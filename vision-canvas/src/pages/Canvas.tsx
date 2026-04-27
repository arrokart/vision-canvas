import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function Canvas() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!id) navigate('/dashboard')
  }, [id])

  return (
    <div style={{ width:'100vw', height:'100vh', background:'#0b0b0e', position:'relative' }}>
      {!loaded && (
        <div style={{
          position:'absolute', inset:0, display:'flex',
          alignItems:'center', justifyContent:'center',
          flexDirection:'column', gap:12,
          background:'#0b0b0e', zIndex:10,
          fontFamily:'Outfit,sans-serif'
        }}>
          <div style={{ color:'#8b8ff4', fontSize:20,
            fontFamily:'Syne,sans-serif', fontWeight:700 }}>
            Vision<span style={{color:'#4a4a60'}}>.</span>
          </div>
          <div style={{ color:'#4a4a60', fontSize:13 }}>Loading canvas...</div>
        </div>
      )}
      <iframe
        src={`/canvas.html?id=${id}`}
        style={{ width:'100%', height:'100%', border:'none' }}
        title="Vision Canvas"
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}