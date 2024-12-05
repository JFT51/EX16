import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { Navigation } from './components/Navigation';
import { DetailedView } from './components/DetailedView';
import { DailyView } from './components/DailyView';
import { DayAnalysis } from './components/DayAnalysis';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useRestaurantData } from './hooks/useRestaurantData';

function App() {
  const { data, loading, error } = useRestaurantData();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<DailyView data={data} loading={loading} error={error} />} />
              <Route path="/hourly" element={<DetailedView data={data} loading={loading} error={error} />} />
              <Route path="/day-analysis" element={<DayAnalysis data={data} loading={loading} error={error} />} />
              <Route path="/daily" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;