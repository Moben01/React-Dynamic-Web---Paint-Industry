import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  X,
  ZoomIn,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AGENCIES_CHANGED_EVENT,
  loadAgenciesData,
} from '../data/agenciesStore'
import { localizedText } from '../i18n/localizedContent'
import { useLanguage } from '../i18n/LanguageContext'
import './ProductDetails.css'
import './Agencies.css'

const cleanPhoneNumber = (value) => String(value || '').replace(/[^\d+]/g, '')

function AgencyDetails() {
  const { agencyId } = useParams()
  const navigate = useNavigate()
  const { language, direction } = useLanguage()
  const [pageData, setPageData] = useState(loadAgenciesData)
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
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

  const agency = useMemo(
    () => (pageData.agencies || []).find(
      (item) => String(item.id) === decodeURIComponent(String(agencyId || '')),
    ),
    [agencyId, pageData.agencies],
  )

  const images = useMemo(() => {
    if (!agency) return []
    const gallery = Array.isArray(agency.images)
      ? agency.images.filter(Boolean)
      : []
    if (!gallery.length && agency.image) gallery.push(agency.image)
    return [...new Set(gallery)]
  }, [agency])

  useEffect(() => {
    setActiveImage(0)
    setLightboxOpen(false)
  }, [agencyId])

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

  if (!agency || agency.active === false) {
    return (
      <main className="product-detail-not-found" dir={direction}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span><Sparkles size={20} /></span>
          <h1>{language === 'en' ? 'Agency not found' : 'نمایندگی پیدا نشد'}</h1>
          <p>{language === 'en' ? 'This agency may be disabled or removed.' : 'این نمایندگی حذف یا غیرفعال شده است.'}</p>
          <Link to="/agencies">
            {language === 'en' ? 'Back to agencies' : 'بازگشت به نمایندگی‌ها'}
            {direction === 'rtl' ? <ArrowLeft size={17} /> : <ArrowRight size={17} />}
          </Link>
        </motion.div>
      </main>
    )
  }

  const title = l(agency.name)
  const summary = l(agency.summary)
  const description = l(agency.description) || summary
  const city = l(agency.city)
  const manager = l(agency.manager)
  const address = l(agency.address)
  const hours = l(agency.hours)
  const currentImage = images[activeImage] || agency.image

  const openLightbox = (index = activeImage) => {
    setActiveImage(index)
    setLightboxOpen(true)
  }

  return (
    <main className="product-detail-page agency-product-detail" dir={direction}>
      <div className="product-detail-orb product-detail-orb-one" />
      <div className="product-detail-orb product-detail-orb-two" />

      <div className="product-detail-container">
        <motion.button
          type="button"
          className="product-detail-back"
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: direction === 'rtl' ? 16 : -16 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: direction === 'rtl' ? 4 : -4 }}
        >
          {direction === 'rtl' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          {language === 'en' ? 'Back' : 'بازگشت'}
        </motion.button>

        <section className="product-detail-hero">
          <motion.div
            className="product-detail-gallery"
            initial={{ opacity: 0, x: direction === 'rtl' ? 35 : -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="product-detail-main-image product-detail-clickable-image"
              role="button"
              tabIndex={0}
              onClick={() => currentImage && openLightbox(activeImage)}
              onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && currentImage) {
                  event.preventDefault()
                  openLightbox(activeImage)
                }
              }}
            >
              {currentImage && (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={currentImage}
                    alt={title}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.38 }}
                  />
                </AnimatePresence>
              )}

              <div className="product-detail-image-shade" />
              <span className="product-detail-category-pill">{city || 'نمایندگی'}</span>
              {currentImage && (
                <span className="product-detail-zoom-hint">
                  <ZoomIn size={17} /> {language === 'en' ? 'Zoom' : 'بزرگ‌نمایی'}
                </span>
              )}

              {images.length > 1 && (
                <div className="product-detail-gallery-nav" onClick={(event) => event.stopPropagation()}>
                  <button type="button" onClick={previousImage}>
                    <ChevronRight size={20} />
                  </button>
                  <span>{String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
                  <button type="button" onClick={nextImage}>
                    <ChevronLeft size={20} />
                  </button>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="product-detail-thumbnails">
                {images.map((image, index) => (
                  <motion.button
                    type="button"
                    key={`${image.slice(0, 35)}-${index}`}
                    className={index === activeImage ? 'is-active' : ''}
                    onClick={() => openLightbox(index)}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <img src={image} alt={`${title} ${index + 1}`} />
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            className="product-detail-copy"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.08 }}
          >
            <div className="product-detail-kicker">
              <Store size={17} />
              {language === 'en' ? 'Full agency information' : 'معلومات مکمل نمایندگی'}
            </div>

            <h1>{title}</h1>
            <p className="product-detail-description">{description}</p>

            <div className="product-detail-spec-grid">
              <motion.article whileHover={{ y: -4 }}>
                <span><MapPin size={19} /></span>
                <small>{language === 'en' ? 'City' : 'شهر'}</small>
                <strong>{city || '-'}</strong>
              </motion.article>

              <motion.article whileHover={{ y: -4 }}>
                <span><UserRound size={19} /></span>
                <small>{language === 'en' ? 'Manager' : 'مسئول نمایندگی'}</small>
                <strong>{manager || '-'}</strong>
              </motion.article>

              <motion.article whileHover={{ y: -4 }}>
                <span><Clock3 size={19} /></span>
                <small>{language === 'en' ? 'Working hours' : 'ساعات کاری'}</small>
                <strong>{hours || '-'}</strong>
              </motion.article>
            </div>

            <div className="product-detail-block">
              <div className="product-detail-block-title">
                <Building2 size={18} />
                <strong>{language === 'en' ? 'Address' : 'آدرس نمایندگی'}</strong>
              </div>
              <p className="agency-detail-product-text">{address || '-'}</p>
            </div>

            <div className="product-detail-block">
              <div className="product-detail-block-title">
                <ShieldCheck size={18} />
                <strong>{language === 'en' ? 'Services' : 'خدمات نمایندگی'}</strong>
              </div>
              <div className="product-detail-sizes">
                {(agency.services || []).length ? (
                  agency.services.map((service, index) => (
                    <span key={`${index}-${l(service)}`}><Check size={14} /> {l(service)}</span>
                  ))
                ) : (
                  <span><Check size={14} /> {language === 'en' ? 'Sales and customer support' : 'فروش و پشتیبانی مشتریان'}</span>
                )}
              </div>
            </div>

            <div className="product-detail-actions">
              {agency.phone && (
                <a
                  href={`tel:${cleanPhoneNumber(agency.phone)}`}
                  className="product-detail-primary-action"
                >
                  <Phone size={18} />
                  {agency.phone}
                </a>
              )}
              {agency.email && (
                <a
                  href={`mailto:${agency.email}`}
                  className="product-detail-system-action"
                >
                  <Mail size={18} />
                  {agency.email}
                  <Send size={16} />
                </a>
              )}
              {agency.mapUrl && (
                <a
                  href={agency.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="product-detail-secondary-action"
                >
                  <MapPin size={18} />
                  {language === 'en' ? 'Open map' : 'بازکردن نقشه'}
                </a>
              )}
            </div>
          </motion.div>
        </section>

        <motion.section
          className="product-detail-bottom-note"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55 }}
        >
          <div>
            <span>ALIMI AGENCY</span>
            <h2>{summary || title}</h2>
          </div>
          <p>{description}</p>
        </motion.section>
      </div>

      <AnimatePresence>
        {lightboxOpen && currentImage && (
          <motion.div
            className="product-image-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              className="product-image-lightbox-dialog"
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="product-image-lightbox-close"
                onClick={() => setLightboxOpen(false)}
              >
                <X size={22} />
              </button>

              <div className="product-image-lightbox-stage">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`agency-lightbox-${currentImage}`}
                    src={currentImage}
                    alt={`${title} - ${activeImage + 1}`}
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
                      className="product-image-lightbox-arrow is-previous"
                      onClick={previousImage}
                    >
                      <ChevronRight size={28} />
                    </button>
                    <button
                      type="button"
                      className="product-image-lightbox-arrow is-next"
                      onClick={nextImage}
                    >
                      <ChevronLeft size={28} />
                    </button>
                  </>
                )}
              </div>

              <div className="product-image-lightbox-footer">
                <strong>{title}</strong>
                <span>{String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default AgencyDetails
