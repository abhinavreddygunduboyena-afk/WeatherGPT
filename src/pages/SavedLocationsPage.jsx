import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, MapPin, Trash2, ArrowRight, Plus, ExternalLink } from 'lucide-react';
import { useWeather } from '../contexts/WeatherContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { formatCoordinates } from '../utils/formatters';

export default function SavedLocationsPage() {
  const navigate = useNavigate();
  const { savedLocations, removeLocation, selectLocation, currentLocation } = useWeather();

  const handleSelect = (loc) => {
    selectLocation(loc);
    navigate('/weather');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Saved Monitoring Locations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quick access to pinned municipal and regional meteorological stations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Plus}
          onClick={() => navigate('/weather')}
        >
          Explore More Cities
        </Button>
      </div>

      {savedLocations.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No locations pinned yet"
          description="You can pin frequently monitored cities from the weather card or search bar."
          actionLabel="Go to Weather Intelligence"
          onAction={() => navigate('/weather')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedLocations.map((loc) => {
            const isActive = loc.name === currentLocation.name;
            return (
              <div
                key={loc.id || loc.name}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-weather-500 bg-weather-50/20 dark:bg-navy-900 ring-1 ring-weather-500/50'
                    : 'border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 hover:border-slate-300 dark:hover:border-navy-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-weather-600 dark:text-weather-400" />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {loc.name}
                      </h3>
                    </div>

                    {isActive && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-weather-100 text-weather-700 dark:bg-weather-950 dark:text-weather-300 uppercase">
                        Current
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    {loc.region ? `${loc.region}, ` : ''}{loc.country}
                  </p>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800 text-xs font-mono text-slate-500">
                    {formatCoordinates(loc.lat, loc.lon)}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                  <button
                    onClick={() => removeLocation(loc.name)}
                    className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors text-xs flex items-center gap-1"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>

                  <Button
                    variant={isActive ? "primary" : "secondary"}
                    size="sm"
                    icon={ArrowRight}
                    onClick={() => handleSelect(loc)}
                  >
                    {isActive ? 'View Weather' : 'Activate'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
