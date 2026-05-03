import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

// ── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  bg:         '#09090f',
  sidebar:    '#0d0d16',
  card:       '#111120',
  cardHover:  '#14142a',
  border:     'rgba(255,255,255,0.07)',

  purple:     '#9b6dff',
  purpleDim:  'rgba(155,109,255,0.15)',
  purpleMid:  'rgba(155,109,255,0.25)',
  cyan:       '#22d3ee',
  cyanDim:    'rgba(34,211,238,0.12)',
  pink:       '#f472b6',
  pinkDim:    'rgba(244,114,182,0.12)',
  amber:      '#fbbf24',
  amberDim:   'rgba(251,191,36,0.12)',
  green:      '#34d399',
  greenDim:   'rgba(52,211,153,0.12)',

  text:       '#f0efff',
  textMid:    'rgba(200,195,255,0.6)',
  textDim:    'rgba(200,195,255,0.3)',
}

// Card accent configs — cycles per index
const ACCENTS = [
  { color: C.purple, dim: C.purpleDim, mid: C.purpleMid, tag: 'Design',   tagColor: '#c4b5fd' },
  { color: C.cyan,   dim: C.cyanDim,   mid: 'rgba(34,211,238,0.25)', tag: 'UX', tagColor: '#67e8f9' },
  { color: C.pink,   dim: C.pinkDim,   mid: 'rgba(244,114,182,0.25)', tag: 'Art', tagColor: '#f9a8d4' },
  { color: C.amber,  dim: C.amberDim,  mid: 'rgba(251,191,36,0.25)', tag: 'Slides', tagColor: '#fde68a' },
  { color: C.green,  dim: C.greenDim,  mid: 'rgba(52,211,153,0.25)', tag: 'Mood', tagColor: '#6ee7b7' },
]

// ── Nav icon SVGs ─────────────────────────────────────────────────────────────
const IconGrid = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="1" width="5" height="5" rx="1.5" fill={color} opacity="0.9"/>
    <rect x="8" y="1" width="5" height="5" rx="1.5" fill={color} opacity="0.6"/>
    <rect x="1" y="8" width="5" height="5" rx="1.5" fill={color} opacity="0.6"/>
    <rect x="8" y="8" width="5" height="5" rx="1.5" fill={color} opacity="0.4"/>
  </svg>
)
const IconStar = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1L8.5 5.5H13L9.5 8.5L10.5 13L7 10.5L3.5 13L4.5 8.5L1 5.5H5.5L7 1Z" fill={color} opacity="0.85"/>
  </svg>
)
const IconClock = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.3" fill="none"/>
    <path d="M7 4v3l2 1.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)
const IconLayers = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1L13 4.5L7 8L1 4.5L7 1Z" stroke={color} strokeWidth="1.2" fill="none"/>
    <path d="M1 7.5L7 11L13 7.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)
const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M6.5 1.5v10M1.5 6.5h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

