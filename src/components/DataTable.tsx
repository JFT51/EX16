import { VisitorData } from '../types/restaurant';

interface DataTableProps {
  data: VisitorData[];
}

export function DataTable({ data }: DataTableProps) {
  const calculateCaptureRate = (visitors: number, passersby: number): string => {
    if (passersby === 0) return '0.00';
    return ((visitors / passersby) * 100).toFixed(2);
  };

  const calculateConversion = (groups: number, visitors: number): string => {
    if (visitors === 0) return '0.0';
    const conversion = (groups / visitors) * 100;
    return Math.min(conversion, 100).toFixed(1);
  };

  // Calculate accumulated totals and live visitors for each row
  const dataWithAccumulated = data.map((row, index) => {
    // Get previous rows from the same day
    const prevRows = data.slice(0, index + 1).filter(r => 
      r.timestamp.split(' ')[0] === row.timestamp.split(' ')[0]
    );

    // Calculate accumulated totals
    const accumulatedEntering = prevRows.reduce((sum, r) => sum + r.enteringVisitors, 0);
    const accumulatedLeaving = prevRows.reduce((sum, r) => sum + r.leavingVisitors, 0);

    // Get previous hour's accumulated leaving (for live visitors calculation)
    const prevHourLeaving = index > 0 
      ? data.slice(0, index).filter(r => 
          r.timestamp.split(' ')[0] === row.timestamp.split(' ')[0]
        ).reduce((sum, r) => sum + r.leavingVisitors, 0)
      : 0;

    // Calculate live visitors (ensure it never goes below 0)
    const liveVisitors = Math.max(0, accumulatedEntering - prevHourLeaving);

    return {
      ...row,
      accumulatedEntering,
      accumulatedLeaving,
      liveVisitors,
    };
  });

  return (
    <div className="w-full overflow-x-auto shadow-sm rounded-lg">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-3 sticky left-0 bg-gray-50">Timestamp</th>
            <th className="px-4 py-3" colSpan={2}>Total Visitors</th>
            <th className="px-4 py-3" colSpan={2}>Men</th>
            <th className="px-4 py-3" colSpan={2}>Women</th>
            <th className="px-4 py-3" colSpan={2}>Groups</th>
            <th className="px-4 py-3">Passersby</th>
            <th className="px-4 py-3">Capture Rate</th>
            <th className="px-4 py-3">Conversion</th>
            <th className="px-4 py-3" colSpan={2}>Accumulated Totals</th>
            <th className="px-4 py-3">Live Visitors</th>
          </tr>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 sticky left-0 bg-gray-100"></th>
            <th className="px-4 py-2 text-green-700">In</th>
            <th className="px-4 py-2 text-red-700">Out</th>
            <th className="px-4 py-2 text-green-700">In</th>
            <th className="px-4 py-2 text-red-700">Out</th>
            <th className="px-4 py-2 text-green-700">In</th>
            <th className="px-4 py-2 text-red-700">Out</th>
            <th className="px-4 py-2 text-green-700">In</th>
            <th className="px-4 py-2 text-red-700">Out</th>
            <th className="px-4 py-2"></th>
            <th className="px-4 py-2 text-blue-700">%</th>
            <th className="px-4 py-2 text-violet-700">%</th>
            <th className="px-4 py-2 text-green-700">Total In</th>
            <th className="px-4 py-2 text-red-700">Total Out</th>
            <th className="px-4 py-2 text-purple-700">Current</th>
          </tr>
        </thead>
        <tbody>
          {dataWithAccumulated.map((row, index) => {
            // Check if this is the first row of a new day
            const isFirstOfDay = index === 0 || 
              row.timestamp.split(' ')[0] !== dataWithAccumulated[index - 1].timestamp.split(' ')[0];

            return (
              <tr 
                key={index} 
                className={`bg-white border-b hover:bg-gray-50 ${isFirstOfDay ? 'border-t-2 border-t-gray-200' : ''}`}
              >
                <td className="px-4 py-3 sticky left-0 bg-white font-medium">
                  {row.timestamp}
                </td>
                <td className="px-4 py-3 text-green-700">{row.enteringVisitors}</td>
                <td className="px-4 py-3 text-red-700">{row.leavingVisitors}</td>
                <td className="px-4 py-3 text-green-700">{row.enteringMen}</td>
                <td className="px-4 py-3 text-red-700">{row.leavingMen}</td>
                <td className="px-4 py-3 text-green-700">{row.enteringWomen}</td>
                <td className="px-4 py-3 text-red-700">{row.leavingWomen}</td>
                <td className="px-4 py-3 text-green-700">{row.enteringGroups}</td>
                <td className="px-4 py-3 text-red-700">{row.leavingGroups}</td>
                <td className="px-4 py-3">{row.passersby}</td>
                <td className="px-4 py-3 text-blue-700 font-medium">
                  {calculateCaptureRate(row.enteringVisitors, row.passersby)}%
                </td>
                <td className="px-4 py-3 text-violet-700 font-medium">
                  {calculateConversion(row.enteringGroups, row.enteringVisitors)}%
                </td>
                <td className="px-4 py-3 text-green-700 font-medium">
                  {row.accumulatedEntering}
                </td>
                <td className="px-4 py-3 text-red-700 font-medium">
                  {row.accumulatedLeaving}
                </td>
                <td className="px-4 py-3 text-purple-700 font-medium">
                  {row.liveVisitors}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}