import { isValid, isBefore, differenceInDays } from 'date-fns';
import { formatApiDate } from '../utils/dateFormat';

const RESTAURANT_COORDINATES = {
  latitude: 50.8503, // Brussels coordinates
  longitude: 4.3517
};

export interface WeatherData {
  date: string;
  temperature: number;
  description: string;
  icon: string;
  precipitation: number;
  windSpeed: number;
}

interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

const CACHE_KEY = 'weatherCache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CacheEntry {
  timestamp: number;
  data: WeatherData;
}

function validateDateRange(startDate: Date, endDate: Date): DateValidationResult {
  if (!isValid(startDate) || !isValid(endDate)) {
    return { isValid: false, error: 'Invalid date format' };
  }

  if (!isBefore(startDate, endDate)) {
    return { isValid: false, error: 'Start date must be before end date' };
  }

  const dayDifference = differenceInDays(endDate, startDate);
  if (dayDifference > 365) {
    return { isValid: false, error: 'Date range cannot exceed one year' };
  }

  return { isValid: true };
}

function getWeatherDescription(weatherCode: number): { description: string; icon: string } {
  // WMO Weather interpretation codes (WW)
  switch (true) {
    case weatherCode === 0:
      return { description: 'Clear sky', icon: '01d' };
    case weatherCode === 1:
      return { description: 'Mainly clear', icon: '02d' };
    case weatherCode === 2:
      return { description: 'Partly cloudy', icon: '03d' };
    case weatherCode === 3:
      return { description: 'Overcast', icon: '04d' };
    case weatherCode >= 45 && weatherCode <= 48:
      return { description: 'Foggy', icon: '50d' };
    case weatherCode >= 51 && weatherCode <= 55:
      return { description: 'Drizzle', icon: '09d' };
    case weatherCode >= 61 && weatherCode <= 65:
      return { description: 'Rain', icon: '10d' };
    case weatherCode >= 71 && weatherCode <= 77:
      return { description: 'Snow', icon: '13d' };
    case weatherCode >= 80 && weatherCode <= 82:
      return { description: 'Rain showers', icon: '09d' };
    case weatherCode >= 85 && weatherCode <= 86:
      return { description: 'Snow showers', icon: '13d' };
    case weatherCode >= 95 && weatherCode <= 99:
      return { description: 'Thunderstorm', icon: '11d' };
    default:
      return { description: 'Unknown', icon: '03d' };
  }
}

export function getCachedWeatherData(date: Date): WeatherData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheMap = new Map<string, CacheEntry>(JSON.parse(cached));
    const dateKey = formatApiDate(date);
    const cacheEntry = cacheMap.get(dateKey);

    if (!cacheEntry || Date.now() - cacheEntry.timestamp > CACHE_EXPIRY) {
      return null;
    }

    return cacheEntry.data;
  } catch {
    return null;
  }
}

function getCachedWeather(): Map<string, CacheEntry> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? new Map(JSON.parse(cached)) : new Map();
  } catch {
    return new Map();
  }
}

function setCachedWeather(weatherMap: Map<string, WeatherData>) {
  try {
    const cacheMap = new Map<string, CacheEntry>();
    weatherMap.forEach((data, date) => {
      cacheMap.set(date, {
        timestamp: Date.now(),
        data
      });
    });
    localStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(cacheMap.entries())));
  } catch (error) {
    console.error('Error caching weather data:', error);
  }
}

export async function fetchWeatherData(startDate: Date, endDate: Date): Promise<{
  weatherMap: Map<string, WeatherData>;
  status: 'success' | 'error';
  message?: string;
}> {
  const weatherMap = new Map<string, WeatherData>();
  const dateValidation = validateDateRange(startDate, endDate);
  
  if (!dateValidation.isValid) {
    return {
      weatherMap,
      status: 'error',
      message: dateValidation.error
    };
  }

  try {
    // Check cache first
    const cache = getCachedWeather();
    const datesNeeded = new Set<string>();
    
    // Determine which dates we need to fetch
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = formatApiDate(currentDate);
      const cached = cache.get(dateStr);
      
      if (!cached || Date.now() - cached.timestamp > CACHE_EXPIRY) {
        datesNeeded.add(dateStr);
      } else {
        weatherMap.set(dateStr, cached.data);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // If we need to fetch any data
    if (datesNeeded.size > 0) {
      const formattedStartDate = formatApiDate(startDate);
      const formattedEndDate = formatApiDate(endDate);

      const url = new URL('https://archive-api.open-meteo.com/v1/archive');
      url.searchParams.append('latitude', RESTAURANT_COORDINATES.latitude.toString());
      url.searchParams.append('longitude', RESTAURANT_COORDINATES.longitude.toString());
      url.searchParams.append('start_date', formattedStartDate);
      url.searchParams.append('end_date', formattedEndDate);
      url.searchParams.append('daily', 'temperature_2m_mean,weathercode,precipitation_sum,windspeed_10m_max');
      url.searchParams.append('timezone', 'auto');

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.daily) {
        throw new Error('Invalid response format from Open-Meteo API');
      }

      const { time, temperature_2m_mean, weathercode, precipitation_sum, windspeed_10m_max } = data.daily;

      time.forEach((date: string, index: number) => {
        const weatherData: WeatherData = {
          date,
          temperature: Math.round(temperature_2m_mean[index]),
          description: getWeatherDescription(weathercode[index]).description,
          icon: getWeatherDescription(weathercode[index]).icon,
          precipitation: Math.round(precipitation_sum[index] * 10) / 10,
          windSpeed: Math.round(windspeed_10m_max[index] * 10) / 10
        };

        weatherMap.set(date, weatherData);
      });

      // Update cache with new data
      setCachedWeather(weatherMap);
    }

    return {
      weatherMap,
      status: 'success',
      message: weatherMap.size === 0 
        ? 'No weather data available for the selected date range'
        : undefined
    };

  } catch (error) {
    console.error('Error in fetchWeatherData:', error);
    return {
      weatherMap,
      status: 'error',
      message: 'Failed to fetch weather data: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}