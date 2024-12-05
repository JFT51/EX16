import { useEffect, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { VisitorData, WeatherInfo } from '../types/restaurant';
import { DailyDataTable } from './DailyDataTable';
import { TopPerformersCard } from './TopPerformersCard';
import { DailyTrendsChart } from './DailyTrendsChart';
import { useDailyData } from '../hooks/useDailyData';
import { fetchWeatherData } from '../services/weatherService';
import { formatApiDate, formatDisplayDate } from '../utils/dateFormat';
import { calculateBusinessHoursCaptureRate } from '../utils/businessHours';

interface DailyViewProps {
  data: VisitorData[];
  loading: boolean;
  error: string | null;
}

interface EnhancedDailyData {
  date: Date;
  enteringVisitors: number;
  leavingVisitors: number;
  enteringMen: number;
  leavingMen: number;
  enteringWomen: number;
  leavingWomen: number;
  enteringGroups: number;
  leavingGroups: number;
  passersby: number;
  weather?: WeatherInfo;
}

export function DailyView({ data, loading, error }: DailyViewProps) {
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [enhancedData, setEnhancedData] = useState<EnhancedDailyData[]>([]);
  
  // Use the optimized hook for daily data processing
  const dailyData = useDailyData(data);

  // Calculate top performers
  const topVisitors = dailyData
    .map(day => ({
      date: day.date,
      value: day.enteringVisitors,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const topCaptureRates = dailyData
    .map(day => ({
      date: day.date,
      value: calculateBusinessHoursCaptureRate(data, day.date),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  // Calculate last month's data for the chart
  const lastMonthData = (() => {
    if (dailyData.length === 0) return [];

    // Get the most recent date
    const lastDate = dailyData[dailyData.length - 1].date;
    
    // Calculate the first day of the current month
    const currentMonthStart = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
    
    // Calculate the first day of the previous month
    const previousMonthStart = new Date(lastDate.getFullYear(), lastDate.getMonth() - 1, 1);
    
    // Get data from the previous month
    return dailyData
      .filter(day => day.date >= previousMonthStart && day.date < currentMonthStart)
      .map(day => {
        // Calculate dwell time
        const formattedDate = formatDisplayDate(day.date);
        const dayData = data.filter(entry => 
          entry.timestamp.startsWith(formattedDate)
        );
        
        let totalLiveVisitors = 0;
        dayData.forEach((_, index) => {
          const previousEntering = dayData
            .slice(0, index + 1)
            .reduce((sum, entry) => sum + entry.enteringVisitors, 0);
          const previousLeaving = dayData
            .slice(0, index)
            .reduce((sum, entry) => sum + entry.leavingVisitors, 0);
          totalLiveVisitors += Math.max(0, previousEntering - previousLeaving);
        });
        const averageLiveVisitors = totalLiveVisitors / (dayData.length || 1);
        const dwellTime = day.enteringVisitors > 0 
          ? (averageLiveVisitors / day.enteringVisitors) * 60 * 10 
          : 0;

        return {
          date: day.date,
          enteringVisitors: day.enteringVisitors,
          passersby: day.passersby,
          dwellTime,
        };
      });
  })();

  useEffect(() => {
    const fetchWeather = async () => {
      if (dailyData.length === 0) return;

      setWeatherLoading(true);

      try {
        const startDate = dailyData[0].date;
        const endDate = dailyData[dailyData.length - 1].date;

        const { weatherMap } = await fetchWeatherData(startDate, endDate);

        const enhanced = dailyData.map(day => ({
          ...day,
          weather: weatherMap.get(formatApiDate(day.date))
        }));

        setEnhancedData(enhanced);
      } catch (err) {
        console.error('Weather fetch error:', err);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [dailyData]);

  if (loading || weatherLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {lastMonthData.length > 0 && (
          <div className="mb-8">
            <DailyTrendsChart 
              data={lastMonthData}
              rawData={data}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <TopPerformersCard
            title="Top Visitor Days"
            icon="visitors"
            topDays={topVisitors}
            unit=""
          />
          <TopPerformersCard
            title="Top Capture Rate Days"
            icon="capture"
            topDays={topCaptureRates}
            unit="%"
          />
        </div>

        {enhancedData.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <DailyDataTable data={enhancedData} rawData={data} />
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No data available
          </div>
        )}
      </div>
      
      {/* Footer explanations */}
      <div className="bg-gray-50 text-xs text-gray-500 p-4 mt-8 rounded-lg">
        <div className="max-w-[95%] mx-auto space-y-1">
          <p>* Capture Rate is calculated using data from business hours only:
            Mon-Fri 7:00-20:00, Sat 8:00-20:00, Sun 8:00-16:00</p>
          <p>** Conversion shows the percentage of entering visitors who came in groups (capped at 100%)</p>
          <p>*** Dwell Time shows how long visitors typically stay, calculated from average live visitors and total daily visitors (multiplied by 10)</p>
          <p>**** Data Accuracy shows how well in/out counts match (100% = perfect match, lower values indicate discrepancy)</p>
        </div>
      </div>
    </div>
  );
}