// ── Thumb placeholder SVGs ────────────────────────────────────────────────────
const ThumbSVGs = [
  // purple — brand rings + colour dots
  (ac: typeof ACCENTS[0]) => (
    <svg width="100%" height="100%" viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="80" r="50" fill={ac.dim}/>
      <circle cx="60" cy="80" r="32" fill={ac.mid} stroke={ac.color} strokeWidth="0.8" strokeOpacity="0.4"/>
      <circle cx="60" cy="80" r="16" fill={ac.color} fillOpacity="0.35"/>
      <rect x="116" y="36" width="20" height="20" rx="4" fill={ac.color} fillOpacity="0.85"/>
      <rect x="140" y="36" width="20" height="20" rx="4" fill="#3b82f6" fillOpacity="0.8"/>
      <rect x="164" y="36" width="20" height="20" rx="4" fill={C.pink} fillOpacity="0.8"/>
      <rect x="188" y="36" width="20" height="20" rx="4" fill={C.amber} fillOpacity="0.8"/>
      <rect x="116" y="64" width="88" height="4" rx="2" fill="rgba(255,255,255,0.13)"/>
      <rect x="116" y="74" width="64" height="4" rx="2" fill="rgba(255,255,255,0.07)"/>
      <rect x="116" y="84" width="78" height="4" rx="2" fill="rgba(255,255,255,0.06)"/>
      <path d="M28 138 L72 108 L128 120 L185 82" stroke={ac.color} strokeWidth="1.5" strokeOpacity="0.6" fill="none" strokeDasharray="4 2"/>
      <circle cx="28"  cy="138" r="3.5" fill={ac.color}/>
      <circle cx="72"  cy="108" r="3.5" fill="#7c3aed"/>
      <circle cx="128" cy="120" r="3.5" fill="#3b82f6"/>
      <circle cx="185" cy="82"  r="3.5" fill={C.cyan}/>
    </svg>
  ),
  // cyan — app chrome + cards
  (ac: typeof ACCENTS[0]) => (
    <svg width="100%" height="100%" viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="16" width="208" height="28" rx="6" fill="rgba(255,255,255,0.04)" stroke={ac.color} strokeWidth="0.5" strokeOpacity="0.3"/>
      <circle cx="28" cy="30" r="5" fill="#ef4444" fillOpacity="0.75"/>
      <circle cx="40" cy="30" r="5" fill="#fbbf24" fillOpacity="0.75"/>
      <circle cx="52" cy="30" r="5" fill="#34d399" fillOpacity="0.75"/>
      <rect x="64" y="26" width="100" height="8" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="16" y="52" width="110" height="72" rx="6" fill={ac.dim} stroke={ac.color} strokeWidth="0.5" strokeOpacity="0.25"/>
      <rect x="24" y="60" width="52" height="36" rx="3" fill={ac.mid}/>
      <rect x="24" y="102" width="86" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
      <rect x="24" y="112" width="60" height="4" rx="2" fill="rgba(255,255,255,0.06)"/>
      <rect x="136" y="52" width="88" height="34" rx="6" fill="rgba(155,109,255,0.13)" stroke={C.purple} strokeWidth="0.5" strokeOpacity="0.25"/>
      <rect x="144" y="62" width="56" height="4" rx="2" fill="rgba(255,255,255,0.12)"/>
      <rect x="144" y="72" width="38" height="4" rx="2" fill="rgba(255,255,255,0.07)"/>
      <rect x="136" y="94" width="88" height="30" rx="6" fill={C.pinkDim} stroke={C.pink} strokeWidth="0.5" strokeOpacity="0.25"/>
      <rect x="144" y="103" width="50" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
      <rect x="144" y="113" width="36" height="4" rx="2" fill="rgba(255,255,255,0.06)"/>
      <rect x="16" y="134" width="208" height="14" rx="4" fill="rgba(255,255,255,0.03)"/>
      <rect x="22" y="138" width="44" height="6" rx="3" fill={ac.color} fillOpacity="0.35"/>
    </svg>
  ),
  // pink — moodboard tiles
  (ac: typeof ACCENTS[0]) => (
    <svg width="100%" height="100%" viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="16" width="64" height="60" rx="5" fill={ac.dim} stroke={ac.color} strokeWidth="0.5" strokeOpacity="0.3"/>
      <circle cx="48" cy="36" r="12" fill={ac.color} fillOpacity="0.5"/>
      <path d="M16 54 L30 44 L46 52 L64 40 L80 54" stroke={ac.color} strokeWidth="1.2" fill="none" strokeOpacity="0.5"/>
      <rect x="90" y="16" width="64" height="60" rx="5" fill={C.amberDim} stroke={C.amber} strokeWidth="0.5" strokeOpacity="0.3"/>
      <rect x="98" y="24" width="46" height="5" rx="2" fill="rgba(255,255,255,0.12)"/>
      <rect x="98" y="35" width="32" height="5" rx="2" fill="rgba(255,255,255,0.07)"/>
      <circle cx="122" cy="58" r="10" fill={C.amber} fillOpacity="0.5"/>
      <rect x="164" y="16" width="64" height="60" rx="5" fill={C.cyanDim} stroke={C.cyan} strokeWidth="0.5" strokeOpacity="0.3"/>
      <path d="M170 54 L178 34 L186 44 L196 28 L206 44 L216 34 L224 54" fill={C.cyan} fillOpacity="0.25" stroke={C.cyan} strokeWidth="1" strokeOpacity="0.5"/>
      <rect x="16" y="88" width="212" height="58" rx="5" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
      <rect x="24" y="96" width="90" height="5" rx="2" fill="rgba(255,255,255,0.1)"/>
      <rect x="24" y="108" width="60" height="5" rx="2" fill="rgba(255,255,255,0.06)"/>
      <rect x="24" y="120" width="44" height="5" rx="2" fill="rgba(255,255,255,0.04)"/>
      <rect x="136" y="96" width="80" height="40" rx="4" fill={ac.dim}/>
      <path d="M140 126 Q155 106 166 114 Q177 122 184 108 Q191 94 202 103 Q208 108 218 100" stroke={ac.color} strokeWidth="1.3" fill="none" strokeOpacity="0.6"/>
    </svg>
  ),
  // amber — pitch deck with bars
  (ac: typeof ACCENTS[0]) => (
    <svg width="100%" height="100%" viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="16" width="144" height="84" rx="6" fill="rgba(255,255,255,0.04)" stroke={ac.color} strokeWidth="0.5" strokeOpacity="0.3"/>
      <rect x="16" y="16" width="144" height="24" rx="6" fill={ac.dim}/>
      <rect x="26" y="25" width="56" height="5" rx="2" fill={ac.color} fillOpacity="0.7"/>
      <rect x="26" y="50" width="116" height="5" rx="2" fill="rgba(255,255,255,0.1)"/>
      <rect x="26" y="62" width="80" height="5" rx="2" fill="rgba(255,255,255,0.07)"/>
      <rect x="26" y="74" width="96" height="5" rx="2" fill="rgba(255,255,255,0.05)"/>
      <rect x="170" y="16" width="56" height="26" rx="5" fill="rgba(239,68,68,0.2)" stroke="rgba(239,68,68,0.3)" strokeWidth="0.5"/>
      <rect x="178" y="26" width="38" height="5" rx="2" fill="rgba(255,255,255,0.2)"/>
      <rect x="170" y="50" width="56" height="26" rx="5" fill={ac.dim} stroke={ac.color} strokeWidth="0.5" strokeOpacity="0.4"/>
      <rect x="178" y="60" width="38" height="5" rx="2" fill="rgba(255,255,255,0.2)"/>
      <rect x="170" y="84" width="56" height="16" rx="5" fill={C.greenDim} stroke={C.green} strokeWidth="0.5" strokeOpacity="0.4"/>
      <rect x="16" y="112" width="210" height="34" rx="5" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
      {[
        [24,10],[40,8],[56,14],[72,10],[88,18],[104,13],[120,22],[136,16],[152,20],[168,14],[184,24],[200,18],
      ].map(([x, h], i) => (
        <rect key={i} x={x} y={146 - h} width="12" height={h} rx="2"
          fill={i >= 8 ? '#ef4444' : ac.color} fillOpacity={0.5 + i * 0.03}/>
      ))}
    </svg>
  ),
  // green — data/chart
  (ac: typeof ACCENTS[0]) => (
    <svg width="100%" height="100%" viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="16" width="208" height="90" rx="6" fill="rgba(255,255,255,0.03)" stroke={ac.color} strokeWidth="0.5" strokeOpacity="0.25"/>
      {[0,1,2,3,4].map(i => (
        <line key={i} x1="16" y1={34 + i * 18} x2="224" y2={34 + i * 18} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
      ))}
      <polyline points="24,90 50,75 74,82 100,58 124,68 150,44 174,52 200,32 216,40"
        fill="none" stroke={ac.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8"/>
      <polyline points="24,90 50,75 74,82 100,58 124,68 150,44 174,52 200,32 216,40 216,106 24,106"
        fill={ac.color} fillOpacity="0.1"/>
      {[[50,75],[100,58],[150,44],[200,32]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={ac.color} fillOpacity="0.9"/>
      ))}
      <rect x="16" y="118" width="50" height="26" rx="5" fill={ac.dim} stroke={ac.color} strokeWidth="0.5" strokeOpacity="0.3"/>
      <rect x="24" y="125" width="34" height="4" rx="2" fill="rgba(255,255,255,0.15)"/>
      <rect x="24" y="133" width="22" height="3" rx="2" fill={ac.color} fillOpacity="0.6"/>
      <rect x="76" y="118" width="50" height="26" rx="5" fill={C.purpleDim} stroke={C.purple} strokeWidth="0.5" strokeOpacity="0.3"/>
      <rect x="84" y="125" width="34" height="4" rx="2" fill="rgba(255,255,255,0.12)"/>
      <rect x="84" y="133" width="22" height="3" rx="2" fill={C.purple} fillOpacity="0.6"/>
      <rect x="136" y="118" width="50" height="26" rx="5" fill={C.amberDim} stroke={C.amber} strokeWidth="0.5" strokeOpacity="0.3"/>
      <rect x="144" y="125" width="34" height="4" rx="2" fill="rgba(255,255,255,0.12)"/>
      <rect x="144" y="133" width="22" height="3" rx="2" fill={C.amber} fillOpacity="0.6"/>
    </svg>
  ),
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function Dashboard({ user }: { user: any }) {
  const navigate = useNavigate()
  const [canvases, setCanvases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

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

  const visibleCanvases = canvases.filter(c =>
    (c.name || '').toLowerCase().includes(query.trim().toLowerCase())
  )

  if (loading) return (
    <div style={{
      background: C.bg, height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: C.textDim, fontFamily: "'DM Sans', sans-serif", fontSize: 14,
      gap: 10,
    }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="9" cy="9" r="7" stroke={C.purple} strokeWidth="2" strokeOpacity="0.3"/>
        <path d="M9 2a7 7 0 0 1 7 7" stroke={C.purple} strokeWidth="2" strokeLinecap="round"/>
        <style>{`@keyframes spin { to { transform: rotate(360deg) }}`}</style>
      </svg>
      Loading canvases…
    </div>
  )

  return (
    <div style={s.page}>

      {/* ── SIDEBAR ── */}
      <div style={s.sidebar}>

        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoMark}>V</div>
          <div style={s.logoText}>
            Vision<span style={{ background: 'linear-gradient(90deg,#9b6dff,#22d3ee)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>.</span>
          </div>
        </div>

        {/* Workspace nav */}
        <div style={s.navSection}>
          <div style={s.navLabel}>Workspace</div>

          <NavItem icon={<IconGrid color={C.purple}/>} iconBg={C.purpleDim} label="All Canvases" active />
          <NavItem icon={<IconStar color={C.amber}/>}  iconBg={C.amberDim}  label="Starred" disabled />
          <NavItem icon={<IconClock color={C.cyan}/>}  iconBg={C.cyanDim}   label="Recent" disabled />
        </div>

        <div style={s.divider}/>

        <div style={s.navSection}>
          <div style={s.navLabel}>Tools</div>
          <NavItem icon={<IconLayers color={C.green}/>} iconBg={C.greenDim} label="Layers" disabled />
          <NavItem icon={<IconGrid color={C.pink}/>}    iconBg={C.pinkDim}  label="Assets" disabled />
        </div>

        <div style={{ flex: 1 }}/>

        {/* User footer */}
        <div style={s.userRow}>
          <div style={s.avatar}>{user.email[0].toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.userName}>{user.email}</div>
            <div style={s.userPlan}>Free plan</div>
          </div>
          <button style={s.logoutBtn} onClick={logout} title="Logout">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M9 9.5L12.5 7 9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12.5" y1="7" x2="5.5" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={s.main}>

        {/* Top bar */}
        <div style={s.topbar}>
          <div>
            <div style={s.pageTitle}>All Canvases</div>
            <div style={s.pageSub}>{canvases.length} canvas{canvases.length !== 1 ? 'es' : ''}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* search pill */}
            <label style={s.searchBar}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="5.5" cy="5.5" r="4" stroke={C.textDim} strokeWidth="1.3"/>
                <path d="M8.5 8.5L11 11" stroke={C.textDim} strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search..."
                style={s.searchInput}
              />
            </label>
            <button style={s.newBtn} onClick={createCanvas}>
              <IconPlus/> New Canvas
            </button>
          </div>
        </div>

        {/* Grid or empty */}
        {visibleCanvases.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyOrb}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect x="4" y="4" width="12" height="12" rx="3" fill={C.purple} fillOpacity="0.5"/>
                <rect x="20" y="4" width="12" height="12" rx="3" fill={C.cyan} fillOpacity="0.4"/>
                <rect x="4" y="20" width="12" height="12" rx="3" fill={C.pink} fillOpacity="0.4"/>
                <rect x="20" y="20" width="12" height="12" rx="3" fill={C.amber} fillOpacity="0.3"/>
              </svg>
            </div>
            <div style={s.emptyTitle}>{query ? 'No matching canvases' : 'No canvases yet'}</div>
            <div style={s.emptySub}>{query ? 'Try another search term' : 'Create your first canvas to get started'}</div>
            {!query && <button style={s.newBtn} onClick={createCanvas}><IconPlus/> New Canvas</button>}
          </div>
        ) : (
          <div style={s.grid}>
            {visibleCanvases.map((c, i) => {
              const ac = ACCENTS[i % ACCENTS.length]
              const ThumbSVG = ThumbSVGs[i % ThumbSVGs.length]
              const isHovered = hoveredId === c.id

              return (
                <div
                  key={c.id}
                  style={{
                    ...s.card,
                    borderColor: isHovered ? ac.color + '55' : C.border,
                    boxShadow: isHovered
                      ? `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px ${ac.color}22, inset 0 1px 0 rgba(255,255,255,0.05)`
                      : '0 2px 8px rgba(0,0,0,0.3)',
                    transform: isHovered ? 'translateY(-4px)' : 'none',
                    background: isHovered ? C.cardHover : C.card,
                  }}
                  onClick={() => navigate(`/canvas/${c.id}`)}
                  onMouseEnter={() => setHoveredId(c.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Coloured top strip */}
                  <div style={{ height: 3, background: `linear-gradient(90deg, ${ac.color}, ${ac.color}88)`, borderRadius: '12px 12px 0 0' }}/>

                  {/* Thumbnail — FIX: never mix `background` shorthand with `backgroundImage` */}
                  <div style={{
                    ...s.thumb,
                    ...(c.thumbnail_url
                      ? {
                          backgroundImage: `url(${c.thumbnail_url}?t=${new Date(c.updated_at).getTime()})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center top',
                        }
                      : {
                          background: `radial-gradient(ellipse at 30% 40%, ${ac.color}18 0%, transparent 65%), #0f0f1a`,
                        }
                    ),
                  }}>
                    {!c.thumbnail_url && <ThumbSVG {...ac}/>}
                    {/* Hover overlay */}
                    <div style={{
                      ...s.openOverlay,
                      opacity: isHovered ? 1 : 0,
                      background: `radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)`,
                    }}>
                      <div style={{ ...s.openBtn, background: ac.color, boxShadow: `0 4px 18px ${ac.color}55` }}>
                        Open
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={s.cardBottom}>
                    <div>
                      <span
                        style={s.cardName}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={async e => {
                          const newName = e.currentTarget.textContent?.trim()
                          if (!newName || newName === c.name) return
                          await supabase.from('canvases').update({ name: newName }).eq('id', c.id)
                          setCanvases(prev => prev.map(x => x.id === c.id ? { ...x, name: newName } : x))
                        }}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur() } }}
                        onClick={e => e.stopPropagation()}
                      >{c.name}</span>
                      <div style={s.cardMeta}>
                        {new Date(c.updated_at || c.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ ...s.tag, color: ac.tagColor, background: ac.dim, border: `1px solid ${ac.color}33` }}>
                        {ac.tag}
                      </span>
                      <button
                        style={s.delBtn}
                        onClick={e => {
                          e.stopPropagation()
                          if (window.confirm('Delete this canvas?')) deleteCanvas(c.id)
                        }}
                      >x</button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* New canvas card */}
            <div style={s.newCard} onClick={createCanvas}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${C.purple}88`; (e.currentTarget as HTMLElement).style.background = C.purpleDim }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${C.purple}33`; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <div style={s.newCardIcon}>+</div>
              <div style={s.newCardLabel}>New Canvas</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── NavItem helper ────────────────────────────────────────────────────────────
function NavItem({
  icon,
  iconBg,
  label,
  active = false,
  disabled = false,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  active?: boolean
  disabled?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '7px 10px', borderRadius: 9, cursor: disabled ? 'default' : 'pointer',
      fontSize: 13.5, marginBottom: 2, transition: 'all 0.15s',
      color: active ? '#c4b5fd' : disabled ? 'rgba(200,195,255,0.28)' : 'rgba(200,195,255,0.55)',
      fontWeight: active ? 500 : 400,
      background: active ? 'linear-gradient(135deg,rgba(155,109,255,0.15),rgba(34,211,238,0.07))' : 'transparent',
      border: active ? '1px solid rgba(155,109,255,0.2)' : '1px solid transparent',
      opacity: disabled ? 0.72 : 1,
    }}>
      <div style={{ width:26, height:26, borderRadius:7, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {icon}
      </div>
      {label}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex', height: '100vh', overflow: 'hidden',
    background: C.bg, color: C.text,
    fontFamily: "'DM Sans', sans-serif",
  },
  sidebar: {
    width: 224, minWidth: 224,
    background: C.sidebar,
    borderRight: `1px solid ${C.border}`,
    display: 'flex', flexDirection: 'column',
    padding: '0 0 0 0', flexShrink: 0,
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '22px 20px 18px',
    borderBottom: `1px solid ${C.border}`,
  },
  logoMark: {
    width: 30, height: 30, borderRadius: 8,
    background: 'linear-gradient(135deg, #9b6dff, #3b82f6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700, color: 'white',
    boxShadow: '0 0 18px rgba(155,109,255,0.4)',
    fontFamily: "'DM Sans', sans-serif",
  },
  logoText: {
    fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: -0.3,
    fontFamily: "'DM Sans', sans-serif",
  },
  navSection: { padding: '16px 12px 4px' },
  navLabel: {
    fontSize: 10, fontWeight: 600, letterSpacing: '1.3px',
    color: C.textDim, textTransform: 'uppercase',
    padding: '0 8px', marginBottom: 6,
  },
  divider: { height: 1, background: C.border, margin: '8px 14px' },
  userRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '14px 16px', borderTop: `1px solid ${C.border}`,
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg,#f472b6,#9b6dff)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0,
    boxShadow: '0 0 12px rgba(244,114,182,0.35)',
  },
  userName: { fontSize: 12, fontWeight: 500, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userPlan: {
    fontSize: 10, marginTop: 1, fontWeight: 600,
    background: 'linear-gradient(90deg,#9b6dff,#22d3ee)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  logoutBtn: {
    background: 'none', border: 'none', color: C.textDim,
    cursor: 'pointer', padding: 4, borderRadius: 6, display:'flex',
    transition: 'color 0.15s',
  },
  main: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' },
  topbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '22px 32px 16px',
    borderBottom: `1px solid ${C.border}`,
    background: 'rgba(9,9,15,0.85)',
    backdropFilter: 'blur(12px)',
  },
  pageTitle: { fontSize: 20, fontWeight: 700, letterSpacing: -0.4, color: C.text, fontFamily: "'DM Sans', sans-serif" },
  pageSub: { fontSize: 12, color: C.textDim, marginTop: 2 },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${C.border}`,
    borderRadius: 9, padding: '7px 13px',
    fontSize: 13, color: C.textDim, width: 190, cursor: 'text',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: C.text,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
  },
  newBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '9px 20px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg,#9b6dff,#3b82f6)',
    color: '#fff', fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(155,109,255,0.4)',
    transition: 'all 0.15s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 20, padding: 32,
  },
  card: {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
    transition: 'all 0.22s',
  },
  thumb: {
    height: 160, position: 'relative', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  openOverlay: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.2s',
  },
  openBtn: {
    padding: '9px 22px', borderRadius: 9,
    color: '#fff', fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
  },
  cardBottom: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 14px',
    borderTop: `1px solid ${C.border}`,
  },
  cardName: { fontSize: 13, fontWeight: 500, color: C.text, outline: 'none' },
  cardMeta: { fontSize: 11, color: C.textDim, marginTop: 2 },
  tag: {
    fontSize: 10, fontWeight: 600, padding: '3px 8px',
    borderRadius: 5, letterSpacing: '0.3px',
  },
  delBtn: {
    background: 'none', border: 'none',
    color: C.textDim, cursor: 'pointer',
    fontSize: 13, padding: 0,
    transition: 'color 0.15s',
  },
  newCard: {
    background: 'transparent',
    border: `1.5px dashed ${C.purple}44`,
    borderRadius: 14, minHeight: 215,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    cursor: 'pointer', transition: 'all 0.2s',
    color: `${C.purple}88`,
  },
  newCardIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: C.purpleDim, border: `1px solid ${C.purple}33`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 300,
  },
  newCardLabel: { fontSize: 13, fontWeight: 500 },
  empty: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  emptyOrb: {
    width: 70, height: 70, borderRadius: 16,
    background: 'rgba(155,109,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, fontWeight: 600, color: C.text },
  emptySub: { fontSize: 13, color: C.textDim, marginBottom: 8 },
}
