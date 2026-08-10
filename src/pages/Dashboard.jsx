import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getActiveSlides,
  getHeroContent,
  HERO_UPDATED_EVENT,
  UPDATED_EVENT,
} from '../data/dashboardSlides'
import {
  loadProductsData,
  PRODUCTS_CHANGED_EVENT,
} from '../data/productsStore'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronLeft,
  Droplets,
  ExternalLink,
  Factory,
  Home,
  Layers3,
  Menu,
  Moon,
  PaintRoller,
  Palette,
  Phone,
  ShieldCheck,
  Sparkle,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'
import { localizedText } from '../i18n/localizedContent'
import './Dashboard.css'
import ProjectArchive from './ProjectArchive'

const themes = [
  {
    id: 'alimi',
    label: 'سفید و نارنجی',
    swatches: ['#ffffff', '#ff6b1a', '#1c1c1c'],
  },
  {
    id: 'midnight',
    label: 'شب مدرن',
    swatches: ['#111318', '#ff7a25', '#f7f7f7'],
  },
  {
    id: 'sand',
    label: 'گرم و لوکس',
    swatches: ['#fbf4e8', '#d65d24', '#34241b'],
  },
  {
    id: 'ocean',
    label: 'آرام و حرفه‌ای',
    swatches: ['#f7fbff', '#ff6b1a', '#15364a'],
  },
]



const projectCardVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction === 1 ? 110 : -110,
    scale: 0.88,
    rotateY: direction === 1 ? -12 : 12,
    filter: 'blur(8px)',
  }),

  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    rotateY: 0,
    filter: 'blur(0px)',
  },

  exit: (direction) => ({
    opacity: 0,
    x: direction === 1 ? -110 : 110,
    scale: 0.9,
    rotateY: direction === 1 ? 12 : -12,
    filter: 'blur(8px)',
  }),
}

const sideCardVariants = {
  initial: {
    opacity: 0,
    scale: 0.82,
    filter: 'blur(10px)',
  },

  animate: {
    opacity: 0.5,
    scale: 0.9,
    filter: 'blur(3.5px)',
  },

  exit: {
    opacity: 0,
    scale: 0.82,
    filter: 'blur(10px)',
  },
}

