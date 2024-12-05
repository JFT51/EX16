import { Cloud, Droplets, Sun, ThermometerSun, Wind } from 'lucide-react';
import { WeatherInfo } from '../types/restaurant';

interface WeatherCardProps {
  weather: WeatherInfo | undefined;
}

export function WeatherCard({ weather }: WeatherCardProps) {
  if (!weather) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Weather Conditions</h3>
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg text-gray-600">
          <div className="flex flex-col items-center gap-3">
            <Cloud className="w-8 h-8 text-gray-400" />
            <div className="text-center">
              <p className="font-medium">No weather data available for this date</p>
              <p className="text-sm mt-1 text-gray-500">
                Data might be unavailable for dates that are too recent or too old
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Weather Conditions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperature and Description */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <ThermometerSun className="w-8 h-8 text-orange-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {weather.temperature}°C
              </div>
              <div className="text-sm text-gray-600">Temperature</div>
            </div>
          </div>
        </div>

        {/* Weather Icon and Description */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12">
            <img 
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
              className="w-full h-full"
            />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {weather.description}
            </div>
            <div className="text-sm text-gray-600">Conditions</div>
          </div>
        </div>

        {/* Precipitation */}
        <div className="flex items-center gap-3">
          <Droplets className="w-8 h-8 text-blue-500" />
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {weather.precipitation} mm
            </div>
            <div className="text-sm text-gray-600">Precipitation</div>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="flex items-center gap-3">
          <Wind className="w-8 h-8 text-gray-500" />
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {weather.windSpeed} km/h
            </div>
            <div className="text-sm text-gray-600">Wind Speed</div>
          </div>
        </div>
      </div>
    </div>
  );
}