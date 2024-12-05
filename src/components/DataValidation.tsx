import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { VisitorData } from '../types/restaurant';

interface ValidationResult {
  isValid: boolean;
  message: string;
  type: 'error' | 'warning' | 'success';
}

interface DataValidationProps {
  data: VisitorData[];
}

export function DataValidation({ data }: DataValidationProps) {
  const validateData = (data: VisitorData[]): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Check if there's data
    if (data.length === 0) {
      results.push({
        isValid: false,
        message: 'No data available',
        type: 'error'
      });
      return results;
    }

    // Check for missing timestamps
    const missingTimestamps = data.some(row => !row.timestamp);
    if (missingTimestamps) {
      results.push({
        isValid: false,
        message: 'Some entries are missing timestamps',
        type: 'error'
      });
    }

    // Check for invalid numbers
    const hasInvalidNumbers = data.some(row => 
      Object.entries(row).some(([key, value]) => 
        key !== 'timestamp' && (isNaN(value) || value < 0)
      )
    );
    if (hasInvalidNumbers) {
      results.push({
        isValid: false,
        message: 'Invalid or negative numbers detected',
        type: 'error'
      });
    }

    // Check data consistency
    let inconsistentData = false;
    data.forEach(row => {
      if (row.enteringMen + row.enteringWomen > row.enteringVisitors) {
        inconsistentData = true;
      }
      if (row.leavingMen + row.leavingWomen > row.leavingVisitors) {
        inconsistentData = true;
      }
    });
    if (inconsistentData) {
      results.push({
        isValid: false,
        message: 'Inconsistent visitor counts detected',
        type: 'warning'
      });
    }

    // Add success message if no issues found
    if (results.length === 0) {
      results.push({
        isValid: true,
        message: 'All data appears to be valid',
        type: 'success'
      });
    }

    return results;
  };

  const validationResults = validateData(data);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Data Validation Results</h2>
      <div className="space-y-2">
        {validationResults.map((result, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 p-3 rounded-md ${
              result.type === 'error'
                ? 'bg-red-50 text-red-700'
                : result.type === 'warning'
                ? 'bg-yellow-50 text-yellow-700'
                : 'bg-green-50 text-green-700'
            }`}
          >
            {result.type === 'error' && <XCircle className="w-5 h-5" />}
            {result.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            {result.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            <span>{result.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}