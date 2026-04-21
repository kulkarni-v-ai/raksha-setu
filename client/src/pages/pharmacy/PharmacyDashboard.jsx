import React, { useState, useEffect } from 'react';
import { 
  Pill, Search, MapPin, 
  ChevronRight, TrendingUp, HelpCircle, 
  Plus, ArrowUpRight, CheckCircle2,
  AlertCircle, History, Zap, Activity,
  Stethoscope, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    outOfStock: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000')) + '/api/pharmacy/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        const inventory = data.inventory || [];
        setStats({
          total: inventory.length,
          available: inventory.filter(i => i.stock > 0).length,
          outOfStock: inventory.filter(i => i.stock === 0).length
        });
      }
    } catch (err) {
      console.error('Data sync failed');
    }
    setLoading(false);
  };

  const trendingMeds = [
    { name: 'Dolo 650', volume: '+142%', status: 'high' },
    { name: 'Paracetamol 500', volume: '+85%', status: 'med' },
    { name: 'Azithromycin', volume: '+44%', status: 'low' }
  ];

  const emergencyRequests = [
    { hospital: 'City Care Hospital', med: 'Remdesivir (Rare)', time: '2m ago', urgent: true },
    { hospital: 'Red Cross Clinic', med: 'Blood Bags (O+)', time: '15m ago', urgent: false }
  ];

  if (loading) return (
    <div className="clean-loader-pro">
       <div className="pulse-circle"></div>
       <span>Syncing Hub Resources...</span>
    </div>
  );

  return (
    <div className="pro-dashboard-canvas animate-fade-in">
      
      <div className="dashboard-grid-parent">
        
        {/* LEFT COLUMN: Main Stats & Requests */}
        <div className="col-main">
          
          {/* 1. Hero Command Center */}
          <div className="hero-pro-card shadow-premium">
            <div className="hero-top-row">
               <div className="status-badge-live">NETWORK ACTIVE</div>
               <div className="hero-actions">
                  <button className="h-action-btn" onClick={() => navigate('/pharmacy/medicines')}>
                     <Plus size={16} /> <span>Smart Restock</span>
                  </button>
                  <button className="h-action-btn glass">
                     <Download size={16} /> <span>Export Report</span>
                  </button>
               </div>
            </div>

            <div className="hero-body-pro">
               <h1 className="p-name-pro">{profile?.name || 'Apollo Pharmacy Central'}</h1>
               <p className="p-loc-pro"><MapPin size={14} /> {profile?.address || 'Connaught Place, New Delhi'}</p>
               
               <div className="stats-row-pro">
                  <div className="stat-unit">
                     <span className="unit-val">{stats.total}</span>
                     <span className="unit-lbl">Global Stock</span>
                  </div>
                  <div className="unit-divider"></div>
                  <div className="stat-unit">
                     <span className="unit-val success">{stats.available}</span>
                     <span className="unit-lbl">Live Listings</span>
                  </div>
                  <div className="unit-divider"></div>
                  <div className="stat-unit">
                     <span className="unit-val warning">{stats.outOfStock}</span>
                     <span className="unit-lbl">Critical Low</span>
                  </div>
               </div>
            </div>
          </div>

          {/* 2. Hospital Emergency Requests */}
          <div className="emergency-requests-panel glass-surface shadow-premium">
             <div className="panel-head-pro">
                <div className="title-group-pro">
                   <div className="icon-badge-blue">
                      <Stethoscope size={18} />
                   </div>
                   <h3>Local Hospital Requests</h3>
                </div>
                <div className="live-pill">
                   <span className="pulse-dot"></span>
                   <span>LIVE FEED</span>
                </div>
             </div>
             <div className="request-stack-pro">
                {emergencyRequests.map((req, i) => (
                  <div key={i} className="request-item-pro glass-card-lite">
                     <div className="req-meta">
                        <strong>{req.hospital}</strong>
                        <p>{req.med}</p>
                     </div>
                     <div className="req-actions-flex">
                        <span className="req-time">{req.time}</span>
                        {req.urgent && <span className="urgent-tag-pulse">URGENT</span>}
                        <button className="respond-btn-pro ripple" onClick={() => navigate('/pharmacy/orders')}>Provide Stock</button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Analytics & Trends */}
        <div className="col-side">
           
           {/* Performance Monitor */}
           <div className="perf-panel-pro glass-surface shadow-premium">
              <div className="perf-top-pro">
                 <div>
                    <h4>Hub Performance</h4>
                    <span className="perf-big-val">98.4%</span>
                 </div>
                 <div className="perf-badge-success">
                    <Activity size={20} />
                 </div>
              </div>
              <p className="perf-p-pro">Visibility is up +12.4% following your latest inventory sync.</p>
              <div className="perf-graph-mock">
                 <div className="bar" style={{height: '40%'}}></div>
                 <div className="bar" style={{height: '65%'}}></div>
                 <div className="bar pro-active" style={{height: '90%'}}></div>
                 <div className="bar" style={{height: '75%'}}></div>
              </div>
              <button className="p-optimize-btn-pro ripple" onClick={() => navigate('/pharmacy/profile')}>Run Search Optimization</button>
           </div>

           {/* Demand Prediction Widget */}
           <div className="demand-trends-card glass-surface shadow-premium">
              <div className="trends-head">
                 <div className="icon-badge-warn">
                    <Zap size={18} />
                 </div>
                 <h4>Local Demand Prediction</h4>
              </div>
              <p className="trends-desc">Trending medicines searched within 2km.</p>
              <div className="trends-list-pro">
                 {trendingMeds.map((med, i) => (
                   <div key={i} className="trend-row-pro glass-card-lite">
                      <span className="trend-name">{med.name}</span>
                      <div className="trend-meta">
                         <span className={`trend-vol ${med.status}`}>{med.volume}</span>
                         <ArrowUpRight size={12} />
                      </div>
                   </div>
                 ))}
              </div>
              <button className="trends-btn-pro ripple" onClick={() => navigate('/pharmacy/medicines')}>Stock Trending Items</button>
           </div>

           {/* Support */}
           <div className="support-link-v3" onClick={() => navigate('/pharmacy/profile')}>
              <HelpCircle size={20} />
              <span>Partner Support Desk</span>
              <ChevronRight size={16} className="m-auto-L" />
           </div>

        </div>

      </div>

      <style>{`
        .pro-dashboard-canvas {
          padding-bottom: 1rem;
        }

        .dashboard-grid-parent {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 1.25rem;
        }

        /* Glass Component Overrides */
        .glass-surface {
          background: rgba(255, 255, 255, 0.4) !important;
          backdrop-filter: blur(24px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
        }
        .dark-theme .glass-surface {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
        }

        .glass-card-lite {
          background: rgba(255, 255, 255, 0.3);
          border: 1px solid rgba(0,0,0,0.02);
          transition: 0.3s;
        }
        .dark-theme .glass-card-lite {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255,255,255,0.05);
        }

        /* Hero Styling */
        .hero-pro-card {
           background: linear-gradient(135deg, #10b981, #059669);
           border-radius: 20px;
           padding: 1.5rem;
           color: white;
           position: relative;
           overflow: hidden;
        }
        .hero-pro-card::before {
           content: ''; position: absolute; top: -50%; right: -20%; width: 300px; height: 300px;
           background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
           pointer-events: none;
        }

        .hero-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem; }
        .status-badge-live { 
          padding: 0.25rem 0.65rem; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); 
          border-radius: 100px; font-size: 0.55rem; font-weight: 800; letter-spacing: 0.05em;
        }
        .hero-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .h-action-btn {
           background: white; color: #059669; border: none; padding: 0.4rem 0.85rem; border-radius: 9px;
           font-size: 0.72rem; font-weight: 800; display: flex; align-items: center; gap: 0.4rem; cursor: pointer; transition: 0.2s;
        }
        .h-action-btn.glass { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(8px); }
        .h-action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.15); }

        .p-name-pro { font-size: 1.6rem; font-weight: 900; margin-bottom: 0.2rem; letter-spacing: -0.02em; }
        .p-loc-pro { display: flex; align-items: center; gap: 0.4rem; opacity: 0.85; font-size: 0.8rem; margin-bottom: 1.25rem; }

        .stats-row-pro { display: flex; align-items: center; gap: 2rem; background: rgba(0,0,0,0.12); padding: 0.9rem 1.5rem; border-radius: 14px; width: fit-content; backdrop-filter: blur(10px); }
        .unit-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.15); }
        .stat-unit { display: flex; flex-direction: column; }
        .unit-val { font-size: 1.1rem; font-weight: 950; margin-bottom: 0.1rem; }
        .unit-lbl { font-size: 0.6rem; font-weight: 700; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.05em; }
        .unit-val.success { color: white; }
        .unit-val.warning { color: #facc15; }

        /* Emergency Requests */
        .emergency-requests-panel { border-radius: 18px; padding: 1.25rem; }
        .panel-head-pro { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .title-group-pro { display: flex; align-items: center; gap: 0.6rem; }
        .icon-badge-blue { background: #0ea5e9; color: white; padding: 0.4rem; border-radius: 8px; display: flex; }
        .title-group-pro h3 { font-size: 0.95rem; font-weight: 800; }
        
        .live-pill { 
          display: flex; align-items: center; gap: 0.4rem; background: rgba(239, 68, 68, 0.1); 
          padding: 0.25rem 0.6rem; border-radius: 100px; color: #ef4444; font-size: 0.6rem; font-weight: 800;
        }
        .pulse-dot { width: 5px; height: 5px; background: #ef4444; border-radius: 50%; animation: pulse-red 1.5s infinite; }

        .request-stack-pro { display: flex; flex-direction: column; gap: 0.6rem; }
        .request-item-pro { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1rem; border-radius: 12px; transition: 0.2s; flex-wrap: wrap; gap: 0.5rem; }
        .request-item-pro:hover { transform: scale(1.01); }
        .req-meta strong { display: block; font-size: 0.85rem; margin-bottom: 0.15rem; }
        .req-meta p { font-size: 0.75rem; color: #64748b; margin: 0; }
        .req-actions-flex { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
        .req-time { font-size: 0.68rem; color: #94a3b8; }
        .urgent-tag-pulse { font-size: 0.6rem; font-weight: 950; color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 0.15rem 0.5rem; border-radius: 4px; letter-spacing: 0.05em; }
        .respond-btn-pro { background: #0ea5e9; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 800; font-size: 0.75rem; cursor: pointer; transition: 0.2s; }
        .respond-btn-pro:hover { background: #0284c7; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3); }

        /* Side Panels */
        .perf-panel-pro, .demand-trends-card { border-radius: 18px; padding: 1.25rem; }
        .perf-top-pro { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
        .perf-badge-success { background: #10b981; color: white; padding: 0.4rem; border-radius: 8px; display: flex; }
        .perf-big-val { font-size: 1.75rem; font-weight: 950; display: block; color: #10b981; letter-spacing: -0.04em; }
        .perf-p-pro { font-size: 0.78rem; color: #64748b; line-height: 1.5; margin-bottom: 1rem; }
        .perf-graph-mock { display: flex; align-items: flex-end; gap: 0.5rem; height: 50px; margin-bottom: 1rem; }
        .bar { flex: 1; background: rgba(0,0,0,0.05); border-radius: 4px; transition: 0.3s; }
        .dark-theme .bar { background: rgba(255,255,255,0.05); }
        .bar.pro-active { background: #10b981; box-shadow: 0 6px 14px rgba(16, 185, 129, 0.2); }
        .p-optimize-btn-pro { width: 100%; padding: 0.75rem; background: #0ea5e9; color: white; border: none; border-radius: 10px; font-weight: 800; font-size: 0.8rem; cursor: pointer; transition: 0.2s; }
        .p-optimize-btn-pro:hover { background: #0284c7; }

        .trends-head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.6rem; }
        .icon-badge-warn { background: #f59e0b; color: white; padding: 0.4rem; border-radius: 8px; display: flex; }
        .trends-list-pro { display: flex; flex-direction: column; gap: 0.5rem; margin: 0.75rem 0; }
        .trend-row-pro { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; border-radius: 10px; }
        .trend-name { font-size: 0.8rem; font-weight: 750; }
        .trend-meta { display: flex; align-items: center; gap: 0.4rem; color: #f59e0b; }
        .trend-vol { font-size: 0.78rem; font-weight: 950; }
        .trends-btn-pro { width: 100%; padding: 0.65rem; background: transparent; border: 1.5px dashed #e2e8f0; border-radius: 10px; font-weight: 800; font-size: 0.78rem; color: #64748b; cursor: pointer; transition: 0.2s; }
        .dark-theme .trends-btn-pro { border-color: rgba(255,255,255,0.1); }
        .trends-btn-pro:hover { border-color: #0ea5e9; color: #0ea5e9; }

        .shadow-premium { box-shadow: 0 20px 50px rgba(0,0,0,0.05) !important; }
        .dark-theme .shadow-premium { box-shadow: 0 20px 50px rgba(0,0,0,0.2) !important; }

        @keyframes pulse-red { 0% { transform: scale(0.8); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.5; } 100% { transform: scale(0.8); opacity: 1; } }

        .support-link-v3 { 
          display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; background: white; border-radius: 20px; 
          border: 1px solid #f1f5f9; cursor: pointer; color: #64748b; font-weight: 700; font-size: 0.9rem;
        }
        .dark-theme .support-link-v3 { background: rgba(255,255,255,0.025); border-color: rgba(255,255,255,0.05); }
        .m-auto-L { margin-left: auto; }

        .clean-loader-pro { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 500px; gap: 1.5rem; color: #94a3b8; }
        .pulse-circle { width: 48px; height: 48px; background: #10b981; border-radius: 50%; animation: pro-pulse 2s infinite; }
        
        @keyframes pro-pulse { 
          0% { transform: scale(0.8); opacity: 0.5; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.8); opacity: 0.5; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

        @media (max-width: 1300px) {
           .dashboard-grid-parent { grid-template-columns: 1fr; }
           .col-side { flex-direction: row; flex-wrap: wrap; }
           .col-side > div { flex: 1; min-width: 300px; }
        }

        @media (max-width: 768px) {
           .hero-pro-card { padding: 1.25rem; }
           .p-name-pro { font-size: 1.5rem; }
           .stats-row-pro { width: 100%; gap: 1rem; padding: 1rem; justify-content: space-between; flex-wrap: wrap; }
           .stat-unit { align-items: center; min-width: 30%; }
           .unit-divider { display: none; }
           .pro-dashboard-canvas { padding: 0 0.25rem; }
        }
      `}</style>
    </div>
  );
};

export default PharmacyDashboard;
