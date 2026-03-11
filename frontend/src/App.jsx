import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ─── GLOBAL STYLES ─────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --mint: #00ffb4; --blue: #00c8ff; --pink: #ff6b9d; --bg: #040810;
    --glass: rgba(255,255,255,0.04); --glass-border: rgba(0,255,180,0.18);
    --font-head: 'Orbitron', sans-serif; --font-mono: 'DM Mono', monospace;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: #c8d8e8; font-family: var(--font-mono);
    overflow-x: hidden; cursor: none; }
  #custom-cursor { position: fixed; width: 12px; height: 12px; border-radius: 50%;
    background: var(--mint); pointer-events: none; z-index: 9999; transform: translate(-50%,-50%);
    transition: transform .1s, opacity .2s; mix-blend-mode: screen; box-shadow: 0 0 18px var(--mint); }
  #cursor-ring { position: fixed; width: 36px; height: 36px; border-radius: 50%;
    border: 1px solid rgba(0,255,180,.45); pointer-events: none; z-index: 9998;
    transform: translate(-50%,-50%); transition: transform .18s ease, width .2s, height .2s; }

  @keyframes floatBob { 0%,100%{transform:translateY(0) rotate(0deg)}
    33%{transform:translateY(-12px) rotate(.4deg)} 66%{transform:translateY(-6px) rotate(-.3deg)} }
  @keyframes spinOrbit { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes spinOrbitRev { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
  @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 8px var(--mint)}
    50%{opacity:.5;box-shadow:0 0 22px var(--mint)} }
  @keyframes shimmer { 0%{background-position:-200%} 100%{background-position:200%} }
  @keyframes rocketUp { from{transform:scaleY(0);transform-origin:bottom} to{transform:scaleY(1);transform-origin:bottom} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
  @keyframes typewriter { from{width:0} to{width:100%} }
  @keyframes gravWave { 0%{transform:scale(0);opacity:.6} 100%{transform:scale(4);opacity:0} }
  @keyframes wormhole { 0%,100%{box-shadow:0 0 30px rgba(0,255,180,.15),inset 0 0 30px rgba(0,200,255,.08)}
    50%{box-shadow:0 0 60px rgba(0,255,180,.4),inset 0 0 60px rgba(0,200,255,.22)} }
  @keyframes toastIn { from{opacity:0;transform:translateX(120px)} to{opacity:1;transform:translateX(0)} }
  @keyframes donutSpin { from{stroke-dashoffset:300} }
  @keyframes particleBurst {
    0%{transform:translate(0,0) scale(1);opacity:1}
    100%{transform:translate(var(--px),var(--py)) scale(0);opacity:0}
  }

  .glass-card { background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    border:1px solid var(--glass-border); border-radius:16px; padding:24px; }
  .neon-text { color:var(--mint); text-shadow:0 0 12px var(--mint),0 0 30px rgba(0,255,180,.4); }
  .float-card { animation: floatBob var(--bob-dur,6s) ease-in-out var(--bob-delay,0s) infinite; }
`;

/* ─── PARTICLE NEBULA CANVAS ────────────────────────────────────────────── */
function ParticleNebula() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let mx = W / 2, my = H / 2;
    const COLORS = ['#00ffb4', '#00c8ff', '#ff6b9d', '#ffffff'];
    const particles = Array.from({ length: 120 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
      r: Math.random() * 2 + .5,
      color: COLORS[i % COLORS.length],
      alpha: Math.random() * .7 + .3,
    }));
    const onResize = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
    const onMouse = e => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouse);
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const offX = (mx / W - .5) * 30, offY = (my / H - .5) * 30;
      particles.forEach(p => {
        p.x += p.vx + offX * .005; p.y += p.vy + offY * .005;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.globalAlpha = (1 - d / 100) * .25;
            ctx.strokeStyle = '#00ffb4';
            ctx.lineWidth = .5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); window.removeEventListener('mousemove', onMouse); };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* ─── MAGNETIC CURSOR ───────────────────────────────────────────────────── */
function MagneticCursor() {
  useEffect(() => {
    const dot = document.getElementById('custom-cursor');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;
    let rx = 0, ry = 0;
    const move = e => {
      dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px';
      rx += (e.clientX - rx) * .15; ry += (e.clientY - ry) * .15;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    };
    const raf = () => { requestAnimationFrame(raf); };
    window.addEventListener('mousemove', move); raf();
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return null;
}

/* ─── HEADER ────────────────────────────────────────────────────────────── */
function Header() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <header style={{ position: 'relative', zIndex: 10, padding: '28px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid rgba(0,255,180,.1)', backdropFilter: 'blur(10px)',
      animation: 'fadeInUp .8s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800,
          color: '#00ffb4', letterSpacing: 4, textShadow: '0 0 20px #00ffb4' }}>
          ⚡ RABBITAI
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,255,180,.08)',
          border: '1px solid rgba(0,255,180,.25)', borderRadius: 20, padding: '4px 12px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ffb4',
            display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 10, color: '#00ffb4', letterSpacing: 2 }}>MISSION ACTIVE</span>
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00c8ff',
        letterSpacing: 2, textShadow: '0 0 10px #00c8ff' }}>
        {time.toLocaleTimeString('en-US', { hour12: false })} UTC+0
      </div>
    </header>
  );
}

/* ─── STAT CARDS ─────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon, color, delay, index }) {
  const ref = useRef(null);
  const onMove = useCallback(e => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(600px) rotateX(${-y * 14}deg) rotateY(${x * 14}deg) scale(1.04)`;
  }, []);
  const onLeave = useCallback(() => { if (ref.current) ref.current.style.transform = ''; }, []);
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      className="glass-card float-card"
      style={{ '--bob-dur': `${5 + index}s`, '--bob-delay': `${delay}s`,
        flex: '1 1 200px', minWidth: 180, transition: 'transform .2s ease',
        animation: `fadeInUp .7s ease ${delay + .2}s both, floatBob ${5 + index}s ease-in-out ${delay}s infinite`,
        cursor: 'none' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6a8099',
        letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700,
        color, textShadow: `0 0 16px ${color}` }}>{value}</div>
    </div>
  );
}

