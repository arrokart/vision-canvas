import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Canvas from './pages/Canvas'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
      if (data.session?.user) saveUser(data.session.user)
    })
    supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) saveUser(session.user)
    })
  }, [])

  const saveUser = async (u: any) => {
    await supabase.from('users').upsert({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name ?? u.email,
      avatar_url: u.user_metadata?.avatar_url ?? null,
    }, { onConflict: 'id' })
  }

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  const signup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { alert(error.message); return }
    if (data.user) saveUser(data.user)
  }

  if (loading) return <div style={{ color: 'white', padding: 40 }}>Loading...</div>

  if (!user) return (
    <div style={{ color: 'white', padding: 40, fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: 20 }}>Vision Canvas</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}>
        <input type="email" placeholder="your@email.com" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: 'none', fontSize: 14 }} />
        <input type="password" placeholder="password" value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: 'none', fontSize: 14 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={login}
            style={{ flex: 1, padding: '8px 16px', borderRadius: 6,
              background: '#6c71f0', border: 'none', color: 'white', cursor: 'pointer' }}>
            Login
          </button>
          <button onClick={signup}
            style={{ flex: 1, padding: '8px 16px', borderRadius: 6,
              background: 'transparent', border: '1px solid rgba(255,255,255,.2)',
              color: 'white', cursor: 'pointer' }}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/canvas/:id" element={<Canvas />} />
      </Routes>
    </BrowserRouter>
  )
}