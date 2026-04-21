import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResponder } from '../../context/ResponderContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Phone, X, CheckCircle, Mic, ArrowLeft, ShieldCheck,
  Moon, Sun, ChevronRight, Clock, MapPin, Navigation
} from 'lucide-react';

const STAGES = ['Available', 'Deployed', 'En Route', 'On Scene', 'Patient Onboard', 'Clinical Handover', 'Mission Resolved'];

const LiveTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const {
    getAlertById, responders, updateResponderStatus,
    cancelTask, moveResponder, submitHandoverLog
  } = useResponder();

  const mission = getAlertById(id);
  const myUserStr = localStorage.getItem('user');
  const myUser = (myUserStr && myUserStr !== 'null' && myUserStr !== 'undefined') ? JSON.parse(myUserStr) : {};
  
  // Prioritize finding 'me' by the mission's assigned ID, then local user cache
  const me = responders.find(r => r.id === mission?.assignedResponderId) || 
             responders.find(r => r.id === (myUser._id || myUser.id)) || 
             responders[0];

  const [showHandover, setShowHandover] = useState(false);
  const [handoverNote, setHandoverNote] = useState('');

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const meMarker = useRef(null);
  const targetMarker = useRef(null);
  const routeLine = useRef(null);
  const tileLayerRef = useRef(null);

  useEffect(() => {
    if (!mission) navigate('/responder/field');
  }, [mission, navigate]);

  useEffect(() => {
    let interval;
    if (me?.status === 'En Route' && mission) {
      interval = setInterval(() => {
        moveResponder(me.id, mission.userLocation);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [me?.status, mission]);

  useEffect(() => {
    if (!mapInstance.current && mapRef.current && window.L && mission && me) {
      mapInstance.current = window.L.map(mapRef.current, {
        zoomControl: false, attributionControl: false
      }).setView(me.location || [28.5284, 77.2140], 15);
    }

    if (mapInstance.current && window.L) {
      if (tileLayerRef.current) tileLayerRef.current.remove();
      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      tileLayerRef.current = window.L.tileLayer(tileUrl).addTo(mapInstance.current);
    }

    if (mapInstance.current && window.L && mission && me) {
      if (meMarker.current) mapInstance.current.removeLayer(meMarker.current);
      if (targetMarker.current) mapInstance.current.removeLayer(targetMarker.current);
      if (routeLine.current) mapInstance.current.removeLayer(routeLine.current);

      const meIcon = window.L.divIcon({
        html: `<div class="lt-marker-shell"><div class="lt-marker-me"></div></div>`,
        className: '', iconSize: [40, 40], iconAnchor: [20, 20]
      });
      meMarker.current = window.L.marker(me.location, { icon: meIcon }).addTo(mapInstance.current);

      const tgtIcon = window.L.divIcon({
        html: `<div class="lt-marker-shell"><div class="lt-marker-target"></div></div>`,
        className: '', iconSize: [40, 40], iconAnchor: [20, 20]
      });
      targetMarker.current = window.L.marker(mission.userLocation, { icon: tgtIcon }).addTo(mapInstance.current);

      routeLine.current = window.L.polyline([me.location, mission.userLocation], {
        color: '#00d4e8', weight: 4, opacity: 0.8, dashArray: '8, 12'
      }).addTo(mapInstance.current);

      const bounds = window.L.latLngBounds([me.location, mission.userLocation]);
      mapInstance.current.flyToBounds(bounds, { padding: [100, 100], duration: 1.5 });
    }
  }, [me?.location, mission, isDark]);

  if (!mission || !me) return null;

  const currentIndex = STAGES.findIndex(s => s.toLowerCase() === (me?.status?.toLowerCase() || ''));
  const handleStageClick = (nextStatus) => {
    updateResponderStatus(me.id, mission.id, nextStatus);
    if (nextStatus === 'Mission Resolved') navigate('/responder/field');
  };

  const getStatusTitle = () => {
    if (!me?.status) return 'Unit Assigned';
    const s = me.status.toLowerCase();
    if (s === 'deployed' || s === 'available' || s === 'pending') return 'Unit Assigned';
    if (s === 'en route') return 'En Route to Scene';
    if (s === 'on scene') return 'On Scene';
    if (s === 'patient onboard') return 'Patient Onboard';
    if (s === 'clinical handover' || s === 'handover') return 'Hospital Handover';
    if (s === 'mission resolved' || s === 'resolved') return 'Mission Resolved';
    return me.status;
  };

  return (
    <div className="lt-page">
      <div id="lt-map" ref={mapRef} />

      {/* ULTRA-COMPACT MISSION CARD - HIDDEN WHEN HANDOVER OPEN */}
      {!showHandover && (
        <div className="lt-bottom-area">
          <div className="lt-kiwi-card glassmorphism">
            <div className="lt-k-top-row">
              <div className="lt-k-status-pill">
                <div className="lt-status-dot pulse" />
                <span className="lt-status-text">{getStatusTitle()}</span>
              </div>
              <div className="lt-k-eta-capsule">
                <Clock size={12} />
                <span className="lt-eta-val">4 MIN</span>
              </div>
            </div>

            <div className="lt-k-main-info">
              <div className="lt-patient-avatar">
                {mission.userName?.charAt(0) || 'P'}
              </div>
              <div className="lt-patient-details">
                <h3 className="lt-patient-name">{mission.userName}</h3>
                <p className="lt-mission-type">{mission.type}</p>
              </div>
              <div className="lt-k-actions">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${mission.userLocation[0]},${mission.userLocation[1]}`} className="lt-action-btn btn-nav" target="_blank" rel="noreferrer">
                    <Navigation size={18} />
                  </a>
                  <a href={`tel:${mission.phone}`} className="lt-action-btn btn-call">
                    <Phone size={18} />
                  </a>
              </div>
            </div>

            <div className="lt-progress-track">
               <div className="lt-progress-bar" style={{ width: `${(currentIndex / 5) * 100}%` }} />
               <div className="lt-progress-nodes">
                  {['En Route', 'On Scene', 'Patient Onboard', 'Clinical Handover'].map((stage) => {
                    const sIdx = STAGES.indexOf(stage);
                    const isDone = currentIndex >= sIdx;
                    return (
                      <div 
                        key={stage} 
                        className={`lt-p-node ${isDone ? 'done' : ''}`}
                        onClick={() => stage === 'Clinical Handover' ? setShowHandover(true) : handleStageClick(stage)}
                      />
                    );
                  })}
               </div>
            </div>

            <div className="lt-action-footer">
               {me.status === 'Patient Onboard' ? (
                  <button className="lt-hospital-btn" onClick={() => handleStageClick('Clinical Handover')}>
                    HOSPITAL ROUTE
                  </button>
               ) : me.status === 'Clinical Handover' ? (
                  <button className="lt-confirm-complete-btn" onClick={() => handleStageClick('Mission Resolved')}>
                    <CheckCircle size={16} /> RESOLVE MISSION
                  </button>
               ) : (
                  <button className="lt-cancel-mission-btn" onClick={() => window.confirm('Abort?') && (cancelTask(mission.id), navigate('/responder/field'))}>
                    ABORT DEPLOYMENT
                  </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* HANDOVER MODAL - MOBILE BOTTOM SHEET */}
      {showHandover && (
        <div className="lt-overlay">
          <div className="lt-handover-sheet">
            <div className="lt-sheet-drag-handle" />
            <div className="lt-sheet-header">
              <h3>Handover Log</h3>
              <button className="lt-close-btn" onClick={() => setShowHandover(false)}><X size={18} /></button>
            </div>
            <p className="lt-sheet-sub">Briefly record vital conditions.</p>
            <div className="lt-input-wrap">
              <textarea
                placeholder="BP, HR, SpO2, GCS..."
                value={handoverNote}
                onChange={e => setHandoverNote(e.target.value)}
              />
              <button className="lt-mic-btn"><Mic size={18} /></button>
            </div>
            <button
              className="lt-submit-btn"
              onClick={() => {
                submitHandoverLog(mission.id, handoverNote);
                setShowHandover(false);
                handleStageClick('Clinical Handover');
              }}
            >
              FINALIZE HANDOVER
            </button>
          </div>
        </div>
      )}

      <style>{`
        .lt-page { position: fixed; inset: 0; z-index: 100; font-family: 'Outfit', sans-serif; overflow: hidden; }
        #lt-map { position: absolute; inset: 0; z-index: 0; }

        .lt-bottom-area {
          position: fixed; bottom: 1rem; left: 0; width: 100vw; z-index: 10000;
          display: flex; justify-content: center; pointer-events: none;
        }
        
        .lt-kiwi-card {
          width: 92vw; max-width: 320px; 
          background: ${isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-radius: 18px; padding: 0.85rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
          pointer-events: auto; display: flex; flex-direction: column; gap: 0.6rem;
          animation: ltPop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lt-k-top-row { display: flex; justify-content: space-between; align-items: center; }
        .lt-k-status-pill { display: flex; align-items: center; gap: 0.3rem; background: rgba(0, 212, 232, 0.1); padding: 3px 8px; border-radius: 20px; }
        .lt-status-dot { width: 5px; height: 5px; border-radius: 50%; background: #00d4e8; }
        .lt-status-dot.pulse { animation: ltP 1.5s infinite; }
        .lt-status-text { font-size: 0.65rem; font-weight: 850; color: #00d4e8; text-transform: uppercase; }

        .lt-k-eta-capsule { display: flex; align-items: center; gap: 0.3rem; background: #10b981; padding: 3px 8px; border-radius: 20px; color: white; font-size: 0.65rem; font-weight: 950; }

        .lt-k-main-info { display: flex; align-items: center; gap: 0.6rem; }
        .lt-patient-avatar { width: 38px; height: 38px; background: var(--primary-gradient); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 950; color: white; font-size: 1rem; }
        .lt-patient-details { flex: 1; min-width: 0; }
        .lt-patient-name { font-size: 0.9rem; font-weight: 850; color: ${isDark ? 'white' : '#1e293b'}; margin: 0; letter-spacing: -0.01em; }
        .lt-mission-type { font-size: 0.68rem; color: ${isDark ? '#94a3b8' : '#64748b'}; margin: 0; font-weight: 600; }

        .lt-k-actions { display: flex; gap: 0.4rem; }
        .lt-action-btn { width: 34px; height: 34px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .btn-nav { background: ${isDark ? 'rgba(0, 212, 232, 0.1)' : '#e0f2fe'}; color: #00d4e8; }
        .btn-call { background: #3b82f6; color: white; }

        .lt-progress-track { position: relative; height: 2px; background: rgba(148,163,184,0.15); margin: 0.4rem 0.2rem; }
        .lt-progress-bar { height: 100%; background: #00d4e8; transition: 0.5s; }
        .lt-progress-nodes { position: absolute; top: -3px; left: 0; right: 0; display: flex; justify-content: space-between; }
        .lt-p-node { width: 8px; height: 8px; border-radius: 50%; background: ${isDark ? '#1e293b' : 'white'}; border: 1px solid rgba(148,163,184,0.3); }
        .lt-p-node.done { background: #00d4e8; border-color: #00d4e8; }

        .lt-action-footer { margin-top: 0.2rem; }
        .lt-hospital-btn { width: 100%; padding: 0.7rem; background: #00d4e8; color: white; border: none; border-radius: 10px; font-weight: 900; font-size: 0.8rem; }
        .lt-confirm-complete-btn { width: 100%; padding: 0.7rem; background: var(--primary-gradient); color: white; border: none; border-radius: 10px; font-weight: 900; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 5px; }
        .lt-cancel-mission-btn { width: 100%; font-size: 0.6rem; color: #94a3b8; font-weight: 700; background: none; border: none; opacity: 0.6; }

        /* HANDOVER BOTTOM SHEET */
        .lt-overlay {
          position: fixed; inset: 0; z-index: 20000;
          background: rgba(0,0,0,0.6); display: flex; align-items: flex-end; justify-content: center;
        }
        .lt-handover-sheet { 
          width: 100vw; max-width: 500px; background: ${isDark ? '#0f172a' : 'white'}; 
          border-radius: 24px 24px 0 0; padding: 1.25rem; 
          animation: ltSheetUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          display: flex; flex-direction: column; gap: 0.75rem;
        }
        .lt-sheet-drag-handle { width: 40px; height: 4px; background: rgba(148,163,184,0.3); border-radius: 2px; margin: -0.5rem auto 0.5rem auto; }
        .lt-sheet-header { display: flex; justify-content: space-between; align-items: center; }
        .lt-sheet-header h3 { font-size: 1.1rem; font-weight: 950; color: ${isDark ? 'white' : '#1e293b'}; margin: 0; }
        .lt-close-btn { background: none; border: none; color: #94a3b8; }
        .lt-sheet-sub { font-size: 0.75rem; color: #64748b; margin: 0; }
        .lt-input-wrap textarea {
          width: 100%; height: 100px; background: ${isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'}; 
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}; 
          border-radius: 12px; padding: 0.75rem; color: ${isDark ? 'white' : '#1e293b'}; font-size: 0.9rem; resize: none;
        }
        .lt-mic-btn { position: absolute; bottom: 0.75rem; right: 0.75rem; background: none; border: none; color: #64748b; }
        .lt-submit-btn { width: 100%; padding: 0.9rem; background: var(--primary-gradient); color: white; border: none; border-radius: 14px; font-weight: 950; font-size: 0.9rem; }

        .lt-marker-shell { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
        .lt-marker-me { width: 12px; height: 12px; background: #00d4e8; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #00d4e8; }
        .lt-marker-target { width: 14px; height: 14px; background: #ef4444; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #ef4444; }
        
        @keyframes ltPop { from { opacity: 0; transform: scale(0.95) translateY(10px); } }
        @keyframes ltSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes ltP { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
      `}</style>
    </div>
  );
};

export default LiveTracking;
