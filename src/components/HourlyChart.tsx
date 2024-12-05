import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'react-chartjs-2';
import { Check } from 'lucide-react';
import { VisitorData } from '../types/restaurant';
import { formatDisplayDate } from '../utils/dateFormat';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface HourlyChartProps {
  data: VisitorData[];
  date: Date;
  benchmarkDate?: Date | null;
  benchmarkData?: VisitorData[] | null;
}

interface MetricOption {
  id: string;
  label: string;
  color: string;
  type: 'bar' | 'line';
  yAxisID: string;
}

const METRICS: MetricOption[] = [
  { id: 'visitors', label: 'Visitors', color: 'rgb(47, 118, 34)', type: 'bar', yAxisID: 'yVisitors' },
  { id: 'passersby', label: 'Passersby', color: 'rgb(243, 151, 0)', type: 'line', yAxisID: 'yPassersby' },
  { id: 'captureRate', label: 'Capture Rate', color: 'rgb(59, 130, 246)', type: 'line', yAxisID: 'yPercentage' },
  { id: 'men', label: 'Men', color: 'rgb(75, 85, 99)', type: 'line', yAxisID: 'yVisitors' },
  { id: 'women', label: 'Women', color: 'rgb(190, 24, 93)', type: 'line', yAxisID: 'yVisitors' },
];

const DEFAULT_METRICS = ['visitors', 'passersby', 'captureRate'];

export function HourlyChart({ data, date, benchmarkDate, benchmarkData }: HourlyChartProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(DEFAULT_METRICS);

  const processDateData = (targetDate: Date | null, useCustomData?: VisitorData[]) => {
    if (!targetDate && !useCustomData) return [];
    
    const sourceData = useCustomData || data;
    const dateStr = targetDate ? formatDisplayDate(targetDate) : null;
    
    return sourceData
      .filter(entry => !dateStr || entry.timestamp.startsWith(dateStr))
      .map(entry => ({
        hour: entry.timestamp.split(' ')[1].substring(0, 5),
        visitors: entry.enteringVisitors,
        passersby: entry.passersby,
        captureRate: entry.passersby > 0 ? (entry.enteringVisitors / entry.passersby) * 100 : 0,
        men: entry.enteringMen,
        women: entry.enteringWomen,
      }));
  };

  const hourlyData = useMemo(() => processDateData(date), [data, date]);
  const benchmarkHourlyData = useMemo(() => 
    benchmarkDate ? processDateData(benchmarkDate) : 
    benchmarkData ? processDateData(null, benchmarkData) : 
    [], 
    [data, benchmarkDate, benchmarkData]
  );

  // Calculate max values for each axis
  const maxValues = useMemo(() => {
    const allData = [...hourlyData, ...benchmarkHourlyData];
    const maxCaptureRate = Math.max(...allData.map(d => d.captureRate));
    return { maxCaptureRate };
  }, [hourlyData, benchmarkHourlyData]);

  const createDataset = (metric: MetricOption, data: typeof hourlyData, isBenchmark: boolean = false) => ({
    type: metric.type,
    label: isBenchmark ? `${metric.label} (${benchmarkData ? 'Average' : 'Benchmark'})` : metric.label,
    data: data.map(d => d[metric.id as keyof typeof data[0]]),
    backgroundColor: isBenchmark 
      ? `${metric.color.replace('rgb', 'rgba').replace(')', ', 0.5)')}` 
      : metric.color,
    borderColor: isBenchmark 
      ? `${metric.color.replace('rgb', 'rgba').replace(')', ', 0.5)')}` 
      : metric.color,
    yAxisID: metric.yAxisID,
    order: metric.type === 'bar' ? 1 : 0,
    datalabels: {
      display: (context: any) => {
        // Only show labels for visitor bars with values > 0
        return metric.id === 'visitors' && context.dataset.data[context.dataIndex] > 0;
      },
      color: 'black',
      anchor: 'end',
      align: 'top',
      offset: 4,
      font: {
        weight: 'bold',
        size: 14
      },
      formatter: (value: number) => Math.round(value)
    }
  });

  const chartData = {
    labels: hourlyData.map(d => d.hour),
    datasets: [
      // Primary date datasets
      ...METRICS
        .filter(metric => selectedMetrics.includes(metric.id))
        .map(metric => createDataset(metric, hourlyData)),
      // Benchmark datasets (if available)
      ...(benchmarkHourlyData.length > 0 ? METRICS
        .filter(metric => selectedMetrics.includes(metric.id))
        .map(metric => createDataset(metric, benchmarkHourlyData, true))
        : [])
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      yVisitors: {
        type: 'linear' as const,
        position: 'left' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of People',
        },
      },
      yPassersby: {
        type: 'linear' as const,
        position: 'right' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Passersby',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      yPercentage: {
        type: 'linear' as const,
        position: 'right' as const,
        min: 0,
        max: maxValues.maxCaptureRate < 5 ? 5 : Math.ceil(maxValues.maxCaptureRate * 1.1),
        title: {
          display: true,
          text: 'Percentage',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          stepSize: maxValues.maxCaptureRate < 5 ? 1 : Math.ceil(maxValues.maxCaptureRate / 10),
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
              if (label.includes('Rate')) {
                label += context.parsed.y.toFixed(1) + '%';
              } else {
                label += Math.round(context.parsed.y);
              }
            }
            return label;
          }
        }
      },
      legend: {
        display: false
      }
    }
  };

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  return (
    <div>
      <div className="mb-4">
        <div className="flex flex-wrap gap-3">
          {METRICS.map(metric => (
            <button
              key={metric.id}
              onClick={() => toggleMetric(metric.id)}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                selectedMetrics.includes(metric.id)
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } border`}
              style={{
                borderColor: selectedMetrics.includes(metric.id) ? metric.color : 'rgb(229, 231, 235)'
              }}
            >
              <div className="w-4 h-4 flex items-center justify-center rounded-sm"
                style={{ backgroundColor: metric.color }}
              >
                {selectedMetrics.includes(metric.id) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="font-medium">
                {metric.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}