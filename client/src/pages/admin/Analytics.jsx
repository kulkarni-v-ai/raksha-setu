import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, ShieldAlert, Activity, 
  Download, Filter, Calendar
} from 'lucide-react';

const Analytics = () => {
  const trendData = [
    { day: 'Mon', emergencies: 45, visits: 240 },
    { day: 'Tue', emergencies: 52, visits: 198 },
    { day: 'Wed', emergencies: 38, visits: 310 },
    { day: 'Thu', emergencies: 65, visits: 280 },
    { day: 'Fri', emergencies: 48, visits: 410 },
    { day: 'Sat', emergencies: 72, visits: 450 },
    { day: 'Sun', emergencies: 55, visits: 320 },
  ];

  const categoryData = [
    { name: 'Accidents', value: 400 },
    { name: 'Cardiac', value: 300 },
    { name: 'Pregnancy', value: 200 },
    { name: 'Viral/Fever', value: 278 },
  ];

  const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="analytics-page">
      <div className="module-header">
        <div>
          <h1>Analytics & Trends</h1>
          <p>Deep dive into emergency patterns and system usage data.</p>
        </div>
        <div className="analytics-actions">
           <button className="filter-btn"><Calendar size={18} /> Last 7 Days</button>
           <button className="admin-primary-btn"><Download size={18} /> Report</button>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Main Trend Chart */}
        <div className="admin-card span-2">
          <div className="card-head">
            <h3>Emergencies vs Platform Visits</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="visits" stroke="#3b82f6" fill="#3b82f622" strokeWidth={3} />
                <Area type="monotone" dataKey="emergencies" stroke="#ef4444" fill="#ef444422" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="admin-card">
          <div className="card-head">
            <h3>Emergency Categories</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {categoryData.map((item, idx) => (
                <div key={item.name} className="legend-item">
                  <span className="dot" style={{ background: COLORS[idx] }}></span>
                  <span className="name">{item.name}</span>
                  <span className="val">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Peak Usage Time */}
        <div className="admin-card">
          <div className="card-head">
            <h3>Peak Usage (Hourly)</h3>
          </div>
          <div className="chart-wrapper">
             <ResponsiveContainer width="100%" height={300}>
               <BarChart data={[
                 { h: '08:00', load: 30 },
                 { h: '12:00', load: 85 },
                 { h: '16:00', load: 45 },
                 { h: '20:00', load: 95 },
                 { h: '00:00', load: 15 },
               ]}>
                 <XAxis dataKey="h" axisLine={false} tickLine={false} />
                 <YAxis hide />
                 <Tooltip cursor={{ fill: '#f8fafc' }} />
                 <Bar dataKey="load" fill="#2563eb" radius={[6, 6, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style>{`
        .analytics-actions {
          display: flex;
          gap: 0.75rem;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .span-2 { grid-column: span 2; }

        .chart-wrapper {
          padding-top: 1rem;
        }

        .pie-legend {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .legend-item .dot { width: 10px; height: 10px; border-radius: 50%; }
        .legend-item .name { flex: 1; color: var(--text-muted); }
        .legend-item .val { font-weight: 800; }

        @media (max-width: 1200px) {
          .analytics-grid { grid-template-columns: 1fr; }
          .span-2 { grid-column: auto; }
        }
      `}</style>
    </div>
  );
};

export default Analytics;
