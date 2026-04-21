import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, ArrowLeft, Navigation, Star, Search, Filter } from 'lucide-react';

const mockHospitals = [
  { id: 1, name: "City Care Hospital", lat: 28.6139, lng: 77.2090, phone: "011-23456789", rating: 4.5, type: "General", time: "5 min" },
  { id: 2, name: "Lifeline Medical", lat: 28.6250, lng: 77.2150, phone: "011-98765432", rating: 4.2, type: "Emergency", time: "12 min" },
  { id: 3, name: "St. Stephens Hosp.", lat: 28.6650, lng: 77.2250, phone: "011-45678901", rating: 4.8, type: "Tertiary", time: "18 min" },
  { id: 4, name: "Max Super Specialty", lat: 28.5244, lng: 77.2100, phone: "011-33445566", rating: 4.6, type: "Specialty", time: "22 min" },
];

const Hospitals = () => {
  const [userLoc, setUserLoc] = useState([28.6139, 77.2090]); // Default to Delhi
  const [hospitals, setHospitals] = useState([]);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get User Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLoc(coords);
        initMap(coords);
        calculateDistances(coords);
      }, () => {
        initMap(userLoc);
        calculateDistances(userLoc);
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const initMap = (center) => {
    if (mapInstance.current || !mapRef.current) return;
    
    // @ts-ignore
    mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView(center, 13);
    
    // @ts-ignore
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap'
    }).addTo(mapInstance.current);

    // User Marker
    // @ts-ignore
    L.circleMarker(center, { radius: 8, fillColor: '#2563eb', color: '#fff', weight: 3, fillOpacity: 1 }).addTo(mapInstance.current)
      .bindPopup('Your Location');

    // Hospital Markers
    mockHospitals.forEach(h => {
      // @ts-ignore
      L.marker([h.lat, h.lng], {
        // @ts-ignore
        icon: L.divIcon({
          className: 'hospital-marker',
          html: `<div style="background: #ef4444; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`
        })
      }).addTo(mapInstance.current)
        .bindPopup(`<b>${h.name}</b><br>${h.type}`);
    });
  };

  const calculateDistances = (center) => {
    const list = mockHospitals.map(h => {
      const dist = getDist(center[0], center[1], h.lat, h.lng);
      return { ...h, distance: dist.toFixed(1) };
    }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    setHospitals(list);
  };

  const getDist = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  return (
    <div className="page-container dashboard-container">
      <header className="dashboard-header animate-slide-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="icon-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <h2>Hospital Finder</h2>
        </div>
      </header>

      <div className="search-wrap animate-slide-up" style={{ animationDelay: '0.1s', marginBottom: '1.25rem' }}>
        <div className="search-box glassmorphism" style={{ padding: '0.5rem 0.85rem' }}>
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search by name or specialty..." style={{ fontSize: '0.85rem' }} />
          <Filter size={16} color="var(--primary)" />
        </div>
      </div>

      <div className="map-wrapper animate-slide-up" style={{ 
        height: '200px', 
        borderRadius: '1.25rem', 
        overflow: 'hidden', 
        marginBottom: '1.25rem', 
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
      </div>

      <div className="hospitals-list">
        <div className="section-head animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3>Nearby Facilities</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Found {hospitals.length} result</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {hospitals.map((h, idx) => (
            <div key={h.id} className="hospital-card glassmorphism animate-slide-up" style={{ animationDelay: `${0.3 + idx * 0.1}s`, padding: '1rem' }}>
              <div className="h-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h4 style={{ margin: 0 }}>{h.name}</h4>
                  <span style={{ background: 'var(--success)', color: 'white', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>OPEN</span>
                </div>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <MapPin size={12} /> {h.distance} km • {h.type} • {h.time}
                </p>
                <div className="rating" style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                  <Star size={12} fill="#f59e0b" color="#f59e0b" /> {h.rating} 
                  <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>(1.2k reviews)</span>
                </div>
              </div>
              <div className="h-actions" style={{ marginLeft: '1rem' }}>
                <a href={`tel:${h.phone}`} className="call-btn" style={{ background: '#f0fdf4' }}>
                  <Phone size={18} color="#10b981" />
                </a>
                <button className="nav-btn" style={{ background: '#eff6ff' }}>
                  <Navigation size={18} color="#3b82f6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hospitals;

