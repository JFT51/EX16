import { format } from 'date-fns';
import { VisitorData, WeatherInfo } from '../types/restaurant';
import { calculateBusinessHoursCaptureRate } from '../utils/businessHours';
import { formatMinutesToTime } from '../utils/timeFormat';
import { formatDisplayDate } from '../utils/dateFormat';
import { Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSnow, Sun, CloudFog } from 'lucide-react';

interface DailyDataTableProps {
  data: {
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
  }[];
  rawData: VisitorData[];
  isBenchmarking?: boolean;
}

export function DailyDataTable({ data, rawData, isBenchmarking }: DailyDataTableProps) {
  const calculateConversion = (groupsIn: number, visitorsIn: number): number => {
    if (visitorsIn === 0) return 0;
    return Math.min((groupsIn / visitorsIn) * 100, 100);
  };

  const calculateAccuracy = (entering: number, leaving: number): number => {
    if (entering === 0 && leaving === 0) return 100;
    if (entering === 0 || leaving === 0) return 0;
    return (Math.min(entering, leaving) / Math.max(entering, leaving)) * 100;
  };

  const calculateDwellTime = (date: Date, rawData: VisitorData[]): number => {
    const formattedDate = formatDisplayDate(date);
    const dayData = rawData.filter(entry => 
      entry.timestamp.startsWith(formattedDate)
    );

    if (dayData.length === 0) return 0;

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
    const averageLiveVisitors = totalLiveVisitors / dayData.length;
    const totalVisitors = dayData.reduce((sum, entry) => sum + entry.enteringVisitors, 0);

    if (totalVisitors === 0) return 0;
    return (averageLiveVisitors / totalVisitors) * 60 * 10;
  };

  const calculateGenderDistribution = (men: number, women: number): string => {
    const total = men + women;
    if (total === 0) return 'N/A';
    const menPercent = (men / total * 100).toFixed(1);
    const womenPercent = (women / total * 100).toFixed(1);
    return `♂ ${menPercent}% / ♀ ${womenPercent}%`;
  };

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case '01d': return <Sun className="w-5 h-5 text-yellow-500" />;
      case '02d': case '03d': case '04d': return <Cloud className="w-5 h-5 text-gray-500" />;
      case '09d': case '10d': return <CloudRain className="w-5 h-5 text-blue-500" />;
      case '11d': return <CloudLightning className="w-5 h-5 text-purple-500" />;
      case '13d': return <CloudSnow className="w-5 h-5 text-blue-300" />;
      case '50d': return <CloudFog className="w-5 h-5 text-gray-400" />;
      default: return <Cloud className="w-5 h-5 text-gray-500" />;
    }
  };

  const getComparisonColor = (value: number, metricValues: number[]): string => {
    if (!isBenchmarking || metricValues.length !== 2) return '';
    
    const max = Math.max(...metricValues);
    const min = Math.min(...metricValues);
    
    if (max === min) return '';
    if (value === max) return 'text-green-600';
    return 'text-orange-500';
  };

  const formatDateDisplay = (date: Date, rowIndex: number): string => {
    // If this is a weekday average (second row with same date as first row)
    if (isBenchmarking && rowIndex === 1 && date.getTime() === data[0].date.getTime()) {
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${weekdays[date.getDay()]} Averages`;
    }
    return format(date, 'EEE dd MMM yyyy');
  };

  const renderDataRow = (row: DailyDataTableProps['data'][0], rowIndex: number) => {
    const captureRate = calculateBusinessHoursCaptureRate(rawData, row.date);
    const conversionRate = calculateConversion(row.enteringGroups, row.enteringVisitors);
    const accuracy = calculateAccuracy(row.enteringVisitors, row.leavingVisitors);
    const dwellTime = calculateDwellTime(row.date, rawData);

    // Get arrays of values for comparison when benchmarking
    const allEnteringVisitors = data.map(r => r.enteringVisitors);
    const allCaptureRates = data.map(r => calculateBusinessHoursCaptureRate(rawData, r.date));
    const allConversionRates = data.map(r => calculateConversion(r.enteringGroups, r.enteringVisitors));
    const allDwellTimes = data.map(r => calculateDwellTime(r.date, rawData));

    return (
      <tr 
        key={rowIndex} 
        className={`bg-white border-b hover:bg-gray-50 ${
          isBenchmarking && rowIndex === 1 ? 'bg-gray-50' : ''
        }`}
      >
        <td className="px-4 py-3 font-bold text-black">
          {formatDateDisplay(row.date, rowIndex)}
        </td>
        <td className={`px-4 py-3 font-bold ${getComparisonColor(row.enteringVisitors, allEnteringVisitors)}`}>
          {row.enteringVisitors}
        </td>
        <td className={`px-4 py-3 font-bold ${getComparisonColor(captureRate, allCaptureRates)}`}>
          {captureRate.toFixed(2)}%
        </td>
        <td className={`px-4 py-3 font-bold ${getComparisonColor(conversionRate, allConversionRates)}`}>
          {conversionRate.toFixed(1)}%
        </td>
        <td className={`px-4 py-3 font-bold ${getComparisonColor(dwellTime, allDwellTimes)}`}>
          {formatMinutesToTime(dwellTime)}
        </td>
        <td className="px-4 py-3 font-bold text-black">
          {calculateGenderDistribution(row.enteringMen, row.enteringWomen)}
        </td>
        <td className={`px-4 py-3 font-bold ${
          accuracy >= 95 ? 'text-primary' :
          accuracy >= 80 ? 'text-secondary' :
          'text-red-700'
        }`}>
          {accuracy.toFixed(1)}%
        </td>
        {row.weather ? (
          <>
            <td className="px-4 py-3 font-bold text-black">
              <div className="flex items-center gap-2">
                {getWeatherIcon(row.weather.icon)}
                <span>{row.weather.description}</span>
              </div>
            </td>
            <td className="px-4 py-3 font-bold text-black">
              {row.weather.temperature}°C
            </td>
            <td className="px-4 py-3 font-bold text-black">
              {row.weather.precipitation}mm
            </td>
            <td className="px-4 py-3 font-bold text-black">
              {row.weather.windSpeed}km/h
            </td>
          </>
        ) : (
          <td colSpan={4} className="px-4 py-3 text-gray-500 text-center font-bold">
            No weather data
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="w-full overflow-x-auto shadow-sm rounded-lg">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Total Visitors</th>
            <th className="px-4 py-3">Capture Rate*</th>
            <th className="px-4 py-3">Conversion**</th>
            <th className="px-4 py-3">Dwell Time***</th>
            <th className="px-4 py-3">Gender Distribution</th>
            <th className="px-4 py-3">Data Accuracy****</th>
            <th className="px-4 py-3" colSpan={4}>Weather</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => renderDataRow(row, index))}
        </tbody>
      </table>
    </div>
  );
}