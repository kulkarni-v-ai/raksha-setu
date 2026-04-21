import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, User, Activity, AlertTriangle, WifiOff, MapPin, Search, 
  ShieldAlert, Hospital, Pill, Bot, ScanLine, Contact, 
  FlameKindling, Home, Settings, Languages, Mic, Map as MapIcon, 
  ChevronRight, Bell, RefreshCw, ClipboardList, CheckCircle2, Zap, ShieldCheck,
  Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { name: "Divya", email: "divya@rakshasetu.in" };
  });
  const [location, setLocation] = useState("Saket, New Delhi");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [sosProgress, setSosProgress] = useState(0);
  const [sosStatus, setSosStatus] = useState('READY'); // READY, ACTIVATING, SENT
  const [isSosPressing, setIsSosPressing] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState([
    { id: 1, type: 'emergency', title: 'Medical team dispatched', meta: 'SOS response active • Just now' }
  ]);
  
  const navigate = useNavigate();
  const sosInterval = useRef(null);
  const recognition = useRef(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Translations
  const t = {
    en: {
      greeting: "Good to see you",
      sos: "SOS EMERGENCY",
      sos_hold: "Hold for 3 seconds",
      sos_activating: "Activating...",
      sos_sent: "SOS ALERT SENT",
      nearby: "Hospitals",
      medicines: "Pharmacy",
      ai_assist: "AI Assistant",
      scanner: "Scanner",
      contacts: "Contacts",
      relief: "Relief",
      profile: "Health Profile",
      recent: "Recent Alerts",
      responders: "12 Responders Nearby",
      map_cta: "View on Map",
      search_placeholder: "Search hospitals, medicines or ask..."
    },
    hi: {
      greeting: "नमस्ते",
      sos: "आपातकालीन",
      sos_hold: "3 सेकंड दबाएं",
      sos_activating: "सक्रिय हो रहा है...",
      sos_sent: "अलर्ट भेज दिया गया",
      nearby: "अस्पताल",
      medicines: "दवाइयां",
      ai_assist: "AI सहायक",
      scanner: "स्कैनर",
      contacts: "संपर्क",
      relief: "सहायता",
      profile: "हेल्थ प्रोफाइल",
      recent: "हालिया अलर्ट",
      responders: "12 सहायक पास में हैं",
      map_cta: "मैप पर देखें",
      search_placeholder: "अस्पताल, दवाएं खोजें या पूछें..."
    }
  }[lang];

  // Map Initialization
  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      // @ts-ignore (Leaflet global)
      mapInstance.current = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([28.5244, 77.2100], 15);
      // @ts-ignore
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
      // @ts-ignore
      L.circleMarker([28.5244, 77.2100], { radius: 8, fillColor: '#2563eb', color: '#fff', weight: 3, fillOpacity: 0.8 }).addTo(mapInstance.current);
    }
  }, []);

  // Voice Recognition Logic
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      
      recognition.current.onresult = (event) => {
        const current = event.results[event.results.length - 1][0].transcript;
        setTranscript(current);
        if (event.results[event.results.length - 1].isFinal) {
          const lower = current.toLowerCase();
          if (lower.includes('help') || lower.includes('emergency')) triggerSOS();
          setTimeout(() => setTranscript(''), 3000);
        }
      };
    }
  }, []);

  const toggleVoice = () => {
    if (isListening) recognition.current?.stop();
    else recognition.current?.start();
    setIsListening(!isListening);
  };

  const startSosPress = () => {
    setIsSosPressing(true);
    setSosStatus('ACTIVATING');
    let progress = 0;
    sosInterval.current = setInterval(() => {
      progress += 2; // ~1.5 - 2s hold for better feel
      setSosProgress(progress);
      if (progress >= 100) {
        clearInterval(sosInterval.current);
        triggerSOS();
      }
    }, 30);
  };

  const stopSosPress = () => {
    if (sosStatus !== 'SENT') {
      setIsSosPressing(false);
      setSosStatus('READY');
      clearInterval(sosInterval.current);
      setSosProgress(0);
    }
  };

  const triggerSOS = async () => {
    if (sosStatus === 'SENT') return;
    
    navigator.vibrate?.([200, 100, 200]);
    setSosStatus('SENT');
    setSosProgress(100);
    setIsSosPressing(false);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000')) + '/api/admin/sos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id || '69dfb6c02a610003c92392b8', // Fallback to Divya
          type: 'Medical Emergency (Manual Trigger)',
          severity: 'High',
          location: { type: 'Point', coordinates: [77.2100, 28.5244] }, // Saket coords
          address: 'Saket, New Delhi'
        })
      });
      
      if (res.ok) {
        // Add to dynamic alerts
        const newAlert = {
          id: Date.now(),
          type: 'emergency',
          title: 'Emergency SOS Signal Broadcasted',
          meta: `Alert sent to nearby responders • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        };
        setRecentAlerts(prev => [newAlert, ...prev]);
      }
    } catch (err) {
      console.error('SOS fetch failed', err);
    }

    // Keep it in 'SENT' status for longer (2 mins) to avoid 'malfunction' feel
    setTimeout(() => {
      setSosStatus('READY');
      setSosProgress(0);
    }, 120000);
  };

  const suggestions = [
    { icon: <Hospital size={16} />, text: "Nearby ICU Beds" },
    { icon: <Pill size={16} />, text: "Paracetamol Status" },
    { icon: <Bot size={16} />, text: "How to treat a burn?" }
  ];

  return (
    <div className="dashboard-container page-container" style={{ padding: 0, backgroundColor: 'transparent' }}>
      {/* 1. TOP BRANDING BANNER */}
      <div className="dashboard-top-banner animate-slide-up">
        <h1 className="brand-text-new">
          <ShieldCheck className="brand-icon-shield" size={22} />
          RakshaSetu
        </h1>
        <div className="header-icon-group">
          <div className="icon-circle-btn theme-toggle-btn" onClick={toggleTheme} title={isDark ? 'Switch to Light' : 'Switch to Dark'}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </div>
          <div className="icon-circle-btn" onClick={() => navigate('/profile')}>
            <User size={15} />
          </div>
          <div className="icon-circle-btn" style={{ position: 'relative' }}>
            <Bell size={15} />
            <div className="notification-badge" style={{ top: '6px', right: '6px' }}>2</div>
          </div>
        </div>
      </div>

      <div className="dashboard-main-wrapper">
        <div className="dashboard-main-grid-new">
          <div className="main-content-flow">
            {/* 2. NEW SEARCH BAR */}
            <div className="search-container-new animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="search-input-wrap">
                <Search size={15} color="var(--text-muted)" />
                <input 
                  type="text" 
                  placeholder="What service do you need?" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      navigate(`/medicines?search=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                />
                <div className="filter-btn-inner">
                  <Mic size={13} onClick={toggleVoice} style={{ cursor: 'pointer' }} color={isListening ? "var(--emergency)" : "#0ea5e9"} />
                </div>
              </div>
            </div>

            {/* 3. CATEGORY CHIPS */}
            <div className="categories-row animate-slide-up" style={{ animationDelay: '0.15s' }}>
              {[
                { id: 'all', label: 'All', icon: <Zap size={11} /> },
                { id: 'emergency', label: 'Emergency', icon: <ShieldAlert size={11} /> },
                { id: 'medicines', label: 'Medicines', icon: <Pill size={11} /> },
                { id: 'hospitals', label: 'Hospitals', icon: <Hospital size={11} /> },
              ].map(cat => (
                <div 
                  key={cat.id} 
                  className={`category-chip ${cat.id === 'all' ? 'active' : ''}`}
                >
                  {cat.icon} {cat.label}
                </div>
              ))}
            </div>

            {/* 4. HERO SOS CARD (COMPACT) */}
            <div className="hero-card-section animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div 
                className={`hero-emergency-card ${isSosPressing ? 'pressing' : ''}`}
                onMouseDown={startSosPress}
                onMouseUp={stopSosPress}
                onTouchStart={startSosPress}
                onTouchEnd={stopSosPress}
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
                <div className="hero-content">
                  <div className="hero-tag">EMERGENCY SOS</div>
                  <h2>{sosStatus === 'SENT' ? 'Alert Sent' : 'Need Help?'}</h2>
                  <p>{sosStatus === 'SENT' ? 'Responders notified.' : 'Hold to trigger alert.'}</p>
                  <button 
                    className="hero-action-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerSOS();
                    }}
                  >
                    {sosStatus === 'SENT' ? 'Status: Active' : 'Trigger SOS'}
                  </button>
                </div>
                {isSosPressing && <div className="sos-progress-fill" style={{ width: `${sosProgress}%`, position: 'absolute', bottom: 0, left: 0, height: '4px', background: 'white' }}></div>}
              </div>
            </div>

            {/* 5. SERVICES GRID (WHITE BLOCK) */}
            <div className="services-white-block animate-slide-up" style={{ animationDelay: '0.25s' }}>
              <div className="section-header-new">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Our Services</h3>
                <span style={{ fontSize: '0.72rem', color: '#0ea5e9', fontWeight: 700 }}>View All</span>
              </div>
              <div className="services-grid-new" style={{ padding: 0 }}>
                {[
                  { id: 'hospitals', icon: <Hospital size={18} />, label: 'Hospitals', path: '/hospitals' },
                  { id: 'medicines', icon: <Pill size={18} />, label: 'Medicines', path: '/medicines' },
                  { id: 'ai', icon: <Bot size={18} />, label: 'Raksha AI', path: '/ai' },
                  { id: 'scanner', icon: <ScanLine size={18} />, label: 'Scanner', path: '/scanner' },
                  { id: 'relief', icon: <FlameKindling size={18} />, label: 'Disaster', path: '/ai' },
                  { id: 'health', icon: <ClipboardList size={18} />, label: 'Medical', path: '/profile' },
                ].map((item) => (
                  <div key={item.id} className="service-item-new" onClick={() => navigate(item.path)}>
                    <div className="service-icon-box">
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. ALERTS SECTION */}
            <div className="alerts-section animate-slide-up" style={{ animationDelay: '0.35s', padding: '0 1rem 1.5rem' }}>
              <div className="section-head" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Recent Updates</h3>
              </div>
              <div className="alerts-list">
                {recentAlerts.map(alert => (
                  <div key={alert.id} className="alert-item glass animate-slide-up" style={{ borderRadius: '1rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem' }}>
                    <div className={`alert-dot ${alert.type}`}></div>
                    <div className="alert-content">
                      <p style={{ fontWeight: 700 }}>{alert.title}</p>
                      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{alert.meta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR FOR DESKTOP (Map & Responders) */}
          <aside className="emergency-sidebar-new animate-slide-up" style={{ animationDelay: '0.4s', padding: '0 1rem 6rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.85rem' }}>Nearby Coverage</h3>
              <div className="mini-map-container" style={{ height: '240px', borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
              </div>
            </div>

            <div className="responders-hero" style={{ padding: '1.1rem', borderRadius: '1.25rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Nearby Responders</h4>
              <div className="responder-avatars" style={{ margin: '0.75rem 0' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="avatar-circle">
                     <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="user" />
                  </div>
                ))}
                <span style={{ fontSize: '0.7rem', marginLeft: '4px', color: 'var(--text-muted)' }}>+12 cover area</span>
              </div>
              <button className="responder-cta" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => navigate('/hospitals')}>
                Check Real-time Map
              </button>
            </div>
          </aside>
        </div>
      {/* Voice Assistant Feedback */}
      {isListening && (
        <div className="voice-feedback-pill fade-in">
          <div className="pulse-dot" style={{ width: '8px', height: '8px', background: 'var(--emergency)', borderRadius: '50%', animation: 'sospelPulse 1s infinite' }}></div>
          <span>{transcript || 'Listening...'}</span>
        </div>
      )}

      {isOffline && (
        <div className="offline-pill" style={{ bottom: '6rem' }}>
          <WifiOff size={14} /> Offline Mode Active
        </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;


