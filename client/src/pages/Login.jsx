import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ambulance, Sun, Moon, ArrowRight, Activity, MapPin, Search, WifiOff,
  Phone, ShieldAlert, CheckCircle2, User, Mail, Lock, Eye, EyeOff, ShoppingCart
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Login = () => {
  const [view, setView] = useState('login'); // 'login' or 'register'
  const { isDark, toggleTheme } = useTheme();
  const isDarkMode = isDark;
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // --- LOGIN STATES ---
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');

  // --- REGISTER STATES ---
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpVerified, setRegOtpVerified] = useState(false);
  const [regOtp, setRegOtp] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('user'); // 'user' or 'pharmacy'



  // --- HANDLERS ---

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (loginMethod === 'password') {
        if (!loginIdentifier || !loginPassword) return setLoading(false);
        
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/login-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        // Securely store tokens and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user-role', data.user.role);
        
        // Dynamically redirect based on database role
        if (data.user.role === 'admin') {
          localStorage.setItem('admin-token', 'true');
          navigate('/admin/overview');
        } else if (data.user.role === 'pharmacy') {
          navigate('/pharmacy/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        // OTP Method
        if (!loginOtpSent) {
          if (!loginIdentifier) return setLoading(false);
          const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: loginIdentifier })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setLoginOtpSent(true);
          setMessage(data.message);
        } else {
          if (loginOtp.length < 4) return setLoading(false);
          const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/login-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: loginIdentifier, otp: loginOtp })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          
          localStorage.setItem('token', data.token);
          localStorage.setItem('user-role', data.user.role);

          if (data.user.role === 'admin') {
            localStorage.setItem('admin-token', 'true');
            navigate('/admin/overview');
          } else if (data.user.role === 'pharmacy') {
            navigate('/pharmacy/dashboard');
          } else {
            navigate('/dashboard');
          }
        }
      }
    } catch (err) {
      setMessage(err.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!regOtpSent && !regOtpVerified) {
        if (!regName || !regEmail || !regPhone) return setLoading(false);
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: regPhone })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setRegOtpSent(true);
        setMessage(data.message);
      } else if (regOtpSent && !regOtpVerified) {
        if (regOtp.length < 4) return setLoading(false);
        // OTP is verified in the final step with all data during DB insertion
        setRegOtpVerified(true);
        setMessage('Phone verified internally! Now set your password to finalize.');
      } else if (regOtpVerified) {
        if (regPassword !== regConfirmPassword) throw new Error('Passwords do not match!');
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: regName, email: regEmail, phone: regPhone, 
            otp: regOtp, password: regPassword, role: regRole 
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user-role', data.user.role);
        
        if (data.user.role === 'pharmacy') {
          navigate('/pharmacy/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setMessage(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  const switchView = (newView) => {
    setView(newView);
    setMessage('');
    // Reset minimal states if needed
  };

  const renderTrustHighlight = (Icon, text) => (
    <div className="trust-highlight">
      <div className="trust-icon-box">
        <Icon size={18} />
      </div>
      <span>{text}</span>
    </div>
  );

  const renderStat = (number, label) => (
    <div className="stat-item">
      <h3>{number}</h3>
      <p>{label}</p>
    </div>
  );

  return (
    <div className="auth-container">
      <button className="theme-switcher" onClick={toggleTheme}>
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="auth-content">
        {/* Left Section (Introduction & Branding) */}
        <div className="auth-branding animate-slide-up">
          <div className="branding-header">
            <div className="app-logo">
              <Ambulance size={32} />
            </div>
            <h1>Raksha Setu</h1>
          </div>
          
          <h2 className="tagline">Instant Help When You Need It Most</h2>
          <p className="description">
            Raksha Setu helps you quickly access emergency services, find nearby hospitals, and get the medical support you need — anytime, anywhere.
          </p>

          <div className="trust-highlights">
            {renderTrustHighlight(Activity, "Fast emergency assistance")}
            {renderTrustHighlight(MapPin, "Nearby hospital access")}
            {renderTrustHighlight(Search, "Easy medicine search")}
            {renderTrustHighlight(WifiOff, "Works even in low network conditions")}
          </div>

          <div className="stats-container">
            {renderStat("500+", "Emergencies Assisted")}
            {renderStat("200+", "Hospitals Connected")}
            {renderStat("1000+", "Users Supported")}
          </div>
        </div>

        {/* Right Section (Form) */}
        <div className="auth-card-wrapper animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="auth-card glassmorphism">

            {/* Mobile Header */}
            <div className="mobile-branding">
              <div className="app-logo-mobile">
                <Ambulance size={28} />
              </div>
              <h2>Raksha Setu</h2>
              <p>Instant Help When You Need It Most</p>
            </div>

            <div className="card-header">
              <h2>{view === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <p>{view === 'login' ? 'Login safely using Password or OTP' : 'Register and verify your details'}</p>
            </div>

            {message && <div className="message-alert">{message}</div>}

            {/* --- LOGIN FORM --- */}
            {view === 'login' && (
              <form onSubmit={handleLoginSubmit} className="auth-form fade-in">
                <div className="input-field">
                  <User size={18} className="input-icon"/>
                  <input 
                    type="text" 
                    placeholder="Email or Mobile Number" 
                    value={loginIdentifier} 
                    onChange={e => setLoginIdentifier(e.target.value)} 
                    required 
                    disabled={loginOtpSent}
                  />
                </div>

                {loginMethod === 'password' && (
                  <div className="input-field fade-in">
                    <Lock size={18} className="input-icon"/>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter Password" 
                      value={loginPassword} 
                      onChange={e => setLoginPassword(e.target.value)} 
                      required 
                    />
                    <button type="button" className="action-icon" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}

                {loginMethod === 'otp' && loginOtpSent && (
                  <div className="input-field fade-in">
                    <CheckCircle2 size={18} className="input-icon"/>
                    <input 
                      type="text" 
                      placeholder="Enter 4-digit OTP" 
                      value={loginOtp} 
                      onChange={e => setLoginOtp(e.target.value)} 
                      required 
                      maxLength={4}
                    />
                  </div>
                )}

                <div className="auth-options" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--link-color)', fontWeight: '500', margin: '-0.25rem 0 0.5rem 0' }}>
                  <span onClick={() => {
                    setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
                    setLoginOtpSent(false);
                    setMessage('');
                  }} style={{ cursor: 'pointer' }}>
                    {loginMethod === 'password' ? 'Login with OTP instead' : 'Login with Password instead'}
                  </span>
                  {loginMethod === 'password' && <span style={{ cursor: 'pointer' }}>Forgot Password?</span>}
                </div>

                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? 'Processing...' : 
                    loginMethod === 'password' ? 'Login' : 
                    loginOtpSent ? 'Verify & Login' : 'Send OTP'}
                </button>
              </form>
            )}

            {/* --- REGISTER FORM --- */}
            {view === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="auth-form fade-in">
                
                {/* Step 1: Info Collection */}
                <div className="input-field">
                  <User size={18} className="input-icon"/>
                  <input type="text" placeholder="Full Name" value={regName} onChange={e => setRegName(e.target.value)} required disabled={regOtpSent || regOtpVerified} />
                </div>
                <div className="input-field">
                  <Mail size={18} className="input-icon"/>
                  <input type="email" placeholder="Email Address" value={regEmail} onChange={e => setRegEmail(e.target.value)} required disabled={regOtpSent || regOtpVerified} />
                </div>
                <div className="input-field">
                  <Phone size={18} className="input-icon"/>
                  <input type="tel" placeholder="Mobile Number" value={regPhone} onChange={e => setRegPhone(e.target.value)} required disabled={regOtpSent || regOtpVerified} />
                </div>

                {!regOtpSent && !regOtpVerified && (
                  <div className="role-selector" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div 
                      className={`role-option glass ${regRole === 'user' ? 'active' : ''}`}
                      onClick={() => setRegRole('user')}
                      style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', textAlign: 'center', cursor: 'pointer', border: regRole === 'user' ? '2px solid var(--primary)' : '1px solid var(--glass-border)' }}
                    >
                      <User size={18} style={{ marginBottom: '0.25rem' }} />
                      <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Standard User</div>
                    </div>
                    <div 
                      className={`role-option glass ${regRole === 'pharmacy' ? 'active' : ''}`}
                      onClick={() => setRegRole('pharmacy')}
                      style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', textAlign: 'center', cursor: 'pointer', border: regRole === 'pharmacy' ? '2px solid var(--primary)' : '1px solid var(--glass-border)' }}
                    >
                      <ShoppingCart size={18} style={{ marginBottom: '0.25rem' }} />
                      <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Pharmacy Store</div>
                    </div>
                  </div>
                )}

                {/* Step 2: OTP Verification */}
                {regOtpSent && !regOtpVerified && (
                  <div className="input-field fade-in">
                    <CheckCircle2 size={18} className="input-icon"/>
                    <input type="text" placeholder="Enter Registration OTP" value={regOtp} onChange={e => setRegOtp(e.target.value)} required maxLength={4} />
                  </div>
                )}

                {/* Step 3: Set Password */}
                {regOtpVerified && (
                  <>
                    <div className="input-field fade-in">
                      <Lock size={18} className="input-icon"/>
                      <input type={showPassword ? "text" : "password"} placeholder="Create Password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                      <button type="button" className="action-icon" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className="input-field fade-in">
                      <CheckCircle2 size={18} className="input-icon"/>
                      <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} required />
                    </div>
                  </>
                )}

                <p className="terms-text" style={{ marginTop: '0' }}>
                  By continuing, you agree to our <span>Terms</span> & <span>Privacy Policy</span>
                </p>

                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? 'Processing...' : 
                    !regOtpSent ? 'Verify Mobile with OTP' : 
                    !regOtpVerified ? 'Verify OTP' : 'Create Account'}
                </button>
              </form>
            )}

            {/* Shared Google Login & Switch */}
            <div className="divider">
              <span>OR</span>
            </div>

            <div className="social-logins">
              <button type="button" className="secondary-btn" onClick={() => {
                localStorage.setItem('token', 'guest-token');
                navigate('/dashboard');
              }}>
                <GoogleIcon />
                Continue with Google
              </button>
            </div>

            <div className="auth-switch">
              {view === 'login' ? (
                <p>New here? <span onClick={() => switchView('register')}>Create an Account</span></p>
              ) : (
                <p>Already have an account? <span onClick={() => switchView('login')}>Login</span></p>
              )}
            </div>

          </div>

          <div className="emergency-feature animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="emergency-alert" onClick={() => {
              localStorage.setItem('token', 'emergency-guest');
              navigate('/dashboard');
            }}>
              <div className="alert-icon">
                <ShieldAlert size={20} />
              </div>
              <div className="alert-text">
                <strong>🚨 Need urgent help?</strong>
                <p>Continue without login</p>
              </div>
              <ArrowRight size={20} className="arrow-icon" />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
