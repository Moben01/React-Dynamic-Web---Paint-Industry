import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  HashRouter,
} from 'react-router-dom'

import App from './App'
import { LanguageProvider } from './i18n/LanguageContext'
import { prepareI18nMigration } from './i18n/i18nMigration'
import './styles.css'

// Phase 1: create a safe three-language staging copy and a one-time backup.
// Current production storage is intentionally untouched until every public/admin page
// has been switched to localizedText()/LocalizedField in the next phases.
prepareI18nMigration()

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