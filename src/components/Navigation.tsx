import { NavLink } from 'react-router-dom';
import { Clock, CalendarDays, Calendar } from 'lucide-react';

export function Navigation() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
      isActive
        ? 'bg-white/20 text-white'
        : 'hover:bg-white/10 text-white/90'
    }`;

  return (
    <nav className="bg-primary">
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 space-x-4">
          <h1 className="text-xl font-bold text-white mr-8">
            Restaurant Traffic Analytics
          </h1>
          <NavLink to="/" className={navLinkClass}>
            <CalendarDays className="w-5 h-5" />
            Daily View
          </NavLink>
          <NavLink to="/hourly" className={navLinkClass}>
            <Clock className="w-5 h-5" />
            Hourly View
          </NavLink>
          <NavLink to="/day-analysis" className={navLinkClass}>
            <Calendar className="w-5 h-5" />
            Day Analysis
          </NavLink>
        </div>
      </div>
    </nav>
  );
}