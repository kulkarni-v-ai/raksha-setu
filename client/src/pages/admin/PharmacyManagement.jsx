import React, { useState } from 'react';
import { 
  Pill, ShoppingBag, Search, Plus, 
  Trash2, Edit3, MoreVertical, CheckCircle2,
  AlertCircle, Package, MapPin
} from 'lucide-react';

const PharmacyManagement = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPharmacy, setNewPharmacy] = useState({
    name: '', contact: '', address: '', ownerId: '69dfb6c02a610003c92392b8' // Default owner for now
  });

  React.useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000')) + '/api/admin/pharmacies');
      const data = await res.json();
      setPharmacies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (id, currentStatus) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/pharmacies/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !currentStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setPharmacies(pharmacies.map(p => p._id === updated._id ? updated : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPharmacy = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000')) + '/api/admin/pharmacies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPharmacy)
      });
      if (res.ok) {
        setShowModal(false);
        setNewPharmacy({ name: '', contact: '', address: '', ownerId: '69dfb6c02a610003c92392b8' });
        fetchPharmacies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPharmacies = pharmacies.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pharmacy-management animate-slide-up">
      <div className="module-header">
        <div>
          <h1>Pharmacy & Medicines</h1>
          <p>Inventory control and stock monitoring for medical partners.</p>
        </div>
        <button className="admin-primary-btn" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Pharmacy
        </button>
      </div>

      <div className="pharmacy-stats">
        <div className="p-stat-card">
          <div className="p-stat-icon blue"><Package size={24} /></div>
          <div className="p-stat-info">
            <label>Across Network</label>
            <h3>14,820 SKUs</h3>
          </div>
        </div>
        <div className="p-stat-card">
          <div className="p-stat-icon orange"><AlertCircle size={24} /></div>
          <div className="p-stat-info">
            <label>Out of Stock</label>
            <h3>12 Items</h3>
          </div>
        </div>
        <div className="p-stat-card">
          <div className="p-stat-icon green"><ShoppingBag size={24} /></div>
          <div className="p-stat-info">
            <label>Orders Today</label>
            <h3>1,240</h3>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="table-controls">
          <div className="search-wrap">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search pharmacies or medicines..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="table-actions-top">
             <button className="icon-btn-tiny"><CheckCircle2 size={18} /></button>
          </div>
        </div>

        <div className="admin-column-grid">
          <div className="list-header-row">
            <span>Pharmacy Name</span>
            <span>Location</span>
            <span>Inventory Level</span>
            <span>Orders</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading pharmacies...</div>
          ) : filteredPharmacies.map((p) => (
            <div key={p._id} className="admin-list-item">
              <div className="pharmacy-cell">
                <div className="p-avatar"><Pill size={16} /></div>
                <div className="p-name-info">
                  <span className="p-main-name">{p.name} {p.isVerified && <CheckCircle2 size={12} color="#10b981" />}</span>
                  <span className="p-contact">{p.contact}</span>
                </div>
              </div>

              <div className="loc-cell">
                <MapPin size={14} /> {p.address}
              </div>

              <div className="inventory-bar-wrap">
                <div className="bar-label">{p.medicines ? p.medicines.length : 0} items</div>
              </div>

              <div className="orders-count-wrap">
                <span className="orders-count">{p.isVerified ? 'Verified' : 'Pending'}</span>
              </div>

              <div className="h-actions" style={{ opacity: 1, flexDirection: 'row' }}>
                <button 
                  className={`icon-btn-tiny ${!p.isVerified ? 'green' : 'red'}`}
                  title={p.isVerified ? "Revoke Verification" : "Verify Pharmacy"}
                  onClick={() => toggleVerification(p._id, p.isVerified)}
                >
                  {p.isVerified ? <Trash2 size={16} /> : <CheckCircle2 size={16} />}
                </button>
                <button className="icon-btn-tiny"><MoreVertical size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="admin-card modal-card animate-slide-up">
            <div className="modal-header">
              <h3>Register New Pharmacy Hub</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddPharmacy} className="hospital-form">
              <div className="form-grid">
                <input required placeholder="Pharmacy Name" value={newPharmacy.name} onChange={e => setNewPharmacy({...newPharmacy, name: e.target.value})} />
                <input required placeholder="Contact Number" value={newPharmacy.contact} onChange={e => setNewPharmacy({...newPharmacy, contact: e.target.value})} />
                <input required placeholder="Full Address" className="span-2" value={newPharmacy.address} onChange={e => setNewPharmacy({...newPharmacy, address: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-secondary-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-primary-btn">Save Pharmacy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .pharmacy-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        /* Modal Styles Shared with Hospital Management */
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
          background: var(--glass-bg);
          backdrop-filter: blur(28px);
          border: 1px solid var(--glass-border);
          border-radius: 1.25rem;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--text-main); }
        .close-btn { background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }
        .hospital-form .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .hospital-form input {
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

        .p-stat-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem !important;
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: 1rem;
        }

        .p-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
        }

        .p-stat-icon.blue { color: var(--primary); }
        .p-stat-icon.orange { color: var(--warning); }
        .p-stat-icon.green { color: var(--success); }

        .p-stat-info label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          display: block;
        }

        .p-stat-info h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .pharmacy-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .p-avatar {
          width: 32px;
          height: 32px;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .p-name-info {
          display: flex;
          flex-direction: column;
        }

        .p-main-name { font-weight: 700; color: var(--text-main); }
        .p-contact { font-size: 0.75rem; color: var(--text-muted); }

        .loc-cell {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .inventory-bar-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .bar-label {
          font-size: 0.8rem;
          font-weight: 700;
          width: 35px;
          color: var(--text-main);
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: var(--input-bg);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar .fill {
           height: 100%;
           border-radius: 3px;
        }

        .orders-count {
           font-weight: 700;
           background: var(--input-bg);
           padding: 0.1rem 0.6rem;
           border-radius: 1rem;
           font-size: 0.8rem;
           color: var(--text-main);
           border: 1px solid var(--input-border);
        }

        @media (max-width: 768px) {
          .pharmacy-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PharmacyManagement;
