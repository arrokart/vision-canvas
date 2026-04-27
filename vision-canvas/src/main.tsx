import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.tsx'
import './index.css'

Sentry.init({
  dsn: 'https://20310af9891e4fec5e425149af5c1e31@o4511293659545600.ingest.de.sentry.io/4511293668720720',
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
