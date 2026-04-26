import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Canvas from './pages/Canvas'
import Shared from './pages/Shared'
import Landing from './pages/Landing'

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

  if (loading) return (
    <div style={{ color: 'white', padding: 40 }}>Loading...</div>
  )

  if (!user) return <Landing />

  return (
    <BrowserRouter>
      <Routes>
        {/* Public — no login needed */}
        <Route path="/shared/:token" element={<Shared />} />

        {/* Logged in routes */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/canvas/:id" element={<Canvas />} />
      </Routes>
    </BrowserRouter>
  )
}