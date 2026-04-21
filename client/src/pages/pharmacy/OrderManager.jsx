import React, { useEffect } from 'react';
import { 
  Inbox, CheckCircle, XCircle, AlertCircle, Clock, CheckCircle2, Navigation
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';

const OrderManager = () => {
  const { requests, updateRequestStatus } = usePharmacy();
  const loading = requests.length === 0;

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  const handleStatusChange = (id, newStatus, qty, medName) => {
    // Update global state which also fires the system notification payload
    updateRequestStatus(id, newStatus, qty, medName);

    // If accepted, we simulate deductive inventory via browser API and context alerts
    if (newStatus === 'accepted') {
      if (Notification.permission === 'granted') {
          new Notification('Order Confirmed', {
              body: `${qty}x ${medName} assigned. Courier dispatched.`,
              icon: '/favicon.ico'
          });
      }
    }
  };

  const getUrgencyColor = (urgency) => {
    if (urgency === 'critical') return '#ef4444';
    if (urgency === 'high') return '#f59e0b';
    return '#3b82f6';
  };

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '500px', flexDirection: 'column', color: '#94a3b8', gap: '1rem' }}>
       <div className="pulse-loader" style={{ width: '40px', height: '40px', background: '#0ea5e9', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
       <span>Syncing Live Requests...</span>
    </div>
  );

  return (
    <div className="orders-hub animate-fade-in">
      <header className="page-header space-between" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
             <Inbox size={24} color="#0ea5e9" />
             <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Request Inbox</h1>
           </div>
           <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage incoming hospital emergency orders.</p>
        </div>
        <div className="status-pills" style={{ display: 'flex', gap: '1rem' }}>
           <div className="stat-pill">
              <span className="dot pulse-red"></span>
              <strong>{requests.filter(r => r.status === 'pending').length}</strong> Pending
           </div>
        </div>
      </header>

      <div className="requests-grid" style={{ display: 'grid', gap: '1.5rem' }}>
        {requests.map(req => {
          const isPending = req.status === 'pending';
          const isAccepted = req.status === 'accepted';
          
          return (
            <div key={req.id} className={`request-card glass-v2 ${isAccepted ? 'accepted-card' : ''} ${req.status === 'rejected' ? 'rejected-card' : ''}`}>
               <div className="r-header">
                  <div className="r-hospital">
                     <h3>{req.hospital}</h3>
                     <span className="r-dist"><Navigation size={12} /> {req.distance}</span>
                  </div>
                  {isPending && (
                    <div className="r-time-badge" style={{ border: `1px solid ${getUrgencyColor(req.urgency)}`, color: getUrgencyColor(req.urgency) }}>
                      <Clock size={12} /> {req.time}
                    </div>
                  )}
                  {!isPending && (
                     <div className="r-status-badge">
                        {isAccepted ? <span style={{color: '#10b981', display: 'flex', gap: '5px', alignItems: 'center'}}><CheckCircle2 size={16}/> En Route</span> : <span style={{color: '#ef4444', display: 'flex', gap: '5px', alignItems: 'center'}}><XCircle size={16}/> Declined</span>}
                     </div>
                  )}
               </div>

               <div className="r-body">
                  <div className="r-item-detail">
                     <span className="r-qty">{req.quantity}x</span>
                     <span className="r-med">{req.medication}</span>
                  </div>
               </div>

               {isPending && (
                 <div className="r-actions">
                    <button className="r-btn reject ripple" onClick={() => handleStatusChange(req.id, 'rejected', req.quantity, req.medication)}>
                       <XCircle size={16} /> Reject
                    </button>
                    <button className="r-btn accept ripple" onClick={() => handleStatusChange(req.id, 'accepted', req.quantity, req.medication)}>
                       <CheckCircle size={16} /> Accept & Dispatch
                    </button>
                 </div>
               )}
            </div>
          )
        })}
        {requests.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>No new requests.</p>}
      </div>

      <style>{`
        .orders-hub { padding: 1rem; padding-bottom: 5rem; max-width: 900px; margin: 0 auto; }
        
        .stat-pill { 
          display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.05); 
          padding: 0.5rem 1rem; border-radius: 100px; font-size: 0.85rem; 
        }
        .dark-theme .stat-pill { background: rgba(255,255,255,0.05); }
        .pulse-red { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; animation: pulse 1.5s infinite; }
        
        .request-card {
           padding: 1.5rem; border-radius: 16px; background: rgba(255,255,255,0.6);
           border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.02);
           transition: 0.3s;
        }
        .dark-theme .request-card { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.08); }
        
        .accepted-card { border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.02); }
        .rejected-card { opacity: 0.5; filter: grayscale(1); }

        .r-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; }
        .r-hospital h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 0.25rem; }
        .r-dist { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: #64748b; font-weight: 600; }
        
        .r-time-badge { display: flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 100px; font-size: 0.7rem; font-weight: 800; background: rgba(255,255,255,0.5); }
        .dark-theme .r-time-badge { background: rgba(0,0,0,0.2); }

        .r-item-detail { display: flex; align-items: center; gap: 1rem; background: rgba(0,0,0,0.03); padding: 1rem; border-radius: 12px; }
        .dark-theme .r-item-detail { background: rgba(255,255,255,0.03); }
        .r-qty { font-size: 1.2rem; font-weight: 900; color: #0ea5e9; }
        .r-med { font-size: 1rem; font-weight: 700; }

        .r-actions { display: flex; gap: 1rem; margin-top: 1.25rem; }
        .r-btn { flex: 1; padding: 0.75rem; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 700; font-size: 0.85rem; cursor: pointer; border: none; transition: 0.2s; }
        .r-btn.accept { background: #0ea5e9; color: white; }
        .r-btn.accept:hover { background: #0284c7; }
        .r-btn.reject { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .r-btn.reject:hover { background: #ef4444; color: white; }

        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }

        /* Mobile Responsiveness */
        @media (max-width: 600px) {
           .page-header { flex-direction: column !important; align-items: flex-start !important; gap: 1rem; }
           .r-header { flex-direction: column; gap: 0.75rem; }
           .r-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  )
}

export default OrderManager;
