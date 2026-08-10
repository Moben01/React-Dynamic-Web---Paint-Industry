import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  loadProjectsData,
  PROJECTS_CHANGED_EVENT,
} from '../data/projectsStore'
import { localizedText, normalizeLocalizedValue } from '../i18n/localizedContent'
import { useLanguage } from '../i18n/LanguageContext'
import './Projects.css'

const allLanguageText = (value) => {
  const localized = normalizeLocalizedValue(value)
  return `${localized.fa} ${localized.ps} ${localized.en}`.toLocaleLowerCase()
}

function Projects() {
  const { language, direction, t } = useLanguage()
  const [pageData, setPageData] = useState(loadProjectsData)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    const refreshProjects = () => setPageData(loadProjectsData())
    window.addEventListener(PROJECTS_CHANGED_EVENT, refreshProjects)
    window.addEventListener('storage', refreshProjects)
    window.addEventListener('focus', refreshProjects)
    const handleVisibilityChange = () => {
      if (!document.hidden) refreshProjects()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener(PROJECTS_CHANGED_EVENT, refreshProjects)
      window.removeEventListener('storage', refreshProjects)
      window.removeEventListener('focus', refreshProjects)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const activeProjects = useMemo(
    () => (Array.isArray(pageData.projects) ? pageData.projects : [])
      .filter((project) => project.active !== false && Boolean(project.image))
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [pageData.projects],
  )

  const featuredProject = useMemo(
    () => activeProjects.find((project) => project.featured === true) || activeProjects[0],
    [activeProjects],
  )

  const filteredProjects = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase()
    if (!query) return activeProjects
    return activeProjects.filter((project) => {
      const searchableText = [
        project.title,
        project.description,
        project.location,
        project.client,
        project.status,
        project.categoryLabel,
      ].map(allLanguageText).join(' ')
      return searchableText.includes(query) || String(project.year || '').toLocaleLowerCase().includes(query)
    })
  }, [activeProjects, searchText])

  const locationCount = useMemo(
    () => new Set(activeProjects.map((project) => localizedText(project.location, 'fa')).filter(Boolean)).size,
    [activeProjects],
  )

  const completedCount = useMemo(
    () => activeProjects.filter((project) => {
      const status = `${allLanguageText(project.status)}`
      return project.completed === true || status.includes('تکمیل') || status.includes('completed') || status.includes('بشپړه')
    }).length,
    [activeProjects],
  )

  const section = pageData.section || {}
  const l = (value) => localizedText(value, language)
  const scrollToProjects = () => document.getElementById('completed-projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  if (!featuredProject) {
    return (
      <main className="projects-page" dir={direction}>
        <div className="projects-page-container">
          <div className="projects-page-empty">{l(section.emptyMessage) || t('projects.noProjects')}</div>
        </div>
      </main>
    )
  }

  const featuredTitle = l(featuredProject.title)
  const featuredCategory = l(featuredProject.categoryLabel) || featuredProject.category || t('projects.project')

  return (
    <main className="projects-page" dir={direction}>
      <section className="projects-hero">
        <div className="projects-hero-orb projects-hero-orb-one" />
        <div className="projects-hero-orb projects-hero-orb-two" />
        <div className="projects-container projects-hero-layout">
          <motion.div className="projects-hero-content" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <span className="projects-eyebrow"><Sparkles size={17} />{l(section.eyebrow)}</span>
            <h1>{l(section.title)} <span>{l(section.highlight)}</span></h1>
            <p>{l(section.description)}</p>
            <div className="projects-hero-actions">
              <button type="button" className="projects-primary-button" onClick={scrollToProjects}>
                {t('projects.viewProjects')}<ArrowLeft size={18} />
              </button>
              <Link className="projects-secondary-button" to="/contact">{t('projects.startProject')}</Link>
            </div>
            <div className="projects-statistics">
              <div><strong>{activeProjects.length}+</strong><span>{t('projects.registeredProjects')}</span></div>
              <div><strong>{locationCount}</strong><span>{t('projects.workLocations')}</span></div>
              <div><strong>{completedCount}</strong><span>{t('projects.completedProjects')}</span></div>
            </div>
          </motion.div>

          <motion.article className="projects-featured-card" initial={{ opacity: 0, scale: 0.94, x: -30 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.75, delay: 0.1 }}>
            <img src={featuredProject.image} alt={l(featuredProject.alt) || featuredTitle} style={{ objectPosition: featuredProject.objectPosition || 'center' }} />
            <span className="projects-featured-overlay" />
            <div className="projects-featured-top">
              <span>{featuredProject.year || ''}</span>
              <span className="projects-status-badge">{l(featuredProject.status)}</span>
            </div>
            <div className="projects-featured-content">
              <small>{featuredCategory}</small>
              <h2>{featuredTitle}</h2>
              <div><MapPin size={16} />{l(featuredProject.location) || t('projects.afghanistan')}</div>
            </div>
            <Link to={`/projects/${encodeURIComponent(featuredProject.id)}`} aria-label={`${t('projects.viewProject')}: ${featuredTitle}`}><ExternalLink size={20} /></Link>
          </motion.article>
        </div>
      </section>

      <section id="completed-projects" className="projects-page-hero">
        <div className="projects-page-container">
          <motion.div className="projects-page-heading" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
            <span className="projects-page-eyebrow"><Sparkles size={17} />{t('projects.archive')}</span>
            <h1>{t('projects.archiveTitleBefore')} <strong>{t('projects.archiveTitleHighlight')}</strong></h1>
            <p>{t('projects.archiveDescription')}</p>
          </motion.div>
          <div className="projects-page-tools">
            <label className="projects-page-search"><Search size={18} />
              <input type="search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder={t('projects.searchPlaceholder')} />
            </label>
          </div>
        </div>
      </section>

      <section className="projects-page-list-section">
        <div className="projects-page-container">
          {filteredProjects.length ? (
            <div className="projects-page-grid">
              {filteredProjects.map((project, index) => {
                const title = l(project.title)
                const category = l(project.categoryLabel) || project.category || t('projects.project')
                return (
                  <motion.article key={project.id} className="projects-page-card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}>
                    <div className="projects-page-card-image">
                      <img src={project.image} alt={l(project.alt) || title} style={{ objectPosition: project.objectPosition || 'center' }} />
                      <div className="projects-page-card-overlay" />
                      <span className="projects-page-card-category">{category}</span>
                      <span className="projects-page-card-year">{project.year}</span>
                      <Link to={`/projects/${encodeURIComponent(project.id)}`} className="projects-page-card-open" aria-label={`${t('projects.viewProject')}: ${title}`}><ExternalLink size={20} /></Link>
                    </div>
                    <div className="projects-page-card-content">
                      <div className="projects-page-card-location"><MapPin size={15} /><span>{l(project.location) || t('projects.afghanistan')}</span></div>
                      <h2>{title}</h2>
                      <p>{l(project.description) || t('projects.defaultDescription')}</p>
                      <div className="projects-page-card-footer">
                        <div>
                          {l(project.client) && <span>{t('projects.client')}: <strong>{l(project.client)}</strong></span>}
                          {l(project.area) && <span>{t('projects.area')}: <strong>{l(project.area)}</strong></span>}
                        </div>
                        <Link to={`/projects/${encodeURIComponent(project.id)}`}>{t('projects.more')}<ArrowLeft size={17} /></Link>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          ) : (
            <div className="projects-page-empty">
              <Search size={36} />
              <h2>{t('projects.notFound')}</h2>
              <p>{t('projects.changeSearch')}</p>
              <button type="button" onClick={() => setSearchText('')}>{t('projects.showAll')}</button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default Projects
