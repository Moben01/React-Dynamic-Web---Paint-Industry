import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Layers3,
  PackageCheck,
  Palette,
  Sparkles,
  X,
  ZoomIn,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  loadProductsData,
  PRODUCTS_CHANGED_EVENT,
} from '../data/productsStore'
import './ProductDetails.css'

function ProductDetails() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [pageData, setPageData] = useState(loadProductsData)
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    const refresh = () => setPageData(loadProductsData())
    window.addEventListener(PRODUCTS_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener(PRODUCTS_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  const product = useMemo(
    () =>
      (pageData.products || []).find(
        (item) => String(item.id) === decodeURIComponent(String(productId || '')),
      ),
    [pageData.products, productId],
  )

  const images = useMemo(() => {
    if (!product) return []
    const gallery = Array.isArray(product.images)
      ? product.images.filter(Boolean)
      : []
    if (!gallery.length && product.image) gallery.push(product.image)
    return [...new Set(gallery)]
  }, [product])

  useEffect(() => {
    setActiveImage(0)
    setLightboxOpen(false)
  }, [productId])

  const imageCount = Math.max(images.length, 1)
  const nextImage = () =>
    setActiveImage((current) => (current + 1) % imageCount)
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

  if (!product || product.active === false) {
    return (
      <main className="product-detail-not-found">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span><Sparkles size={20} /></span>
          <h1>محصول پیدا نشد</h1>
          <p>ممکن است این محصول حذف یا غیرفعال شده باشد.</p>
          <Link to="/products">بازگشت به محصولات <ArrowLeft size={17} /></Link>
        </motion.div>
      </main>
    )
  }

  const currentImage = images[activeImage] || product.image

  const openLightbox = (index = activeImage) => {
    setActiveImage(index)
    setLightboxOpen(true)
  }

  return (
    <main className="product-detail-page" dir="rtl">
      <div className="product-detail-orb product-detail-orb-one" />
      <div className="product-detail-orb product-detail-orb-two" />

      <div className="product-detail-container">
        <motion.button
          type="button"
          className="product-detail-back"
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: 4 }}
        >
          <ArrowRight size={18} />
          بازگشت
        </motion.button>

        <section className="product-detail-hero">
          <motion.div
            className="product-detail-gallery"
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="product-detail-main-image product-detail-clickable-image"
              role="button"
              tabIndex={0}
              onClick={() => openLightbox(activeImage)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openLightbox(activeImage)
                }
              }}
              aria-label="بزرگ‌نمایی عکس محصول"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  src={currentImage}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.38 }}
                />
              </AnimatePresence>

              <div className="product-detail-image-shade" />
              <span className="product-detail-category-pill">
                {product.categoryLabel}
              </span>
              <span className="product-detail-zoom-hint"><ZoomIn size={17} /> بزرگ‌نمایی</span>

              {images.length > 1 && (
                <div className="product-detail-gallery-nav" onClick={(event) => event.stopPropagation()}>
                  <button type="button" onClick={previousImage} aria-label="عکس قبلی">
                    <ChevronRight size={20} />
                  </button>
                  <span>{String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
                  <button type="button" onClick={nextImage} aria-label="عکس بعدی">
                    <ChevronLeft size={20} />
                  </button>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="product-detail-thumbnails" aria-label="گالری تصاویر محصول">
                {images.map((image, index) => (
                  <motion.button
                    type="button"
                    key={`${image.slice(0, 35)}-${index}`}
                    className={index === activeImage ? 'is-active' : ''}
                    onClick={() => openLightbox(index)}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.96 }}
                    aria-label={`نمایش عکس ${index + 1}`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
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
              <Sparkles size={17} />
              معلومات مکمل محصول
            </div>

            <h1>{product.name}</h1>
            <p className="product-detail-description">{product.description}</p>

            <div className="product-detail-spec-grid">
              <motion.article whileHover={{ y: -4 }}>
                <span><Layers3 size={19} /></span>
                <small>نوع پوشش</small>
                <strong>{product.finish || 'ثبت نشده'}</strong>
              </motion.article>

              <motion.article whileHover={{ y: -4 }}>
                <span><Droplets size={19} /></span>
                <small>پوشش‌دهی</small>
                <strong>{product.coverage || 'ثبت نشده'}</strong>
              </motion.article>

              <motion.article whileHover={{ y: -4 }}>
                <span><PackageCheck size={19} /></span>
                <small>اندازه‌های موجود</small>
                <strong>{product.sizes?.length || 0} انتخاب</strong>
              </motion.article>
            </div>

            <div className="product-detail-block">
              <div className="product-detail-block-title">
                <Palette size={18} />
                <strong>رنگ‌های پیشنهادی</strong>
              </div>
              <div className="product-detail-colors">
                {(product.colors || []).map((color) => (
                  <motion.span
                    key={color}
                    style={{ backgroundColor: color }}
                    title={color}
                    whileHover={{ scale: 1.18, y: -3 }}
                  />
                ))}
              </div>
            </div>

            <div className="product-detail-block">
              <div className="product-detail-block-title">
                <PackageCheck size={18} />
                <strong>اندازه‌های محصول</strong>
              </div>
              <div className="product-detail-sizes">
                {(product.sizes || []).map((size) => (
                  <span key={size}><Check size={14} /> {size}</span>
                ))}
              </div>
            </div>

            <div className="product-detail-actions">
              <Link to="/contact" className="product-detail-primary-action">
                تماس برای معلومات بیشتر
                <ArrowLeft size={18} />
              </Link>
              <Link to="/products" className="product-detail-secondary-action">
                مشاهده محصولات دیگر
              </Link>
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
            <span>ALIMI PAINT</span>
            <h2>کیفیت در هر لایه، زیبایی در هر فضا</h2>
          </div>
          <p>{product.description}</p>
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
                aria-label="بستن تصویر"
              >
                <X size={22} />
              </button>

              <div className="product-image-lightbox-stage">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`lightbox-${currentImage}`}
                    src={currentImage}
                    alt={`${product.name} - ${activeImage + 1}`}
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
                      aria-label="عکس قبلی"
                    >
                      <ChevronRight size={28} />
                    </button>
                    <button
                      type="button"
                      className="product-image-lightbox-arrow is-next"
                      onClick={nextImage}
                      aria-label="عکس بعدی"
                    >
                      <ChevronLeft size={28} />
                    </button>
                  </>
                )}
              </div>

              <div className="product-image-lightbox-footer">
                <strong>{product.name}</strong>
                <span>{String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default ProductDetails