/* ─── BAR CHART ──────────────────────────────────────────────────────────── */
function BarChart({ data }) {
  const [active, setActive] = useState(null);
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="glass-card float-card" style={{ '--bob-dur': '7s', '--bob-delay': '.8s',
      animation: 'fadeInUp .9s ease .6s both, floatBob 7s ease-in-out .8s infinite' }}>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 13, color: '#00c8ff',
        letterSpacing: 2, marginBottom: 20, textTransform: 'uppercase' }}>📊 Revenue by Region</div>
      <svg viewBox="0 0 400 180" style={{ width: '100%', overflow: 'visible' }}>
        {data.map((d, i) => {
          const barH = (d.value / max) * 140;
          const x = i * 80 + 20;
          return (
            <g key={d.label} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
              <rect x={x} y={160 - barH} width={52} height={barH} rx={4}
                fill={active === i ? '#00ffb4' : `url(#grad${i})`}
                style={{ animation: `rocketUp .8s cubic-bezier(.23,1.01,.32,1) ${i * .15}s both`,
                  filter: `drop-shadow(0 0 ${active === i ? 12 : 6}px ${d.color})`, cursor: 'none' }} />
              <defs>
                <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={d.color} />
                  <stop offset="100%" stopColor={d.color} stopOpacity=".3" />
                </linearGradient>
              </defs>
              <text x={x + 26} y={175} textAnchor="middle" fill="#6a8099"
                fontSize={10} fontFamily="DM Mono">{d.label}</text>
              {active === i && (
                <g>
                  <rect x={x - 5} y={160 - barH - 30} width={62} height={24} rx={6}
                    fill="rgba(0,255,180,.15)" stroke="rgba(0,255,180,.4)" strokeWidth={1} />
                  <text x={x + 26} y={160 - barH - 13} textAnchor="middle"
                    fill="#00ffb4" fontSize={11} fontFamily="DM Mono">${d.value}K</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── DONUT CHART ─────────────────────────────────────────────────────────── */
function DonutChart({ segments }) {
  const r = 70; const cx = 90; const cy = 90; const circ = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((s, d) => s + d.value, 0);
  return (
    <div className="glass-card float-card" style={{ '--bob-dur': '8s', '--bob-delay': '1.2s',
      animation: 'fadeInUp .9s ease .7s both, floatBob 8s ease-in-out 1.2s infinite' }}>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 13, color: '#00c8ff',
        letterSpacing: 2, marginBottom: 20, textTransform: 'uppercase' }}>🍩 Product Mix</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <svg width={180} height={180}>
          {segments.map((seg, i) => {
            const dash = (seg.value / total) * circ;
            const gap = circ - dash;
            const el = (
              <circle key={seg.label} cx={cx} cy={cy} r={r}
                fill="transparent" stroke={seg.color} strokeWidth={20}
                strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset}
                style={{ filter: `drop-shadow(0 0 8px ${seg.color})`,
                  animation: `donutSpin 1.2s cubic-bezier(.23,1,.32,1) ${i * .2}s both`,
                  transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(-90deg)' }} />
            );
            offset += dash;
            return el;
          })}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="#c8d8e8"
            fontSize={10} fontFamily="DM Mono">TOTAL</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#00ffb4"
            fontSize={14} fontFamily="Orbitron" fontWeight="700">
            ${(total / 1000).toFixed(0)}K
          </text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {segments.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color,
                boxShadow: `0 0 8px ${s.color}`, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#8a9ab0' }}>{s.label}</span>
              <span style={{ fontSize: 11, color: s.color, marginLeft: 'auto', fontWeight: 600 }}>
                {Math.round(s.value / total * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── UPLOAD ZONE ─────────────────────────────────────────────────────────── */
function UploadZone({ onFile, file }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const onDrop = e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };
  return (
    <div onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)} onDrop={onDrop}
      className="float-card"
      style={{ '--bob-dur': '6s', '--bob-delay': '.3s',
        background: dragging ? 'rgba(0,255,180,.06)' : 'rgba(255,255,255,.03)',
        backdropFilter: 'blur(20px)', border: `1px solid ${dragging ? '#00ffb4' : 'rgba(0,255,180,.18)'}`,
        borderRadius: 16, padding: '36px 24px', textAlign: 'center',
        cursor: 'none', position: 'relative', overflow: 'hidden',
        animation: `fadeInUp .8s ease .4s both, floatBob 6s ease-in-out .3s infinite,
          ${dragging ? 'wormhole 1.5s ease-in-out infinite' : 'none'}`,
        transition: 'border-color .3s, background .3s',
        ...(dragging && { animation: 'wormhole 1.5s ease-in-out infinite, floatBob 6s ease-in-out .3s infinite' })
      }}>
      {/* Orbital ring */}
      <div style={{ position: 'absolute', top: '50%', left: '50%',
        width: dragging ? 220 : 160, height: dragging ? 220 : 160,
        borderRadius: '50%', border: `1px solid rgba(0,200,255,${dragging ? .5 : .2})`,
        transform: 'translate(-50%, -50%)', transition: 'all .4s',
        animation: 'spinOrbit 6s linear infinite',
        boxShadow: dragging ? '0 0 30px rgba(0,200,255,.3)' : 'none', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%',
        width: dragging ? 180 : 120, height: dragging ? 180 : 120,
        borderRadius: '50%', border: '1px solid rgba(255,107,157,.2)',
        transform: 'translate(-50%, -50%)',
        animation: 'spinOrbitRev 4s linear infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{dragging ? '🌀' : '📁'}</div>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, color: '#00c8ff',
          letterSpacing: 2, marginBottom: 8 }}>
          {file ? `✅ ${file.name}` : dragging ? 'RELEASE TO UPLOAD' : 'DROP SALES DATA HERE'}
        </div>
        <div style={{ fontSize: 12, color: '#4a6280' }}>CSV or XLSX · Max 5MB</div>
      </div>
      <input ref={inputRef} type="file" accept=".csv,.xlsx"
        style={{ display: 'none' }} onChange={e => onFile(e.target.files[0])} />
    </div>
  );
}

/* ─── EMAIL INPUT ─────────────────────────────────────────────────────────── */
function EmailInput({ value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative', animation: 'fadeInUp .8s ease .5s both' }}>
      <label style={{ position: 'absolute', top: focused || value ? 8 : '50%',
        left: 16, transform: focused || value ? 'translateY(0)' : 'translateY(-50%)',
        fontSize: focused || value ? 10 : 14, color: focused ? '#00ffb4' : '#4a6280',
        letterSpacing: 1, transition: 'all .25s ease', pointerEvents: 'none',
        fontFamily: 'var(--font-mono)' }}>
        RECIPIENT EMAIL
      </label>
      <input type="email" value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: '100%', padding: '22px 16px 10px', background: 'rgba(255,255,255,.03)',
          backdropFilter: 'blur(20px)', border: `1px solid ${focused ? '#00ffb4' : 'rgba(0,255,180,.18)'}`,
          borderRadius: 12, color: '#c8d8e8', fontFamily: 'var(--font-mono)', fontSize: 14,
          outline: 'none', cursor: 'none', transition: 'border-color .25s',
          boxShadow: focused ? '0 0 16px rgba(0,255,180,.15)' : 'none' }} />
    </div>
  );
}

/* ─── LAUNCH BUTTON ───────────────────────────────────────────────────────── */
function LaunchButton({ loading, onClick }) {
  const [bursting, setBursting] = useState(false);
  const [particles, setParticles] = useState([]);
  const handleClick = () => {
    if (loading) return;
    setBursting(true);
    const pts = Array.from({ length: 24 }, (_, i) => ({
      id: i, angle: (i / 24) * 360,
      px: `${(Math.cos(i / 24 * Math.PI * 2) * 80).toFixed(0)}px`,
      py: `${(Math.sin(i / 24 * Math.PI * 2) * 80).toFixed(0)}px`,
    }));
    setParticles(pts);
    setTimeout(() => { setBursting(false); setParticles([]); }, 800);
    onClick();
  };
  return (
    <div style={{ position: 'relative', textAlign: 'center', animation: 'fadeInUp .8s ease .6s both' }}>
      {particles.map(p => (
        <div key={p.id} style={{ position: 'absolute', top: '50%', left: '50%',
          width: 8, height: 8, borderRadius: '50%',
          background: p.id % 3 === 0 ? '#00ffb4' : p.id % 3 === 1 ? '#00c8ff' : '#ff6b9d',
          '--px': p.px, '--py': p.py, pointerEvents: 'none',
          animation: 'particleBurst .8s ease forwards' }} />
      ))}
      <button onClick={handleClick} disabled={loading}
        style={{ position: 'relative', width: '100%', padding: '16px 32px',
          border: 'none', borderRadius: 12, cursor: loading ? 'wait' : 'none',
          fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700,
          letterSpacing: 3, color: '#040810',
          background: loading
            ? 'linear-gradient(90deg,#00c8ff,#00ffb4,#ff6b9d,#00ffb4,#00c8ff) 0/300%'
            : 'linear-gradient(135deg,#00ffb4,#00c8ff)',
          backgroundSize: loading ? '300%' : '100%',
          animation: loading ? 'shimmer 1.5s linear infinite' : 'none',
          boxShadow: bursting
            ? '0 0 60px rgba(0,255,180,.8)'
            : '0 0 24px rgba(0,255,180,.35)',
          transition: 'box-shadow .3s, transform .2s',
          transform: bursting ? 'scale(1.08)' : 'scale(1)' }}>
        {loading ? '⏳ ANALYZING...' : '🚀 LAUNCH ANALYSIS'}
      </button>
    </div>
  );
}

/* ─── LOADING SPINNER ─────────────────────────────────────────────────────── */
function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '40px', position: 'relative', height: 140 }}>
      {[
        { size: 100, dur: '1.8s', color: '#00ffb4' },
        { size: 70, dur: '1.2s', color: '#00c8ff', rev: true },
        { size: 40, dur: '2.4s', color: '#ff6b9d' },
      ].map((r, i) => (
        <div key={i} style={{ position: 'absolute',
          width: r.size, height: r.size, borderRadius: '50%',
          border: `2px solid transparent`,
          borderTop: `2px solid ${r.color}`,
          borderRight: `2px solid ${r.color}42`,
          animation: `${r.rev ? 'spinOrbitRev' : 'spinOrbit'} ${r.dur} linear infinite`,
          boxShadow: `0 0 14px ${r.color}55` }} />
      ))}
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
      i += 3;
      setDisplayed(summary.slice(0, i));
      if (i >= summary.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [summary]);
  return (
    <div className="glass-card" style={{ animation: 'fadeInUp 1s ease both',
      border: '1px solid rgba(0,255,180,.3)', boxShadow: '0 0 40px rgba(0,255,180,.08)',
      '--bob-dur': '9s', '--bob-delay': '0s' }}>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, color: '#00ffb4',
        letterSpacing: 2, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>📋</span> EXECUTIVE INTELLIGENCE REPORT
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#00c8ff',
          animation: 'pulse 2s infinite' }}>● LIVE</span>
      </div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, lineHeight: 2,
        color: '#b8c8d8', whiteSpace: 'pre-wrap' }}>{displayed}
        <span style={{ display: 'inline-block', width: 2, height: 16,
          background: '#00ffb4', marginLeft: 2, animation: 'pulse 1s infinite',
          verticalAlign: 'middle' }} />
      </p>
    </div>
  );
}

