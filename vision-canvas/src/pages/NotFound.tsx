import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{
      height:'100vh', background:'#0b0b0e',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      fontFamily:'Outfit,sans-serif', gap:12
    }}>
      <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,
        fontSize:20,color:'#8b8ff4'}}>
        Vision<span style={{color:'#4a4a60'}}>.</span>
      </div>
      <div style={{fontSize:48,fontWeight:700,color:'#1a1a24',
        fontFamily:'Syne,sans-serif'}}>404</div>
      <div style={{fontSize:15,color:'#8a8a9e'}}>Page not found</div>
      <button onClick={() => navigate('/dashboard')}
        style={{marginTop:8,padding:'8px 20px',borderRadius:8,
          border:'none',background:'#6c71f0',color:'#fff',
          cursor:'pointer',fontSize:13,fontFamily:'Outfit,sans-serif'}}>
        Go to Dashboard
      </button>
    </div>
  )
}