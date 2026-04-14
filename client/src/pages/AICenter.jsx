import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, ArrowLeft, Mic, Sparkles, MessageSquare, Flame, Heart, Activity, AlertCircle, ShieldCheck, Zap } from 'lucide-react';

const AICenter = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: "Hello! I'm your Raksha AI Assistant. I provide instant first-aid, disaster relief guides, and health support. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (text = input) => {
    if (!text.trim()) return;
    
    const newMsg = { id: Date.now(), type: 'user', text };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response logic
    setTimeout(() => {
      setIsTyping(false);
      let botResponse = "I'm analyzing your request. For life-threatening emergencies, please use the SOS button immediately.";
      
      const lowerText = text.toLowerCase();
      
      // Disaster Relief Logic
      if (lowerText.includes('earthquake')) {
        botResponse = "🚨 EARTHQUAKE IMMEDIATE RELIEF:\n1. DROP, COVER, and HOLD ON.\n2. Stay away from glass, windows, and heavy furniture.\n3. If indoors, stay there. Use stairs, NOT elevators.\n4. If outdoors, move to an open area away from buildings/wires.";
      } else if (lowerText.includes('fire')) {
        botResponse = "🔥 FIRE SAFETY STEPS:\n1. If possible, use a fire extinguisher (PASS: Pull, Aim, Squeeze, Sweep).\n2. If smoke is present, stay low to the ground.\n3. Feel doors for heat before opening.\n4. Close doors behind you to delay fire spread.";
      } else if (lowerText.includes('burn')) {
        botResponse = "💧 BURNS: 1. Cool under running water for 20 mins. 2. Remove tight clothing/jewelry. 3. Cover with loose plastic wrap. DO NOT use ice or butter.";
      } else if (lowerText.includes('chest pain')) {
        botResponse = "❤️ CHEST PAIN: 1. Stop all activity and sit down. 2. Loosen tight clothing. 3. Call 102 (Ambulance) immediately. I've alerted nearby responders (Simulated).";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: botResponse }]);
    }, 1500);
  };

  const emergencyChips = [
    { label: "Earthquake Tips", icon: <Zap size={14} />, color: '#f59e0b' },
    { label: "Fire Safety", icon: <Flame size={14} />, color: '#ef4444' },
    { label: "Chest Pain", icon: <Heart size={14} />, color: '#ec4899' },
    { label: "Bleeding Help", icon: <Activity size={14} />, color: '#10b981' },
  ];

  return (
    <div className="page-container dashboard-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '4.5rem' }}>
      <header className="dashboard-header animate-slide-up" style={{ paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="icon-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div className="icon-wrap" style={{ background: 'var(--primary-gradient)', color: 'white', width: '2rem', height: '2rem', borderRadius: '0.6rem' }}>
                <Bot size={16} />
             </div>
             <div>
                <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Raksha AI</h2>
                <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>● Ready to Assist</span>
             </div>
          </div>
        </div>
      </header>

      <main className="chat-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="chat-window" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-wrap ${msg.type}`} style={{ 
              display: 'flex', 
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '1rem'
            }}>
              <div className={`chat-bubble modern-card ${msg.type}`} style={{
                maxWidth: '85%',
                padding: '0.75rem',
                borderRadius: '1rem',
                fontSize: '0.85rem',
                background: msg.type === 'user' ? 'var(--primary-gradient)' : 'var(--card-bg)',
                color: msg.type === 'user' ? 'white' : 'var(--text-main)',
                borderBottomLeftRadius: msg.type === 'bot' ? '0.25rem' : '1.25rem',
                borderBottomRightRadius: msg.type === 'user' ? '0.25rem' : '1.25rem',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: 'flex', gap: '0.4rem', padding: '1rem', marginLeft: '0.5rem' }}>
               {[0, 1, 2].map(i => <div key={i} className="typing-dot" style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%', animation: 'dotAnim 1.4s infinite ease-in-out', animationDelay: `${i * 0.2}s` }}></div>)}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-footer glass" style={{ padding: '0.8rem 1rem', borderTop: '1px solid var(--card-border)', borderTopLeftRadius: '1.25rem', borderTopRightRadius: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
             <ShieldCheck size={12} color="var(--primary)" />
             <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emergency Quick Help</span>
          </div>
          <div className="quick-chips-scroll" style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.4rem' }}>
            {emergencyChips.map((chip, idx) => (
              <button 
                key={idx} 
                onClick={() => handleSend(chip.label)}
                className="glass" 
                style={{ 
                  whiteSpace: 'nowrap', 
                  padding: '0.45rem 0.85rem', 
                  borderRadius: '1.5rem', 
                  fontSize: '0.72rem', 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.35rem',
                  border: `1px solid ${chip.color}44`,
                  background: 'none',
                  color: 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                <span style={{ color: chip.color }}>{chip.icon}</span> 
                {chip.label}
              </button>
            ))}
          </div>
          
          <div className="chat-input-row" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="chat-input-glass glassmorphism" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0.4rem 0.85rem', borderRadius: '1rem' }}>
              <input 
                type="text" 
                placeholder="Ask for relief steps..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: '0.4rem 0', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '0.85rem' }}
              />
              <Mic size={16} color="var(--primary)" style={{ cursor: 'pointer' }} />
            </div>
            <button 
              onClick={() => handleSend()}
              style={{ 
                width: '2.8rem', 
                height: '2.8rem', 
                borderRadius: '0.85rem', 
                background: 'var(--primary-gradient)', 
                color: 'white', 
                border: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: 'var(--shadow-lg)',
                cursor: 'pointer'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </main>
      
      <style>{`
        @keyframes dotAnim {
          0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AICenter;


