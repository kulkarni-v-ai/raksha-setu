import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, MapPin, Phone, Edit3, Trash2, 
  Plus, Search, Hospital, Globe, Info 
} from 'lucide-react';

const HospitalManagement = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingId, setEditingId] = useState(null);
  const [newHospital, setNewHospital] = useState({
    name: '', address: '', contact: '', lat: '', lng: '', totalBeds: '', emergencyStatus: 'Active'
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000')) + '/api/admin/hospitals');
      const data = await res.json();
      setHospitals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHospital = async (id) => {
    if (!window.confirm('Delete this hospital from the network?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/hospitals/${id}`, { method: 'DELETE' });
      if (res.ok) fetchHospitals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddHospital = async (e) => {
    e.preventDefault();
    try {
      const url = modalMode === 'add' 
        ? (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000')) + '/api/admin/hospitals' 
        : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/hospitals/${editingId}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHospital)
      });
      if (res.ok) {
        setShowModal(false);
        setNewHospital({ name: '', address: '', contact: '', lat: '', lng: '', totalBeds: '', emergencyStatus: 'Active' });
        fetchHospitals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (h) => {
    setModalMode('edit');
    setEditingId(h._id);
    setNewHospital({
      name: h.name,
      address: h.address,
      contact: h.contact,
      lat: h.location.coordinates[1],
      lng: h.location.coordinates[0],
      totalBeds: h.totalBeds,
      emergencyStatus: h.emergencyStatus
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setNewHospital({ name: '', address: '', contact: '', lat: '', lng: '', totalBeds: '', emergencyStatus: 'Active' });
    setShowModal(true);
  };

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      // @ts-ignore
      mapInstance.current = L.map(mapRef.current).setView([28.6139, 77.2090], 11);
      // @ts-ignore
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap'
      }).addTo(mapInstance.current);

      hospitals.forEach(h => {
        // @ts-ignore
        if (h.location && h.location.coordinates) {
          L.marker([h.location.coordinates[1], h.location.coordinates[0]]).addTo(mapInstance.current)
            .bindPopup(`<b>${h.name}</b><br>${h.emergencyStatus}`);
        }
      });
    }
  }, [hospitals]);

  return (
    <div className="hospital-management animate-slide-up">
      <div className="module-header">
        <div>
          <h1>Hospital Network</h1>
          <p>Manage secondary and tertiary care hospital partners.</p>
        </div>
        <button className="admin-primary-btn" onClick={openAddModal}>
          <Plus size={18} /> Add New Hospital
        </button>
      </div>

      <div className="admin-grid-layout">
        <div className="admin-card list-column">
          <div className="card-top">
            <div className="search-wrap">
              <Search size={16} />
              <input type="text" placeholder="Search hospitals..." />
            </div>
          </div>

          <div className="hospital-scroll-list">
            {loading ? <div style={{ padding: '2rem', textAlign: 'center' }}>Loading hospitals...</div> : hospitals.map((h) => (
              <div key={h._id} className="hospital-admin-item">
                <div className="h-icon-box">
                  <Hospital size={20} />
                </div>
                <div className="h-details">
                  <h4>{h.name}</h4>
                  <span className="h-type">{h.emergencyStatus}</span>
                  <div className="h-meta">
                    <MapPin size={12} /> {h.address}
                  </div>
                  <div className="h-meta">
                    <Phone size={12} /> {h.contact}
                  </div>
                </div>
                <div className="h-actions">
                  <button className="icon-btn-tiny" onClick={() => openEditModal(h)} title="Edit Hospital"><Edit3 size={16} /></button>
                  <button className="icon-btn-tiny red" onClick={() => handleDeleteHospital(h._id)} title="Delete Hospital"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="map-column">
          <div className="admin-card map-card">
            <div className="card-head">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h3 style={{ margin: 0 }}>Geospatial Overview</h3>
                <div className="map-legend">
                  <span className="dot govt"></span> Govt
                  <span className="dot pvt"></span> Private
                </div>
              </div>
            </div>
            <div className="admin-map-container" ref={mapRef}></div>
            <div className="map-stats">
               <div className="ms-item">
                  <div className="p-stat-icon blue" style={{ width: '36px', height: '36px' }}><Globe size={18} /></div>
                  <div>
                    <label>Coverage Area</label>
                    <span>Delhi NCR (24km rad)</span>
                  </div>
               </div>
               <div className="ms-item">
                  <div className="p-stat-icon orange" style={{ width: '36px', height: '36px' }}><Info size={18} /></div>
                  <div>
                    <label>Critical Hubs</label>
                    <span>12 Intensive Care Units</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-grid-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 1.5rem;
          height: calc(100vh - 200px);
        }

        .list-column {
          display: flex;
          flex-direction: column;
          padding: 0 !important;
          overflow: hidden;
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: 1rem;
        }

        .card-top {
          padding: 1.25rem;
          border-bottom: 1px solid var(--border-color);
        }

        .hospital-scroll-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .hospital-admin-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-radius: 0.75rem;
          transition: all 0.2s;
          position: relative;
          color: var(--text-main);
        }

        .hospital-admin-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .h-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 0.5rem;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--primary);
        }

        .h-details {
          flex: 1;
        }

        .h-details h4 {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0 0 0.2rem 0;
          color: var(--text-main);
        }

        .h-type {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.02em;
          display: block;
          margin-bottom: 0.4rem;
        }

        .h-meta {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.2rem;
        }

        .h-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .hospital-admin-item:hover .h-actions {
          opacity: 1;
        }

        .icon-btn-tiny {
          width: 28px;
          height: 28px;
          border-radius: 0.4rem;
          border: 1px solid var(--border-color);
          background: var(--card-bg);
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn-tiny.red:hover { border-color: var(--emergency); color: var(--emergency); }

        /* Map Column */
        .map-column {
          display: flex;
          flex-direction: column;
        }

        .map-card {
           height: 100%;
           display: flex;
           flex-direction: column;
           padding: 0 !important;
           background: var(--glass-bg);
           backdrop-filter: blur(16px);
           border: 1px solid var(--glass-border);
           border-radius: 1rem;
           overflow: hidden;
        }

        .map-card .card-head {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .admin-map-container {
          flex: 1;
          background: var(--input-bg);
        }

        .map-legend {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.govt { background: var(--primary); }
        .dot.pvt { background: var(--emergency); }

        .map-stats {
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 2rem;
        }

        .ms-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-main);
        }

        .ms-item label {
          display: block;
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
        }

        .ms-item span {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
        }

        @media (max-width: 1100px) {
          .admin-grid-layout {
            grid-template-columns: 1fr;
            height: auto;
          }
          .admin-map-container {
            height: 400px;
          }
        }
      `}</style>

      {showModal && (
        <div className="modal-overlay">
          <div className="admin-card modal-card animate-slide-up">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Register New Hospital Partner' : 'Edit Hospital Details'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddHospital} className="hospital-form">
              <div className="form-grid">
                <input required placeholder="Hospital Name" value={newHospital.name} onChange={e => setNewHospital({...newHospital, name: e.target.value})} />
                <input required placeholder="Contact Number" value={newHospital.contact} onChange={e => setNewHospital({...newHospital, contact: e.target.value})} />
                <input required placeholder="Full Address" className="span-2" value={newHospital.address} onChange={e => setNewHospital({...newHospital, address: e.target.value})} />
                <input required step="any" type="number" placeholder="Latitude (e.g. 28.567)" value={newHospital.lat} onChange={e => setNewHospital({...newHospital, lat: e.target.value})} />
                <input required step="any" type="number" placeholder="Longitude (e.g. 77.210)" value={newHospital.lng} onChange={e => setNewHospital({...newHospital, lng: e.target.value})} />
                <input type="number" placeholder="Total Beds" value={newHospital.totalBeds} onChange={e => setNewHospital({...newHospital, totalBeds: e.target.value})} />
                <select value={newHospital.emergencyStatus} onChange={e => setNewHospital({...newHospital, emergencyStatus: e.target.value})}>
                   <option value="Active">Active / Open</option>
                   <option value="Crowded">Crowded</option>
                   <option value="Full">Full / No Beds</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-secondary-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-primary-btn">Save Partner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .modal-card {
          width: 100%;
          max-width: 540px;
          padding: 1.5rem !important;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 800; }
        .close-btn { background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }
        .hospital-form .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .hospital-form input, .hospital-form select {
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          padding: 0.75rem;
          border-radius: 0.75rem;
          color: var(--text-main);
          font-family: inherit;
        }
        .span-2 { grid-column: span 2; }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        .admin-secondary-btn {
          background: var(--input-bg);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 0.6rem 1.25rem;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default HospitalManagement;
