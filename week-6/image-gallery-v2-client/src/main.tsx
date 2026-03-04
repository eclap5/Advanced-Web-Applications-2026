import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'

// For some reason sonarqube doesn't like the non-null assertion here. 
// We can disable sonar for this line or ignore the warning.
createRoot(document.getElementById('root')!).render(  // NOSONAR
  <StrictMode>
    <App />
  </StrictMode>,
)