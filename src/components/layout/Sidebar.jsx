import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  CloudSun, Zap, LayoutDashboard, Bookmark, FolderKanban, 
  Bell, Settings, ChevronLeft, ChevronRight, X, ShieldAlert, Sprout 
} from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import { SAMPLE_ALERTS } from '../../data/sampleAlerts';

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) {
  const { savedLocations } = useWeather();
  const alertCount = SAMPLE_ALERTS.length;

  const NAV_ITEMS = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/weather', label: 'Weather Intelligence', icon: CloudSun, mode: 'weather' },
    { to: '/energy', label: 'Energy Intelligence', icon: Zap, mode: 'energy' },
    { to: '/farmer', label: 'Farmer Intelligence', icon: Sprout, mode: 'farmer' },
    { to: '/saved-locations', label: 'Saved Locations', icon: Bookmark, badge: savedLocations.length },
    { to: '/projects', label: 'Energy Projects', icon: FolderKanban },
    { to: '/alerts', label: 'Alerts', icon: ShieldAlert, badge: alertCount, badgeVariant: 'red' },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800 transition-all duration-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-navy-800 h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-weather-600 to-energy-600 flex items-center justify-center text-white shrink-0 shadow-sm font-bold text-base">
            W
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                WeatherGPT
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 font-semibold">
                  v2.0
                </span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
                Environmental & Energy Intelligence
              </span>
            </div>
          )}
        </div>

        {/* Close button for mobile */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Routes */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => isMobileOpen && setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? item.mode === 'farmer'
                      ? 'bg-slate-100 dark:bg-navy-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : item.mode === 'energy'
                      ? 'bg-slate-100 dark:bg-navy-800 text-energy-600 dark:text-energy-400 font-semibold'
                      : 'bg-slate-100 dark:bg-navy-800 text-weather-600 dark:text-weather-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-850 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
              title={isCollapsed && !isMobileOpen ? item.label : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  item.mode === 'farmer' 
                    ? 'group-hover:text-emerald-500' 
                    : item.mode === 'energy' 
                    ? 'group-hover:text-energy-500' 
                    : 'group-hover:text-weather-500'
                }`} />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
              </div>

              {(!isCollapsed || isMobileOpen) && item.badge !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  item.badgeVariant === 'red'
                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : 'bg-slate-200 dark:bg-navy-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Desktop Toggle */}
      <div className="hidden lg:flex p-3 border-t border-slate-100 dark:border-navy-800 items-center justify-between">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors text-xs"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block h-screen sticky top-0 shrink-0 z-30 transition-all duration-200 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 lg:hidden transform transition-transform duration-200 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>
    </>
  );
}
