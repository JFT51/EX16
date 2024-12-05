/**
 * Convert minutes to HH:mm format
 * @param minutes Total minutes
 * @returns Formatted time string
 */
export function formatMinutesToTime(minutes: number): string {
  if (isNaN(minutes) || minutes < 0) return '00:00';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
}