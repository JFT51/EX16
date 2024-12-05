import { VisitorData } from '../types/restaurant';
import { formatDisplayDate } from './dateFormat';

interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
  };
}

export const BUSINESS_HOURS: BusinessHours = {
  '1': { open: '07:00', close: '20:00' }, // Monday
  '2': { open: '07:00', close: '20:00' }, // Tuesday
  '3': { open: '07:00', close: '20:00' }, // Wednesday
  '4': { open: '07:00', close: '20:00' }, // Thursday
  '5': { open: '07:00', close: '20:00' }, // Friday
  '6': { open: '08:00', close: '20:00' }, // Saturday
  '0': { open: '08:00', close: '16:00' }, // Sunday
};

export function calculateBusinessHoursCaptureRate(data: VisitorData[], date: Date): number {
  // Get the day of the week (0-6, 0 = Sunday)
  const dayOfWeek = date.getDay().toString();
  const businessHours = BUSINESS_HOURS[dayOfWeek];

  if (!businessHours) return 0;

  const dateStr = formatDisplayDate(date);
  
  // Filter data for the specific date and business hours
  const businessHoursData = data.filter(entry => {
    if (!entry.timestamp.startsWith(dateStr)) return false;

    const time = entry.timestamp.split(' ')[1];
    return isTimeInRange(time, businessHours.open, businessHours.close);
  });

  if (businessHoursData.length === 0) return 0;

  // Calculate totals for business hours
  const totals = businessHoursData.reduce(
    (acc, curr) => ({
      entering: acc.entering + curr.enteringVisitors,
      passersby: acc.passersby + curr.passersby,
    }),
    { entering: 0, passersby: 0 }
  );

  // Calculate capture rate
  return totals.passersby > 0 
    ? (totals.entering / totals.passersby) * 100 
    : 0;
}

function isTimeInRange(time: string, start: string, end: string): boolean {
  const [timeHour] = time.split(':').map(Number);
  const [startHour] = start.split(':').map(Number);
  const [endHour] = end.split(':').map(Number);

  return timeHour >= startHour && timeHour < endHour;
}