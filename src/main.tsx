import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// TODO: Import App and global styles once created
// import './styles/index.css'
// import App from './App'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html contains <div id="root">.')
}

createRoot(rootElement).render(
  <StrictMode>
    <div>
      <h1>NeuroLearn</h1>
      <p>Learning that adapts to you.</p>
    </div>
  </StrictMode>,
)
