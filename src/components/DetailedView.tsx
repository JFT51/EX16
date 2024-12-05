import { DataTable } from './DataTable';
import { LoadingSpinner } from './LoadingSpinner';
import { DataValidation } from './DataValidation';
import { VisitorData } from '../types/restaurant';
import { AlertCircle } from 'lucide-react';

interface DetailedViewProps {
  data: VisitorData[];
  loading: boolean;
  error: string | null;
}

export function DetailedView({ data, loading, error }: DetailedViewProps) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Hourly Traffic Data
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Detailed hourly breakdown of visitor traffic
        </p>
      </div>

      {loading && <LoadingSpinner />}
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <DataValidation data={data} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <DataTable data={data} />
          </div>
        </div>
      )}
    </div>
  );
}