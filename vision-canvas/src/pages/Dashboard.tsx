import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Dashboard({ user }: { user: any }) {
  const navigate = useNavigate()
  const [canvases, setCanvases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCanvases() }, [])

  const fetchCanvases = async () => {
    const { data } = await supabase
      .from('canvases')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    setCanvases(data || [])
    setLoading(false)
  }

  const createCanvas = async () => {
    const { data } = await supabase
      .from('canvases')
      .insert({ user_id: user.id, name: 'Untitled Canvas' })
      .select().single()
    if (data) setCanvases(prev => [data, ...prev])
  }

  const deleteCanvas = async (id: string) => {
    await supabase.from('canvases').update({ is_deleted: true }).eq('id', id)
    setCanvases(prev => prev.filter(c => c.id !== id))
  }

  const logout = async () => { await supabase.auth.signOut() }

  if (loading) return <div style={s.page}>Loading...</div>

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <span style={s.logo}>Vision Canvas</span>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <span style={{color:'#8a8a9e',fontSize:13}}>{user.email}</span>
          <button style={s.btn} onClick={createCanvas}>+ New Canvas</button>
          <button style={s.btnGhost} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={s.grid}>
        {canvases.length === 0 && (
          <div style={{color:'#4a4a60',gridColumn:'1/-1',textAlign:'center',paddingTop:60}}>
            No canvases yet. Click + New Canvas to start.
          </div>
        )}
        {canvases.map(c => (
          <div key={c.id} style={s.card} onClick={() => navigate(`/canvas/${c.id}`)}>
            <div style={s.thumb}></div>
            <div style={s.cardBottom}>
              <span style={s.cardName}>{c.name}</span>
              <button style={s.delBtn} onClick={() => deleteCanvas(c.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const s: any = {
  page: { background:'#0b0b0e', minHeight:'100vh', color:'white', fontFamily:'sans-serif' },
  topbar: { display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'12px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)',
    background:'rgba(14,14,18,0.95)' },
  logo: { fontWeight:700, fontSize:16, color:'#8b8ff4' },
  btn: { padding:'6px 14px', borderRadius:7, border:'none',
    background:'#6c71f0', color:'white', cursor:'pointer', fontSize:13 },
  btnGhost: { padding:'6px 14px', borderRadius:7,
    border:'1px solid rgba(255,255,255,0.13)',
    background:'transparent', color:'#8a8a9e', cursor:'pointer', fontSize:13 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',
    gap:16, padding:24 },
  card: { background:'#17171d', border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:12, overflow:'hidden', cursor:'pointer',
    transition:'border-color .15s' },
  thumb: { height:140, background:'#0f0f14' },
  cardBottom: { display:'flex', justifyContent:'space-between',
    alignItems:'center', padding:'10px 14px' },
  cardName: { fontSize:13, color:'#eeeef5' },
  delBtn: { background:'none', border:'none', color:'#4a4a60',
    cursor:'pointer', fontSize:13 },
}