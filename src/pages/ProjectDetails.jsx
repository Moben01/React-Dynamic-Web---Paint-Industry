import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers3,
  MapPin,
  Maximize2,
  Sparkles,
  UserRound,
  X,
  ZoomIn,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  loadProjectsData,
  PROJECTS_CHANGED_EVENT,
} from '../data/projectsStore'
import { localizedText } from '../i18n/localizedContent'
import { useLanguage } from '../i18n/LanguageContext'
import './ProjectDetails.css'

function ProjectDetails() {
  const { projectId } = useParams()
  const { language, direction, t } = useLanguage()
  const [pageData, setPageData] = useState(loadProjectsData)
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const l = (value) => localizedText(value, language)

  useEffect(() => {
    const refresh = () => setPageData(loadProjectsData())
    window.addEventListener(PROJECTS_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener(PROJECTS_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  const project = useMemo(
    () => (pageData.projects || []).find(
      (item) => String(item.id) === decodeURIComponent(String(projectId || '')),
    ),
    [pageData.projects, projectId],
  )

  const images = useMemo(() => {
    if (!project) return []
    const gallery = Array.isArray(project.images) ? project.images.filter(Boolean) : []
    if (!gallery.length && project.image) gallery.push(project.image)
    return [...new Set(gallery)]
  }, [project])

  useEffect(() => {
    setActiveImage(0)
    setLightboxOpen(false)
  }, [projectId])

  const imageCount = Math.max(images.length, 1)
  const nextImage = () => setActiveImage((current) => (current + 1) % imageCount)
  const previousImage = () => setActiveImage((current) => (current - 1 + imageCount) % imageCount)

  useEffect(() => {
    if (!lightboxOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxOpen(false)
      if (event.key === 'ArrowLeft' && images.length > 1) nextImage()
      if (event.key === 'ArrowRight' && images.length > 1) previousImage()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [lightboxOpen, images.length])

  if (!project || project.active === false) {
    return (
      <main className="project-detail-page project-detail-empty" dir={direction}>
        <Sparkles size={38} />
        <h1>{t('projects.notFound')}</h1>
        <p>{t('projects.notFoundDescription')}</p>
        <Link to="/projects">{t('projects.backToProjects')} <ArrowLeft size={17} /></Link>
      </main>
    )
  }

  const title = l(project.title)
  const description = l(project.description)
  const categoryLabel = l(project.categoryLabel) || project.category || t('projects.project')
  const location = l(project.location)
  const status = l(project.status)
  const currentImage = images[activeImage] || project.image
  const openLightbox = (index = activeImage) => {
    setActiveImage(index)
    setLightboxOpen(true)
  }

  const facts = [
    { icon: MapPin, label: t('projects.location'), value: location || t('projects.notRegistered') },
    { icon: CalendarDays, label: t('projects.year'), value: project.year || t('projects.notRegistered') },
    { icon: UserRound, label: t('projects.client'), value: l(project.client) || t('projects.notRegistered') },
    { icon: Maximize2, label: t('projects.area'), value: l(project.area) || t('projects.notRegistered') },
  ]

  return (
    <main className="project-detail-page" dir={direction}>
      <div className="project-detail-orb project-detail-orb-one" />
      <div className="project-detail-orb project-detail-orb-two" />

      <section className="project-detail-hero">
        <div className="project-detail-container">
          <motion.div className="project-detail-topline" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/projects" className="project-detail-back"><ArrowRight size={17} /> {t('projects.backToProjects')}</Link>
            <span><Sparkles size={15} /> {t('projects.projectDetails')}</span>
          </motion.div>

          <div className="project-detail-hero-grid">
            <motion.div className="project-detail-copy" initial={{ opacity: 0, x: 35 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }}>
              <div className="project-detail-badges">
                <span>{categoryLabel}</span>
                <span className="status"><CheckCircle2 size={14} /> {status || t('projects.completed')}</span>
              </div>
              <h1>{title}</h1>
              <p>{description || t('projects.defaultDescription')}</p>

              <div className="project-detail-facts">
                {facts.map(({ icon: Icon, label, value }) => (
                  <motion.div key={label} whileHover={{ y: -4 }}>
                    <span><Icon size={18} /></span>
                    <div><small>{label}</small><strong>{value}</strong></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div className="project-detail-media" initial={{ opacity: 0, scale: 0.95, x: -30 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.08 }}>
              <div
                className="project-detail-gallery-main project-detail-clickable-image"
                role="button"
                tabIndex={0}
                onClick={() => openLightbox(activeImage)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openLightbox(activeImage)
                  }
                }}
                aria-label={t('projects.zoomImage')}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={currentImage}
                    alt={`${l(project.alt) || title} - ${activeImage + 1}`}
                    style={{ objectPosition: project.objectPosition || 'center' }}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35 }}
                  />
                </AnimatePresence>
                <div className="project-detail-image-shade" />
                <span className="project-detail-image-index">{String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
                <span className="project-detail-zoom-hint"><ZoomIn size={17} /> {t('projects.zoom')}</span>
                {images.length > 1 && (
                  <div className="project-detail-image-nav" onClick={(event) => event.stopPropagation()}>
                    <button type="button" onClick={previousImage} aria-label={t('projects.previousImage')}><ChevronRight size={20} /></button>
                    <button type="button" onClick={nextImage} aria-label={t('projects.nextImage')}><ChevronLeft size={20} /></button>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="project-detail-thumbnails project-detail-thumbnails-inline" aria-label={t('projects.gallery')}>
                  {images.map((image, index) => (
                    <motion.button
                      key={`${image.slice(0, 30)}-${index}`}
                      type="button"
                      className={activeImage === index ? 'active' : ''}
                      onClick={() => openLightbox(index)}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label={`${t('projects.showImage')} ${index + 1}`}
                    >
                      <img src={image} alt={`${title} - ${index + 1}`} />
                      <span>{String(index + 1).padStart(2, '0')}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="project-detail-content-section">
        <div className="project-detail-container project-detail-content-grid">
          <motion.div className="project-detail-story" initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}>
            <span className="project-detail-section-label"><Layers3 size={17} /> {t('projects.aboutProject')}</span>
            <h2>{t('projects.executionDetails')}</h2>
            <p>{description || t('projects.noDescription')}</p>
            <div className="project-detail-story-line" />
            <div className="project-detail-meta-row">
              <div><small>{t('projects.projectType')}</small><strong>{categoryLabel || '—'}</strong></div>
              <div><small>{t('projects.status')}</small><strong>{status || '—'}</strong></div>
              <div><small>{t('projects.yearShort')}</small><strong>{project.year || '—'}</strong></div>
            </div>
          </motion.div>

          <motion.aside className="project-detail-cta" initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Sparkles size={24} />
            <h3>{t('projects.similarProject')}</h3>
            <p>{t('projects.contactDescription')}</p>
            <Link to="/contact">{t('projects.contactUs')} <ArrowLeft size={17} /></Link>
          </motion.aside>
        </div>
      </section>

      <AnimatePresence>
        {lightboxOpen && currentImage && (
          <motion.div className="project-image-lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightboxOpen(false)}>
            <motion.div className="project-image-lightbox-dialog" initial={{ opacity: 0, scale: 0.94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }} onClick={(event) => event.stopPropagation()}>
              <button type="button" className="project-image-lightbox-close" onClick={() => setLightboxOpen(false)} aria-label={t('projects.closeImage')}><X size={22} /></button>
              <div className="project-image-lightbox-stage">
                <AnimatePresence mode="wait">
                  <motion.img key={`lightbox-${currentImage}`} src={currentImage} alt={`${title} - ${activeImage + 1}`} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 0.25 }} />
                </AnimatePresence>
                {images.length > 1 && (
                  <>
                    <button type="button" className="project-image-lightbox-arrow is-previous" onClick={previousImage} aria-label={t('projects.previousImage')}><ChevronRight size={28} /></button>
                    <button type="button" className="project-image-lightbox-arrow is-next" onClick={nextImage} aria-label={t('projects.nextImage')}><ChevronLeft size={28} /></button>
                  </>
                )}
              </div>
              <div className="project-image-lightbox-footer"><strong>{title}</strong><span>{String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default ProjectDetails
