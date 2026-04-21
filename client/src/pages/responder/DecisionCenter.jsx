import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResponder } from '../../context/ResponderContext';
import { 
  MapPin, User, Clock, Phone, Navigation, AlertTriangle, ChevronLeft, ShieldCheck 
} from 'lucide-react';

const DecisionCenter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAlertById, responders, dispatchResponder } = useResponder();
  const [dispatchTab, setDispatchTab] = useState('All');
  const [selectedResponder, setSelectedResponder] = useState(null);
  
  const alertConfig = getAlertById(id);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!alertConfig) {
      navigate('/responder/control'); // fail-safe if invalid ID
      return;
    }

    if (!mapInstance.current && mapRef.current) {
      if (!window.L) return;
      mapInstance.current = window.L.map(mapRef.current, { zoomControl: false }).setView(alertConfig.userLocation, 14);
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
    }
    
    if (mapInstance.current && window.L) {
       mapInstance.current.eachLayer(layer => {
         if (layer instanceof window.L.CircleMarker || layer instanceof window.L.Marker) {
           mapInstance.current.removeLayer(layer);
         }
       });

       // Victim Marker (Pulsing Red)
       window.L.circleMarker(alertConfig.userLocation, { radius: 10, fillColor: '#ef4444', color: '#fff', weight: 3, fillOpacity: 0.9 })
           .addTo(mapInstance.current).bindPopup(`<b>${alertConfig.userName}</b><br>Victim Location`);

       // Available Responders Only
       responders.forEach(r => {
         if(r.status === 'Available') {
            const color = '#10b981';
            window.L.circleMarker(r.location, { radius: 6, fillColor: color, color: '#fff', weight: 2, fillOpacity: 1 })
            .addTo(mapInstance.current)
            .bindPopup(`<b>${r.name}</b><br>${r.role}`);
         }
       });
    }
  }, [alertConfig, responders, navigate]);

  if (!alertConfig) return null;

  const calculateDistance = (loc1, loc2) => {
    if (!loc1 || !loc2) return 0;
    const dx = loc1[0] - loc2[0];
    const dy = loc1[1] - loc2[1];
    return (Math.sqrt(dx*dx + dy*dy) * 111).toFixed(1);
  };

  const handleConfirmAssignment = () => {
    if(selectedResponder) {
      dispatchResponder(alertConfig.id, selectedResponder);
      navigate(`/responder/tracking/${alertConfig.id}`);
    }
  };

  const severityColor = alertConfig.severity === 'High' ? '#ef4444' : alertConfig.severity === 'Medium' ? '#f59e0b' : '#10b981';

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'Outfit' }}>
      
      {/* HEADER */}
      <header className="glass-surface" style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
           <button onClick={() => navigate('/responder/control')} className="icon-btn" style={{ background: 'var(--bg-soft)', padding: '0.6rem', borderRadius: '50%' }}>
             <ChevronLeft size={20} />
           </button>
           <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#0ea5e9" /> Decision Center
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Emergency ID: {alertConfig.id}</span>
           </div>
        </div>
        <div style={{ background: `rgba(${alertConfig.severity === 'High' ? '239, 68, 68' : '245, 158, 11'}, 0.1)`, padding: '0.4rem 1rem', borderRadius: '2rem', border: `1px solid ${severityColor}`, color: severityColor, fontWeight: 800, fontSize: '0.8rem' }}>
           {alertConfig.severity} PRIORITY
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
        
        {/* LEFT PANEL - DATA & RESPONDERS */}
        <div style={{ width: '380px', background: 'var(--card-bg)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', zIndex: 5 }}>
          
          {/* Victim Vitals */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
             <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', color: 'var(--text-main)' }}>Victim Vitals</h3>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 <div style={{ background: 'var(--bg-soft)', padding: '0.6rem', borderRadius: '50%', color: 'var(--primary)' }}><User size={16} /></div>
                 <div><strong style={{ display: 'block', fontSize: '0.95rem' }}>{alertConfig.userName}</strong><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Patient Name</span></div>
               </div>
               
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 <div style={{ background: 'var(--bg-soft)', padding: '0.6rem', borderRadius: '50%', color: 'var(--primary)' }}><Phone size={16} /></div>
                 <div><strong style={{ display: 'block', fontSize: '0.9rem' }}>{alertConfig.phone}</strong><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contact</span></div>
               </div>

               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 <div style={{ background: 'var(--bg-soft)', padding: '0.6rem', borderRadius: '50%', color: 'var(--primary)' }}><MapPin size={16} /></div>
                 <div><strong style={{ display: 'block', fontSize: '0.85rem' }}>{alertConfig.userLocation[0].toFixed(4)}, {alertConfig.userLocation[1].toFixed(4)}</strong><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GPS Coordinates</span></div>
               </div>

               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.6rem', borderRadius: '50%', color: '#ef4444' }}><AlertTriangle size={16} /></div>
                 <div><strong style={{ display: 'block', fontSize: '0.9rem' }}>{alertConfig.type}</strong><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Condition</span></div>
               </div>

               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 <div style={{ background: 'var(--bg-soft)', padding: '0.6rem', borderRadius: '50%', color: 'var(--primary)' }}><Clock size={16} /></div>
                 <div><strong style={{ display: 'block', fontSize: '0.9rem' }}>{new Date(alertConfig.time).toLocaleTimeString()}</strong><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Time Elapsed</span></div>
               </div>
             </div>
          </div>

          {/* Responder Assignment Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{ padding: '0.8rem 1rem', background: 'var(--bg-soft)' }}>
               <h3 style={{ margin: '0 0 0.6rem 0', fontSize: '0.95rem' }}>Assign Responder</h3>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                 {['All', 'Ambulance', 'Medical', 'Volunteer'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setDispatchTab(tab)}
                      style={{ 
                        flex: 1, padding: '0.3rem', borderRadius: '2rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.7rem',
                        background: dispatchTab === tab ? 'var(--primary)' : 'var(--card-bg)', 
                        color: dispatchTab === tab ? '#fff' : 'var(--text-muted)',
                        boxShadow: dispatchTab === tab ? '0 4px 10px rgba(14, 165, 233, 0.3)' : 'none'
                      }}>
                       {tab}
                    </button>
                 ))}
               </div>
            </div>

            <div style={{ padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto' }}>
                {responders
                  .filter(r => r.status === 'Available' && (dispatchTab === 'All' || r.role === dispatchTab))
                  .map(r => ({...r, distance: parseFloat(calculateDistance(r.location, alertConfig.userLocation))}))
                  .sort((a,b) => a.distance - b.distance)
                  .map((responder, idx) => (
                  <label key={responder.id} className="glass" style={{ padding: '0.8rem', borderRadius: '1rem', border: selectedResponder === responder.id ? '2px solid #10b981' : (idx === 0 ? '1px solid #0ea5e9' : '1px solid var(--border-color)'), display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {idx === 0 && <span style={{ position: 'absolute', top: '-8px', left: '1rem', background: '#0ea5e9', color: '#fff', fontSize: '0.6rem', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontWeight: 800 }}>MAPPED NEAREST</span>}
                    
                    <input 
                       type="radio" 
                       name="responder-select" 
                       checked={selectedResponder === responder.id} 
                       onChange={() => setSelectedResponder(responder.id)} 
                       style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
                    />

                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                          <User size={14} /> {responder.name} 
                        </h4>
                        <span style={{ fontSize: '0.7rem', background: 'var(--bg-soft)', color: 'var(--text-muted)', padding: '0.1rem 0.5rem', borderRadius: '1rem' }}>{responder.role}</span>
                      </div>
                      <div style={{ color: '#0ea5e9', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Navigation size={14} /> ~{responder.distance} km
                      </div>
                    </div>
                  </label>
                ))}

                {responders.filter(r => r.status === 'Available' && (dispatchTab === 'All' || r.role === dispatchTab)).length === 0 && (
                   <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                     No units match this criteria.
                   </div>
                )}
            </div>

            {/* Bottom Primary Action */}
            <div style={{ padding: '0.8rem 1rem', borderTop: '1px solid var(--border-color)', background: 'var(--card-bg)', zIndex: 10 }}>
               <button 
                 disabled={!selectedResponder}
                 className="primary-btn" 
                 style={{ width: '100%', padding: '0.7rem', fontSize: '0.95rem', opacity: selectedResponder ? 1 : 0.5, cursor: selectedResponder ? 'pointer' : 'not-allowed' }} 
                 onClick={handleConfirmAssignment}>
                 Confirm Assignment
               </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - MAP */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }}></div>
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.8rem 1.2rem', background: 'var(--card-bg)', backdropFilter: 'blur(10px)', borderRadius: '1rem', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '0.8rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)' }}>
             <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></span>
             <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Victim Targeting Active</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DecisionCenter;
