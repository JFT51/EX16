import { Award, Users, Target } from 'lucide-react';
import { format } from 'date-fns';

interface TopDay {
  date: Date;
  value: number;
}

interface TopPerformersCardProps {
  title: string;
  icon: 'visitors' | 'capture';
  topDays: TopDay[];
  unit: string;
}

export function TopPerformersCard({ title, icon, topDays, unit }: TopPerformersCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        {icon === 'visitors' ? (
          <Users className="w-6 h-6 text-primary" />
        ) : (
          <Target className="w-6 h-6 text-primary" />
        )}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="space-y-4">
        {topDays.map((day, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <Award className={`w-5 h-5 ${
                index === 0 ? 'text-yellow-500' :
                index === 1 ? 'text-gray-400' :
                'text-orange-500'
              }`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">
                {format(day.date, 'EEE dd MMM yyyy')}
              </div>
              <div className="text-sm text-gray-500">
                {day.value.toLocaleString(undefined, { 
                  maximumFractionDigits: unit === '%' ? 2 : 0 
                })}
                {unit}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}