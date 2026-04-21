import React, { useState, useEffect, useRef } from 'react';
import { useResponder } from '../../context/ResponderContext';
import { 
  Plus, Trash2, Users, MapPin, Phone, Activity, ShieldCheck, 
  X, CheckCircle, Navigation, Ambulance, Crosshair, CloudLightning, Car
} from 'lucide-react';
import '../../index.css';

const ResponderManagement = () => {
  const { responders, addResponder, deleteResponder, updateResponderStatus } = useResponder();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [envStats] = useState({ traffic: 'Dense (+4m Drop)', weather: 'Clear Visibility' });
  
  const [formData, setFormData] = useState({
    name: '', phone: '', role: 'Ambulance', address: '', status: 'Available'
  });

  const availableCount = responders.filter(r => r.status === 'Available').length;
  const transitCount = responders.filter(r => r.status === 'Assigned' || r.status === 'Reached').length;

  // Map Refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layerGroup = useRef(null);
  const coverageGroup = useRef(null);

  useEffect(() => {
    if (!mapInstance.current && mapRef.current && window.L) {
      mapInstance.current = window.L.map(mapRef.current, { zoomControl: true }).setView([0, 0], 12);
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
      layerGroup.current = window.L.layerGroup().addTo(mapInstance.current);
      coverageGroup.current = window.L.layerGroup().addTo(mapInstance.current);
    }
    
    if (mapInstance.current && layerGroup.current && window.L) {
       layerGroup.current.clearLayers();
       
       responders.forEach(r => {
          let color = r.status === 'Available' ? '#10b981' : r.status === 'Assigned' || r.status === 'Reached' ? '#f59e0b' : '#ef4444';
          let pulseClass = r.status === 'Available' ? 'pulse-safe' : '';
          
          const markerHtml = `
            <div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};" class="${pulseClass}"></div>
          `;
          const customIcon = window.L.divIcon({ html: markerHtml, className: '', iconSize: [14, 14], iconAnchor: [7, 7] });
          
          window.L.marker(r.location, { icon: customIcon })
            .addTo(layerGroup.current)
            .bindPopup(`<b>${r.name}</b><br>${r.role} • ${r.status}`);
       });
    }
  }, [responders]);

  const locateAsset = (location) => {
    if(mapInstance.current && window.L) {
        // Clear old coverage circles
        coverageGroup.current.clearLayers();

        // Fly to GPS
        mapInstance.current.flyTo(location, 14, { animate: true, duration: 1.5 });
        
        // Draw 2KM Tactical Coverage Radius
        setTimeout(() => {
           window.L.circle(location, {
               color: '#0ea5e9',
               fillColor: '#0ea5e9',
               fillOpacity: 0.15,
               radius: 2000, // 2km radius
               weight: 2,
               dashArray: '5, 5'
           }).addTo(coverageGroup.current)
             .bindPopup('2KM Valid Coverage Zone');
        }, 1500);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if(!formData.name || !formData.phone || !formData.address) return;
    
    setIsGeocoding(true);
    let newCoords = [0, 0]; // Fallback

    try {
        // Nominatim OpenStreetMap Geocoding API
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            newCoords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        } else {
            alert("Warning: Address failed to verify exactly. Deploying via Sector defaults. Edit location manually later if needed.");
        }
    } catch (err) {
        console.error("Geocoding failed:", err);
    }
    setIsGeocoding(false);

    addResponder({
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      location: newCoords,
      status: formData.status
    });
    
    setFormData({ name: '', phone: '', role: 'Ambulance', address: '', status: 'Available' });
    setShowAddModal(false);
    
    setTimeout(() => locateAsset(newCoords), 500); // Fly + circle new unit!
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(500px, 1fr) 1fr', gap: '1.5rem', height: 'calc(100vh - 50px)', overflow: 'hidden' }}>
      
      {/* LEFT PANEL: DATA & CONTROLS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem', paddingBottom: '2rem' }}>
        
        {/* Premium Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
           <div>
              <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck color="#0ea5e9" size={24} /> Fleet Radar Console
              </h1>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Administrative terminal bridging data lists and tactical radar views.</p>
           </div>
           <button onClick={() => setShowAddModal(true)} className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.2rem', borderRadius: '2rem', fontSize: '0.9rem' }}>
              <Plus size={16} /> Provision Unit
           </button>
        </div>

        {/* KPI Cards (Compact Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
           <div className="glass" style={{ padding: '1rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0ea5e9', fontSize: '0.85rem', fontWeight: 600 }}>
                <Users size={16} /> Total Capacity
              </div>
              <h2 style={{ margin: 0, fontSize: '1.6rem' }}>{responders.length} <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>units</span></h2>
           </div>
           <div className="glass" style={{ padding: '1rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                <CheckCircle size={16} /> Safe / Available
              </div>
              <h2 style={{ margin: 0, fontSize: '1.6rem' }}>{availableCount} <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>units</span></h2>
           </div>
           <div className="glass" style={{ padding: '1rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
                <Navigation size={16} /> Live Missions
              </div>
              <h2 style={{ margin: 0, fontSize: '1.6rem' }}>{transitCount} <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>active</span></h2>
           </div>
        </div>

        {/* Vertical Compressed Datatable */}
        <div className="modern-card" style={{ padding: 0, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-soft)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Active Sector Roster</h3>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
             <div style={{ display: 'flex', flexDirection: 'column' }}>
                {responders.map(r => (
                  <div key={r.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) auto', gap: '1rem', padding: '1.25rem', borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s', background: 'transparent' }} className="hover-lift-soft">
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.status === 'Available' ? '#10b981' : r.status === 'Assigned' || r.status === 'Reached' ? '#f59e0b' : '#ef4444' }}></span>
                           <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{r.name}</h4>
                           <span style={{ fontSize: '0.7rem', background: 'var(--bg-soft)', padding: '0.1rem 0.5rem', borderRadius: '1rem', color: 'var(--text-muted)' }}>{r.role}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={12}/> {r.phone}</span>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#0ea5e9' }}><MapPin size={12}/> {r.location[0].toFixed(3)}, {r.location[1].toFixed(3)}</span>
                        </div>
                     </div>
                     
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button className="icon-btn" style={{ background: 'var(--bg-soft)' }} onClick={() => locateAsset(r.location)} title="Target Asset in Radar & Draw Coverage">
                          <Crosshair size={16} color="#0ea5e9" />
                        </button>
                        <button className="icon-btn" style={{ background: 'var(--bg-soft)' }} onClick={() => updateResponderStatus(r.id, null, r.status === 'Available' ? 'Unavailable' : 'Available')} title="Toggle Status">
                          <Activity size={16} color={r.status === 'Available' ? '#10b981' : '#ef4444'} />
                        </button>
                        <button className="icon-btn" style={{ background: 'rgba(239, 68, 68, 0.1)' }} onClick={() => deleteResponder(r.id)} title="Decommission Unit">
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                     </div>
                  </div>
                ))}
                {responders.length === 0 && (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No units match active filters.</div>
                )}
             </div>
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: LIVE TACTICAL RADAR */}
      <div className="modern-card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
         <div style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             
             {/* Dynamic Environmental HUD */}
             <div style={{ background: 'var(--card-bg)', backdropFilter: 'blur(10px)', padding: '0.6rem 1rem', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Environmental Sensors</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                   <CloudLightning size={14} color="#0ea5e9" /> {envStats.weather}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                   <Car size={14} color="#f59e0b" /> {envStats.traffic}
                </div>
             </div>

             {/* Live Radar Pulse */}
             <div style={{ background: 'var(--card-bg)', backdropFilter: 'blur(10px)', padding: '0.8rem 1.2rem', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} className="pulse-safe"></span> Sector Radar Active
             </div>
         </div>
         
         <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
      </div>


      {/* OVERLAY MODAL FOR ADDING RESPONDER */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
           <div className="modern-card animate-slide-up" style={{ width: '100%', maxWidth: '550px', padding: 0 }}>
              
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-soft)' }}>
                 <h2 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Plus color="#0ea5e9"/> Provision Sector Asset</h2>
                 <button onClick={() => setShowAddModal(false)} className="icon-btn" style={{ width: '35px', height: '35px', borderRadius: '50%' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleAdd} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Unit Identifier / Call Sign</label>
                    <input type="text" className="glass-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. MedFlight 7" required style={{ width: '100%', padding: '1rem' }} />
                 </div>

                 <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                       <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Asset Class</label>
                       <select className="glass-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '1rem' }}>
                         <option value="Ambulance">Ambulance (ALS)</option>
                         <option value="Medical">Medical Staff (Doctor)</option>
                         <option value="Volunteer">Citizen Volunteer</option>
                       </select>
                    </div>
                    <div style={{ flex: 1 }}>
                       <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Initial Line Status</label>
                       <select className="glass-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '1rem' }}>
                         <option value="Available">Available for Dispatch</option>
                         <option value="Unavailable">Offline / Maintenance</option>
                       </select>
                    </div>
                 </div>

                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Primary Contact Comms</label>
                    <input type="text" className="glass-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91-XXXXX" required style={{ width: '100%', padding: '1rem' }} />
                 </div>

                 {/* REAL LIFE - GEOCODING ADDRESS INSTEAD OF RAW GPS */}
                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Sector Address / Target Plot</label>
                    <input type="text" className="glass-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="e.g. Hauz Khas, New Delhi" required style={{ width: '100%', padding: '1rem' }} />
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>The Geocoding engine will automatically triangulate this to raw GPS math integers upon dispatch.</p>
                 </div>

                 <button type="submit" disabled={isGeocoding} className="primary-btn" style={{ marginTop: '1rem', padding: '1.2rem', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: isGeocoding ? 0.7 : 1 }}>
                    {isGeocoding ? <Activity size={20} className="spin-animation" /> : <Activity size={20} />}
                    {isGeocoding ? 'Triangulating GPS...' : 'Authorize Deployment'}
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default ResponderManagement;
