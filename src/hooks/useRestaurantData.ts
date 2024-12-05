import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { VisitorData } from '../types/restaurant';

const CACHE_KEY = 'visitorData';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

interface UseRestaurantDataReturn {
  data: VisitorData[];
  loading: boolean;
  error: string | null;
}

export function useRestaurantData(): UseRestaurantDataReturn {
  const [data, setData] = useState<VisitorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }

        const response = await fetch('https://raw.githubusercontent.com/JFT51/ExRest/refs/heads/main/ikxe.csv');
        const text = await response.text();
        
        Papa.parse(text, {
          header: false,
          complete: (results) => {
            const parsedData = results.data.slice(1).map((row: any) => {
              // First parse all the raw values
              const enteringVisitors = parseInt(row[1]) || 0;
              const leavingVisitors = parseInt(row[2]) || 0;
              let enteringMen = parseInt(row[3]) || 0;
              let leavingMen = parseInt(row[4]) || 0;
              let enteringWomen = parseInt(row[5]) || 0;
              let leavingWomen = parseInt(row[6]) || 0;
              
              // Adjust entering counts
              const totalEnteringGender = enteringMen + enteringWomen;
              if (totalEnteringGender !== enteringVisitors && totalEnteringGender > 0) {
                const ratio = enteringVisitors / totalEnteringGender;
                enteringMen = Math.round(enteringMen * ratio);
                enteringWomen = enteringVisitors - enteringMen;
              } else if (totalEnteringGender === 0 && enteringVisitors > 0) {
                enteringMen = Math.round(enteringVisitors / 2);
                enteringWomen = enteringVisitors - enteringMen;
              }

              // Adjust leaving counts
              const totalLeavingGender = leavingMen + leavingWomen;
              if (totalLeavingGender !== leavingVisitors && totalLeavingGender > 0) {
                const ratio = leavingVisitors / totalLeavingGender;
                leavingMen = Math.round(leavingMen * ratio);
                leavingWomen = leavingVisitors - leavingMen;
              } else if (totalLeavingGender === 0 && leavingVisitors > 0) {
                leavingMen = Math.round(leavingVisitors / 2);
                leavingWomen = leavingVisitors - leavingMen;
              }

              return {
                timestamp: row[0],
                enteringVisitors,
                leavingVisitors,
                enteringMen,
                leavingMen,
                enteringWomen,
                leavingWomen,
                enteringGroups: parseInt(row[7]) || 0,
                leavingGroups: parseInt(row[8]) || 0,
                passersby: parseInt(row[9]) || 0,
              };
            });

            // Cache the parsed data
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              data: parsedData,
              timestamp: Date.now()
            }));

            setData(parsedData);
            setLoading(false);
          },
          error: (error) => {
            setError('Error parsing CSV data');
            setLoading(false);
          }
        });
      } catch (err) {
        setError('Error fetching data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}