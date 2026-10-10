import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../../contexts/ThemeContext';

export default function LeafletMap({
  center = [17.3850, 78.4867],
  zoom = 10,
  markers = [],
  studyAreaRadiusKm = 0,
  polyline = null,
  polylineColor = '#0284c7',
  alternativePolyline = null,
  alternativePolylineColor = '#0d9488',
  className = "h-80 w-full",
  title = "Interactive Map"
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
        attributionControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center & zoom if no polyline
  useEffect(() => {
    if (mapInstanceRef.current && center && center[0] && center[1] && (!polyline || polyline.length === 0)) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, polyline]);

  // Update markers, geometries, and polylines
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    // Custom SVG icon generator for pin stability without broken png assets
    const createMarkerIcon = (color = '#0284c7', isRecommended = false, iconType = null) => {
      if (iconType === 'closure') {
        return L.divIcon({
          className: 'custom-leaflet-closure-marker',
          html: `<div style="background: #ef4444; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #ffffff; box-shadow: 0 3px 6px rgba(0,0,0,0.4); font-size: 15px; cursor: pointer;">⛔</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
      }

      if (iconType === 'roadworks') {
        return L.divIcon({
          className: 'custom-leaflet-roadworks-marker',
          html: `<div style="background: #f59e0b; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 3px 6px rgba(0,0,0,0.4); font-size: 14px; cursor: pointer;">🚧</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
      }

      if (iconType === 'hazard' || iconType === 'laneClosed') {
        return L.divIcon({
          className: 'custom-leaflet-hazard-marker',
          html: `<div style="background: #eab308; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 3px 6px rgba(0,0,0,0.4); font-size: 13px; cursor: pointer;">⚠️</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
      }

      const size = isRecommended ? 36 : 28;
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3.2" fill="#ffffff"></circle>
        </svg>
      `;
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: svg,
        iconSize: [size, size],
        iconAnchor: [size / 2, size]
      });
    };

    // 1. Draw Alternative Route Polyline if present (dashed line)
    if (alternativePolyline && alternativePolyline.length > 0) {
      L.polyline(alternativePolyline, {
        color: alternativePolylineColor,
        weight: 4,
        opacity: 0.85,
        dashArray: '7, 9',
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(layerGroupRef.current).bindPopup('<b>Alternative Route (Detour)</b>');
    }

    // 2. Draw Primary Route Polyline
    if (polyline && polyline.length > 0) {
      const line = L.polyline(polyline, {
        color: polylineColor,
        weight: 5,
        opacity: 0.88,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(layerGroupRef.current);

      try {
        mapInstanceRef.current.fitBounds(line.getBounds(), {
          padding: [45, 45],
          maxZoom: 13
        });
      } catch (e) {
        // bounds fit fallback
      }
    }

    // 3. Draw study radius circle if requested
    if (studyAreaRadiusKm > 0 && center && center[0] && center[1]) {
      L.circle(center, {
        radius: studyAreaRadiusKm * 1000,
        color: '#0d9488',
        fillColor: '#0d9488',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(layerGroupRef.current).bindPopup(`<b>Study Area Radius:</b> ${studyAreaRadiusKm} km`);
    }

    // 4. Render markers (checkpoints and incident badges)
    markers.forEach(m => {
      if (!m.lat || !m.lon) return;

      const isCandidate = m.isCandidate || false;
      const color = m.color || (m.recommended ? '#10b981' : isCandidate ? '#0d9488' : '#0284c7');
      const icon = createMarkerIcon(color, m.recommended || m.isHighlighted, m.iconType);

      const marker = L.marker([m.lat, m.lon], { icon }).addTo(layerGroupRef.current);

      const popupHtml = `
        <div style="font-family: Inter, sans-serif; min-width: 160px; font-size: 12px; color: #1e293b; padding: 2px;">
          <h4 style="font-weight: 700; font-size: 13px; margin: 0 0 4px 0; color: #0f172a;">${m.name}</h4>
          ${m.typeBadge ? `<div style="margin-bottom: 4px;"><span style="display: inline-block; padding: 2px 6px; font-size: 10px; font-weight: 700; border-radius: 4px; background: ${m.typeBadgeColor || '#f1f5f9'}; color: ${m.typeBadgeTextColor || '#1e293b'};">${m.typeBadge}</span></div>` : ''}
          ${m.score ? `<div style="font-size: 11px; margin-bottom: 2px;">Score: <b>${m.score}/100</b></div>` : ''}
          ${m.temp !== undefined ? `<div style="font-size: 11px; margin-bottom: 2px;">Weather: <b>${m.temp}°C, ${m.condition || ''}</b></div>` : ''}
          ${m.eta ? `<div style="font-size: 11px; margin-bottom: 2px; color: #0369a1;">ETA: <b>${m.eta}</b></div>` : ''}
          ${m.details ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px; line-height: 1.4;">${m.details}</div>` : ''}
          ${m.timing ? `<div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">${m.timing}</div>` : ''}
          ${m.recommended ? `<div style="margin-top: 5px; display: inline-block; padding: 2px 6px; background: #ecfdf5; color: #047857; border-radius: 4px; font-size: 10px; font-weight: 600;">Optimal Site</div>` : ''}
        </div>
      `;
      marker.bindPopup(popupHtml);
    });

  }, [markers, studyAreaRadiusKm, center, polyline, polylineColor, alternativePolyline, alternativePolylineColor]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-navy-800 shadow-xs">
      <div 
        ref={mapContainerRef} 
        className={className} 
        style={{ zIndex: 10 }}
        aria-label={title}
      />
    </div>
  );
}
