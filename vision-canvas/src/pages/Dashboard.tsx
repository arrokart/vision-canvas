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

  if (loading) return (
    <div style={{background:'#0b0b0e',height:'100vh',display:'flex',
      alignItems:'center',justifyContent:'center',color:'#4a4a60',
      fontFamily:'Outfit,sans-serif'}}>Loading...</div>
  )

  return (
    <div style={s.page}>
      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <div style={s.logo}>Vision<span style={{color:'#4a4a60'}}>.</span></div>
        <div style={s.sideSection}>
          <div style={s.sideLabel}>Workspace</div>
          <div style={{...s.sideItem, ...s.sideItemActive}}>
            <span>⊞</span> All Canvases
          </div>
        </div>
        <div style={{flex:1}}/>
        <div style={s.userRow}>
          <div style={s.avatar}>{user.email[0].toUpperCase()}</div>
          <div style={{flex:1,overflow:'hidden'}}>
            <div style={{fontSize:12,color:'#eeeef5',overflow:'hidden',
              textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.email}</div>
            <div style={{fontSize:11,color:'#4a4a60'}}>Free plan</div>
          </div>
          <button style={s.logoutBtn} onClick={logout} title="Logout">↪</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={s.main}>
        {/* TOP BAR */}
        <div style={s.topbar}>
          <div>
            <div style={s.pageTitle}>All Canvases</div>
            <div style={s.pageSubtitle}>{canvases.length} canvas{canvases.length!==1?'es':''}</div>
          </div>
          <button style={s.newBtn} onClick={createCanvas}>+ New Canvas</button>
        </div>

        {/* GRID */}
        {canvases.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>⊞</div>
            <div style={s.emptyTitle}>No canvases yet</div>
            <div style={s.emptySub}>Create your first canvas to get started</div>
            <button style={s.newBtn} onClick={createCanvas}>+ New Canvas</button>
          </div>
        ) : (
          <div style={s.grid}>
            {canvases.map(c => (
              <div key={c.id} style={s.card}
                onClick={() => navigate(`/canvas/${c.id}`)}
                onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(108,113,240,0.4)')}
                onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.07)')}>
                {/* THUMBNAIL */}
                <div style={{...s.thumb,
                  backgroundImage: c.thumbnail_url?`url(${c.thumbnail_url})`:'none',
                  backgroundSize:'cover',backgroundPosition:'center top'}}>
                  {!c.thumbnail_url && (
                    <div style={s.noThumb}>No preview</div>
                  )}
                  {/* HOVER OPEN BUTTON */}
                  <div style={s.openOverlay} className="card-overlay">
                    <div style={s.openBtn}>Open →</div>
                  </div>
                </div>
                {/* CARD BOTTOM */}
                <div style={s.cardBottom}>
                  <span
                    style={s.cardName}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={async e => {
                      const newName = e.currentTarget.textContent?.trim()
                      if(!newName || newName === c.name) return
                      await supabase.from('canvases').update({ name: newName }).eq('id', c.id)
                      setCanvases(prev => prev.map(x => x.id === c.id ? {...x, name: newName} : x))
                    }}
                    onKeyDown={e => { if(e.key === 'Enter') e.currentTarget.blur() }}
                    onClick={e => e.stopPropagation()}
                  >{c.name}</span>
                  <button style={s.delBtn} onClick={e => {
                    e.stopPropagation()
                    if(window.confirm('Delete this canvas?')) deleteCanvas(c.id)
                  }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const s: any = {
  page: {
    display:'flex', height:'100vh', background:'#0b0b0e',
    color:'#eeeef5', fontFamily:"'Outfit',sans-serif", overflow:'hidden'
  },
  sidebar: {
    width:220, background:'#0e0e12', borderRight:'1px solid rgba(255,255,255,0.06)',
    display:'flex', flexDirection:'column', padding:'20px 0', flexShrink:0
  },
  logo: {
    fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18,
    color:'#8b8ff4', padding:'0 20px 24px'
  },
  sideSection: { padding:'0 12px', marginBottom:8 },
  sideLabel: {
    fontSize:10, fontWeight:600, color:'#4a4a60',
    letterSpacing:'1.5px', textTransform:'uppercase',
    padding:'0 8px', marginBottom:4
  },
  sideItem: {
    display:'flex', alignItems:'center', gap:8,
    padding:'7px 8px', borderRadius:7, fontSize:13,
    color:'#8a8a9e', cursor:'pointer'
  },
  sideItemActive: {
    background:'rgba(108,113,240,0.1)', color:'#8b8ff4'
  },
  userRow: {
    display:'flex', alignItems:'center', gap:8,
    padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.06)'
  },
  avatar: {
    width:28, height:28, borderRadius:'50%',
    background:'#6c71f0', display:'flex', alignItems:'center',
    justifyContent:'center', fontSize:12, fontWeight:600,
    flexShrink:0
  },
  logoutBtn: {
    background:'none', border:'none', color:'#4a4a60',
    cursor:'pointer', fontSize:15, padding:0
  },
  main: { flex:1, overflow:'auto', display:'flex', flexDirection:'column' },
  topbar: {
    display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'28px 32px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)'
  },
  pageTitle: { fontSize:20, fontWeight:600, fontFamily:"'Syne',sans-serif" },
  pageSubtitle: { fontSize:12, color:'#4a4a60', marginTop:2 },
  newBtn: {
    padding:'8px 18px', borderRadius:8, border:'none',
    background:'#6c71f0', color:'#fff', cursor:'pointer',
    fontSize:13, fontFamily:"'Outfit',sans-serif", fontWeight:500
  },
  grid: {
    display:'grid',
    gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',
    gap:20, padding:32
  },
  card: {
    background:'#111115', border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:12, overflow:'hidden', cursor:'pointer',
    transition:'border-color .15s', position:'relative'
  },
  thumb: {
    height:160, background:'#0f0f14', position:'relative', overflow:'hidden'
  },
  noThumb: {
    display:'flex', alignItems:'center', justifyContent:'center',
    height:'100%', color:'#4a4a60', fontSize:12
  },
  openOverlay: {
    position:'absolute', inset:0, background:'rgba(0,0,0,0.5)',
    display:'flex', alignItems:'center', justifyContent:'center',
    opacity:0, transition:'opacity .15s'
  },
  openBtn: {
    padding:'8px 20px', borderRadius:8,
    background:'#6c71f0', color:'#fff', fontSize:13, fontWeight:500
  },
  cardBottom: {
    display:'flex', justifyContent:'space-between',
    alignItems:'center', padding:'12px 14px'
  },
  cardName: { fontSize:13, color:'#eeeef5', outline:'none' },
  delBtn: {
    background:'none', border:'none', color:'#4a4a60',
    cursor:'pointer', fontSize:13
  },
  empty: {
    flex:1, display:'flex', flexDirection:'column',
    alignItems:'center', justifyContent:'center', gap:12
  },
  emptyIcon: { fontSize:40, color:'#1a1a24' },
  emptyTitle: { fontSize:16, fontWeight:500, color:'#eeeef5' },
  emptySub: { fontSize:13, color:'#4a4a60', marginBottom:8 },
}