import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/* ─── GLOBAL STYLES ─────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --bg-main: #FFFFFF;
    --bg-surface: #F9FAFB;
    --border: #E5E7EB;
    --text-primary: #111827;
    --text-muted: #6B7280;
    --accent: #2563EB;
    --accent-light: #EFF6FF;
    --accent-hover: #1D4ED8;
    --success: #16A34A;
    --success-bg: #F0FDF4;
    --error: #DC2626;
    --error-bg: #FEF2F2;
    --disabled: #9CA3AF;
    --font-ui: 'DM Sans', sans-serif;
    --font-data: 'DM Mono', monospace;
  }
  
  body { 
    background-color: var(--bg-main); 
    color: var(--text-primary); 
    font-family: var(--font-ui);
    -webkit-font-smoothing: antialiased;
    line-height: 1.5;
  }

  /* Animations */
  @keyframes slideInRight { 
    from { transform: translateX(100%); opacity: 0; } 
    to { transform: translateX(0); opacity: 1; } 
  }
  @keyframes slideDownFade {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes barRise {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Utilities */
  .card-hover {
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .card-hover:hover {
    border-color: var(--accent);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  }
  
  /* Floating label */
  .floating-label-wrap { position: relative; }
  .floating-label-input {
    width: 100%;
    padding: 20px 16px 8px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-family: var(--font-ui);
    font-size: 14px;
    color: var(--text-primary);
    background: transparent;
    transition: all 0.2s ease;
    outline: none;
  }
  .floating-label-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px #DBEAFE;
  }
  .floating-label {
    position: absolute;
    left: 17px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: var(--text-muted);
    transition: all 0.2s ease;
    pointer-events: none;
  }
  .floating-label-input:focus ~ .floating-label,
  .floating-label-input:not(:placeholder-shown) ~ .floating-label {
    top: 6px;
    transform: translateY(0);
    font-size: 11px;
    color: var(--accent);
  }
  .floating-label-input:not(:focus):not(:placeholder-shown) ~ .floating-label {
    color: var(--text-muted);
  }
`;

/* ─── ANIMATED NUMBER ───────────────────────────────────────────────────── */
function AnimatedNumber({ value, prefix = '', suffix = '', isCurrency = false }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (typeof value !== 'number') return;
    
    let startTimestamp = null;
    const duration = 1500; // 1.5s
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(easing * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);

  if (typeof value !== 'number') return <span>{value}</span>;

  const formatted = isCurrency 
    ? displayValue.toLocaleString() 
    : displayValue;

  return <span>{prefix}{formatted}{suffix}</span>;
}

/* ─── HEADER ────────────────────────────────────────────────────────────── */
function Header() {
  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px 0',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-main)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '24px', height: '24px', backgroundColor: 'var(--accent)', borderRadius: '4px' }}></div>
        <div style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em' }}>
          Sales Insight <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>Automator</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ 
          width: '8px', 
          height: '8px', 
          backgroundColor: 'var(--success)', 
          borderRadius: '50%',
          animation: 'opacity 2s infinite' 
        }}></div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>System Ready</span>
      </div>
    </header>
  );
}

/* ─── STAT CARDS ─────────────────────────────────────────────────────────── */
function StatCard({ title, value, icon, isNumber }) {
  return (
    <div className="card-hover" style={{ 
      background: 'var(--bg-main)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '20px',
      flex: '1 1 0',
      minWidth: '180px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-muted)' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span style={{ fontSize: '13px', fontWeight: '500' }}>{title}</span>
      </div>
      <div style={{ 
        fontFamily: 'var(--font-data)', 
        fontSize: '24px', 
        fontWeight: '600', 
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em'
      }}>
        {value}
      </div>
    </div>
  );
}

/* ─── BAR CHART ──────────────────────────────────────────────────────────── */
function MinimalBarChart() {
  const data = [
    { label: 'Jan', value: 180000 },
    { label: 'Feb', value: 262500 },
    { label: 'Mar', value: 109250 }
  ];
  
  const max = Math.max(...data.map(d => d.value));
  
  return (
    <div style={{
      background: 'var(--bg-main)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '24px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '40px', color: 'var(--text-primary)' }}>Q1 Revenue</div>
      <div style={{ flex: 1, position: 'relative', minHeight: '160px' }}>
        {/* Grey axis lines */}
        {[0, 0.5, 1].map((ratio, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: `${ratio * 100}%`,
            borderBottom: '1px solid #F3F4F6',
            zIndex: 0
          }} />
        ))}
        
        <svg viewBox="0 0 300 160" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible', position: 'relative', zIndex: 1 }}>
          {data.map((d, i) => {
            const barH = (d.value / max) * 110; // scale
            const x = i * 100 + 50;
            return (
              <g key={d.label}>
                {/* Value label */}
                <text x={x + 20} y={150 - barH - 8} textAnchor="middle" fill="var(--text-muted)" fontSize="11px" fontFamily="var(--font-data)" style={{ animation: `slideDownFade 0.3s ease ${0.6 + i * 0.1}s backwards` }}>
                  ${(d.value / 1000)}k
                </text>
                {/* Bar */}
                <rect 
                  x={x} 
                  y={150 - barH} 
                  width={40} 
                  height={barH} 
                  fill="var(--accent)" 
                  rx={4} 
                  style={{ 
                    transformOrigin: 'bottom',
                    animation: `barRise 0.6s ease ${i * 0.1}s backwards`
                  }} 
                />
                {/* X Axis label */}
                <text x={x + 20} y={170} textAnchor="middle" fill="var(--text-muted)" fontSize="11px" fontFamily="var(--font-data)">
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ─── UPLOAD ZONE ─────────────────────────────────────────────────────────── */
function UploadZone({ onFile, file, onRemove }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  
  const onDrop = e => {
    e.preventDefault(); 
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };
  
  return (
    <div 
      onClick={() => !file && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); if (!file) setDragging(true); }}
      onDragLeave={() => setDragging(false)} 
      onDrop={onDrop}
      style={{
        background: file ? 'var(--bg-main)' : dragging ? 'var(--accent-light)' : 'var(--bg-surface)',
        border: `2px dashed ${file ? 'var(--border)' : dragging ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: '12px',
        padding: '32px 24px',
        textAlign: 'center',
        cursor: file ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '220px'
      }}
    >
      {file ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{file.name}</div>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            style={{ 
              background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', 
              padding: '6px 12px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer',
              marginTop: '4px',
              transition: 'background 0.1s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--bg-surface)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            Remove file
          </button>
        </div>
      ) : (
        <>
          <svg style={{ color: 'var(--text-muted)', marginBottom: '12px' }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Drag & drop your CSV or XLSX
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            or click to browse
          </div>
        </>
      )}
      <input 
        ref={inputRef} 
        type="file" 
        accept=".csv,.xlsx"
        style={{ display: 'none' }} 
        onChange={e => {
          if (e.target.files[0]) {
            onFile(e.target.files[0]);
            e.target.value = ''; // Reset input to allow re-uploading same file
          }
        }} 
      />
    </div>
  );
}

/* ─── SUMMARY CARD ─────────────────────────────────────────────────────────── */
function SummaryCard({ summary }) {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      i += 1;
      setDisplayed(summary.slice(0, i));
      if (i >= summary.length) {
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [summary]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
  };
  
  return (
    <div style={{ 
      background: 'var(--bg-main)',
      border: '1px solid var(--border)',
      borderLeft: '4px solid var(--accent)',
      borderRadius: '8px',
      padding: '24px',
      marginTop: '32px',
      animation: 'slideDownFade 0.3s ease both'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>AI Executive Summary</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <button 
          onClick={handleCopy}
          title="Copy to clipboard"
          style={{ 
            background: 'transparent', border: 'none', color: 'var(--text-muted)', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px',
            transition: 'color 0.15s ease'
          }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
      </div>
      <div style={{ 
        fontFamily: 'var(--font-ui)', 
        fontSize: '14px', 
        lineHeight: '1.6', 
        color: 'var(--text-primary)',
        whiteSpace: 'pre-wrap' 
      }}>
        {displayed}
      </div>
    </div>
  );
}

/* ─── TOAST ───────────────────────────────────────────────────────────────── */
function ToastContainer({ toasts }) {
  return (
    <div style={{ 
      position: 'fixed', top: '24px', right: '24px', zIndex: 1000,
      display: 'flex', flexDirection: 'column', gap: '12px' 
    }}>
      {toasts.map(t => {
        const isSuccess = t.type === 'success';
        return (
          <div key={t.id} style={{ 
            background: isSuccess ? 'var(--success-bg)' : 'var(--error-bg)',
            border: '1px solid',
            borderColor: isSuccess ? '#BBF7D0' : '#FECACA',
            borderLeft: `4px solid ${isSuccess ? 'var(--success)' : 'var(--error)'}`,
            borderRadius: '6px', 
            padding: '12px 16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            animation: 'slideInRight 0.25s ease both', 
            fontFamily: 'var(--font-ui)', 
            fontSize: '14px',
            width: '320px'
          }}>
            <span style={{ color: isSuccess ? 'var(--success)' : 'var(--error)' }}>
              {isSuccess ? 
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> : 
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              }
            </span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── MAIN APP ────────────────────────────────────────────────────────────── */
export default function App() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const handleSubmit = async () => {
    if (!file) { addToast('Please upload a file.', 'error'); return; }
    if (!email) { addToast('Please enter an email address.', 'error'); return; }
    
    setLoading(true); 
    setSummary(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);
    
    try {
      const apiUrl = typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL 
        : 'http://localhost:5001';
        
      const res = await axios.post(`${apiUrl}/api/upload`, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      setSummary(res.data.summary);
      addToast('Analysis complete', 'success');
      // setFile(null);
      // setEmail('');
    } catch (err) {
      if (typeof import.meta.env === 'undefined' || !import.meta.env.VITE_API_URL) {
        // Fallback mock if completely unconfigured or backend is down, for demonstration
        setTimeout(() => {
          setSummary('Mock Summary:\n\nThe data from Q1 reveals positive growth. Total revenue reached $551,750, driven mainly by strong performance in February. The North region outperformed overall targets.\n\nElectronics continued to dominate product sales, showcasing strong sustained demand and healthy product mix. Management recommends increasing Q2 inventory allocation.');
          setLoading(false);
          addToast('Mock Analysis complete', 'success');
        }, 2500);
        return;
      }
      
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to analyze data.';
      addToast(msg, 'error');
    } finally {
      if (typeof import.meta.env !== 'undefined') {
        setLoading(false);
      }
    }
  };

  const isFormValid = file && email && email.includes('@');

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px', position: 'relative' }}>
        <Header />
        
        <main style={{ marginTop: '32px' }}>
          
          {/* Stat Cards - 4 in a row */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <StatCard icon="📊" title="Total Revenue" value={<AnimatedNumber value={684} prefix="$" suffix=",000" />} />
            <StatCard icon="📦" title="Units Sold" value={<AnimatedNumber value={640} />} />
            <StatCard icon="📍" title="Top Region" value="North" />
            <StatCard icon="⭐" title="Top Product" value="Electronics" />
          </div>
          
          {/* Main Grid: Upload & Chart */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px', 
            marginBottom: '24px' 
          }}>
            <UploadZone onFile={setFile} file={file} onRemove={() => setFile(null)} />
            <MinimalBarChart />
          </div>
          
          {/* Email & Submit */}
          <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
            <div className="floating-label-wrap">
              <input 
                type="email" 
                id="email-input"
                className="floating-label-input" 
                placeholder=" "
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <label htmlFor="email-input" className="floating-label">Recipient Email</label>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={loading || !isFormValid}
              style={{
                width: '100%',
                padding: '14px',
                background: loading || !isFormValid ? 'var(--disabled)' : 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '500',
                cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s ease',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={e => { if (!loading && isFormValid) e.currentTarget.style.background = 'var(--accent-hover)' }}
              onMouseOut={e => { if (!loading && isFormValid) e.currentTarget.style.background = 'var(--accent)' }}
            >
              {loading ? (
                <>
                  <div style={{ 
                    width: '16px', height: '16px', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Analyzing data...
                </>
              ) : (
                'Generate Executive Summary'
              )}
            </button>
          </div>
          
          {/* Results Area */}
          {summary && !loading && (
            <SummaryCard summary={summary} />
          )}
          
        </main>
      </div>

      <ToastContainer toasts={toasts} />
    </>
  );
}
