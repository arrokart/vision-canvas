import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Landing() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    if (!email || !password) { alert('Enter email and password'); return }
    setLoading(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { alert(error.message); setLoading(false) }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { alert(error.message); setLoading(false) }
    }
  }

  return (
    <div style={s.page}>
      {/* BG glow */}
      <div style={s.glow} />

      {/* NAV */}
      <nav style={s.nav}>
        <span style={s.logo}>Vision<span style={{color:'#4a4a60'}}>.</span></span>
        <div style={{display:'flex',gap:8}}>
          <button style={s.navBtn} onClick={()=>setMode('login')}>Login</button>
          <button style={s.navBtnAccent} onClick={()=>setMode('signup')}>Get Started Free</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={s.hero}>
        <div style={s.badge}>✦ Free to start — no credit card</div>
        <h1 style={s.h1}>
          The infinite canvas<br />
          <span style={s.h1accent}>for visual thinkers</span>
        </h1>
        <p style={s.sub}>
          Drag images, add text, build moodboards.<br />
          Save to cloud, share in one click.
        </p>

        {/* FEATURES */}
        <div style={s.features}>
          {['🖼️ Drag & drop images','✦ Infinite canvas','☁️ Auto-save to cloud',
            '🔗 Share with one link','✏️ Text blocks','🔒 Lock & layer'].map(f=>(
            <div key={f} style={s.feature}>{f}</div>
          ))}
        </div>

        {/* AUTH FORM */}
        <div style={s.form}>
          <div style={s.formTabs}>
            <button style={{...s.tab, ...(mode==='login'?s.tabActive:{})}}
              onClick={()=>setMode('login')}>Login</button>
            <button style={{...s.tab, ...(mode==='signup'?s.tabActive:{})}}
              onClick={()=>setMode('signup')}>Sign Up</button>
          </div>
          <input type="email" placeholder="your@email.com" value={email}
            onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleAuth()}
            style={s.input} />
          <input type="password" placeholder="password" value={password}
            onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleAuth()}
            style={s.input} />
          <button onClick={handleAuth} disabled={loading} style={s.cta}>
            {loading ? 'Please wait...' : mode==='login' ? 'Login →' : 'Create Free Account →'}
          </button>
        </div>

        <p style={s.hint}>
          Used by designers, architects & content creators
        </p>
      </div>
    </div>
  )
}

const s: any = {
  page: {
    minHeight: '100vh',
    background: '#08080b',
    color: '#eeeef5',
    fontFamily: "'Outfit', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '-200px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '800px',
    height: '600px',
    background: 'radial-gradient(ellipse, rgba(108,113,240,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  logo: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 20,
    color: '#8b8ff4',
  },
  navBtn: {
    padding: '7px 16px',
    borderRadius: 7,
    border: '1px solid rgba(255,255,255,0.13)',
    background: 'transparent',
    color: '#8a8a9e',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
  },
  navBtnAccent: {
    padding: '7px 16px',
    borderRadius: 7,
    border: 'none',
    background: '#6c71f0',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
  },
  hero: {
    maxWidth: 560,
    margin: '0 auto',
    padding: '80px 24px 60px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  badge: {
    display: 'inline-block',
    padding: '4px 14px',
    borderRadius: 20,
    border: '1px solid rgba(108,113,240,0.3)',
    background: 'rgba(108,113,240,0.08)',
    color: '#8b8ff4',
    fontSize: 12,
    marginBottom: 24,
  },
  h1: {
    fontSize: 52,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-1.5px',
    marginBottom: 20,
    fontFamily: "'Syne', sans-serif",
  },
  h1accent: {
    color: '#8b8ff4',
  },
  sub: {
    fontSize: 17,
    color: '#8a8a9e',
    lineHeight: 1.7,
    marginBottom: 32,
  },
  features: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 40,
  },
  feature: {
    padding: '6px 14px',
    borderRadius: 20,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: 13,
    color: '#8a8a9e',
  },
  form: {
    background: 'rgba(16,16,21,0.9)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    backdropFilter: 'blur(20px)',
    marginBottom: 20,
  },
  formTabs: {
    display: 'flex',
    gap: 4,
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    padding: '6px 0',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    color: '#8a8a9e',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
    transition: '.15s',
  },
  tabActive: {
    background: 'rgba(108,113,240,0.2)',
    color: '#8b8ff4',
  },
  input: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: '#eeeef5',
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    outline: 'none',
  },
  cta: {
    padding: '12px',
    borderRadius: 8,
    border: 'none',
    background: '#6c71f0',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    transition: '.15s',
  },
  hint: {
    fontSize: 12,
    color: '#4a4a60',
  },
}