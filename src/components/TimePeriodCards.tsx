import { useState, useMemo } from 'react';
import { Clock } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import { VisitorData } from '../types/restaurant';
import { formatMinutesToTime } from '../utils/timeFormat';
import { formatDisplayDate } from '../utils/dateFormat';

interface TimePeriod {
  name: string;
  icon: React.ReactNode;
  startHour: number;
  endHour: number;
}

interface TimePeriodCardsProps {
  data: VisitorData[];
  date: Date;
  benchmarkDate?: Date | null;
  benchmarkData?: VisitorData[] | null;
}

const FIXED_PERIODS: TimePeriod[] = [
  { name: 'Morning', icon: <Clock className="w-5 h-5" />, startHour: 7, endHour: 10 },
  { name: 'Noon', icon: <Clock className="w-5 h-5" />, startHour: 12, endHour: 14 },
  { name: 'Afternoon', icon: <Clock className="w-5 h-5" />, startHour: 16, endHour: 20 },
];

function calculateCaptureRate(data: VisitorData[], date: Date, startHour: number, endHour: number): number {
  const dateStr = formatDisplayDate(date);
  const periodData = data.filter(entry => {
    if (!entry.timestamp.startsWith(dateStr)) return false;
    const hour = parseInt(entry.timestamp.split(' ')[1].split(':')[0]);
    return hour >= startHour && hour < endHour;
  });

  const totals = periodData.reduce(
    (acc, curr) => ({
      entering: acc.entering + curr.enteringVisitors,
      passersby: acc.passersby + curr.passersby,
    }),
    { entering: 0, passersby: 0 }
  );

  return totals.passersby > 0 ? (totals.entering / totals.passersby) * 100 : 0;
}

export function TimePeriodCards({ data, date, benchmarkDate, benchmarkData }: TimePeriodCardsProps) {
  const [customRange, setCustomRange] = useState([9, 17]); // Default 9:00-17:00

  const captureRates = useMemo(() => {
    const rates = FIXED_PERIODS.map(period => ({
      ...period,
      rate: calculateCaptureRate(data, date, period.startHour, period.endHour),
      benchmarkRate: benchmarkDate
        ? calculateCaptureRate(data, benchmarkDate, period.startHour, period.endHour)
        : benchmarkData
        ? calculateCaptureRate(benchmarkData, date, period.startHour, period.endHour)
        : null,
    }));

    // Add custom period
    rates.push({
      name: 'Custom',
      icon: <Clock className="w-5 h-5" />,
      startHour: customRange[0],
      endHour: customRange[1],
      rate: calculateCaptureRate(data, date, customRange[0], customRange[1]),
      benchmarkRate: benchmarkDate
        ? calculateCaptureRate(data, benchmarkDate, customRange[0], customRange[1])
        : benchmarkData
        ? calculateCaptureRate(benchmarkData, date, customRange[0], customRange[1])
        : null,
    });

    return rates;
  }, [data, date, benchmarkDate, benchmarkData, customRange]);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Time Period Capture Rate
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {captureRates.map((period, index) => (
          <div
            key={period.name}
            className="bg-white rounded-lg p-4 shadow-sm border"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  {period.icon}
                </div>
                <h4 className="font-semibold text-gray-900">{period.name}</h4>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                {formatMinutesToTime(period.startHour * 60)} - {formatMinutesToTime(period.endHour * 60)}
              </div>
              
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-gray-900">
                  {period.rate.toFixed(1)}%
                </div>
                {period.benchmarkRate !== null && (
                  <div className={`text-sm font-medium ${
                    period.rate > period.benchmarkRate ? 'text-green-600' :
                    period.rate < period.benchmarkRate ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {period.rate > period.benchmarkRate ? '↑' : '↓'} {period.benchmarkRate.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>

            {index === 3 && (
              <div className="mt-4">
                <Slider.Root 
                  className="relative flex items-center select-none w-full h-5" 
                  value={customRange}
                  onValueChange={setCustomRange}
                  min={0}
                  max={23}
                  step={1}
                >
                  <Slider.Track className="bg-gray-200 relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-primary rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb 
                    className="block w-4 h-4 bg-white border-2 border-primary rounded-full hover:bg-gray-50 focus:outline-none"
                    aria-label="Start time"
                  />
                  <Slider.Thumb 
                    className="block w-4 h-4 bg-white border-2 border-primary rounded-full hover:bg-gray-50 focus:outline-none"
                    aria-label="End time"
                  />
                </Slider.Root>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}