import { useMemo, useRef, useState } from 'react'
import {
  confirmAdminAction,
  showAdminError,
  showAdminSuccess,
  showAdminWarning,
} from '../utils/adminAlert'
import {
  Check,
  ImagePlus,
  Images,
  LayoutTemplate,
  PackagePlus,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import {
  loadProductsData,
  resetProductsData,
  saveProductsData,
} from '../data/productsStore'
import LocalizedField from '../components/LocalizedField'
import {
  createLocalizedValue,
  localizedText,
  normalizeLocalizedValue,
} from '../i18n/localizedContent'
import './ProductsAdmin.css'

const L = () => createLocalizedValue()

const emptyCategory = {
  id: null,
  label: L(),
  description: L(),
  image: '',
  active: true,
  order: 1,
}

const emptyProduct = {
  id: null,
  name: L(),
  category: '',
  categoryLabel: L(),
  description: L(),
  sizesText: L(),
  finish: L(),
  coverage: L(),
  image: '',
  images: [],
  colorsText: '',
  selectedColor: '#ff6b1a',
  featured: false,
  active: true,
  order: 1,
}

const textOf = (value) => localizedText(value, 'fa')

function localizedListToText(items = []) {
  const result = createLocalizedValue()
  ;['fa', 'ps', 'en'].forEach((lang) => {
    result[lang] = (Array.isArray(items) ? items : [])
      .map((item) => localizedText(item, lang, { fallbackOrder: [lang] }))
      .filter(Boolean)
      .join('\n')
  })
  return result
}

function localizedTextToList(value) {
  const normalized = normalizeLocalizedValue(value)
  const lists = {}
  let maxLength = 0

  ;['fa', 'ps', 'en'].forEach((lang) => {
    lists[lang] = normalized[lang]
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean)
    maxLength = Math.max(maxLength, lists[lang].length)
  })

  return Array.from({ length: maxLength }, (_, index) => ({
    fa: lists.fa[index] || '',
    ps: lists.ps[index] || '',
    en: lists.en[index] || '',
  }))
}

