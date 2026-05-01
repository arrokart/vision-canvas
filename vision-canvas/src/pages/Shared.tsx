import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Shared() {
  const { token } = useParams()
  const requestedMode = new URLSearchParams(window.location.search).get('mode') || 'view'
  const mode = ['view', 'comment', 'edit'].includes(requestedMode) ? requestedMode : 'view'
  const [ready, setReady] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchCanvas = async () => {
      if (!token) {
        setNotFound(true)
        return
      }
      const { data } = await supabase
        .from('canvases')
        .select('id')
        .eq('share_token', token)
        .single()
      if (data) setReady(true)
      else setNotFound(true)
    }
    fetchCanvas()
  }, [token])

  if (notFound) return (
    <div style={{ color: 'white', padding: 40, fontFamily: 'sans-serif' }}>
      Canvas not found or link expired.
    </div>
  )

  if (!ready) return (
    <div style={{ color: 'white', padding: 40 }}>Loading...</div>
  )

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0b0b0e' }}>
      <iframe
        src={`/canvas.html?share=${encodeURIComponent(token || '')}&mode=${mode}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Shared Canvas"
      />
    </div>
  )
}
