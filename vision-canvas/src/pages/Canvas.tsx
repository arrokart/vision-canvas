import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function Canvas({ user }: { user: any }) {
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) navigate('/dashboard')
  }, [id])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0b0b0e' }}>
      <iframe
        src={`/canvas.html?id=${id}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Vision Canvas"
      />
    </div>
  )
}