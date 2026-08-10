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
  MessageCircle,
  Send,
  Sparkles,
  PhoneCall,
  X,
  ZoomIn,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  loadProductsData,
  PRODUCTS_CHANGED_EVENT,
} from '../data/productsStore'
import { localizedArray, localizedText } from '../i18n/localizedContent'
import { useLanguage } from '../i18n/LanguageContext'
import { loadContactData } from '../data/contactStore'
import './ProductDetails.css'

const cleanPhoneNumber = (value) => String(value || '').replace(/[^\d]/g, '')

function ProductDetails() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { language, direction, t } = useLanguage()
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

  const category = useMemo(
    () =>
      pageData.categories.find(
        (item) => String(item.id) === String(product?.category),
      ),
    [pageData.categories, product?.category],
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

  if (!product || product.active === false) {
    return (
      <main className="product-detail-not-found" dir={direction}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span><Sparkles size={20} /></span>
          <h1>{t('products.notFound', 'Ù…Ø­ØµÙˆÙ„ Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯')}</h1>
          <p>{t('products.notFoundDescription', 'Ù…Ù…Ú©Ù† Ø§Ø³Øª Ø§ÛŒÙ† Ù…Ø­ØµÙˆÙ„ Ø­Ø°Ù ÛŒØ§ ØºÛŒØ±ÙØ¹Ø§Ù„ Ø´Ø¯Ù‡ Ø¨Ø§Ø´Ø¯.')}</p>
          <Link to="/products">
            {t('products.backToProducts', 'Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ù‡ Ù…Ø­ØµÙˆÙ„Ø§Øª')}
            {direction === 'rtl' ? <ArrowLeft size={17} /> : <ArrowRight size={17} />}
          </Link>
        </motion.div>
      </main>
    )
  }

  const productName = localizedText(product.name, language)
  const productDescription = localizedText(product.description, language)
  const categoryName = localizedText(category?.label || product.categoryLabel, language)
  const finish = localizedText(product.finish, language)
  const coverage = localizedText(product.coverage, language)
  const sizes = localizedArray(product.sizes, language)
  const currentImage = images[activeImage] || product.image
  const whatsappPhone = (() => {
    const phones = loadContactData().phones || []
    return (
      phones.find((phone) => phone.active !== false && phone.whatsapp && phone.number) ||
      phones.find((phone) => phone.active !== false && phone.number)
    )
  })()
  const productUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/products/${encodeURIComponent(product.id)}`
      : `/products/${encodeURIComponent(product.id)}`
  const productInquiryText = [
    'درخواست معلومات محصول',
    `نام محصول: ${productName}`,
    `آیدی محصول: ${product.id}`,
    `لینک محصول: ${productUrl}`,
    currentImage ? `عکس محصول: ${currentImage}` : '',
  ].filter(Boolean).join('\n')
  const whatsappHref = whatsappPhone?.number
    ? `https://wa.me/${cleanPhoneNumber(whatsappPhone.number)}?text=${encodeURIComponent(productInquiryText)}`
    : ''

  const openLightbox = (index = activeImage) => {
    setActiveImage(index)
    setLightboxOpen(true)
  }

  const contactThroughAssistant = () => {
    window.dispatchEvent(new CustomEvent('alimi-assistant-product-request', {
      detail: {
        productId: String(product.id),
        productName,
        productImage: currentImage,
        productUrl,
        text: productInquiryText,
      },
    }))
  }

  return (
    <main className="product-detail-page" dir={direction}>
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
          {t('products.back', 'Ø¨Ø§Ø²Ú¯Ø´Øª')}
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
              onClick={() => openLightbox(activeImage)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openLightbox(activeImage)
                }
              }}
              aria-label={t('products.zoomImage', 'Ø¨Ø²Ø±Ú¯â€ŒÙ†Ù…Ø§ÛŒÛŒ Ø¹Ú©Ø³ Ù…Ø­ØµÙˆÙ„')}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  src={currentImage}
                  alt={productName}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.38 }}
                />
              </AnimatePresence>

              <div className="product-detail-image-shade" />
              <span className="product-detail-category-pill">{categoryName}</span>
              <span className="product-detail-zoom-hint">
                <ZoomIn size={17} /> {t('products.zoom', 'Ø¨Ø²Ø±Ú¯â€ŒÙ†Ù…Ø§ÛŒÛŒ')}
              </span>

              {images.length > 1 && (
                <div className="product-detail-gallery-nav" onClick={(event) => event.stopPropagation()}>
                  <button type="button" onClick={previousImage} aria-label={t('products.previousImage', 'Ø¹Ú©Ø³ Ù‚Ø¨Ù„ÛŒ')}>
                    <ChevronRight size={20} />
                  </button>
                  <span>{String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
                  <button type="button" onClick={nextImage} aria-label={t('products.nextImage', 'Ø¹Ú©Ø³ Ø¨Ø¹Ø¯ÛŒ')}>
                    <ChevronLeft size={20} />
                  </button>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="product-detail-thumbnails" aria-label={t('products.gallery', 'Ú¯Ø§Ù„Ø±ÛŒ ØªØµØ§ÙˆÛŒØ± Ù…Ø­ØµÙˆÙ„')}>
                {images.map((image, index) => (
                  <motion.button
                    type="button"
                    key={`${image.slice(0, 35)}-${index}`}
                    className={index === activeImage ? 'is-active' : ''}
                    onClick={() => openLightbox(index)}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <img src={image} alt={`${productName} ${index + 1}`} />
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
              {t('products.fullInfo', 'Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ù…Ú©Ù…Ù„ Ù…Ø­ØµÙˆÙ„')}
            </div>

            <h1>{productName}</h1>
            <p className="product-detail-description">{productDescription}</p>

            <div className="product-detail-spec-grid">
              <motion.article whileHover={{ y: -4 }}>
                <span><Layers3 size={19} /></span>
                <small>{t('products.finish', 'Ù†ÙˆØ¹ Ù¾ÙˆØ´Ø´')}</small>
                <strong>{finish || t('products.notRegistered', 'Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡')}</strong>
              </motion.article>

              <motion.article whileHover={{ y: -4 }}>
                <span><Droplets size={19} /></span>
                <small>{t('products.coverage', 'Ù¾ÙˆØ´Ø´â€ŒØ¯Ù‡ÛŒ')}</small>
                <strong>{coverage || t('products.notRegistered', 'Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡')}</strong>
              </motion.article>

              <motion.article whileHover={{ y: -4 }}>
                <span><PackageCheck size={19} /></span>
                <small>{t('products.availableSizes', 'Ø§Ù†Ø¯Ø§Ø²Ù‡â€ŒÙ‡Ø§ÛŒ Ù…ÙˆØ¬ÙˆØ¯')}</small>
                <strong>{sizes.length} {t('products.options', 'Ø§Ù†ØªØ®Ø§Ø¨')}</strong>
              </motion.article>
            </div>

            <div className="product-detail-block">
              <div className="product-detail-block-title">
                <Palette size={18} />
                <strong>{t('products.suggestedColors', 'Ø±Ù†Ú¯â€ŒÙ‡Ø§ÛŒ Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ÛŒ')}</strong>
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
                <strong>{t('products.productSizes', 'Ø§Ù†Ø¯Ø§Ø²Ù‡â€ŒÙ‡Ø§ÛŒ Ù…Ø­ØµÙˆÙ„')}</strong>
              </div>
              <div className="product-detail-sizes">
                {sizes.map((size, index) => (
                  <span key={`${index}-${size}`}><Check size={14} /> {size}</span>
                ))}
              </div>
            </div>

            <div className="product-detail-actions">
              <a
                href={whatsappHref || undefined}
                target="_blank"
                rel="noreferrer"
                className={`product-detail-primary-action ${!whatsappHref ? 'is-disabled' : ''}`}
                onClick={(event) => {
                  if (!whatsappHref) event.preventDefault()
                }}
              >
                <PhoneCall size={18} />
                ارتباط با واتساپ
              </a>
              <button
                type="button"
                className="product-detail-system-action"
                onClick={contactThroughAssistant}
              >
                <MessageCircle size={18} />
                ارتباط با سیستم
                <Send size={16} />
              </button>
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
            <h2>{t('products.qualityHeadline', 'Ú©ÛŒÙÛŒØª Ø¯Ø± Ù‡Ø± Ù„Ø§ÛŒÙ‡ØŒ Ø²ÛŒØ¨Ø§ÛŒÛŒ Ø¯Ø± Ù‡Ø± ÙØ¶Ø§')}</h2>
          </div>
          <p>{productDescription}</p>
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
                aria-label={t('products.closeImage', 'Ø¨Ø³ØªÙ† ØªØµÙˆÛŒØ±')}
              >
                <X size={22} />
              </button>

              <div className="product-image-lightbox-stage">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`lightbox-${currentImage}`}
                    src={currentImage}
                    alt={`${productName} - ${activeImage + 1}`}
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
                      aria-label={t('products.previousImage', 'Ø¹Ú©Ø³ Ù‚Ø¨Ù„ÛŒ')}
                    >
                      <ChevronRight size={28} />
                    </button>
                    <button
                      type="button"
                      className="product-image-lightbox-arrow is-next"
                      onClick={nextImage}
                      aria-label={t('products.nextImage', 'Ø¹Ú©Ø³ Ø¨Ø¹Ø¯ÛŒ')}
                    >
                      <ChevronLeft size={28} />
                    </button>
                  </>
                )}
              </div>

              <div className="product-image-lightbox-footer">
                <strong>{productName}</strong>
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
