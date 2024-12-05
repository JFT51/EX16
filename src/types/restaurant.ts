export interface VisitorData {
  timestamp: string;
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

export interface WeatherInfo {
  temperature: number;
  description: string;
  icon: string;
  precipitation: number;
  windSpeed: number;
}