function ProductsAdmin({ searchTerm = '' }) {
  const [data, setData] = useState(loadProductsData)
  const [section, setSection] = useState('hero')
  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState(emptyProduct)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [categoryDraft, setCategoryDraft] = useState(emptyCategory)
  const imageInputRef = useRef(null)
  const categoryImageInputRef = useRef(null)

  const persist = (nextData, message) => {
    try {
      const saved = saveProductsData(nextData)
      setData(saved)
      if (message) showAdminSuccess(message)
      return true
    } catch (error) {
      console.error(error)
      showAdminError('ذخیره معلومات انجام نشد. اگر عکس خیلی بزرگ است، یک تصویر کوچک‌تر انتخاب کنید.')
      return false
    }
  }

  const updateHero = (field, value) => {
    setData((current) => ({ ...current, hero: { ...current.hero, [field]: value } }))
  }

  const updateCatalog = (field, value) => {
    setData((current) => ({ ...current, catalog: { ...current.catalog, [field]: value } }))
  }

  const updateHeroStat = (index, field, value) => {
    setData((current) => ({
      ...current,
      hero: {
        ...current.hero,
        stats: current.hero.stats.map((stat, statIndex) =>
          statIndex === index ? { ...stat, [field]: value } : stat,
        ),
      },
    }))
  }

  const compressImageFile = (file, maxWidth = 1100, quality = 0.78) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('خواندن عکس ناموفق بود.'))
      reader.onload = () => {
        const image = new Image()
        image.onerror = () => reject(new Error('عکس معتبر نیست.'))
        image.onload = () => {
          const ratio = Math.min(1, maxWidth / image.width)
          const canvas = document.createElement('canvas')
          canvas.width = Math.max(1, Math.round(image.width * ratio))
          canvas.height = Math.max(1, Math.round(image.height * ratio))
          const context = canvas.getContext('2d')
          context.drawImage(image, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/webp', quality))
        }
        image.src = String(reader.result || '')
      }
      reader.readAsDataURL(file)
    })

  const makeCategoryId = (labelValue) => {
    const label = textOf(labelValue) || 'category'
    const base = label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'category'
    let id = base
    let counter = 2
    while (data.categories.some((category) => category.id === id)) {
      id = `${base}-${counter}`
      counter += 1
    }
    return id
  }

  const openAddCategory = () => {
    setCategoryDraft({ ...emptyCategory, label: L(), description: L(), order: data.categories.length + 1 })
    setCategoryModalOpen(true)
  }

  const openEditCategory = (category) => {
    setCategoryDraft({
      ...emptyCategory,
      ...category,
      label: normalizeLocalizedValue(category.label),
      description: normalizeLocalizedValue(category.description),
    })
    setCategoryModalOpen(true)
  }

  const closeCategoryModal = () => {
    setCategoryModalOpen(false)
    setCategoryDraft(emptyCategory)
  }

  const setCategoryDraftField = (field, value) => {
    setCategoryDraft((current) => ({ ...current, [field]: value }))
  }

  const handleCategoryImageFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showAdminWarning('فقط فایل تصویری انتخاب کنید.')
      return
    }
    try {
      const image = await compressImageFile(file, 1000, 0.76)
      setCategoryDraftField('image', image)
    } catch (error) {
      console.error(error)
      showAdminError('آماده‌سازی عکس کتگوری انجام نشد.')
    }
  }

  const saveCategory = (event) => {
    event.preventDefault()
    const label = normalizeLocalizedValue(categoryDraft.label)
    const description = normalizeLocalizedValue(categoryDraft.description)

    if (!label.fa.trim()) {
      showAdminWarning('نام کتگوری به زبان دری را وارد کنید.')
      return
    }
    if ([description.fa, description.ps, description.en].some((value) => value.length > 30)) {
      showAdminWarning('متن کوتاه کتگوری در هر زبان باید حداکثر ۳۰ کرکتر باشد.')
      return
    }
    if (!String(categoryDraft.image || '').trim()) {
      showAdminWarning('عکس کتگوری را انتخاب کنید.')
      return
    }

    const id = categoryDraft.id || makeCategoryId(label)
    const category = {
      id,
      label,
      description,
      image: String(categoryDraft.image).trim(),
      active: categoryDraft.active !== false,
      order: Number(categoryDraft.order || data.categories.length + 1),
    }

    const nextCategories = categoryDraft.id
      ? data.categories.map((item) => item.id === categoryDraft.id ? category : item)
      : [...data.categories, category]

    const nextProducts = data.products.map((product) =>
      String(product.category) === String(id)
        ? { ...product, categoryLabel: label }
        : product,
    )

    if (persist(
      { ...data, categories: nextCategories, products: nextProducts },
      categoryDraft.id ? 'کتگوری ویرایش شد.' : 'کتگوری جدید اضافه شد.',
    )) closeCategoryModal()
  }

  const toggleCategory = (categoryId) => {
    persist({
      ...data,
      categories: data.categories.map((category) =>
        category.id === categoryId
          ? { ...category, active: category.active === false }
          : category,
      ),
    })
  }

  const requestDeleteCategory = async (category) => {
    const categoryProducts = data.products.filter((product) => String(product.category) === String(category.id))
    const remainingCategories = data.categories.filter((item) => item.id !== category.id)
    if (!remainingCategories.length) {
      showAdminWarning('حداقل یک کتگوری باید باقی بماند.')
      return
    }

    const fallbackCategory = remainingCategories[0]
    const confirmed = await confirmAdminAction({
      title: 'حذف کتگوری',
      text: categoryProducts.length
        ? `در این کتگوری ${categoryProducts.length} محصول وجود دارد. با حذف کتگوری، این محصولات به «${textOf(fallbackCategory.label)}» منتقل می‌شوند.`
        : `آیا کتگوری «${textOf(category.label)}» حذف شود؟`,
      confirmText: 'حذف کتگوری',
      cancelText: 'انصراف',
    })
    if (!confirmed) return

    const nextProducts = data.products.map((product) =>
      String(product.category) === String(category.id)
        ? { ...product, category: fallbackCategory.id, categoryLabel: fallbackCategory.label }
        : product,
    )
    persist({ ...data, categories: remainingCategories, products: nextProducts }, 'کتگوری حذف شد.')
  }

  const saveHeroSection = () => persist(data, 'معلومات بخش بالای صفحه محصولات ذخیره شد.')
  const saveCatalogSettings = () => persist(data, 'تنظیمات کاتالوگ محصولات ذخیره شد.')

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return data.products
    return data.products.filter((product) =>
      JSON.stringify([product.name, product.categoryLabel, product.finish, product.coverage])
        .toLowerCase()
        .includes(query),
    )
  }, [data.products, searchTerm])

  const openAddProduct = () => {
    const firstCategory = data.categories.find((item) => item.active !== false) || data.categories[0]
    setDraft({
      ...emptyProduct,
      name: L(), description: L(), finish: L(), coverage: L(), sizesText: L(),
      category: firstCategory?.id || '',
      categoryLabel: firstCategory?.label || L(),
      order: data.products.length + 1,
    })
    setModalOpen(true)
  }

  const openEditProduct = (product) => {
    const productColors = Array.isArray(product.colors) ? product.colors : []
    const productImages = Array.isArray(product.images) && product.images.length
      ? product.images
      : product.image ? [product.image] : []
    setDraft({
      ...emptyProduct,
      ...product,
      name: normalizeLocalizedValue(product.name),
      categoryLabel: normalizeLocalizedValue(product.categoryLabel),
      description: normalizeLocalizedValue(product.description),
      finish: normalizeLocalizedValue(product.finish),
      coverage: normalizeLocalizedValue(product.coverage),
      sizesText: localizedListToText(product.sizes),
      image: productImages[0] || '',
      images: productImages,
      colorsText: productColors.join('\n'),
      selectedColor: productColors[0] || '#ff6b1a',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setDraft(emptyProduct)
  }

  const setDraftField = (field, value) => setDraft((current) => ({ ...current, [field]: value }))

  const normalizeHexColor = (color) => {
    const value = String(color || '').trim().toLowerCase()
    return /^#[0-9a-f]{6}$/i.test(value) ? value : null
  }

  const getDraftColors = () => draft.colorsText
    .split(/\n|,/)
    .map((color) => normalizeHexColor(color))
    .filter(Boolean)

  const addSelectedColor = () => {
    const selectedColor = normalizeHexColor(draft.selectedColor) || '#ff6b1a'
    const currentColors = getDraftColors()
    if (currentColors.includes(selectedColor)) {
      showAdminWarning('این رنگ قبلاً اضافه شده است.')
      return
    }
    setDraftField('colorsText', [...currentColors, selectedColor].join('\n'))
  }

  const removeDraftColor = (colorToRemove) => {
    setDraftField('colorsText', getDraftColors().filter((color) => color !== colorToRemove).join('\n'))
  }

  const handleColorPickerChange = (event) => setDraftField('selectedColor', event.target.value)
  const handleColorPickerBlur = () => {
    const selectedColor = normalizeHexColor(draft.selectedColor)
    if (selectedColor) setDraftField('selectedColor', selectedColor)
  }

  const handleCategoryChange = (categoryId) => {
    const category = data.categories.find((item) => String(item.id) === String(categoryId))
    setDraft((current) => ({
      ...current,
      category: categoryId,
      categoryLabel: category?.label || current.categoryLabel,
    }))
  }

  const handleImageFile = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    if (files.some((file) => !file.type.startsWith('image/'))) {
      showAdminWarning('فقط فایل تصویری انتخاب کنید.')
      return
    }
    try {
      const preparedImages = await Promise.all(files.map((file) => compressImageFile(file, 1200, 0.72)))
      setDraft((current) => {
        const currentImages = Array.isArray(current.images) ? current.images.filter(Boolean) : current.image ? [current.image] : []
        const images = [...currentImages, ...preparedImages]
        return { ...current, images, image: images[0] || '' }
      })
    } catch (error) {
      console.error(error)
      showAdminError('آماده‌سازی عکس‌های محصول انجام نشد.')
    }
  }

  const removeProductImage = (index) => {
    setDraft((current) => {
      const images = (current.images || []).filter((_, imageIndex) => imageIndex !== index)
      return { ...current, images, image: images[0] || '' }
    })
  }

  const setPrimaryProductImage = (index) => {
    setDraft((current) => {
      const images = [...(current.images || [])]
      if (!images[index]) return current
      const [selected] = images.splice(index, 1)
      images.unshift(selected)
      return { ...current, images, image: selected }
    })
  }

  const saveProduct = (event) => {
    event.preventDefault()
    const name = normalizeLocalizedValue(draft.name)
    if (!name.fa.trim()) {
      showAdminWarning('نام محصول به زبان دری را وارد کنید.')
      return
    }
    if (!draft.category) {
      showAdminWarning('کتگوری محصول را انتخاب کنید.')
      return
    }

    const productImages = Array.isArray(draft.images) ? draft.images.filter(Boolean) : draft.image ? [draft.image] : []
    if (!productImages.length) {
      showAdminWarning('حداقل یک تصویر برای محصول انتخاب کنید.')
      return
    }

    const colorEntries = draft.colorsText.split(/\n|,/).map((item) => item.trim()).filter(Boolean)
    const invalidColors = colorEntries.filter((color) => !/^#[0-9a-f]{6}$/i.test(color))
    if (invalidColors.length) {
      showAdminWarning(`کد رنگ نامعتبر است:\n${invalidColors.join('\n')}\n\nکد رنگ باید مانند #ff6b1a باشد.`)
      return
    }
    const colors = [...new Set(colorEntries.map((color) => color.toLowerCase()))]
    const selectedCategory = data.categories.find((item) => String(item.id) === String(draft.category))

    const product = {
      id: draft.id || Date.now(),
      name,
      category: draft.category,
      categoryLabel: selectedCategory?.label || normalizeLocalizedValue(draft.categoryLabel),
      description: normalizeLocalizedValue(draft.description),
      sizes: localizedTextToList(draft.sizesText),
      finish: normalizeLocalizedValue(draft.finish),
      coverage: normalizeLocalizedValue(draft.coverage),
      image: productImages[0],
      images: productImages,
      colors: colors.length ? colors : ['#ffffff'],
      featured: Boolean(draft.featured),
      active: Boolean(draft.active),
      order: Number(draft.order || 0),
    }

    const nextProducts = draft.id
      ? data.products.map((item) => String(item.id) === String(draft.id) ? product : item)
      : [...data.products, product]

    const nextHero = data.hero.featuredProductId
      ? data.hero
      : { ...data.hero, featuredProductId: product.id }

    if (persist(
      { ...data, hero: nextHero, products: nextProducts },
      draft.id ? 'محصول ویرایش شد.' : 'محصول جدید اضافه شد.',
    )) closeModal()
  }

  const toggleProduct = (productId) => {
    persist({
      ...data,
      products: data.products.map((product) =>
        String(product.id) === String(productId)
          ? { ...product, active: product.active === false }
          : product,
      ),
    })
  }

  const setFeaturedProduct = (productId) => {
    persist({ ...data, hero: { ...data.hero, featuredProductId: productId } })
  }

  const requestDeleteProduct = async (product) => {
    const confirmed = await confirmAdminAction({
      title: 'حذف محصول',
      text: `آیا محصول «${textOf(product.name)}» حذف شود؟ این عمل قابل برگشت نیست.`,
      confirmText: 'حذف',
      cancelText: 'انصراف',
    })
    if (!confirmed) return
    const nextProducts = data.products.filter((item) => String(item.id) !== String(product.id))
    persist({
      ...data,
      products: nextProducts,
      hero: {
        ...data.hero,
        featuredProductId:
          String(data.hero.featuredProductId) === String(product.id)
            ? nextProducts[0]?.id || null
            : data.hero.featuredProductId,
      },
    }, 'محصول حذف شد.')
  }

  const restoreDefaults = async () => {
    const confirmed = await confirmAdminAction({
      title: 'بازگردانی معلومات اولیه',
      text: 'تمام معلومات محصولات به حالت اولیه برگردد؟',
      confirmText: 'بله، بازگردانی شود',
    })
    if (!confirmed) return
    setData(resetProductsData())
    showAdminSuccess('معلومات محصولات به حالت اولیه بازگردانده شد.')
  }

  return (
    <div className="products-admin">
      <div className="products-admin-section-tabs">
        <button type="button" className={section === 'hero' ? 'active' : ''} onClick={() => setSection('hero')}>
          <LayoutTemplate size={18} /> بخش بالای صفحه
        </button>
        <button type="button" className={section === 'catalog' ? 'active' : ''} onClick={() => setSection('catalog')}>
          <PackagePlus size={18} /> کاتالوگ محصولات
        </button>
        <button type="button" className="products-admin-reset" onClick={restoreDefaults}>
          <RotateCcw size={16} /> بازگردانی معلومات اولیه
        </button>
      </div>

      {section === 'hero' && (
        <div className="products-admin-hero-layout">
          <section className="products-admin-card">
            <header><div><h3>متن‌های بخش معرفی محصولات</h3><p>تمام متن‌ها را به دری، پشتو و انگلیسی وارد کنید.</p></div></header>
            <div className="products-admin-form-grid">
              <LocalizedField label="نوشته کوچک بالا" value={data.hero.kicker} onChange={(value) => updateHero('kicker', value)} showTranslationTools={false} />
              <LocalizedField label="قسمت اول عنوان" value={data.hero.titleBefore} onChange={(value) => updateHero('titleBefore', value)} showTranslationTools={false} />
              <LocalizedField label="قسمت رنگی عنوان" value={data.hero.titleHighlight} onChange={(value) => updateHero('titleHighlight', value)} showTranslationTools={false} />
              <label><span>نوشته بزرگ پس‌زمینه</span><input value={data.hero.backgroundWord} onChange={(event) => updateHero('backgroundWord', event.target.value)} dir="ltr" /></label>
              <LocalizedField className="products-admin-full-field" label="توضیحات" multiline rows={4} value={data.hero.description} onChange={(value) => updateHero('description', value)} showTranslationTools={false} />
            </div>
          </section>

          <section className="products-admin-card">
            <header><div><h3>آمار بخش محصولات</h3><p>مقدار عددی مشترک است؛ عنوان هر آمار سه‌زبانه است.</p></div></header>
            <div className="products-admin-stats-editor">
              {data.hero.stats.map((stat, index) => (
                <article key={stat.id}>
                  <strong>آمار {index + 1}</strong>
                  <label><span>مقدار</span><input value={stat.value} onChange={(event) => updateHeroStat(index, 'value', event.target.value)} /></label>
                  <LocalizedField label="عنوان" value={stat.label} onChange={(value) => updateHeroStat(index, 'label', value)} showTranslationTools={false} />
                </article>
              ))}
            </div>
          </section>

          <section className="products-admin-card products-admin-featured-card">
            <header><div><h3>محصول ویژه بخش اول</h3><p>محصول و نوشته روی کارت را مشخص کنید.</p></div></header>
            <div className="products-admin-form-grid">
              <label><span>محصول ویژه</span><select value={data.hero.featuredProductId || ''} onChange={(event) => updateHero('featuredProductId', event.target.value)}>{data.products.map((product) => <option key={product.id} value={product.id}>{textOf(product.name)}</option>)}</select></label>
              <LocalizedField label="نوشته روی کارت" value={data.hero.featuredBadge} onChange={(value) => updateHero('featuredBadge', value)} showTranslationTools={false} />
            </div>
          </section>

          <div className="products-admin-save-row"><button type="button" onClick={saveHeroSection}><Save size={17} /> ذخیره بخش بالای صفحه</button></div>
        </div>
      )}

      {section === 'catalog' && (
        <>
          <section className="products-admin-card products-admin-catalog-settings">
            <header><div><h3>عنوان‌های کاتالوگ</h3><p>متن‌های عمومی صفحه محصولات را در سه زبان وارد کنید.</p></div><button type="button" onClick={saveCatalogSettings}><Save size={16} /> ذخیره تنظیمات</button></header>
            <div className="products-admin-form-grid">
              <LocalizedField label="نوشته کوچک" value={data.catalog.kicker} onChange={(value) => updateCatalog('kicker', value)} showTranslationTools={false} />
              <LocalizedField label="عنوان کاتالوگ" value={data.catalog.title} onChange={(value) => updateCatalog('title', value)} showTranslationTools={false} />
              <LocalizedField label="متن داخل جستجو" value={data.catalog.searchPlaceholder} onChange={(value) => updateCatalog('searchPlaceholder', value)} showTranslationTools={false} />
              <LocalizedField label="عنوان نتیجه خالی" value={data.catalog.emptyTitle} onChange={(value) => updateCatalog('emptyTitle', value)} showTranslationTools={false} />
              <LocalizedField className="products-admin-full-field" label="توضیح نتیجه خالی" value={data.catalog.emptyDescription} onChange={(value) => updateCatalog('emptyDescription', value)} showTranslationTools={false} />
            </div>
          </section>

          <section className="products-admin-card products-admin-categories-card">
            <header><div><h3>کتگوری‌های محصولات</h3><p>نام و متن هر کتگوری را به هر سه زبان ثبت کنید.</p></div><button type="button" onClick={openAddCategory}><Plus size={16} /> افزودن کتگوری</button></header>
            <div className="products-admin-category-list">
              {[...data.categories].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)).map((category) => {
                const productCount = data.products.filter((product) => String(product.category) === String(category.id)).length
                return (
                  <article key={category.id} className={category.active === false ? 'is-disabled' : ''}>
                    <img src={category.image} alt={textOf(category.label)} />
                    <div className="products-admin-category-info"><strong>{textOf(category.label)}</strong><p>{textOf(category.description) || 'بدون توضیح'}</p><span>{productCount} محصول</span></div>
                    <div className="products-admin-category-actions">
                      <label className="products-admin-switch"><input type="checkbox" checked={category.active !== false} onChange={() => toggleCategory(category.id)} /><i /><b>{category.active !== false ? 'فعال' : 'غیرفعال'}</b></label>
                      <button type="button" title="ویرایش کتگوری" onClick={() => openEditCategory(category)}><Pencil size={16} /></button>
                      <button type="button" className="danger" title="حذف کتگوری" onClick={() => requestDeleteCategory(category)}><Trash2 size={16} /></button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <div className="products-admin-products-toolbar"><div><strong>لیست محصولات</strong><span>{data.products.length} محصول ثبت شده است.</span></div><button type="button" onClick={openAddProduct}><Plus size={17} /> افزودن محصول</button></div>

          <div className="products-admin-grid">
            {filteredProducts.map((product) => (
              <article key={product.id} className={product.active === false ? 'is-disabled' : ''}>
                <div className="products-admin-product-image">
                  <img src={product.image} alt={textOf(product.name)} />
                  {String(data.hero.featuredProductId) === String(product.id) && <span><Star size={13} fill="currentColor" /> محصول بخش اول</span>}
                  <b>{textOf(data.categories.find((item) => String(item.id) === String(product.category))?.label || product.categoryLabel)}</b>
                </div>
                <div className="products-admin-product-content">
                  <small>{textOf(product.finish) || 'بدون نوع پوشش'}</small>
                  <h3>{textOf(product.name)}</h3>
                  <p>{textOf(product.description)}</p>
                  <div><span>{textOf(product.coverage) || 'پوشش‌دهی ثبت نشده'}</span><strong>{product.active === false ? 'غیرفعال' : 'فعال'}</strong></div>
                </div>
                <footer>
                  <button type="button" title="انتخاب برای بخش اول" onClick={() => setFeaturedProduct(product.id)}><Star size={16} /></button>
                  <button type="button" title={product.active === false ? 'فعال‌سازی' : 'غیرفعال‌سازی'} onClick={() => toggleProduct(product.id)}><Check size={16} /></button>
                  <button type="button" title="ویرایش" onClick={() => openEditProduct(product)}><Pencil size={16} /></button>
                  <button type="button" className="danger" title="حذف" onClick={() => requestDeleteProduct(product)}><Trash2 size={16} /></button>
                </footer>
              </article>
            ))}
          </div>
        </>
      )}

      {categoryModalOpen && (
        <div className="products-admin-backdrop" role="presentation">
          <form className="products-admin-modal products-admin-category-modal" onSubmit={saveCategory}>
            <header><div><h2>{categoryDraft.id ? 'ویرایش کتگوری' : 'افزودن کتگوری جدید'}</h2><p>نام و متن کتگوری را به دری، پشتو و انگلیسی وارد کنید.</p></div><button type="button" onClick={closeCategoryModal}><X size={20} /></button></header>
            <div className="products-admin-category-modal-body">
              <button type="button" className="products-admin-upload products-admin-category-upload" onClick={() => categoryImageInputRef.current?.click()}>
                {categoryDraft.image ? <img src={categoryDraft.image} alt="پیش‌نمایش کتگوری" /> : <><ImagePlus size={34} /><strong>انتخاب عکس کتگوری</strong><span>JPG، PNG یا WEBP</span></>}
              </button>
              <input ref={categoryImageInputRef} type="file" accept="image/*" hidden onChange={handleCategoryImageFile} />
              <div className="products-admin-category-fields">
                <LocalizedField label="نام کتگوری" required value={categoryDraft.label} onChange={(value) => setCategoryDraftField('label', value)} showTranslationTools={false} placeholder={{ fa: 'مثلاً رنگ‌های دکوراتیف', ps: 'لکه دکوراتیف رنګونه', en: 'e.g. Decorative paints' }} />
                <LocalizedField label="متن کوتاه کتگوری" maxLength={30} value={categoryDraft.description} onChange={(value) => setCategoryDraftField('description', value)} showTranslationTools={false} placeholder={{ fa: 'حداکثر ۳۰ کرکتر', ps: 'تر ۳۰ تورو پورې', en: 'Maximum 30 characters' }} />
                <label><span>یا آدرس عکس</span><input value={categoryDraft.image} onChange={(event) => setCategoryDraftField('image', event.target.value)} dir="ltr" placeholder="https://..." /></label>
                <label className="products-admin-checkbox"><input type="checkbox" checked={categoryDraft.active !== false} onChange={(event) => setCategoryDraftField('active', event.target.checked)} /><span>کتگوری فعال و در سایت قابل نمایش باشد</span></label>
              </div>
            </div>
            <footer><button type="button" className="secondary" onClick={closeCategoryModal}>انصراف</button><button type="submit" className="primary"><Save size={16} /> ذخیره کتگوری</button></footer>
          </form>
        </div>
      )}

      {modalOpen && (
        <div className="products-admin-backdrop" role="presentation">
          <form className="products-admin-modal" onSubmit={saveProduct}>
            <header><div><h2>{draft.id ? 'ویرایش محصول' : 'افزودن محصول جدید'}</h2><p>متن‌های محصول را به هر سه زبان وارد کنید.</p></div><button type="button" onClick={closeModal}><X size={20} /></button></header>
            <div className="products-admin-modal-layout">
              <aside>
                <button type="button" className="products-admin-upload products-admin-upload-multiple" onClick={() => imageInputRef.current?.click()}><Images size={34} /><strong>انتخاب چندین عکس</strong><span>JPG، PNG یا WEBP — چند فایل را هم‌زمان انتخاب کنید</span></button>
                <input ref={imageInputRef} type="file" accept="image/*" multiple hidden onChange={handleImageFile} />
                <div className="products-admin-gallery-preview">
                  {(draft.images || []).length ? draft.images.map((image, index) => (
                    <div className={`products-admin-gallery-item ${index === 0 ? 'is-primary' : ''}`} key={`${index}-${image.slice(0, 30)}`}>
                      <img src={image} alt={`عکس ${index + 1} محصول`} />{index === 0 && <span>عکس اصلی</span>}
                      <div>{index !== 0 && <button type="button" onClick={() => setPrimaryProductImage(index)} title="انتخاب به عنوان عکس اصلی"><Star size={14} /></button>}<button type="button" className="danger" onClick={() => removeProductImage(index)} title="حذف عکس"><Trash2 size={14} /></button></div>
                    </div>
                  )) : <p>هنوز عکسی برای محصول انتخاب نشده است.</p>}
                </div>
              </aside>

              <div className="products-admin-form-grid">
                <LocalizedField label="نام محصول" required value={draft.name} onChange={(value) => setDraftField('name', value)} showTranslationTools={false} placeholder={{ fa: 'نام محصول را وارد کنید', ps: 'د محصول نوم ولیکئ', en: 'Enter product name' }} />
                <label><span>کتگوری *</span><select value={draft.category} onChange={(event) => handleCategoryChange(event.target.value)} required><option value="" disabled>کتگوری محصول را انتخاب کنید</option>{data.categories.filter((category) => category.id !== 'all' && (category.active !== false || String(category.id) === String(draft.category))).sort((a, b) => Number(a.order || 0) - Number(b.order || 0)).map((category) => <option key={category.id} value={category.id}>{textOf(category.label)}{category.active === false ? ' (غیرفعال)' : ''}</option>)}</select></label>
                <LocalizedField label="نوع پوشش" value={draft.finish} onChange={(value) => setDraftField('finish', value)} showTranslationTools={false} />
                <LocalizedField label="پوشش‌دهی" value={draft.coverage} onChange={(value) => setDraftField('coverage', value)} showTranslationTools={false} />
                <label><span>ترتیب نمایش</span><input type="number" min="0" value={draft.order} onChange={(event) => setDraftField('order', event.target.value)} /></label>
                <LocalizedField className="products-admin-full-field" label="توضیحات" multiline rows={4} value={draft.description} onChange={(value) => setDraftField('description', value)} showTranslationTools={false} />
                <LocalizedField label="اندازه‌ها؛ هر مورد در یک خط" multiline rows={5} value={draft.sizesText} onChange={(value) => setDraftField('sizesText', value)} showTranslationTools={false} placeholder={{ fa: '۴ کیلو\n۱۲ کیلو\n۲۰ کیلو', ps: '۴ کیلو\n۱۲ کیلو\n۲۰ کیلو', en: '4 kg\n12 kg\n20 kg' }} />

                <div className="products-admin-colors-field">
                  <span className="products-admin-field-label">رنگ‌های محصول</span>
                  <div className="products-admin-color-picker-row">
                    <label className="products-admin-color-picker"><input type="color" value={draft.selectedColor || '#ff6b1a'} onChange={handleColorPickerChange} aria-label="انتخاب رنگ محصول" /><span className="products-admin-color-preview" style={{ backgroundColor: draft.selectedColor || '#ff6b1a' }} /></label>
                    <input type="text" className="products-admin-color-code-input" value={draft.selectedColor || ''} onChange={(event) => setDraftField('selectedColor', event.target.value)} onBlur={handleColorPickerBlur} placeholder="#ff6b1a" dir="ltr" maxLength={7} />
                    <button type="button" className="products-admin-add-color" onClick={addSelectedColor}>افزودن رنگ</button>
                  </div>
                  <div className="products-admin-selected-colors">{getDraftColors().length ? getDraftColors().map((color) => <div className="products-admin-selected-color" key={color}><span className="products-admin-selected-color-preview" style={{ backgroundColor: color }} /><code>{color}</code><button type="button" onClick={() => removeDraftColor(color)} aria-label={`حذف رنگ ${color}`} title="حذف رنگ">×</button></div>) : <p className="products-admin-no-colors">هنوز رنگی انتخاب نشده است.</p>}</div>
                  <textarea className="products-admin-colors-textarea" rows="4" value={draft.colorsText} onChange={(event) => setDraftField('colorsText', event.target.value)} placeholder={'#ffffff\n#ff6b1a'} dir="ltr" />
                </div>

                <label className="products-admin-checkbox"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraftField('featured', event.target.checked)} /><span>نمایش نشان پرفروش روی کارت</span></label>
                <label className="products-admin-checkbox"><input type="checkbox" checked={draft.active} onChange={(event) => setDraftField('active', event.target.checked)} /><span>محصول فعال و قابل نمایش باشد</span></label>
              </div>
            </div>
            <footer><button type="button" className="secondary" onClick={closeModal}>انصراف</button><button type="submit" className="primary"><Save size={16} /> ذخیره محصول</button></footer>
          </form>
        </div>
      )}
    </div>
  )
}

export default ProductsAdmin
