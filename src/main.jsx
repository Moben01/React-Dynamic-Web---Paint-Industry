import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  HashRouter,
} from 'react-router-dom'

import App from './App'
import { LanguageProvider } from './i18n/LanguageContext'
import './styles.css'

const Router =
  window.location.protocol === 'file:'
    ? HashRouter
    : BrowserRouter

createRoot(
  document.getElementById('root'),
).render(
  <StrictMode>
    <LanguageProvider>
      <Router>
        <App />
      </Router>
    </LanguageProvider>
  </StrictMode>,
)