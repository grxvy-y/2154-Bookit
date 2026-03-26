/**
 * main.jsx — Application entry point (Vite)
 *
 * Mounts the root <App /> component into the #root div in index.html.
 * StrictMode enables extra React warnings in development only.
 * index.css is the global design-system stylesheet (colours, typography, utilities).
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


