import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, ArrowLeft, ScanLine, CheckCircle2, AlertCircle, FileText, Search } from 'lucide-react';

const Scanner = () => {
  const [scanningStatus, setScanningStatus] = useState('IDLE'); // IDLE, SCANNING, EXTRACTING, RESULTS
  const [result, setResult] = useState(null);
  const [scanStep, setScanStep] = useState('');
  const navigate = useNavigate();

  const handleScan = () => {
    setScanningStatus('SCANNING');
    setScanStep('Detecting document edges...');
    
    // Simulate OCR Pipeline
    setTimeout(() => {
      setScanningStatus('EXTRACTING');
      setScanStep('Identifying medication names & dosage...');
    }, 1500);

    setTimeout(() => {
      setScanningStatus('RESULTS');
      setResult({
        medicines: [
          { name: 'Paracetamol 500mg', type: 'Tablet', dose: '1-0-1', timing: 'After meals', duration: '5 Days' },
          { name: 'Amoxicillin 250mg', type: 'Capsule', dose: '1-1-1', timing: 'Before meals', duration: '7 Days' },
          { name: 'Cetirizine 10mg', type: 'Tablet', dose: '0-0-1', timing: 'At bedtime', duration: 'As needed' },
        ],
        date: new Date().toLocaleDateString(),
        doctor: 'Dr. Sarah Khanna',
        hospital: 'City Care Hospital'
      });
    }, 3500);
  };

  return (
    <div className="page-container dashboard-container">
      <header className="dashboard-header animate-slide-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="icon-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <h2>Smart Prescription OCR</h2>
        </div>
      </header>

      <main className="scanner-main animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {scanningStatus === 'IDLE' && (
          <div className="scan-card glassmorphism">
            <div className="scan-area-preview" onClick={handleScan} style={{ 
              height: '300px', 
              background: '#0f172a', 
              borderRadius: '1.5rem', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '2px dashed var(--primary-light)'
            }}>
              <div className="scanner-frame" style={{ 
                position: 'absolute', 
                width: '80%', 
                height: '70%', 
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '1rem',
                boxShadow: '0 0 0 1000px rgba(0,0,0,0.4)'
              }}></div>
              <Camera size={48} color="white" style={{ opacity: 0.6 }} />
              <p style={{ color: 'white', marginTop: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>Tap to Capture Prescription</p>
            </div>
            
            <div className="divider"><span>OR</span></div>
            
            <button className="secondary-btn" onClick={handleScan}>
              <Upload size={20} /> Upload Digital PDF/Image
            </button>

            <div className="info-box glass" style={{ marginTop: '1.5rem', padding: '1rem' }}>
               <AlertCircle size={18} color="var(--primary)" />
               <p style={{ fontSize: '0.8rem' }}>AI will automatically find medicines and check availability.</p>
            </div>
          </div>
        )}

        {(scanningStatus === 'SCANNING' || scanningStatus === 'EXTRACTING') && (
          <div className="scan-card glassmorphism" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative', width: '200px', height: '260px', background: 'rgba(0,0,0,0.05)', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div className="scanning-bar" style={{ 
                position: 'absolute', 
                top: '0', 
                left: '0', 
                width: '100%', 
                height: '4px', 
                background: 'var(--primary)', 
                boxShadow: '0 0 15px var(--primary)',
                animation: 'scanAnim 2s infinite ease-in-out'
              }}></div>
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.3 }}>
                <div style={{ height: '20px', width: '80%', background: 'var(--text-muted)', borderRadius: '4px' }}></div>
                <div style={{ height: '20px', width: '60%', background: 'var(--text-muted)', borderRadius: '4px' }}></div>
                <div style={{ height: '20px', width: '90%', background: 'var(--text-muted)', borderRadius: '4px' }}></div>
                <div style={{ height: '20px', width: '70%', background: 'var(--text-muted)', borderRadius: '4px' }}></div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
               <h3 className="pulse-bot">{scanStep}</h3>
               <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                 <div className="loading-dot"></div>
                 <div className="loading-dot" style={{ animationDelay: '0.2s' }}></div>
                 <div className="loading-dot" style={{ animationDelay: '0.4s' }}></div>
               </div>
            </div>
          </div>
        )}

        {scanningStatus === 'RESULTS' && result && (
          <div className="scan-result-container fade-in">
            <div className="modern-card scan-result" style={{ padding: '1.5rem' }}>
              <div className="result-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div className="icon-wrap" style={{ background: 'var(--success)', color: 'white', width: '3rem', height: '3rem', borderRadius: '1rem' }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Analysis Complete</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{result.hospital} • {result.doctor}</p>
                </div>
              </div>

              <div className="medicines-list">
                {result.medicines.map((med, idx) => (
                  <div key={idx} className="med-result-item glass" style={{ padding: '1.25rem', borderRadius: '1.25rem', marginBottom: '1rem', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>{med.type}</span>
                        <h4 style={{ margin: '0.2rem 0', fontSize: '1.1rem' }}>{med.name}</h4>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{med.dose}</span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{med.duration}</p>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <FileText size={14} /> <span>{med.timing}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="secondary-btn" onClick={() => setScanningStatus('IDLE')}>
                  Rescan
                </button>
                <button className="primary-btn" onClick={() => navigate('/medicines')}>
                  <Search size={18} /> Search All
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes scanAnim {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .loading-dot {
          width: 6px;
          height: 6px;
          background: var(--primary);
          border-radius: 50%;
          animation: dotAnim 1.4s infinite ease-in-out;
        }
        @keyframes dotAnim {
          0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;

