import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const IndonesiaMap = ({ provinceData = [], onProvinceClick, valueKey = 'value', unit = '' }) => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    // Using a more reliable province GeoJSON source
    fetch('https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Failed to load geojson", err));
  }, []);

  const getProvinceValue = (name) => {
    if (!name) return null;
    
    // Normalize string for better matching
    const cleanName = name.trim().toLowerCase();
    
    const found = provinceData.find(d => {
      const pName = (d.provinsi || d.wilayah || '').trim().toLowerCase();
      return pName === cleanName || 
             cleanName.includes(pName) || 
             pName.includes(cleanName.replace('daerah istimewa', 'di'));
    });
    
    return found ? found[valueKey] : null;
  };

  const getStyle = (feature) => {
    const name = feature.properties.Propinsi || feature.properties.name;
    const val = getProvinceValue(name);
    
    return {
      fillColor: val !== null && val !== undefined ? '#10b981' : '#94a3b8',
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: val !== null && val !== undefined ? 0.6 : 0.2
    };
  };

  const onEachFeature = (feature, layer) => {
    const name = feature.properties.Propinsi || feature.properties.name;
    const val = getProvinceValue(name);
    
    // Safety format for displaying the value
    const displayVal = val !== null && val !== undefined 
      ? (typeof val === 'number' ? val.toLocaleString('id-ID') : val) + ' ' + unit 
      : 'Data tidak tersedia';

    layer.bindTooltip(`
      <div class="p-1">
        <div class="font-bold border-b border-border text-primary pb-1 mb-1">${name}</div>
        <div class="text-xs text-foreground">${displayVal}</div>
      </div>
    `, {
      sticky: true,
      className: 'bg-surface font-sans rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-border'
    });

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: 0.8, weight: 2 });
      },
      mouseout: (e) => {
        e.target.setStyle({ fillOpacity: val !== null && val !== undefined ? 0.6 : 0.2, weight: 1 });
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
            data={geoData} 
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
      <div className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur-sm p-3 rounded-xl border border-border text-[11px] text-muted z-[1000] shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#10b981] opacity-60"></div>
          <span>Data Tersedia</span>
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
