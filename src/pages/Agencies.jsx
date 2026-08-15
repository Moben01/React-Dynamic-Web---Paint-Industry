import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  AGENCIES_CHANGED_EVENT,
  loadAgenciesData,
} from '../data/agenciesStore'
import { localizedText } from '../i18n/localizedContent'
import { useLanguage } from '../i18n/LanguageContext'
import './Agencies.css'

function Agencies() {
  const { language, direction } = useLanguage()
  const [pageData, setPageData] = useState(loadAgenciesData)
  const l = (value) => localizedText(value, language)

  useEffect(() => {
    const refresh = () => setPageData(loadAgenciesData())
    window.addEventListener(AGENCIES_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener(AGENCIES_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  const activeAgencies = useMemo(
    () => [...(pageData.agencies || [])]
      .filter((agency) => agency.active !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [pageData.agencies],
  )

  const section = pageData.section
  const primaryPhone = activeAgencies[0]?.phone || '+93700000101'

  return (
    <main className="agencies-page" dir={direction}>
      <section className="agencies-hero">
        <div className="agencies-container agencies-hero-layout">
          <motion.div className="agencies-hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="agencies-kicker"><Sparkles size={17} />{l(section.kicker)}</span>
            <h1>{l(section.title)}</h1>
            <p>{l(section.description)}</p>
            <div className="agencies-actions">
              <Link to="/contact#contact-form">{l(section.primaryAction)}<ArrowLeft size={18} /></Link>
              <a href={`tel:${primaryPhone.replace(/[^\d+]/g, '')}`}>{l(section.secondaryAction)}<Phone size={17} /></a>
            </div>
          </motion.div>

          <motion.div className="agencies-map-panel" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}>
            <div className="agencies-map-grid" />
            <div className="agencies-map-route" />
            {activeAgencies.slice(0, 4).map((agency, index) => (
              <span key={agency.id} className={`agencies-map-pin agencies-map-pin-${index + 1}`}><MapPin size={18} /></span>
            ))}
            <div className="agencies-map-card">
              <Store size={28} />
              <strong>{l(section.locatorTitle)}</strong>
              <p>{l(section.locatorText)}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="agencies-stats-section">
        <div className="agencies-container agencies-stats">
          {(pageData.stats || []).map((stat) => <div key={stat.id}><strong>{stat.value}</strong><span>{l(stat.label)}</span></div>)}
        </div>
      </section>

      <section className="agencies-list-section">
        <div className="agencies-container agencies-list-layout">
          <div className="agencies-section-heading">
            <span><Building2 size={17} />{l(section.kicker)}</span>
            <h2>{l(section.locatorTitle)}</h2>
          </div>
          <div className="agencies-list">
            {activeAgencies.map((agency, index) => (
              <motion.article key={agency.id} className="agency-row" initial={{ opacity: 0, x: direction === 'rtl' ? 24 : -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: (index % 6) * 0.05 }}>
                <Link className="agency-image-link" to={`/agencies/${encodeURIComponent(agency.id)}`}>
                  <img src={agency.image || agency.images?.[0]} alt={l(agency.name)} loading="lazy" />
                  <span className="agency-number">{String(index + 1).padStart(2, '0')}</span>
                </Link>
                <Link className="agency-main agency-main-link" to={`/agencies/${encodeURIComponent(agency.id)}`}>
                  <h3>{l(agency.name)}</h3>
                  <p><MapPin size={15} />{l(agency.address)}</p>
                </Link>
                <div className="agency-note">{l(agency.summary)}</div>
                <Link to={`/agencies/${encodeURIComponent(agency.id)}`} className="agency-details-link">
                  {language === 'en' ? 'Details' : 'جزئیات'}<ArrowLeft size={17} />
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="agencies-process-section">
        <div className="agencies-container agencies-process-layout">
          <div className="agencies-process-card">
            <span><ShieldCheck size={18} />{l(section.benefitsTitle)}</span>
            <div>{(pageData.benefits || []).map((benefit) => <p key={l(benefit)}><CheckCircle2 size={18} />{l(benefit)}</p>)}</div>
          </div>
          <div className="agencies-steps">
            <h2>{l(section.stepsTitle)}</h2>
            {(pageData.steps || []).map((step, index) => (
              <div key={step.id}><span>{index + 1}</span><div><h3>{l(step.title)}</h3><p>{l(step.description)}</p></div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="agencies-cta-section">
        <div className="agencies-container agencies-cta">
          <BadgeCheck size={34} />
          <div><h2>{l(section.ctaTitle)}</h2><p>{l(section.ctaText)}</p></div>
          <Link to="/contact"><Truck size={18} />{l(section.secondaryAction)}</Link>
        </div>
      </section>
    </main>
  )
}

export default Agencies
