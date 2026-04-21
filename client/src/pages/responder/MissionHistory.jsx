import React from 'react';
import { useResponder } from '../../context/ResponderContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  History, MapPin, Clock, ChevronRight, CheckCircle, Search
} from 'lucide-react';

const MissionHistory = () => {
  const { taskHistory } = useResponder();
  const { isDark } = useTheme();

  return (
    <div className="history-container fade-in">
      <div className="hg-header">
        <h1>Task History</h1>
        <div className="search-box-pill">
           <Search size={16} />
           <input type="text" placeholder="Search past missions..." />
        </div>
      </div>

      <div className="history-list">
        {taskHistory.length > 0 ? (
          taskHistory.map((task, idx) => (
            <div key={idx} className="history-card glassmorphism">
               <div className="hc-left">
                  <div className="hc-icon"><CheckCircle size={20} /></div>
               </div>
               <div className="hc-content">
                  <div className="hc-top">
                     <span className="hc-name">{task.userName}</span>
                     <span className="hc-time">{new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="hc-details">
                     <div className="hc-loc"><MapPin size={12} /> {task.type}</div>
                     <div className="hc-meta">
                        <span><Clock size={12} /> Resp: {task.responseTime || '4.2m'}</span>
                     </div>
                  </div>
               </div>
               <ChevronRight size={18} className="hc-arrow" />
            </div>
          ))
        ) : (
          <div className="empty-history">
             <History size={48} className="empty-icon" />
             <h3>No History Yet</h3>
             <p>Complete your first mission to see it logged here.</p>
          </div>
        )}
      </div>

      <style>{`
        .history-container { padding: 1.25rem; max-width: 600px; margin: 0 auto; }
        .hg-header { margin-bottom: 2rem; }
        .hg-header h1 { font-weight: 850; font-size: 1.8rem; color: var(--text-dark); margin-bottom: 1rem; }
        .dark-theme .hg-header h1 { color: white; }
        
        .search-box-pill {
           display: flex; align-items: center; gap: 0.75rem; background: rgba(0,0,0,0.03);
           padding: 0.75rem 1rem; border-radius: 1rem; border: 1px solid var(--glass-border);
           color: var(--text-muted);
        }
        .dark-theme .search-box-pill { background: rgba(255,255,255,0.02); }
        .search-box-pill input { background: none; border: none; outline: none; flex: 1; color: var(--text-dark); font-family: inherit; font-size: 0.9rem; }
        .dark-theme .search-box-pill input { color: white; }

        .history-list { display: flex; flex-direction: column; gap: 1rem; }
        .history-card { 
          padding: 1.25rem; border-radius: 1.25rem; display: flex; align-items: center; gap: 1rem;
          cursor: pointer; transition: 0.2s;
        }
        .history-card:hover { transform: scale(1.02); background: rgba(0,0,0,0.02); }
        .dark-theme .history-card:hover { background: rgba(255,255,255,0.02); }

        .hc-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(16, 185, 129, 0.1); color: #10b981; display: flex; align-items: center; justify-content: center; }
        .hc-content { flex: 1; }
        .hc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
        .hc-name { font-weight: 800; font-size: 1rem; color: var(--text-dark); }
        .dark-theme .hc-name { color: white; }
        .hc-time { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); }

        .hc-details { display: flex; flex-direction: column; gap: 0.25rem; }
        .hc-loc { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
        .hc-meta { display: flex; gap: 1rem; font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase; }
        .hc-arrow { color: var(--text-muted); }

        .empty-history { text-align: center; padding: 4rem 0; color: var(--text-muted); }
        .empty-icon { opacity: 0.2; margin-bottom: 1rem; }
        .empty-history h3 { font-weight: 800; color: var(--text-dark); }
        .dark-theme .empty-history h3 { color: white; }

        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default MissionHistory;