/* ─── TOAST ───────────────────────────────────────────────────────────────── */
function StatusToast({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
      display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: 'rgba(4,8,16,.9)', backdropFilter: 'blur(20px)',
          border: `1px solid ${t.type === 'success' ? '#00ffb4' : t.type === 'error' ? '#ff6b9d' : '#00c8ff'}`,
          borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: `0 0 20px ${t.type === 'success' ? 'rgba(0,255,180,.2)' : t.type === 'error' ? 'rgba(255,107,157,.2)' : 'rgba(0,200,255,.2)'}`,
          animation: 'toastIn .4s ease both', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : '⏳'}</span>
          <span style={{ color: '#c8d8e8' }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── GRAVITATIONAL WAVE ─────────────────────────────────────────────────── */
function GravWave({ active }) {
  if (!active) return null;
  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%',
      width: 200, height: 200, borderRadius: '50%',
      border: '2px solid rgba(0,255,180,.6)',
      transform: 'translate(-50%,-50%)',
      animation: 'gravWave 1.2s ease-out forwards',
      pointerEvents: 'none', zIndex: 100 }} />
  );
}

/* ─── MOCK DATA ───────────────────────────────────────────────────────────── */
const STAT_CARDS = [
  { label: 'Total Revenue', value: '$4.2M', icon: '💰', color: '#00ffb4', delay: 0 },
  { label: 'Units Sold', value: '18,420', icon: '📦', color: '#00c8ff', delay: .15 },
  { label: 'Top Region', value: 'APAC', icon: '🌏', color: '#ff6b9d', delay: .3 },
  { label: 'Top Product', value: 'Electronics', icon: '⚡', color: '#00ffb4', delay: .45 },
];
const BAR_DATA = [
  { label: 'APAC', value: 1400, color: '#00ffb4' },
  { label: 'NA', value: 1800, color: '#00c8ff' },
  { label: 'EU', value: 900, color: '#ff6b9d' },
  { label: 'LATAM', value: 500, color: '#9b8afb' },
];
const DONUT_DATA = [
  { label: 'Electronics', value: 42, color: '#00ffb4' },
  { label: 'Apparel', value: 25, color: '#00c8ff' },
  { label: 'Home', value: 18, color: '#ff6b9d' },
  { label: 'Other', value: 15, color: '#9b8afb' },
];

