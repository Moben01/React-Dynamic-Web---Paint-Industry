import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Info,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  loadProductsData,
  PRODUCTS_CHANGED_EVENT,
} from '../data/productsStore'
import './Products.css'

function Products() {
  const [searchParams] = useSearchParams()
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
      { id: 'all', label: 'همه محصولات', active: true },
      ...pageData.categories
        .filter((category) => category.active !== false)
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    ],
    [pageData.categories],
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
    const query = searchValue.trim().toLowerCase()

    return activeProducts.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' || product.category === activeCategory
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.categoryLabel.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })
  }, [activeCategory, activeProducts, searchValue])

  useEffect(() => {
    const categoryExists = visibleCategories.some(
      (category) => category.id === activeCategory,
    )
    if (!categoryExists) setActiveCategory('all')
  }, [activeCategory, visibleCategories])

  return (
    <div className="products-shell">
      <main className="products-page">
        <section className="products-hero">
          <div className="products-hero-glow products-hero-glow-one" />
          <div className="products-hero-glow products-hero-glow-two" />

          <div className="products-background-word" aria-hidden="true">
            {pageData.hero.backgroundWord}
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
                {pageData.hero.kicker}
              </span>

              <h1>
                {pageData.hero.titleBefore}{' '}
                <span>{pageData.hero.titleHighlight}</span>
              </h1>

              <p>{pageData.hero.description}</p>

              <div className="products-hero-stats">
                {pageData.hero.stats.map((stat) => (
                  <div key={stat.id}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {featuredProduct && (
              <motion.div
                className="products-feature-card"
                initial={{ opacity: 0, scale: 0.92, rotate: 3 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.75, delay: 0.12 }}
              >
                <img
                  src={featuredProduct.images?.[0] || featuredProduct.image}
                  alt={featuredProduct.name}
                />
                <div className="products-feature-shade" />
                <span className="products-feature-badge">
                  {pageData.hero.featuredBadge}
                </span>

                <div className="products-feature-content">
                  <small>{featuredProduct.categoryLabel}</small>
                  <h2>{featuredProduct.name}</h2>
                  <p>{featuredProduct.description}</p>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        <section className="products-catalog" id="product-list">
          <div className="products-container">
            <div className="products-catalog-head">
              <div>
                <span>{pageData.catalog.kicker}</span>
                <h2>{pageData.catalog.title}</h2>
              </div>

              <label className="products-search-box">
                <Search size={19} />
                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={pageData.catalog.searchPlaceholder}
                />

                {searchValue && (
                  <button
                    type="button"
                    onClick={() => setSearchValue('')}
                    aria-label="پاک کردن جستجو"
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
                    activeCategory === category.id ? 'is-active' : ''
                  }
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <motion.div layout className="products-grid">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.article
                    layout
                    key={product.id}
                    className="product-card"
                    initial={{ opacity: 0, y: 28, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 18, scale: 0.94 }}
                    transition={{ duration: 0.36, delay: index * 0.04 }}
                  >
                    <div className="product-card-image">
                      <img
                        src={product.images?.[0] || product.image}
                        alt={product.name}
                        loading="lazy"
                      />
                      <div className="product-card-overlay" />

                      {product.featured && (
                        <span className="product-card-featured">پرفروش</span>
                      )}

                      <span className="product-card-category">
                        {product.categoryLabel}
                      </span>
                    </div>

                    <div className="product-card-body">
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>

                      <div className="product-color-row">
                        <span>رنگ‌های پیشنهادی</span>

                        <div>
                          {product.colors.map((color) => (
                            <i
                              key={`${product.id}-${color}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="product-card-details">
                        <span>
                          <small>نوع پوشش</small>
                          <strong>{product.finish}</strong>
                        </span>

                        <span>
                          <small>پوشش‌دهی</small>
                          <strong>{product.coverage}</strong>
                        </span>
                      </div>

                      <div className="product-card-footer">
                        <div>
                          {product.sizes.map((size) => (
                            <span key={`${product.id}-${size}`}>{size}</span>
                          ))}
                        </div>

                        <Link
                          to={`/products/${product.id}`}
                          className="product-card-info-link"
                          aria-label={`معلومات بیشتر درباره ${product.name}`}
                          title="معلومات بیشتر"
                        >
                          <Info size={19} />
                          <span className="product-card-info-tooltip">معلومات بیشتر</span>
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredProducts.length === 0 && (
              <div className="products-empty-state">
                <Search size={34} />
                <h3>{pageData.catalog.emptyTitle}</h3>
                <p>{pageData.catalog.emptyDescription}</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Products