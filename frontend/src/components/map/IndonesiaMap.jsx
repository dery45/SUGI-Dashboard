import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const FILL_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'];

function getColorForValue(val, min, max) {
  if (val == null) return '#94a3b8';
  const ratio = max > min ? (val - min) / (max - min) : 0.5;
  const idx = Math.min(FILL_COLORS.length - 1, Math.floor(ratio * FILL_COLORS.length));
  return FILL_COLORS[idx];
}

const IndonesiaMap = ({ provinceData = [], onProvinceClick, valueKey = 'value', unit = '', mapKey }) => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Failed to load geojson", err));
  }, []);

  const getProvinceValue = (name) => {
    if (!name) return null;
    const cleanName = name.trim().toLowerCase();
    const found = provinceData.find(d => {
      const pName = (d.provinsi || d.wilayah || '').trim().toLowerCase();
      return pName === cleanName ||
        cleanName.includes(pName) ||
        pName.includes(cleanName.replace('daerah istimewa', 'di'));
    });
    return found ? found[valueKey] : null;
  };

  const { minVal, maxVal, sorted } = useMemo(() => {
    const vals = provinceData.map(d => d[valueKey]).filter(v => v != null && !isNaN(v));
    const min = vals.length ? Math.min(...vals) : 0;
    const max = vals.length ? Math.max(...vals) : 0;
    const s = [...provinceData].sort((a, b) => (b[valueKey] || 0) - (a[valueKey] || 0));
    return { minVal: min, maxVal: max, sorted: s };
  }, [provinceData, valueKey]);

  const getRank = (name) => {
    const idx = sorted.findIndex(d => {
      const pName = (d.provinsi || d.wilayah || '').trim().toLowerCase();
      const cleanName = (name || '').trim().toLowerCase();
      return pName === cleanName || cleanName.includes(pName) || pName.includes(cleanName.replace('daerah istimewa', 'di'));
    });
    return idx >= 0 ? idx + 1 : null;
  };

  const getStyle = (feature) => {
    const name = feature.properties.Propinsi || feature.properties.name;
    const val = getProvinceValue(name);
    return {
      fillColor: val != null ? getColorForValue(val, minVal, maxVal) : '#94a3b8',
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: val != null ? 0.7 : 0.2
    };
  };

  function buildTooltipHtml(name) {
    const val = getProvinceValue(name);
    const rank = getRank(name);
    const displayVal = val != null
      ? (typeof val === 'number' ? val.toLocaleString('id-ID') : val) + ' ' + unit
      : 'Data tidak tersedia';
    const nationalAvg = (minVal + maxVal) / 2;
    const comparison = val != null
      ? val > nationalAvg
        ? `Di atas rata-rata nasional (${nationalAvg.toLocaleString('id-ID')})`
        : `Di bawah rata-rata nasional (${nationalAvg.toLocaleString('id-ID')})`
      : '';
    return `
      <div style="min-width:160px">
        <div style="font-weight:700;border-bottom:1px solid var(--color-border);padding-bottom:6px;margin-bottom:6px;font-size:13px">${name}</div>
        <div style="font-size:20px;font-weight:800;margin:4px 0">${displayVal}</div>
        ${rank ? `<div style="font-size:11px;color:var(--color-muted);margin:2px 0">Peringkat: #${rank} dari ${sorted.length} provinsi</div>` : ''}
        ${comparison ? `<div style="font-size:11px;color:var(--color-muted);margin:2px 0">${comparison}</div>` : ''}
        <div style="display:flex;gap:8px;margin-top:6px;padding-top:6px;border-top:1px solid var(--color-border);font-size:10px;color:var(--color-muted)">
          <span>Min: ${minVal.toLocaleString('id-ID')}</span>
          <span>Maks: ${maxVal.toLocaleString('id-ID')}</span>
        </div>
      </div>
    `;
  }

  const onEachFeature = (feature, layer) => {
    const name = feature.properties.Propinsi || feature.properties.name;

    layer.bindTooltip(buildTooltipHtml(name), {
      sticky: true,
      className: 'bg-surface font-sans rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-border'
    });

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: 0.85, weight: 2.5 });
        e.target.bindTooltip(buildTooltipHtml(name), {
          sticky: true,
          className: 'bg-surface font-sans rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-border'
        });
        e.target.bringToFront();
      },
      mouseout: (e) => {
        const val = getProvinceValue(name);
        e.target.setStyle({ fillOpacity: val != null ? 0.7 : 0.2, weight: 1 });
      },
      click: () => {
        if (onProvinceClick) onProvinceClick(name);
      }
    });
  };

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-border relative z-0">
      <MapContainer
        center={[-2.5489, 118.0149]}
        zoom={5}
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {geoData && (
          <GeoJSON
            key={mapKey || `${valueKey}-${provinceData.length}`}
            data={geoData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
      <div className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur-sm p-3 rounded-xl border border-border text-[11px] text-muted z-[1000] shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-3 h-3 rounded" style={{ background: 'linear-gradient(to right, #ef4444, #f97316, #f59e0b, #84cc16, #22c55e)' }}></div>
          <span>Rendah — Tinggi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#94a3b8] opacity-20 border border-[#94a3b8]"></div>
          <span>Tidak Ada Data</span>
        </div>
      </div>
    </div>
  );
};

export default IndonesiaMap;
