import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Info, Search, Sparkles, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  loadProductsData,
  PRODUCTS_CHANGED_EVENT,
} from '../data/productsStore'
import { localizedArray, localizedText } from '../i18n/localizedContent'
import { useLanguage } from '../i18n/LanguageContext'
import './Products.css'

function normalizeSearchText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ى/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ۀ/g, 'ه')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim()
}

function collectSearchStrings(value, bucket = []) {
  if (value == null) return bucket
  if (typeof value === 'string' || typeof value === 'number') {
    const text = String(value).trim()
    if (text) bucket.push(text)
    return bucket
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectSearchStrings(item, bucket))
    return bucket
  }
  if (typeof value === 'object') {
    Object.values(value).forEach((item) => collectSearchStrings(item, bucket))
  }
  return bucket
}

function Products() {
  const [searchParams] = useSearchParams()
  const { language, direction, t } = useLanguage()
  const [pageData, setPageData] = useState(loadProductsData)
  const [activeCategory, setActiveCategory] = useState(
    () => searchParams.get('category') || 'all',
  )
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    const refreshData = () => setPageData(loadProductsData())
    window.addEventListener(PRODUCTS_CHANGED_EVENT, refreshData)
    window.addEventListener('storage', refreshData)
    return () => {
      window.removeEventListener(PRODUCTS_CHANGED_EVENT, refreshData)
      window.removeEventListener('storage', refreshData)
    }
  }, [])

  useEffect(() => {
    const requestedCategory = searchParams.get('category')
    if (requestedCategory) setActiveCategory(requestedCategory)
  }, [searchParams])

  const categoryMap = useMemo(
    () => new Map(pageData.categories.map((item) => [String(item.id), item])),
    [pageData.categories],
  )

  const activeCategoryIds = useMemo(
    () =>
      new Set(
        pageData.categories
          .filter((category) => category.active !== false)
          .map((category) => String(category.id)),
      ),
    [pageData.categories],
  )

  const activeProducts = useMemo(
    () =>
      [...pageData.products]
        .filter(
          (product) =>
            product.active !== false &&
            activeCategoryIds.has(String(product.category)),
        )
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [activeCategoryIds, pageData.products],
  )

  const visibleCategories = useMemo(
    () => [
      {
        id: 'all',
        label: t('products.allProducts', 'همه محصولات'),
        active: true,
      },
      ...pageData.categories
        .filter((category) => category.active !== false)
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    ],
    [pageData.categories, t],
  )

  const featuredProduct = useMemo(
    () =>
      activeProducts.find(
        (product) =>
          String(product.id) === String(pageData.hero.featuredProductId),
      ) ||
      activeProducts.find((product) => product.featured) ||
      activeProducts[0],
    [activeProducts, pageData.hero.featuredProductId],
  )

  const filteredProducts = useMemo(() => {
    const query = normalizeSearchText(searchValue)

    return activeProducts.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' || String(product.category) === String(activeCategory)

      if (!matchesCategory) return false
      if (!query) return true

      const category = categoryMap.get(String(product.category))
      const haystack = normalizeSearchText(
        collectSearchStrings([
          product.name,
          product.description,
          product.finish,
          product.coverage,
          product.sizes,
          category?.label,
          category?.description,
        ]).join(' '),
      )

      return haystack.includes(query)
    })
  }, [activeCategory, activeProducts, categoryMap, searchValue])

  useEffect(() => {
    const categoryExists = visibleCategories.some(
      (category) => String(category.id) === String(activeCategory),
    )
    if (!categoryExists) setActiveCategory('all')
  }, [activeCategory, visibleCategories])

  const hero = pageData.hero
  const catalog = pageData.catalog

  return (
    <div className="products-shell" dir={direction}>
      <main className="products-page">
        <section className="products-hero">
          <div className="products-hero-glow products-hero-glow-one" />
          <div className="products-hero-glow products-hero-glow-two" />

          <div className="products-background-word" aria-hidden="true">
            {hero.backgroundWord}
          </div>

          <div className="products-container products-hero-layout">
            <motion.div
              className="products-hero-content"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="products-kicker">
                <Sparkles size={17} />
                {localizedText(hero.kicker, language)}
              </span>

              <h1>
                {localizedText(hero.titleBefore, language)}{' '}
                <span>{localizedText(hero.titleHighlight, language)}</span>
              </h1>

              <p>{localizedText(hero.description, language)}</p>

              <div className="products-hero-stats">
                {hero.stats.map((stat) => (
                  <div key={stat.id}>
                    <strong>{stat.value}</strong>
                    <span>{localizedText(stat.label, language)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {featuredProduct && (() => {
              const category = categoryMap.get(String(featuredProduct.category))
              return (
                <motion.div
                  className="products-feature-card"
                  initial={{ opacity: 0, scale: 0.92, rotate: 3 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.75, delay: 0.12 }}
                >
                  <img
                    src={featuredProduct.images?.[0] || featuredProduct.image}
                    alt={localizedText(featuredProduct.name, language)}
                  />
                  <div className="products-feature-shade" />
                  <span className="products-feature-badge">
                    {localizedText(hero.featuredBadge, language)}
                  </span>

                  <div className="products-feature-content">
                    <small>{localizedText(category?.label || featuredProduct.categoryLabel, language)}</small>
                    <h2>{localizedText(featuredProduct.name, language)}</h2>
                    <p>{localizedText(featuredProduct.description, language)}</p>
                  </div>
                </motion.div>
              )
            })()}
          </div>
        </section>

        <section className="products-catalog" id="product-list">
          <div className="products-container">
            <div className="products-catalog-head">
              <div>
                <span>{localizedText(catalog.kicker, language)}</span>
                <h2>{localizedText(catalog.title, language)}</h2>
              </div>

              <label className="products-search-box">
                <Search size={19} />
                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={localizedText(catalog.searchPlaceholder, language)}
                />

                {searchValue && (
                  <button
                    type="button"
                    onClick={() => setSearchValue('')}
                    aria-label={t('products.clearSearch', 'پاک کردن جستجو')}
                  >
                    <X size={16} />
                  </button>
                )}
              </label>
            </div>

            <div className="products-category-tabs">
              {visibleCategories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={
                    String(activeCategory) === String(category.id) ? 'is-active' : ''
                  }
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.id === 'all'
                    ? category.label
                    : localizedText(category.label, language)}
                </button>
              ))}
            </div>

            <motion.div layout className="products-grid">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => {
                  const category = categoryMap.get(String(product.category))
                  const productName = localizedText(product.name, language)
                  const description = localizedText(product.description, language)
                  const sizes = localizedArray(product.sizes, language)

                  return (
                    <motion.article
                      layout
                      key={product.id}
                      className="product-card"
                      initial={{ opacity: 0, y: 28, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 18, scale: 0.94 }}
                      transition={{ duration: 0.36, delay: index * 0.04 }}
                    >
                      <Link
                        to={`/products/${encodeURIComponent(product.id)}`}
                        className="product-card-image product-card-click-target"
                        aria-label={`${t('products.moreInfo', 'معلومات بیشتر')} ${productName}`}
                      >
                        <img
                          src={product.images?.[0] || product.image}
                          alt={productName}
                          loading="lazy"
                        />
                        <div className="product-card-overlay" />

                        {product.featured && (
                          <span className="product-card-featured">
                            {t('products.featured', 'پرفروش')}
                          </span>
                        )}

                        <span className="product-card-category">
                          {localizedText(category?.label || product.categoryLabel, language)}
                        </span>
                      </Link>

                      <div className="product-card-body">
                        <h3>
                          <Link to={`/products/${encodeURIComponent(product.id)}`}>
                            {productName}
                          </Link>
                        </h3>
                        <p>{description}</p>

                        <div className="product-color-row">
                          <span>{t('products.suggestedColors', 'رنگ‌های پیشنهادی')}</span>
                          <div>
                            {(product.colors || []).map((color) => (
                              <i
                                key={`${product.id}-${color}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="product-card-details">
                          <span>
                            <small>{t('products.finish', 'نوع پوشش')}</small>
                            <strong>{localizedText(product.finish, language)}</strong>
                          </span>
                          <span>
                            <small>{t('products.coverage', 'پوشش‌دهی')}</small>
                            <strong>{localizedText(product.coverage, language)}</strong>
                          </span>
                        </div>

                        <div className="product-card-footer">
                          <div>
                            {sizes.map((size, sizeIndex) => (
                              <span key={`${product.id}-${sizeIndex}`}>{size}</span>
                            ))}
                          </div>

                          <Link
                            to={`/products/${encodeURIComponent(product.id)}`}
                            className="product-card-info-link"
                            aria-label={`${t('products.moreInfo', 'معلومات بیشتر')} ${productName}`}
                            title={t('products.moreInfo', 'معلومات بیشتر')}
                          >
                            <Info size={19} />
                            <span className="product-card-info-tooltip">
                              {t('products.moreInfo', 'معلومات بیشتر')}
                            </span>
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  )
                })}
              </AnimatePresence>
            </motion.div>

            {!filteredProducts.length && (
              <div className="products-empty-state">
                <Search size={30} />
                <h3>{localizedText(catalog.emptyTitle, language)}</h3>
                <p>{localizedText(catalog.emptyDescription, language)}</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Products
