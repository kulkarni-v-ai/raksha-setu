import React, { useState } from 'react';
import { 
  Pill, ShoppingBag, Search, Plus, 
  Trash2, Edit3, MoreVertical, CheckCircle2,
  AlertCircle, Package, MapPin
} from 'lucide-react';

const PharmacyManagement = () => {
  const [pharmacies, setPharmacies] = useState([
    { id: 1, name: 'Apollo Pharmacy', location: 'Connaught Place', stock: '85%', orders: 124, contact: '+91 11223 34455' },
    { id: 2, name: 'MedPlus', location: 'Karol Bagh', stock: '92%', orders: 89, contact: '+91 91234 56789' },
    { id: 3, name: 'Wellness Forever', location: 'Rohini, Sec 7', stock: '44%', orders: 56, contact: '+91 88776 65544' },
    { id: 4, name: 'Netmeds Hub', location: 'Janakpuri', stock: '98%', orders: 210, contact: '+91 77665 54433' },
  ]);

  return (
    <div className="pharmacy-management animate-slide-up">
      <div className="module-header">
        <div>
          <h1>Pharmacy & Medicines</h1>
          <p>Inventory control and stock monitoring for medical partners.</p>
        </div>
        <button className="admin-primary-btn">
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
            <input type="text" placeholder="Search pharmacies or medicines..." />
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

          {pharmacies.map((p) => (
            <div key={p.id} className="admin-list-item">
              <div className="pharmacy-cell">
                <div className="p-avatar"><Pill size={16} /></div>
                <div className="p-name-info">
                  <span className="p-main-name">{p.name}</span>
                  <span className="p-contact">{p.contact}</span>
                </div>
              </div>

              <div className="loc-cell">
                <MapPin size={14} /> {p.location}
              </div>

              <div className="inventory-bar-wrap">
                <div className="bar-label">{p.stock}</div>
                <div className="progress-bar">
                  <div className="fill" style={{ width: p.stock, background: parseInt(p.stock) < 50 ? '#ef4444' : 'var(--primary-gradient)' }}></div>
                </div>
              </div>

              <div className="orders-count-wrap">
                <span className="orders-count">{p.orders}</span>
              </div>

              <div className="h-actions" style={{ opacity: 1, flexDirection: 'row' }}>
                <button className="icon-btn-tiny"><Edit3 size={16} /></button>
                <button className="icon-btn-tiny red"><Trash2 size={16} /></button>
                <button className="icon-btn-tiny"><MoreVertical size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .pharmacy-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
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
