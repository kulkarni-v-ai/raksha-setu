import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Search, Map as MapIcon, 
  AlertCircle, ArrowUpRight, Plus, 
  BarChart3, Target, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DemandAnalytics = () => {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDemands();
  }, []);

  const fetchDemands = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000')) + '/api/pharmacy/demands', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDemands(await res.json());
      }
    } catch (err) {
      console.error('Fetch error');
    }
    setLoading(false);
  };

  if (loading) return <div className="loading-screen">Analyzing Market Trends...</div>;

  return (
    <div className="analytics-container page-container animate-fade-in">
      {/* Hero Stats */}
      <div className="analytics-hero">
        <div className="hero-content">
          <div className="hero-badge">
             <Target size={14} /> <span>MARKET INSIGHTS</span>
          </div>
          <h1>Demand Analytics</h1>
          <p>Real-time data on what citizens are searching for within 5km of your pharmacy.</p>
        </div>
        <div className="hero-viz">
           <BarChart3 size={100} strokeWidth={1} opacity={0.2} />
        </div>
      </div>

      <div className="analytics-grid">
        {/* Main List */}
        <div className="trends-card glassmorphism">
          <div className="card-header">
            <h3>High-Demand Medications</h3>
            <span className="info-tag"><Info size={12} /> Data from last 7 days</span>
          </div>

          <div className="demands-list">
            {demands.length > 0 ? demands.map((d, i) => (
              <div key={i} className="demand-row">
                <div className="d-icon-box">
                  <Search size={18} />
                </div>
                <div className="d-info">
                  <h4>{d.medicineName}</h4>
                  <div className="d-stats">
                    <span><TrendingUp size={12} /> {d.requestCount} requests</span>
                    <span className="dot">•</span>
                    <span>Last searched: {new Date(d.lastRequested).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="d-action">
                  <button className="add-quick-btn" onClick={() => navigate('/pharmacy/medicines')}>
                    <Plus size={14} /> <span>Stock This</span>
                  </button>
                </div>
              </div>
            )) : (
              <div className="empty-state">
                <MapIcon size={40} opacity={0.3} />
                <p>No missed search hits recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Opportunity Card */}
        <div className="opportunity-stack">
          <div className="opportunity-card glassmorphism premium-border">
            <div className="o-head">
              <TrendingUp size={24} color="var(--primary)" />
              <h3>Market Opportunity</h3>
            </div>
            <p>You could increase your visibility by <strong>~35%</strong> by adding the top 3 items to your inventory.</p>
            <div className="o-metric">
              <span className="label">Potential Reach</span>
              <span className="value">+1.2k views/mo</span>
            </div>
          </div>

          <div className="tip-box-glass">
             <AlertCircle size={16} />
             <p>Medicines with prices listed get 50% more resident clicks.</p>
          </div>
        </div>
      </div>

      <style>{`
        .analytics-container {
          padding: 1rem;
          padding-bottom: 7rem;
        }

        .analytics-hero {
          background: var(--primary-gradient);
          color: white;
          padding: 2rem;
          border-radius: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.35rem 0.75rem;
          border-radius: 100px;
          font-size: 0.65rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          backdrop-filter: blur(4px);
        }

        .hero-content h1 { font-size: 1.75rem; font-weight: 900; margin-bottom: 0.5rem; }
        .hero-content p { font-size: 0.9rem; opacity: 0.9; max-width: 400px; }

        .analytics-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 1.5rem;
        }

        .trends-card { padding: 1.5rem; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .card-header h3 { font-size: 1.1rem; font-weight: 800; }
        .info-tag { display: flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; color: var(--text-muted); }

        .demands-list { display: flex; flex-direction: column; gap: 1rem; }
        .demand-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 1rem;
          border: 1px solid var(--glass-border);
          transition: all 0.2s;
        }
        .demand-row:hover { background: rgba(255, 255, 255, 0.05); transform: translateX(5px); }

        .d-icon-box {
          width: 40px; height: 40px; border-radius: 12px; background: rgba(0, 212, 232, 0.1); color: var(--primary);
          display: flex; align-items: center; justify-content: center;
        }

        .d-info { flex: 1; }
        .d-info h4 { font-size: 1rem; font-weight: 700; margin: 0 0 0.25rem 0; text-transform: capitalize; }
        .d-stats { display: flex; align-items: center; gap: 0.75rem; font-size: 0.75rem; color: var(--text-muted); }
        .d-stats .dot { opacity: 0.3; }

        .add-quick-btn {
          background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); color: white;
          padding: 0.5rem 1rem; border-radius: 0.75rem; font-size: 0.8rem; font-weight: 700;
          display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s;
        }
        .add-quick-btn:hover { background: var(--primary); border-color: var(--primary); }

        .opportunity-stack { display: flex; flex-direction: column; gap: 1.5rem; }
        .opportunity-card { padding: 1.5rem; }
        .premium-border { border: 1.5px solid rgba(0, 212, 232, 0.3) !important; box-shadow: 0 0 30px rgba(0, 212, 232, 0.05); }
        .o-head { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .o-head h3 { font-size: 1.1rem; font-weight: 800; }
        .opportunity-card p { font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.5rem; }
        .o-metric { display: flex; flex-direction: column; gap: 0.25rem; }
        .o-metric .label { font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase; }
        .o-metric .value { font-size: 1.25rem; font-weight: 900; }

        .tip-box-glass {
          display: flex; align-items: center; gap: 1rem; padding: 1.25rem;
          background: rgba(245, 158, 11, 0.05); border-radius: 1rem; border: 1px dashed rgba(245, 158, 11, 0.2);
          color: #f59e0b; font-size: 0.85rem;
        }

        @media (max-width: 1024px) {
          .analytics-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .analytics-hero { flex-direction: column; text-align: center; gap: 1.5rem; padding: 1.5rem; }
          .hero-viz { display: none; }
          .demand-row { flex-direction: column; text-align: center; }
          .add-quick-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default DemandAnalytics;