function Dashboard() {
  const { language, direction, t } = useLanguage()
  const [wordIndex, setWordIndex] = useState(0)
  const [activeSlide, setActiveSlide] = useState(0)
  const [heroContent, setHeroContent] = useState(
    () => getHeroContent(),
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)



  const [theme, setTheme] = useState(
    () => localStorage.getItem('alimi-theme') || 'alimi',
  )

  const [activeCategory, setActiveCategory] = useState(0)
  const [productsData, setProductsData] = useState(loadProductsData)

  const productCategories = useMemo(() => {
    const activeProducts = productsData.products.filter(
      (product) => product.active !== false,
    )

    return productsData.categories
      .filter((category) => category.active !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((category) => ({
        id: category.id,
        title: localizedText(category.label, language),
        subtitle: localizedText(category.description, language),
        image: category.image || '',
        count: `${activeProducts.filter(
          (product) => String(product.category) === String(category.id),
        ).length} ${t('dashboard.productCount', 'محصول')}`, 
      }))
  }, [language, productsData, t])

  const sliderRef = useRef(null)

  const currentTheme = useMemo(
    () => themes.find((item) => item.id === theme) || themes[0],
    [theme],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('alimi-theme', theme)
  }, [theme])

  useEffect(() => {
    const refreshProducts = () => setProductsData(loadProductsData())

    window.addEventListener(PRODUCTS_CHANGED_EVENT, refreshProducts)
    window.addEventListener('storage', refreshProducts)
    window.addEventListener('focus', refreshProducts)

    return () => {
      window.removeEventListener(PRODUCTS_CHANGED_EVENT, refreshProducts)
      window.removeEventListener('storage', refreshProducts)
      window.removeEventListener('focus', refreshProducts)
    }
  }, [])

  useEffect(() => {
    if (productCategories.length === 0) {
      setActiveCategory(0)
      return
    }

    if (activeCategory >= productCategories.length) {
      setActiveCategory(0)
    }
  }, [activeCategory, productCategories.length])

  const rotatingWordsText = localizedText(heroContent.rotatingWords, language)
  const rotatingWords = rotatingWordsText
    .split('\n')
    .map((word) => word.trim())
    .filter(Boolean)

  if (!rotatingWords.length) {
    rotatingWords.push(t('dashboard.qualityFallback', 'کیفیت'))
  }

  useEffect(() => {
    if (rotatingWords.length <= 1) {
      return undefined
    }

    const wordTimer = window.setInterval(() => {
      setWordIndex(
        (current) =>
          (current + 1) % rotatingWords.length,
      )
    }, 2200)

    return () =>
      window.clearInterval(wordTimer)
  }, [rotatingWords.length])

  const [collectionImages, setCollectionImages] = useState(
    () => getActiveSlides(),
  )

  useEffect(() => {
    const refreshDashboardSlides = () => {
      const updatedSlides = getActiveSlides()

      setCollectionImages(updatedSlides)

      setActiveSlide((current) =>
        current >= updatedSlides.length ? 0 : current,
      )
    }

    window.addEventListener(
      UPDATED_EVENT,
      refreshDashboardSlides,
    )

    window.addEventListener(
      'storage',
      refreshDashboardSlides,
    )

    return () => {
      window.removeEventListener(
        UPDATED_EVENT,
        refreshDashboardSlides,
      )

      window.removeEventListener(
        'storage',
        refreshDashboardSlides,
      )
    }
  }, [])

  useEffect(() => {
    const refreshHeroContent = () => {
      setHeroContent(getHeroContent())
      setWordIndex(0)
    }

    window.addEventListener(
      HERO_UPDATED_EVENT,
      refreshHeroContent,
    )

    window.addEventListener(
      'storage',
      refreshHeroContent,
    )

    return () => {
      window.removeEventListener(
        HERO_UPDATED_EVENT,
        refreshHeroContent,
      )

      window.removeEventListener(
        'storage',
        refreshHeroContent,
      )
    }
  }, [])



  const scrollToSlide = (index) => {
    const slider = sliderRef.current

    if (
      !slider ||
      collectionImages.length === 0
    ) {
      return
    }

    const slides = slider.querySelectorAll(
      '.collection-slide',
    )

    const targetSlide = slides[index]

    if (!targetSlide) {
      return
    }

    targetSlide.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    })

    setActiveSlide(index)
  }

  const nextSlide = () => {
    const nextIndex =
      (activeSlide + 1) % collectionImages.length

    scrollToSlide(nextIndex)
  }

  const previousSlide = () => {
    const previousIndex =
      activeSlide === 0
        ? collectionImages.length - 1
        : activeSlide - 1

    scrollToSlide(previousIndex)
  }

  const handleSliderScroll = () => {
    const slider = sliderRef.current

    if (!slider || slider.clientWidth === 0) {
      return
    }

    const index = Math.round(
      Math.abs(slider.scrollLeft) / slider.clientWidth,
    )

    if (index >= 0 && index < collectionImages.length) {
      setActiveSlide(index)
    }
  }

  const closeMobileMenu = () => {
    setMenuOpen(false)
  }

  const selectTheme = (themeId) => {
    setTheme(themeId)
    setThemeOpen(false)
  }

  return (
    <div className="dashboard-shell" dir={direction}>


      <main className="dashboard-page">
        <section className="dashboard-hero" id="home">
          <div className="dashboard-paint-blob dashboard-blob-one" />
          <div className="dashboard-paint-blob dashboard-blob-two" />
          <div className="dashboard-background-brand" aria-hidden="true">
            ALIMI
          </div>

          <div className="dashboard-container dashboard-hero-grid">
            <div className="dashboard-hero-content">
              <motion.div
                className="dashboard-eyebrow"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <Sparkles size={17} />
                {localizedText(heroContent.eyebrow, language)}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  delay: 0.15,
                }}
              >
                {localizedText(heroContent.titleBefore, language)}{' '}

                <span>
                  {localizedText(heroContent.titleHighlight, language)}
                </span>
              </motion.h1>

              <div className="dashboard-changing-text">
                <span>
                  {localizedText(heroContent.changingPrefix, language)}
                </span>

                <span
                  key={rotatingWords[wordIndex]}
                  className="dashboard-changing-word"
                >
                  {rotatingWords[wordIndex]}
                </span>
              </div>

              <p className="dashboard-description">
                {localizedText(heroContent.description, language)}
              </p>

              <div className="dashboard-actions">
                <a
                  className="dashboard-primary-button"
                  href={heroContent.primaryButtonLink}
                >
                  {localizedText(heroContent.primaryButtonText, language)}
                  <ArrowLeft size={18} />
                </a>

                <a
                  className="dashboard-secondary-button"
                  href={heroContent.secondaryButtonLink}
                >
                  {localizedText(heroContent.secondaryButtonText, language)}
                </a>
              </div>
            </div>

            <motion.div
              className="collection-showcase"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.12,
              }}
            >

              <div className="collection-slider-wrapper">
                <button
                  type="button"
                  className="collection-navigation collection-previous"
                  onClick={previousSlide}
                  aria-label={t('dashboard.previousImage', 'عکس قبلی')}
                >
                  <ArrowRight size={21} />
                </button>

                <div
                  ref={sliderRef}
                  className="collection-slider"
                  onScroll={handleSliderScroll}
                >
                  {collectionImages.map((item, index) => (
                    <article
                      className="collection-slide"
                      key={item.id}
                    >
                      <img
                        src={item.image}
                        alt={localizedText(item.alt, language) || localizedText(item.title, language)}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        className="collection-slide-image"
                        style={{
                          objectPosition: item.objectPosition || 'center',
                        }}
                      />

                      <div className="collection-fragments" aria-hidden="true">
                        <span className="fragment fragment-1" />
                        <span className="fragment fragment-2" />
                        <span className="fragment fragment-3" />
                        <span className="fragment fragment-4" />
                        <span className="fragment fragment-5" />
                        <span className="fragment fragment-6" />
                        <span className="fragment fragment-7" />
                        <span className="fragment fragment-8" />
                        <span className="fragment fragment-9" />
                      </div>

                      <div className="collection-image-overlay" />

                      <div className="collection-slide-content">
                        <span>{localizedText(item.badge, language) || 'ALIMI PAINT'}</span>
                        <h2>{localizedText(item.title, language)}</h2>
                        <p>{localizedText(item.subtitle, language)}</p>
                      </div>
                    </article>
                  ))}
                </div>

                <button
                  type="button"
                  className="collection-navigation collection-next"
                  onClick={nextSlide}
                  aria-label={t('dashboard.nextImage', 'عکس بعدی')}
                >
                  <ArrowLeft size={21} />
                </button>
              </div>

              <div className="collection-dots">
                {collectionImages.map((item, index) => (
                  <button
                    type="button"
                    key={item.id}
                    className={
                      activeSlide === index
                        ? 'collection-dot collection-dot-active'
                        : 'collection-dot'
                    }
                    onClick={() => scrollToSlide(index)}
                    aria-label={`${t('dashboard.showImage', 'نمایش تصویر')} ${index + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <ProjectArchive />

        <section
          className="product-categories-section"
          id="products"
        >
          <div
            className="product-category-glow product-category-glow-one"
            aria-hidden="true"
          />

          <div
            className="product-category-glow product-category-glow-two"
            aria-hidden="true"
          />

          <div className="dashboard-container">
            <div className="product-category-layout">
              <motion.div
                className="product-category-heading"
                initial={{
                  opacity: 0,
                  x: -45,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.3,
                }}
                transition={{
                  duration: 0.65,
                }}
              >
                <div
                  className="product-category-stars"
                  aria-hidden="true"
                >
                  <Sparkles size={42} />
                </div>

                <span className="product-category-small-title">
                  {t('dashboard.companyProducts', 'محصولات شرکت علیمی')}
                </span>

                <h2>
                  {t('dashboard.categoryTitle', 'دسته‌بندی')}
                  <br />
                  <span>{t('dashboard.productsTitle', 'محصولات')}</span>
                </h2>

                <p>
                  {t('dashboard.categoryHint', 'برای مشاهده محصولات هر دسته، موس خود را روی عنوان کتگوری قرار دهید.')}
                </p>
              </motion.div>

              <div className="product-category-browser">
                {productCategories.length > 0 ? (
                  <>
                    <div className="product-category-list">
                      {productCategories.map((category, index) => (
                        <button
                          type="button"
                          key={category.id}
                          className={
                            activeCategory === index
                              ? 'product-category-row product-category-row-active'
                              : 'product-category-row'
                          }
                          onMouseEnter={() => setActiveCategory(index)}
                          onFocus={() => setActiveCategory(index)}
                          onClick={() => setActiveCategory(index)}
                        >
                          <span className="product-category-row-arrow">
                            <ArrowLeft size={20} />
                          </span>

                          <span className="product-category-row-main">
                            <span className="product-category-row-text">
                              <strong>{category.title}</strong>
                              <small>{category.count}</small>
                            </span>
                          </span>

                          <span className="product-category-row-line" />
                        </button>
                      ))}
                    </div>

                    <div className="product-category-preview">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={productCategories[activeCategory]?.id}
                          className="product-category-preview-card"
                          initial={{
                            opacity: 0,
                            scale: 0.88,
                            y: 35,
                            rotate: -4,
                            filter: 'blur(8px)',
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            rotate: 0,
                            filter: 'blur(0px)',
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.9,
                            y: -25,
                            rotate: 4,
                            filter: 'blur(8px)',
                          }}
                          transition={{
                            duration: 0.48,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <img
                            src={productCategories[activeCategory]?.image}
                            alt={productCategories[activeCategory]?.title}
                          />

                          <div className="product-category-preview-overlay" />

                          <span className="product-category-preview-number">
                            {String(activeCategory + 1).padStart(2, '0')}
                          </span>

                          <div className="product-category-preview-content">
                            <span>{productCategories[activeCategory]?.count}</span>
                            <h3>{productCategories[activeCategory]?.title}</h3>
                            <p>{productCategories[activeCategory]?.subtitle}</p>

                            <Link
                              to={`/products?category=${encodeURIComponent(
                                productCategories[activeCategory]?.id || '',
                              )}`}
                            >
                              {t('dashboard.viewProducts', 'مشاهده محصولات')}
                              <ArrowLeft size={18} />
                            </Link>
                          </div>

                          <div
                            className="product-category-preview-pieces"
                            aria-hidden="true"
                          >
                            <i />
                            <i />
                            <i />
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <div className="product-category-empty">
                    {t('dashboard.noActiveCategories', 'هنوز کتگوری فعالی ثبت نشده است.')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Dashboard
