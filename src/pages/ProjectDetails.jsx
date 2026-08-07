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
import './ProjectDetails.css'

function ProjectDetails() {
  const { projectId } = useParams()
  const [pageData, setPageData] = useState(loadProjectsData)
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

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
    () =>
      (pageData.projects || []).find(
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
  const previousImage = () =>
    setActiveImage((current) => (current - 1 + imageCount) % imageCount)

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
      <main className="project-detail-page project-detail-empty">
        <Sparkles size={38} />
        <h1>پروژه پیدا نشد</h1>
        <p>این پروژه حذف شده یا در حال حاضر غیرفعال است.</p>
        <Link to="/projects">بازگشت به پروژه‌ها <ArrowLeft size={17} /></Link>
      </main>
    )
  }

  const currentImage = images[activeImage] || project.image
  const openLightbox = (index = activeImage) => {
    setActiveImage(index)
    setLightboxOpen(true)
  }

  const facts = [
    { icon: MapPin, label: 'موقعیت', value: project.location || 'ثبت نشده' },
    { icon: CalendarDays, label: 'سال اجرا', value: project.year || 'ثبت نشده' },
    { icon: UserRound, label: 'مشتری', value: project.client || 'ثبت نشده' },
    { icon: Maximize2, label: 'مساحت', value: project.area || 'ثبت نشده' },
  ]

  return (
    <main className="project-detail-page" dir="rtl">
      <div className="project-detail-orb project-detail-orb-one" />
      <div className="project-detail-orb project-detail-orb-two" />

      <section className="project-detail-hero">
        <div className="project-detail-container">
          <motion.div
            className="project-detail-topline"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to="/projects" className="project-detail-back">
              <ArrowRight size={17} /> بازگشت به پروژه‌ها
            </Link>
            <span><Sparkles size={15} /> جزئیات پروژه</span>
          </motion.div>

          <div className="project-detail-hero-grid">
            <motion.div
              className="project-detail-copy"
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
            >
              <div className="project-detail-badges">
                <span>{project.categoryLabel || project.category || 'پروژه'}</span>
                <span className="status"><CheckCircle2 size={14} /> {project.status || 'تکمیل‌شده'}</span>
              </div>
              <h1>{project.title}</h1>
              <p>{project.description || 'جزئیات این پروژه توسط تیم شرکت رنگ‌سازی علیمی ثبت شده است.'}</p>

              <div className="project-detail-facts">
                {facts.map(({ icon: Icon, label, value }) => (
                  <motion.div key={label} whileHover={{ y: -4 }}>
                    <span><Icon size={18} /></span>
                    <div><small>{label}</small><strong>{value}</strong></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="project-detail-media"
              initial={{ opacity: 0, scale: 0.95, x: -30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.08 }}
            >
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
                aria-label="بزرگ‌نمایی عکس پروژه"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={currentImage}
                    alt={`${project.alt || project.title} - ${activeImage + 1}`}
                    style={{ objectPosition: project.objectPosition || 'center' }}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35 }}
                  />
                </AnimatePresence>
                <div className="project-detail-image-shade" />
                <span className="project-detail-image-index">{String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
                <span className="project-detail-zoom-hint"><ZoomIn size={17} /> بزرگ‌نمایی</span>
                {images.length > 1 && (
                  <div className="project-detail-image-nav" onClick={(event) => event.stopPropagation()}>
                    <button type="button" onClick={previousImage} aria-label="عکس قبلی"><ChevronRight size={20} /></button>
                    <button type="button" onClick={nextImage} aria-label="عکس بعدی"><ChevronLeft size={20} /></button>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="project-detail-thumbnails project-detail-thumbnails-inline" aria-label="گالری تصاویر پروژه">
                  {images.map((image, index) => (
                    <motion.button
                      key={`${image.slice(0, 30)}-${index}`}
                      type="button"
                      className={activeImage === index ? 'active' : ''}
                      onClick={() => openLightbox(index)}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label={`نمایش عکس ${index + 1}`}
                    >
                      <img src={image} alt={`نمای ${index + 1} پروژه ${project.title}`} />
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
          <motion.div
            className="project-detail-story"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <span className="project-detail-section-label"><Layers3 size={17} /> درباره این پروژه</span>
            <h2>جزئیات اجرای پروژه</h2>
            <p>{project.description || 'توضیحات کامل پروژه هنوز ثبت نشده است.'}</p>
            <div className="project-detail-story-line" />
            <div className="project-detail-meta-row">
              <div><small>نوع پروژه</small><strong>{project.categoryLabel || '—'}</strong></div>
              <div><small>وضعیت</small><strong>{project.status || '—'}</strong></div>
              <div><small>سال</small><strong>{project.year || '—'}</strong></div>
            </div>
          </motion.div>

          <motion.aside
            className="project-detail-cta"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles size={24} />
            <h3>پروژه مشابه در نظر دارید؟</h3>
            <p>برای مشوره در مورد رنگ، نوع پوشش و اجرای پروژه با تیم علیمی تماس بگیرید.</p>
            <Link to="/contact">تماس با ما <ArrowLeft size={17} /></Link>
          </motion.aside>
        </div>
      </section>

      <AnimatePresence>
        {lightboxOpen && currentImage && (
          <motion.div
            className="project-image-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              className="project-image-lightbox-dialog"
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="project-image-lightbox-close"
                onClick={() => setLightboxOpen(false)}
                aria-label="بستن تصویر"
              >
                <X size={22} />
              </button>

              <div className="project-image-lightbox-stage">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`lightbox-${currentImage}`}
                    src={currentImage}
                    alt={`${project.title} - ${activeImage + 1}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.25 }}
                  />
                </AnimatePresence>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="project-image-lightbox-arrow is-previous"
                      onClick={previousImage}
                      aria-label="عکس قبلی"
                    >
                      <ChevronRight size={28} />
                    </button>
                    <button
                      type="button"
                      className="project-image-lightbox-arrow is-next"
                      onClick={nextImage}
                      aria-label="عکس بعدی"
                    >
                      <ChevronLeft size={28} />
                    </button>
                  </>
                )}
              </div>

              <div className="project-image-lightbox-footer">
                <strong>{project.title}</strong>
                <span>{String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default ProjectDetails
