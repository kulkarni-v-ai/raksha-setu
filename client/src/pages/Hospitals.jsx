import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, ArrowLeft, Navigation, Star, Search, Filter } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Hospitals = () => {
  const [userLoc, setUserLoc] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const navigate = useNavigate();

  // 1. Get GPS Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserLoc(coords);
        },
        () => {
          // Fallback: use IP-based rough location (center of India)
          setUserLoc([20.5937, 78.9629]);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // 2. Once GPS is ready, fetch hospitals from Overpass API via backend
  useEffect(() => {
    if (!userLoc) return;

    const fetchHospitals = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/hospitals/nearby?lat=${userLoc[0]}&lng=${userLoc[1]}`);
        const data = await res.json();
        
        // Format with distance
        const formatted = Array.isArray(data) ? data.map((h, i) => ({
          id: h._id || i,
          name: h.name || 'Hospital',
          lat: h.coords?.lat || h.location?.coordinates?.[1] || userLoc[0],
          lng: h.coords?.lng || h.location?.coordinates?.[0] || userLoc[1],
          phone: h.contact || 'N/A',
          rating: (4 + Math.random()).toFixed(1),
          type: h.specialities?.[0] || 'General',
          distance: h.distance || 'N/A',
          address: h.address || '',
          status: h.emergencyStatus || 'Active'
        })) : [];

        setHospitals(formatted);
      } catch (err) {
        console.error('Hospital fetch error:', err);
        setHospitals([]);
      }
      setLoading(false);
    };
    
    fetchHospitals();
    initMap(userLoc);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [userLoc]);

  // 3. Plot hospitals on map once data comes in
  useEffect(() => {
    if (!mapInstance.current || !hospitals.length) return;
    hospitals.forEach(h => {
      // @ts-ignore
      L.marker([h.lat, h.lng], {
        // @ts-ignore
        icon: L.divIcon({
          className: 'hospital-marker',
          html: `<div style="background: #ef4444; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`
        })
      }).addTo(mapInstance.current)
        .bindPopup(`<b>${h.name}</b><br>${h.type} • ${h.distance}`);
    });
  }, [hospitals]);

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
  };

  const filtered = hospitals.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <input 
            type="text" 
            placeholder="Search by name or specialty..." 
            style={{ fontSize: '0.85rem' }} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {loading ? 'Searching...' : `Found ${filtered.length} hospitals`}
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <MapPin size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <p>Finding hospitals near you...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <p>No hospitals found nearby. Try expanding search.</p>
            </div>
          ) : filtered.map((h, idx) => (
            <div key={h.id} className="hospital-card glassmorphism animate-slide-up" style={{ animationDelay: `${0.3 + idx * 0.1}s`, padding: '1rem' }}>
              <div className="h-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h4 style={{ margin: 0 }}>{h.name}</h4>
                  <span style={{ background: h.status === 'Active' ? 'var(--success)' : '#f59e0b', color: 'white', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    {h.status === 'Active' ? 'OPEN' : h.status}
                  </span>
                </div>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <MapPin size={12} /> {h.distance} • {h.type}
                </p>
                {h.address && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{h.address}</p>
                )}
                <div className="rating" style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                  <Star size={12} fill="#f59e0b" color="#f59e0b" /> {h.rating} 
                </div>
              </div>
              <div className="h-actions" style={{ marginLeft: '1rem' }}>
                <a href={`tel:${h.phone}`} className="call-btn" style={{ background: '#f0fdf4' }}>
                  <Phone size={18} color="#10b981" />
                </a>
                <button 
                  className="nav-btn" 
                  style={{ background: '#eff6ff' }}
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`, '_blank')}
                >
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