/* ─── MAIN APP ────────────────────────────────────────────────────────────── */
export default function App() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [wavePulse, setWavePulse] = useState(false);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const handleSubmit = async () => {
    if (!file) { addToast('Please upload a file first.', 'error'); return; }
    if (!email) { addToast('Please enter your email.', 'error'); return; }
    setLoading(true); setSummary(null);
    setWavePulse(true); setTimeout(() => setWavePulse(false), 1400);
    addToast('Launching analysis sequence...', 'info');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);
    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData,
        { headers: { 'Content-Type': 'multipart/form-data' } });
      setSummary(res.data.summary);
      addToast('Analysis complete! Summary sent to your email.', 'success');
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed. Check your connection.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Inject styles */}
      <style>{GLOBAL_CSS}</style>

      {/* Custom cursor elements */}
      <div id="custom-cursor" />
      <div id="cursor-ring" />
      <MagneticCursor />

      {/* Particle background */}
      <ParticleNebula />

      {/* Gravitational wave */}
      <GravWave active={wavePulse} />

      {/* Layout */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh',
        display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1, padding: '32px 40px 60px', maxWidth: 1200,
          margin: '0 auto', width: '100%' }}>

          {/* Stat Cards */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
            {STAT_CARDS.map((c, i) => <StatCard key={c.label} {...c} index={i} />)}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
            <BarChart data={BAR_DATA} />
            <DonutChart segments={DONUT_DATA} />
          </div>

          {/* Upload Form */}
          <div className="glass-card" style={{ marginBottom: 32,
            animation: 'fadeInUp .9s ease .5s both',
            boxShadow: '0 0 40px rgba(0,200,255,.06)',
            border: '1px solid rgba(0,200,255,.18)' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, color: '#00c8ff',
              letterSpacing: 2, marginBottom: 24, textTransform: 'uppercase' }}>
              🛸 Upload Intelligence Data
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <UploadZone onFile={setFile} file={file} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <EmailInput value={email} onChange={setEmail} />
                <div style={{ padding: '16px', background: 'rgba(0,200,255,.04)',
                  border: '1px solid rgba(0,200,255,.12)', borderRadius: 12,
                  fontSize: 12, color: '#4a6280', lineHeight: 1.8 }}>
                  <div style={{ color: '#00c8ff', marginBottom: 4, letterSpacing: 1 }}>
                    MISSION BRIEFING
                  </div>
                  Upload your CSV or XLSX sales dataset. Our Gemini-powered AI will generate
                  a comprehensive 4-paragraph executive summary and deliver it to your inbox.
                </div>
              </div>
            </div>
            <LaunchButton loading={loading} onClick={handleSubmit} />
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="glass-card" style={{ marginBottom: 32, textAlign: 'center',
              animation: 'fadeInUp .5s ease both', border: '1px solid rgba(0,200,255,.2)' }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 12, color: '#00c8ff',
                letterSpacing: 3, marginBottom: 4 }}>GEMINI AI PROCESSING</div>
              <div style={{ fontSize: 11, color: '#4a6280', marginBottom: 8 }}>
                Analyzing sales vectors · Generating executive intelligence...
              </div>
              <LoadingSpinner />
            </div>
          )}

          {/* Summary */}
          {summary && !loading && <SummaryCard summary={summary} />}
        </main>

        {/* Footer */}
        <footer style={{ padding: '20px 40px', borderTop: '1px solid rgba(0,255,180,.08)',
          textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(255,255,255,.2)', letterSpacing: 2 }}>
          RABBITAI COMMAND CENTER · POWERED BY GEMINI 1.5 FLASH · MISSION ACTIVE
        </footer>
      </div>

      {/* Toasts */}
      <StatusToast toasts={toasts} />
    </>
  );
}
