import React, { useState, useEffect } from 'react';
import { 
  Pill, Plus, Search, Edit3, Trash2, Download, Zap,
  CheckCircle2, AlertCircle, XCircle, MoreVertical, LayoutGrid, List, ChevronLeft, Package, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MedicineManager = () => {
  const [medicines, setMedicines] = useState([]);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentMed, setCurrentMed] = useState({ name: '', quantity: 0, price: '', availability: 'Available' });
  const [isEditing, setIsEditing] = useState(false);
  
  // New Pro States
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const DEMO_MEDICINES = [
    { name: 'Paracetamol 500mg',   quantity: 250, price: '12',  availability: 'Available'     },
    { name: 'Amoxicillin 500mg',   quantity: 80,  price: '85',  availability: 'Available'     },
    { name: 'Dolo 650mg',          quantity: 320, price: '30',  availability: 'Available'     },
    { name: 'Crocin Advance',      quantity: 4,   price: '28',  availability: 'Limited'       },
    { name: 'Azithromycin 250mg',  quantity: 45,  price: '110', availability: 'Available'     },
    { name: 'Metformin 500mg',     quantity: 120, price: '18',  availability: 'Available'     },
    { name: 'Atorvastatin 10mg',   quantity: 90,  price: '55',  availability: 'Available'     },
    { name: 'Pantoprazole 40mg',   quantity: 3,   price: '42',  availability: 'Limited'       },
    { name: 'Cetirizine 10mg',     quantity: 200, price: '8',   availability: 'Available'     },
    { name: 'Omeprazole 20mg',     quantity: 75,  price: '35',  availability: 'Available'     },
    { name: 'Ibuprofen 400mg',     quantity: 0,   price: '22',  availability: 'Out of Stock'  },
    { name: 'Losartan 50mg',       quantity: 60,  price: '65',  availability: 'Available'     },
    { name: 'Remdesivir 100mg',    quantity: 2,   price: '899', availability: 'Limited'       },
    { name: 'Vitamin D3 60K IU',   quantity: 150, price: '95',  availability: 'Available'     },
    { name: 'Montelukast 10mg',    quantity: 0,   price: '48',  availability: 'Out of Stock'  },
  ];

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [medRes, demandRes] = await Promise.all([
        fetch('http://localhost:5000/api/pharmacy/medicines', { headers }),
        fetch('http://localhost:5000/api/pharmacy/demands', { headers })
      ]);
      const meds = medRes.ok ? await medRes.json() : [];
      // Use demo data if API returns empty
      setMedicines(meds.length > 0 ? meds : DEMO_MEDICINES);
      if (demandRes.ok) setDemands(await demandRes.json());
    } catch (err) {
      // API unreachable — use demo data
      setMedicines(DEMO_MEDICINES);
    }
    setLoading(false);
  };

  const handleInlineQty = async (name, newQty) => {
    const updatedMeds = medicines.map(m => m.name === name ? { ...m, quantity: newQty } : m);
    setMedicines(updatedMeds);
    
    // De-bounce sync with server in a real app, here we just try-fire
    try {
      const token = localStorage.getItem('token');
      const medObj = updatedMeds.find(m => m.name === name);
      await fetch('http://localhost:5000/api/pharmacy/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(medObj)
      });
    } catch (e) {}
  };

  const handleBulkStatus = async (newStatus) => {
    // Optimistic local update
    const updatedMeds = medicines.map(m => 
      selectedIds.includes(m.name) ? { ...m, availability: newStatus } : m
    );
    setMedicines(updatedMeds);
    
    // Store selected targets before clearing
    const targets = updatedMeds.filter(m => selectedIds.includes(m.name));
    setSelectedIds([]);
    setIsBulkMode(false);

    try {
      const token = localStorage.getItem('token');
      await Promise.all(targets.map(m => 
        fetch('http://localhost:5000/api/pharmacy/medicines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...m, availability: newStatus })
        })
      ));
    } catch (e) {
      console.error('Bulk update error');
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    
    // Optimistic local update
    setMedicines(prev => prev.filter(m => m.name !== name));

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/pharmacy/medicines/${name}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
       console.error('Delete error');
    }
  };

  const toggleSelect = (name) => {
    setSelectedIds(prev => prev.includes(name) ? prev.filter(id => id !== name) : [...prev, name]);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Optimistic local update
    if (isEditing) {
       setMedicines(prev => prev.map(m => m.name === currentMed.name ? currentMed : m));
    } else {
       const exists = medicines.some(m => m.name.toLowerCase() === currentMed.name.toLowerCase());
       if (exists) {
          alert('Medicine already exists in inventory.');
          return;
       }
       setMedicines(prev => [...prev, currentMed]);
    }
    setModalOpen(false);

    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/pharmacy/medicines', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(currentMed)
      });
    } catch (err) {
      console.error('Save error');
    }
  };

  // Sorting & Filtering Logic
  const processedMeds = medicines
    .filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (filter === 'Available') return matchesSearch && m.availability === 'Available';
      if (filter === 'Out of Stock') return matchesSearch && m.availability === 'Out of Stock';
      if (filter === 'Low Stock') return matchesSearch && m.quantity > 0 && m.quantity < 5;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'qty') return b.quantity - a.quantity;
      if (sortBy === 'status') return a.availability.localeCompare(b.availability);
      return a.name.localeCompare(b.name);
    });

  const exportInventory = () => {
    const headers = ['Name', 'Quantity', 'Price', 'Availability'];
    const csvData = processedMeds.map(m => [m.name, m.quantity, m.price || 'N/A', m.availability].join(','));
    const csvContent = [headers.join(','), ...csvData].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleReorder = (med) => {
    setCurrentMed({ ...med, quantity: (med.quantity || 0) + 50 }); // Suggest +50 restock
    setIsEditing(true);
    setModalOpen(true);
  };

  const getStatusColor = (status, qty) => {
    if (qty > 0 && qty < 5) return 'var(--warning)';
    if (status === 'Available') return 'var(--success)';
    if (status === 'Limited') return 'var(--warning)';
    return 'var(--emergency)';
  };

  return (
    <div className="module-container" style={{ padding: '0', paddingBottom: '2rem' }}>
      <header className="module-header animate-slide-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Warehouse Inventory</h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{medicines.length} Medications in Stock</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
           <button className="secondary-action-btn ripple" onClick={exportInventory}>
             <Download size={18} />
             <span>Export CSV</span>
           </button>
           <button 
             className="secondary-action-btn ripple" 
             style={isBulkMode ? { background: '#0ea5e9', color: 'white', borderColor: '#0ea5e9' } : {}}
             onClick={() => setIsBulkMode(!isBulkMode)}
           >
             <List size={18} />
             <span>{isBulkMode ? 'Bulk Edit Active' : 'Select'}</span>
           </button>
           <button className="primary-plus-btn ripple" onClick={() => { setIsEditing(false); setCurrentMed({ name: '', quantity: 0, price: '', availability: 'Available' }); setModalOpen(true); }}>
             <Plus size={20} />
             <span>Add Stock</span>
           </button>
        </div>
      </header>

      {/* FILTER & SORT BAR */}
      <div className="controls-bar animate-slide-up" style={{ animationDelay: '0.1s', marginBottom: '1.5rem' }}>
        <div className="search-box-wrap">
          <Search size={14} className="si" />
          <input type="text" placeholder="Filter stock..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-chips">
           {['All', 'Available', 'Low Stock', 'Out of Stock'].map(f => (
             <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
           ))}
        </div>
      </div>

      {/* DEMAND DRAWER (Quick Add) */}
      {demands.length > 0 && (
        <div className="demand-drawer glass animate-slide-up" style={{ animationDelay: '0.15s', marginBottom: '1.5rem' }}>
           <div className="d-head">
             <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>HIGH DEMAND</span>
             <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>Missed nearby searches</span>
           </div>
           <div className="d-grid">
              {demands.map((d, i) => (
                <div key={i} className="d-chip ripple" onClick={() => { setCurrentMed({ name: d.medicineName, quantity: 10, price: '', availability: 'Available' }); setIsEditing(false); setModalOpen(true); }}>
                  <Plus size={10} /> {d.medicineName}
                </div>
              ))}
           </div>
        </div>
      )}

      {/* INVENTORY LIST */}
      <div className="inventory-grid animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {processedMeds.map((med, idx) => (
          <div key={idx} className={`med-card-pro glass-surface shadow-premium ${selectedIds.includes(med.name) ? 'selected' : ''}`} onClick={() => isBulkMode && toggleSelect(med.name)}>
            <div className="card-top">
               <div className="m-icon-wrap" style={{ color: getStatusColor(med.availability, med.quantity), background: `${getStatusColor(med.availability, med.quantity)}15` }}>
                  <Pill size={20} />
                  {med.quantity < 5 && med.quantity > 0 && <span className="warning-dot-pulse"></span>}
               </div>
               <div className="m-main">
                  <h4>{med.name}</h4>
                  <div className="m-meta">
                     <span className="price-tag">₹{med.price || '0'}</span>
                     <span className={`status-pill`} style={{ background: `${getStatusColor(med.availability, med.quantity)}15`, color: getStatusColor(med.availability, med.quantity) }}>
                       {med.availability === 'Low Stock' ? 'Restock Needed' : med.availability}
                     </span>
                  </div>
               </div>
               <div className="m-qty-controller-v2" onClick={e => e.stopPropagation()}>
                  <button className="q-btn" onClick={() => handleInlineQty(med.name, Math.max(0, med.quantity - 1))}>-</button>
                  <input type="number" value={med.quantity} onChange={e => handleInlineQty(med.name, parseInt(e.target.value) || 0)} />
                  <button className="q-btn" onClick={() => handleInlineQty(med.name, med.quantity + 1)}>+</button>
               </div>
            </div>
            {!isBulkMode && (
              <div className="card-actions-v2">
                 {med.quantity < 10 && <button className="a-btn-v2 reorder" onClick={() => handleReorder(med)} title="Auto Restock"><Zap size={14} /></button>}
                 <button className="a-btn-v2" onClick={() => { setCurrentMed(med); setIsEditing(true); setModalOpen(true); }}><Edit3 size={14} /></button>
                 <button className="a-btn-v2 del" onClick={() => handleDelete(med.name)}><Trash2 size={14} /></button>
              </div>
            )}
            {isBulkMode && (
              <div className="select-check-v2">
                 {selectedIds.includes(med.name) ? <CheckCircle2 size={24} color="#0ea5e9" /> : <div className="dot-v2"></div>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* BULK ACTION BAR */}
      {isBulkMode && selectedIds.length > 0 && (
        <div className="bulk-bar animate-pop-up">
           <div className="b-info">
              <strong>{selectedIds.length}</strong> selected
           </div>
           <div className="b-btns">
              <button className="b-action-btn glass" onClick={() => handleBulkStatus('Available')}>Mark Available</button>
              <button className="b-action-btn glass" onClick={() => handleBulkStatus('Out of Stock')}>Mark Out of Stock</button>
              <button className="b-action-btn del-btn ripple" onClick={() => setSelectedIds([])}><XCircle size={18} /></button>
           </div>
        </div>
      )}

      {/* MODAL (UNCHANGED CORE BUT STYLING REFINED) */}
      {isModalOpen && (
        <div className="modal-overlay fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="modal-content glassmorphism" style={{ width: '100%', maxWidth: '380px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>{isEditing ? 'Update Stock' : 'Add to Inventory'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
               <div className="input-group">
                 <label>MEDICINE NAME</label>
                 <input type="text" className="glass-input" value={currentMed.name} onChange={e => setCurrentMed({...currentMed, name: e.target.value})} disabled={isEditing} required />
               </div>
               
               <div style={{ display: 'flex', gap: '1rem' }}>
                 <div style={{ flex: 1 }}>
                    <label>STOCK QTY</label>
                    <input type="number" className="glass-input" value={currentMed.quantity} onChange={e => setCurrentMed({...currentMed, quantity: parseInt(e.target.value)})} required />
                 </div>
                 <div style={{ flex: 1 }}>
                    <label>PRICE (₹)</label>
                    <input type="text" className="glass-input" value={currentMed.price} onChange={e => setCurrentMed({...currentMed, price: e.target.value})} placeholder="e.g. 150" />
                 </div>
               </div>

               <div className="input-group">
                 <label>AVAILABILITY STATUS</label>
                 <select className="glass-input" value={currentMed.availability} onChange={e => setCurrentMed({...currentMed, availability: e.target.value})}>
                    <option value="Available">Available</option>
                    <option value="Limited">Limited Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                 </select>
               </div>

               <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="secondary-btn ripple" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Cancel</button>
                  <button type="submit" className="primary-btn ripple" style={{ flex: 1 }}>{isEditing ? 'Save' : 'Add Item'}</button>
               </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        /* Glass Surface Utility */
        .glass-surface {
          background: rgba(255, 255, 255, 0.45) !important;
          backdrop-filter: blur(24px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
        }
        .dark-theme .glass-surface {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
        }

        .controls-bar { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
        .search-box-wrap { position: relative; width: 100%; border-radius: 100px; background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; padding: 0.75rem 1.5rem; }
        .dark-theme .search-box-wrap { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.08); }
        .search-box-wrap input { background: transparent; border: none; color: inherit; margin-left: 0.75rem; font-size: 0.9rem; width: 100%; outline: none; }
        .filter-chips { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
        .chip { padding: 0.5rem 1.25rem; border-radius: 100px; font-size: 0.75rem; font-weight: 700; background: rgba(255,255,255,0.5); border: 1px solid rgba(0,0,0,0.05); color: #64748b; cursor: pointer; white-space: nowrap; transition: 0.2s; }
        .chip.active { background: #0ea5e9; color: white; border-color: #0ea5e9; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3); }

        .inventory-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
        .med-card-pro { position: relative; padding: 1rem; border-radius: 16px; transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1); cursor: default; }
        .med-card-pro:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important; }
        .med-card-pro.selected { border-color: #0ea5e9 !important; background: rgba(14, 165, 233, 0.08) !important; }
        
        .card-top { display: flex; align-items: flex-start; gap: 0.75rem; }
        .m-icon-wrap { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; }
        .m-main { flex: 1; min-width: 0; }
        .m-main h4 { margin: 0; font-size: 0.9rem; font-weight: 750; letter-spacing: -0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .m-meta { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.3rem; }
        .price-tag { font-size: 0.75rem; font-weight: 700; color: #0ea5e9; }
        .status-pill { font-size: 0.58rem; font-weight: 900; padding: 0.15rem 0.45rem; border-radius: 5px; text-transform: uppercase; letter-spacing: 0.04em; }

        .m-qty-controller-v2 { display: flex; align-items: center; background: rgba(0,0,0,0.04); border-radius: 9px; border: 1px solid rgba(0,0,0,0.04); height: 30px; overflow: hidden; flex-shrink: 0; }
        .dark-theme .m-qty-controller-v2 { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.05); }
        .q-btn { width: 26px; height: 100%; border: none; background: transparent; color: inherit; cursor: pointer; transition: 0.15s; font-weight: 800; font-size: 0.9rem; }
        .q-btn:hover { background: rgba(0,0,0,0.06); }
        .m-qty-controller-v2 input { width: 36px; text-align: center; background: transparent; border: none; font-size: 0.82rem; font-weight: 850; color: inherit; outline: none; }

        .card-actions-v2 { display: flex; gap: 0.35rem; margin-top: 0.85rem; justify-content: flex-end; }
        .a-btn-v2 { width: 30px; height: 30px; border-radius: 8px; border: none; background: rgba(0,0,0,0.03); color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .dark-theme .a-btn-v2 { background: rgba(255,255,255,0.03); }
        .a-btn-v2:hover { background: #0ea5e9; color: white; transform: translateY(-2px); }
        .a-btn-v2.reorder { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .a-btn-v2.reorder:hover { background: #f59e0b; color: white; }
        .a-btn-v2.del:hover { background: #ef4444; }

        .shadow-premium { box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important; }
        .dark-theme .shadow-premium { box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important; }

        .secondary-action-btn {
          background: rgba(255, 255, 255, 0.05); color: #64748b; border: 1px solid rgba(0,0,0,0.05);
          padding: 0.5rem 0.9rem; border-radius: 10px; display: flex; align-items: center; gap: 0.45rem;
          font-weight: 700; font-size: 0.78rem; cursor: pointer; transition: 0.2s;
        }
        .secondary-action-btn:hover { background: #0ea5e9; color: white; border-color: #0ea5e9; transform: translateY(-1px); }

        .primary-plus-btn {
          background: #0ea5e9; color: white; border: none; padding: 0.5rem 1rem; border-radius: 10px;
          display: flex; align-items: center; gap: 0.45rem; font-weight: 750; font-size: 0.8rem; cursor: pointer; transition: 0.2s;
        }
        .primary-plus-btn:hover { background: #0284c7; transform: translateY(-1px); }

        .glass-input { width: 100%; border: 1px solid rgba(0,0,0,0.05); background: rgba(0,0,0,0.03); border-radius: 100px; padding: 1rem 1.5rem; color: inherit; outline: none; transition: 0.3s; font-family: inherit; font-size: 0.95rem; }
        .dark-theme .glass-input { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.08); }
        .glass-input:focus { border-color: #0ea5e9; background: white; box-shadow: 0 10px 30px rgba(14, 165, 233, 0.1); }
        
        .input-group label { display: block; font-size: 0.7rem; font-weight: 800; color: #64748b; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .warning-dot-pulse { position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; background: #ef4444; border-radius: 50%; border: 2px solid white; animation: pulse-red 1.5s infinite; }
        @keyframes pulse-red { 0% { transform: scale(0.8); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.4; } 100% { transform: scale(0.8); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default MedicineManager;
