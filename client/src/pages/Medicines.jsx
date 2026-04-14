import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Search, MapPin, ArrowLeft, Info, ShoppingCart, AlertCircle, ChevronRight, Phone } from 'lucide-react';

const pharmacyData = [
  { id: 1, name: "Apollo Pharmacy", area: "Connaught Place", distance: "0.8km", medicines: ["Paracetamol", "Amoxicillin", "Cough Syrup"], stock: "High", price: "₹24" },
  { id: 2, name: "MedPlus", area: "Karol Bagh", distance: "2.3km", medicines: ["Paracetamol", "Vitamin C", "Aspirin"], stock: "Limited", price: "₹28" },
  { id: 3, name: "Wellness Forever", area: "Rohini", distance: "5.1km", medicines: ["Insulin", "Metformin", "Paracetamol"], stock: "High", price: "₹22" },
];

const Medicines = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Read from URL if navigated from dashboard
    const params = new URLSearchParams(window.location.search);
    const q = params.get('search');
    if (q) {
      setSearchTerm(q);
      triggerSearch(q);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Location access denied")
      );
    }
  }, []);

  const triggerSearch = async (term) => {
    if (term.length > 2) {
      setLoading(true);
      try {
        const url = `http://localhost:5000/api/medicines/search?name=${term}${userLocation ? `&lat=${userLocation.lat}&lng=${userLocation.lng}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        setResults(data.results || []);
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("Search failed");
      }
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    triggerSearch(term);
  };

  const [reservingId, setReservingId] = useState(null);

  const handleReserve = (id) => {
    setReservingId(id);
    setTimeout(() => {
      alert("Medicine Reserved! Please visit the store within 2 hours.");
      setReservingId(null);
    }, 1500);
  };

  const getStatusClass = (status) => {
    if (status === 'Available') return 'high';
    if (status === 'Limited') return 'limited';
    return 'out-of-stock';
  };

  return (
    <div className="page-container dashboard-container">
      <header className="dashboard-header animate-slide-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="icon-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <h2>Medicine Hub</h2>
        </div>
      </header>

      <div className="search-wrap animate-slide-up" style={{ animationDelay: '0.1s', marginBottom: '1.5rem' }}>
        <div className="search-box glassmorphism" style={{ padding: '0.45rem 0.85rem' }}>
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search medicine (e.g. Paracetamol)" 
            value={searchTerm}
            onChange={handleSearch}
            style={{ fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div className="medicines-content">
        {results.length > 0 ? (
          <div className="results-list">
            <div className="section-head animate-slide-up">
              <h3>Pharmacies Nearby</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Found in {results.length} stores</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {results.map((p, idx) => (
                <div key={idx} className="pharmacy-card-new glassmorphism animate-slide-up" style={{ animationDelay: `${0.2 + idx * 0.1}s`, padding: '1.25rem' }}>
                  <div className="p-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div className="p-brand">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <ShoppingCart size={16} color="var(--success)" />
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{p.pharmacyName}</h4>
                      </div>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <MapPin size={12} /> {p.address} • {p.distance}
                      </p>
                    </div>
                    <div className={`stock-tag ${getStatusClass(p.stock)}`}>{p.stock}</div>
                  </div>

                  <div className="p-med-details" style={{ background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.medicine}</span>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{p.price || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="p-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                    <a href={`tel:${p.contact}`} className="icon-circle-btn" style={{ width: '2.5rem', height: '2.5rem' }}>
                       <Phone size={16} />
                    </a>
                    <button 
                      className="primary-btn" 
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                      onClick={() => handleReserve(p.id)}
                      disabled={reservingId === p.id}
                    >
                      {reservingId === p.id ? 'Reserving...' : 'Reserve Medicine'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="loading-state">Searching...</div>
        ) : (searchTerm.length > 2 && results.length === 0) ? (
          <div className="no-results-wrap animate-slide-up">
            <div className="info-box glassmorphism" style={{ border: '1px dashed var(--emergency)', background: 'rgba(239, 68, 68, 0.05)' }}>
              <AlertCircle size={32} color="var(--emergency)" />
              <h3 style={{ margin: '0.5rem 0' }}>Not in Stock</h3>
              <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Sorry, {searchTerm} is currently unavailable in pharmacies near you.
              </p>
            </div>
            
            {suggestions.length > 0 && (
              <div className="alt-section glassmorphism" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Pill size={18} color="var(--primary)" /> Smart Alternatives
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Consider these substitutes with similar active components:
                </p>
                <div className="alt-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {suggestions.map((alt, i) => (
                    <div key={i} className="alt-item-card glass" style={{ padding: '0.75rem 1rem', borderRadius: '1rem', flex: 1, minWidth: '120px', cursor: 'pointer' }} onClick={() => { setSearchTerm(alt); handleSearch({ target: { value: alt } }); }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>{alt}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>Check Availability</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="medicine-hero-wrap animate-slide-up">
            <div className="hero-card glassmorphism" style={{ background: 'var(--primary-gradient)', color: 'white', border: 'none', padding: '1.25rem' }}>
              <div className="icon-wrap" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', width: '3.5rem', height: '3.5rem', borderRadius: '1rem', marginBottom: '0.75rem' }}>
                <Pill size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Find Essential Medicines</h3>
              <p style={{ opacity: 0.9, fontSize: '0.8rem' }}>Search local pharmacies across the Raksha Setu network for real-time stock availability.</p>
            </div>
            
            <div className="disclaimer glass" style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Info size={16} color="var(--primary)" />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock status is monitored in real-time by registered pharmacy partners.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medicines;

