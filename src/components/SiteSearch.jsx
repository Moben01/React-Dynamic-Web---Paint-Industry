import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { searchSite } from '../utils/siteSearch'
import './SiteSearch.css'

function SiteSearch({ open, onClose }) {
  const navigate = useNavigate()
  const { language, direction, t } = useLanguage()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  const results = useMemo(
    () => searchSite(query, language, t),
    [language, query, t],
  )

  useEffect(() => {
    if (!open) return undefined

    const timer = window.setTimeout(() => inputRef.current?.focus(), 60)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('site-search-is-open')

    const closeWithEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeWithEscape)
    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = previousOverflow
      document.body.classList.remove('site-search-is-open')
      window.removeEventListener('keydown', closeWithEscape)
    }
  }, [onClose, open])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  if (!open || typeof document === 'undefined') return null

  const openResult = (result) => {
    // Navigate to the exact entity route, never to a generic page when an ID exists.
    let target = result.path
    if (result.type === 'product' && result.entityId != null) {
      target = `/products/${encodeURIComponent(result.entityId)}`
    } else if (result.type === 'project' && result.entityId != null) {
      target = `/projects/${encodeURIComponent(result.entityId)}`
    }

    onClose()
    window.requestAnimationFrame(() => navigate(target))
  }

  return createPortal(
    <div className="site-search-backdrop" onMouseDown={onClose} role="presentation">
      <section
        className="site-search-panel"
        dir={direction}
        onMouseDown={(event) => event.stopPropagation()}
        aria-label={t('header.searchTitle', 'جستجو در وب‌سایت')}
        role="dialog"
        aria-modal="true"
      >
        <header className="site-search-header">
          <div>
            <Search size={19} />
            <strong>{t('header.searchTitle', 'جستجو در وب‌سایت')}</strong>
          </div>
          <button type="button" onClick={onClose} aria-label={t('common.close', 'بستن')}>
            <X size={20} />
          </button>
        </header>

        <div className="site-search-input-wrap">
          <Search size={20} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('header.searchPlaceholder', 'محصول، پروژه یا کتگوری را جستجو کنید...')}
            autoComplete="off"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label={t('products.clearSearch', 'پاک کردن جستجو')}>
              <X size={17} />
            </button>
          )}
        </div>

        {!query.trim() ? (
          <div className="site-search-empty-state">
            <Search size={30} />
            <p>{t('header.searchHint', 'نام محصول، پروژه یا کتگوری را به دری، پشتو یا انگلیسی بنویسید.')}</p>
          </div>
        ) : results.length ? (
          <div className="site-search-results">
            {results.map((result) => (
              <button
                type="button"
                key={result.id}
                className="site-search-result"
                onClick={() => openResult(result)}
              >
                {result.image ? (
                  <img src={result.image} alt="" />
                ) : (
                  <span className="site-search-result-placeholder"><Search size={18} /></span>
                )}

                <span className="site-search-result-copy">
                  <small>{result.label}</small>
                  <strong>{result.title}</strong>
                  {result.description && <p>{result.description}</p>}
                </span>

                <span className="site-search-result-arrow"><ArrowLeft size={18} /></span>
              </button>
            ))}
          </div>
        ) : (
          <div className="site-search-empty-state">
            <Search size={30} />
            <strong>{t('header.noSearchResults', 'نتیجه‌ای پیدا نشد')}</strong>
            <p>{t('header.searchHint', 'نام محصول، پروژه یا کتگوری را به دری، پشتو یا انگلیسی بنویسید.')}</p>
          </div>
        )}
      </section>
    </div>,
    document.body,
  )
}

export default SiteSearch
