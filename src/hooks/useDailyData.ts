import { useMemo } from 'react';
import { VisitorData } from '../types/restaurant';
import { parseDatetime, formatDisplayDate } from '../utils/dateFormat';

export interface ProcessedDailyData {
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
}

export function useDailyData(data: VisitorData[]) {
  return useMemo(() => {
    const dailyMap = new Map<string, ProcessedDailyData>();

    data.forEach((entry) => {
      try {
        const date = parseDatetime(entry.timestamp);
        const dateKey = formatDisplayDate(date);

        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, {
            date,
            enteringVisitors: 0,
            leavingVisitors: 0,
            enteringMen: 0,
            leavingMen: 0,
            enteringWomen: 0,
            leavingWomen: 0,
            enteringGroups: 0,
            leavingGroups: 0,
            passersby: 0,
          });
        }

        const currentData = dailyMap.get(dateKey)!;
        dailyMap.set(dateKey, {
          ...currentData,
          enteringVisitors: currentData.enteringVisitors + entry.enteringVisitors,
          leavingVisitors: currentData.leavingVisitors + entry.leavingVisitors,
          enteringMen: currentData.enteringMen + entry.enteringMen,
          leavingMen: currentData.leavingMen + entry.leavingMen,
          enteringWomen: currentData.enteringWomen + entry.enteringWomen,
          leavingWomen: currentData.leavingWomen + entry.leavingWomen,
          enteringGroups: currentData.enteringGroups + entry.enteringGroups,
          leavingGroups: currentData.leavingGroups + entry.leavingGroups,
          passersby: currentData.passersby + entry.passersby,
        });
      } catch (e) {
        console.error('Error processing daily data:', e);
      }
    });

    return Array.from(dailyMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data]);
}