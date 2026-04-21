import React from 'react';
import { useResponder } from '../../context/ResponderContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  BarChart3, Award, Zap, Clock, ShieldCheck, Target, TrendingUp
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="stat-p-card glassmorphism">
    <div className={`sp-icon ${color}`}><Icon size={24} /></div>
    <div className="sp-info">
      <span className="sp-label">{label}</span>
      <span className="sp-value">{value}</span>
    </div>
  </div>
);

const PerformanceSummary = () => {
  const { getPerformanceStats } = useResponder();
  const { isDark } = useTheme();
  const stats = getPerformanceStats();

  return (
    <div className="performance-container fade-in">
      <div className="p-header">
        <h1>Performance Summary</h1>
        <p>Keep up the great work, Unit 4! Your current ranking is **Top 5%**.</p>
      </div>

      <div className="stats-p-grid">
         <StatCard icon={Zap} label="Total Missions" value={stats.total} color="orange" />
         <StatCard icon={Clock} label="Avg Response" value={stats.avgResponse} color="blue" />
         <StatCard icon={TrendingUp} label="Active Hours" value={stats.activeHours} color="purple" />
         <StatCard icon={Award} label="Safety Score" value="98%" color="green" />
      </div>

      <div className="p-analytics-section mt-12">
         <div className="pa-card glassmorphism">
            <h3>Weekly Activity</h3>
            <div className="pa-chart-placeholder">
               {/* Mock bars */}
               <div className="bar-set">
                  {[45, 78, 56, 90, 34, 67, 85].map((h, i) => (
                    <div key={i} className="b-wrap">
                       <div className="b-bar" style={{ height: `${h}%` }}></div>
                       <span>{'MTWRFSS'[i]}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
         
         <div className="achievement-row mt-6">
            <div className="ach-card glassmorphism">
               <ShieldCheck size={32} className="ach-icon" />
               <div className="ach-text">
                  <h4>Safe Driver</h4>
                  <p>15 Missions without a single delay.</p>
               </div>
            </div>
         </div>
      </div>

      <style>{`
        .performance-container { padding: 1.25rem; max-width: 600px; margin: 0 auto; }
        .p-header { margin-bottom: 2rem; }
        .p-header h1 { font-weight: 850; font-size: 1.8rem; color: var(--text-dark); margin-bottom: 0.5rem; }
        .dark-theme .p-header h1 { color: white; }
        .p-header p { color: var(--text-muted); font-size: 0.9rem; font-weight: 600; }
        .p-header b { color: var(--primary); }

        .stats-p-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .stat-p-card { padding: 1.5rem; border-radius: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .sp-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .sp-icon.orange { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .sp-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .sp-icon.purple { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
        .sp-icon.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }

        .sp-info { display: flex; flex-direction: column; }
        .sp-label { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
        .sp-value { font-weight: 850; font-size: 1.5rem; color: var(--text-dark); }
        .dark-theme .sp-value { color: white; }

        .pa-card { padding: 1.5rem; border-radius: 1.5rem; }
        .pa-card h3 { font-weight: 850; font-size: 1.1rem; color: var(--text-dark); margin-bottom: 1.5rem; }
        .dark-theme .pa-card h3 { color: white; }
        
        .pa-chart-placeholder { height: 180px; display: flex; align-items: flex-end; padding-bottom: 1rem; }
        .bar-set { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; height: 100%; gap: 4px; }
        .b-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .b-bar { width: 100%; min-height: 10px; border-radius: 6px; background: var(--primary-gradient); opacity: 0.8; }
        .b-wrap span { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); }

        .ach-card { display: flex; align-items: center; gap: 1.5rem; padding: 1.25rem; border-radius: 1.25rem; }
        .ach-icon { color: #f59e0b; filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.4)); }
        .ach-text h4 { font-weight: 850; color: var(--text-dark); }
        .dark-theme .ach-text h4 { color: white; }
        .ach-text p { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }

        .mt-12 { margin-top: 3rem; }
        .mt-6 { margin-top: 1.5rem; }
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default PerformanceSummary;
