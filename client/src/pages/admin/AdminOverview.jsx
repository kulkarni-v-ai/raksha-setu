import React, { useState, useEffect } from 'react';
import { 
  Users, Hospital, Pill, ShieldAlert, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Clock, UserPlus 
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const AdminOverview = () => {
  const [apiStats, setApiStats] = useState({ users: 0, activeSos: 0, pharmacies: 0, hospitals: 0 });
  const [activities, setActivities] = useState([]);
  const [health, setHealth] = useState({ serverLoad: 0, dbLatency: 0, apiStatus: 'Loading...' });

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000')) + '/api/admin/stats')
      .then(res => res.json())
      .then(data => setApiStats(data))
      .catch(console.error);

    fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000')) + '/api/admin/activity')
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(console.error);

    fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000')) + '/api/admin/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(console.error);
  }, []);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const stats = [
    { label: 'Total Users', value: apiStats.users.toLocaleString(), icon: <Users size={24} />, change: '+12%', trend: 'up', color: '#3b82f6' },
    { label: 'Active SOS Updates', value: apiStats.activeSos.toLocaleString(), icon: <ShieldAlert size={24} />, change: 'Real-time', trend: 'down', color: '#ef4444' },
    { label: 'Platform Hospitals', value: apiStats.hospitals.toLocaleString(), icon: <Hospital size={24} />, change: 'Live DB', trend: 'up', color: '#10b981' },
    { label: 'Platform Pharmacies', value: apiStats.pharmacies.toLocaleString(), icon: <Pill size={24} />, change: 'Live DB', trend: 'up', color: '#f59e0b' },
  ];

  const sosData = [
    { name: '00:00', alerts: 2 },
    { name: '04:00', alerts: 1 },
    { name: '08:00', alerts: 8 },
    { name: '12:00', alerts: 14 },
    { name: '16:00', alerts: 10 },
    { name: '20:00', alerts: 6 },
    { name: '23:59', alerts: 4 },
  ];

  const activityData = [
    { name: 'Mon', users: 400 },
    { name: 'Tue', users: 300 },
    { name: 'Wed', users: 500 },
    { name: 'Thu', users: 280 },
    { name: 'Fri', users: 590 },
    { name: 'Sat', users: 320 },
    { name: 'Sun', users: 190 },
  ];

  return (
    <div className="admin-overview">
      <div className="overview-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, Master Admin. Here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-card stats-card">
            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <h2 className="stat-value">{stat.value}</h2>
              <div className={`stat-trend ${stat.trend}`}>
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{stat.change} vs last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        {/* SOS Trends Chart */}
        <div className="admin-card chart-card">
          <div className="card-head">
            <h3>SOS Alerts Trend (24h)</h3>
            <span className="card-badge red">Live Map</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sosData}>
                <defs>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorAlerts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Activity Chart */}
        <div className="admin-card chart-card">
          <div className="card-head">
            <h3>User Activity (Weekly)</h3>
            <span className="card-badge blue">Reports</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bottom-grid">
        {/* Activity Feed */}
        <div className="admin-card activity-card">
          <div className="card-head">
            <h3>Live Activity Feed</h3>
            <button className="text-btn" onClick={() => window.location.href='/admin/sos'}>View SOS Monitor</button>
          </div>
          <div className="activity-list">
            {activities.length === 0 ? <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>No recent activity.</p> : activities.map((act) => (
              <div key={act.id} className="activity-item">
                <div className="activity-icon">
                  {act.type === 'user' ? <UserPlus size={16} color="#3b82f6" /> : <ShieldAlert size={16} color="#ef4444" />}
                </div>
                <div className="activity-info">
                  <p>{act.text}</p>
                  <span>{formatTime(act.time)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health / Quick Actions */}
        <div className="admin-card health-card">
          <div className="card-head">
            <h3>System Status</h3>
            <span className={`card-badge ${health.apiStatus === 'Operational' ? 'blue' : 'red'}`}>{health.apiStatus}</span>
          </div>
          <div className="health-metrics">
             <div className="health-row">
               <span>Server Load</span>
               <div className="progress-bar"><div className="fill" style={{ width: `${health.serverLoad}%`, background: health.serverLoad > 70 ? '#ef4444' : '#10b981' }}></div></div>
               <span>{health.serverLoad}%</span>
             </div>
             <div className="health-row">
               <span>DB Latency</span>
               <div className="progress-bar"><div className="fill" style={{ width: `${(health.dbLatency/200)*100}%`, background: '#10b981' }}></div></div>
               <span>{health.dbLatency}ms</span>
             </div>
             <div className="health-row">
               <span>API Uptime</span>
               <div className="progress-bar"><div className="fill" style={{ width: '99%', background: '#3b82f6' }}></div></div>
               <span>99.9%</span>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        .overview-header {
          margin-bottom: 2rem;
        }

        .overview-header h1 {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }

        .overview-header p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .admin-card {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border-radius: 1rem;
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow-lg);
          padding: 1.5rem;
        }

        .card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .card-head h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .card-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 2rem;
          text-transform: uppercase;
        }

        .card-badge.red { background: rgba(239, 68, 68, 0.1); color: var(--emergency); }
        .card-badge.blue { background: rgba(0, 212, 232, 0.1); color: var(--primary); }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stats-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: transform 0.2s;
        }

        .stats-card:hover {
          transform: translateY(-5px);
        }

        .stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0.1rem 0;
          color: var(--text-main);
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .stat-trend.up { color: var(--success); }
        .stat-trend.down { color: var(--emergency); }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 32px;
          height: 32px;
          background: var(--input-bg);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .activity-info p {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.1rem;
          color: var(--text-main);
        }

        .activity-info span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .health-metrics {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .health-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .health-row span:first-child { width: 100px; }

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

        .text-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
        }

        @media (max-width: 1200px) {
          .charts-grid, .bottom-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminOverview;
