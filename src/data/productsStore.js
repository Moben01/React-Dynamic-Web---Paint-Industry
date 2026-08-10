import {
  createLocalizedValue,
  normalizeLocalizedValue,
} from '../i18n/localizedContent'

export const PRODUCTS_STORAGE_KEY = 'alimi-products-data-v1'
export const PRODUCTS_CHANGED_EVENT = 'alimi-products-data-changed'

const L = (fa = '', ps = '', en = '') => createLocalizedValue(fa, ps, en)

const defaultCategoryImages = {
  interior:
    'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1000&auto=format&fit=crop&q=85',
  exterior:
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=85',
  industrial:
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=85',
  protective:
    'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=1000&auto=format&fit=crop&q=85',
}

export const defaultProductsData = {
  hero: {
    kicker: L('مجموعه محصولات علیمی', 'د علیمي د محصولاتو مجموعه', 'Alimi Product Collection'),
    titleBefore: L('رنگ مناسب برای', 'مناسب رنګ د', 'The right paint for'),
    titleHighlight: L('هر فضا', 'هر ځای لپاره', 'every space'),
    description: L(
      'از رنگ‌های داخلی و نمای بیرونی تا پوشش‌های صنعتی و محافظتی؛ محصولی را انتخاب کنید که زیبایی، دوام و کیفیت را هم‌زمان ارائه می‌کند.',
      'له داخلي او بهرنيو رنګونو څخه تر صنعتي او محافظتي پوښښونو پورې؛ داسې محصول وټاکئ چې ښکلا، دوام او کیفیت یوځای وړاندې کړي.',
      'From interior and exterior paints to industrial and protective coatings, choose a product that delivers beauty, durability, and quality together.',
    ),
    stats: [
      { id: 'stat-1', value: '۵۰+', label: L('محصول تخصصی', 'تخصصي محصولات', 'specialized products') },
      { id: 'stat-2', value: '۱۲۰+', label: L('ترکیب رنگی', 'د رنګ ترکیبونه', 'color combinations') },
      { id: 'stat-3', value: '۱۲ سال', label: L('تجربه تولید', 'د تولید تجربه', 'years of production') },
    ],
    featuredProductId: 1,
    featuredBadge: L('انتخاب ویژه', 'ځانګړی انتخاب', 'Featured choice'),
    backgroundWord: 'ALIMI',
  },

  catalog: {
    kicker: L('کاتالوگ محصولات', 'د محصولاتو کتلاګ', 'Product catalog'),
    title: L('محصول مناسب خود را پیدا کنید', 'خپل مناسب محصول پیدا کړئ', 'Find the right product for you'),
    searchPlaceholder: L('جستجو در محصولات...', 'په محصولاتو کې لټون...', 'Search products...'),
    emptyTitle: L('محصولی پیدا نشد', 'محصول ونه موندل شو', 'No product found'),
    emptyDescription: L('عبارت جستجو یا دسته‌بندی را تغییر دهید.', 'د لټون عبارت یا کټګوري بدله کړئ.', 'Change the search phrase or category.'),
  },

  categories: [
    {
      id: 'interior',
      label: L('رنگ‌های داخلی', 'داخلي رنګونه', 'Interior paints'),
      description: L('رنگ‌های زیبا برای فضای داخلی', 'د کور دننه لپاره ښکلي رنګونه', 'Beautiful colors for interior spaces'),
      image: defaultCategoryImages.interior,
      active: true,
      order: 1,
    },
    {
      id: 'exterior',
      label: L('رنگ‌های نمای بیرونی', 'د ودانۍ بهرني رنګونه', 'Exterior paints'),
      description: L('مقاوم برای نمای بیرونی ساختمان', 'د ودانۍ د بهر لپاره مقاوم', 'Durable for building exteriors'),
      image: defaultCategoryImages.exterior,
      active: true,
      order: 2,
    },
    {
      id: 'industrial',
      label: L('رنگ‌های صنعتی', 'صنعتي رنګونه', 'Industrial paints'),
      description: L('پوشش حرفه‌ای برای صنعت و فلز', 'د صنعت او فلز لپاره مسلکي پوښښ', 'Professional coating for industry and metal'),
      image: defaultCategoryImages.industrial,
      active: true,
      order: 3,
    },
    {
      id: 'protective',
      label: L('پوشش‌های محافظتی', 'محافظتي پوښښونه', 'Protective coatings'),
      description: L('محافظت بیشتر از سطح و رنگ', 'د سطحې او رنګ لا ښه ساتنه', 'Extra protection for surfaces and paint'),
      image: defaultCategoryImages.protective,
      active: true,
      order: 4,
    },
  ],

  products: [
    {
      id: 1,
      name: L('رنگ پلاستیک ممتاز علیمی', 'د علیمي ممتاز پلاستیک رنګ', 'Alimi Premium Plastic Paint'),
      category: 'interior',
      description: L('پوشش نرم، مات و یک‌دست برای دیوارهای داخلی با اجرای آسان.', 'د داخلي دیوالونو لپاره نرم، مات او یوشان پوښښ چې اسانه تطبیقېږي.', 'A smooth, matte and even finish for interior walls with easy application.'),
      sizes: [L('۴ کیلو', '۴ کیلو', '4 kg'), L('۱۲ کیلو', '۱۲ کیلو', '12 kg'), L('۲۰ کیلو', '۲۰ کیلو', '20 kg')],
      finish: L('مات مخملی', 'مخملی مات', 'Velvet matte'),
      coverage: L('۹ تا ۱۱ متر مربع', '۹ تر ۱۱ متر مربع', '9–11 m²'),
      image: defaultCategoryImages.interior,
      images: [defaultCategoryImages.interior],
      colors: ['#f5f1e8', '#d8c6aa', '#cfa184', '#9e765e'],
      featured: true,
      active: true,
      order: 1,
    },
    {
      id: 2,
      name: L('رنگ روغنی براق حرفه‌ای', 'مسلکي ځلېدونکی تېلي رنګ', 'Professional Gloss Oil Paint'),
      category: 'interior',
      description: L('مقاوم در برابر شست‌وشو، مناسب دروازه، پنجره و سطوح داخلی.', 'د مینځلو پر وړاندې مقاوم، د دروازو، کړکیو او داخلي سطحو لپاره مناسب.', 'Wash-resistant and suitable for doors, windows, and interior surfaces.'),
      sizes: [L('۱ کیلو', '۱ کیلو', '1 kg'), L('۴ کیلو', '۴ کیلو', '4 kg'), L('۲۰ کیلو', '۲۰ کیلو', '20 kg')],
      finish: L('براق', 'ځلېدونکی', 'Gloss'),
      coverage: L('۱۰ تا ۱۲ متر مربع', '۱۰ تر ۱۲ متر مربع', '10–12 m²'),
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&auto=format&fit=crop&q=85',
      images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&auto=format&fit=crop&q=85'],
      colors: ['#ffffff', '#c8d7e8', '#7d9db5', '#2f5268'],
      featured: false,
      active: true,
      order: 2,
    },
    {
      id: 3,
      name: L('رنگ اکریلیک نمای ساختمان', 'د ودانۍ اکریلیک بهرنی رنګ', 'Exterior Acrylic Paint'),
      category: 'exterior',
      description: L('مقاوم در برابر آفتاب، باران و تغییرات شدید آب‌وهوایی.', 'د لمر، باران او سختو هوايي بدلونونو پر وړاندې مقاوم.', 'Resistant to sun, rain, and severe weather changes.'),
      sizes: [L('۱۲ کیلو', '۱۲ کیلو', '12 kg'), L('۲۰ کیلو', '۲۰ کیلو', '20 kg')],
      finish: L('نیمه‌مات', 'نیمه مات', 'Semi-matte'),
      coverage: L('۸ تا ۱۰ متر مربع', '۸ تر ۱۰ متر مربع', '8–10 m²'),
      image: defaultCategoryImages.exterior,
      images: [defaultCategoryImages.exterior],
      colors: ['#ece6da', '#d9b483', '#b9784d', '#6c4938'],
      featured: true,
      active: true,
      order: 3,
    },
    {
      id: 4,
      name: L('پوشش ضد آب بام و دیوار', 'د بام او دیوال ضد اوبو پوښښ', 'Waterproof Roof & Wall Coating'),
      category: 'exterior',
      description: L('لایه محافظ انعطاف‌پذیر برای جلوگیری از نفوذ آب و رطوبت.', 'انعطاف منونکی محافظتي پوښښ چې د اوبو او رطوبت د ننوتلو مخه نیسي.', 'A flexible protective layer that prevents water and moisture penetration.'),
      sizes: [L('۵ کیلو', '۵ کیلو', '5 kg'), L('۱۰ کیلو', '۱۰ کیلو', '10 kg'), L('۲۰ کیلو', '۲۰ کیلو', '20 kg')],
      finish: L('محافظتی', 'محافظتي', 'Protective'),
      coverage: L('۶ تا ۸ متر مربع', '۶ تر ۸ متر مربع', '6–8 m²'),
      image: defaultCategoryImages.protective,
      images: [defaultCategoryImages.protective],
      colors: ['#f0f5f7', '#aacbd7', '#4d899e', '#174f65'],
      featured: false,
      active: true,
      order: 4,
    },
    {
      id: 5,
      name: L('رنگ صنعتی ضد زنگ فلز', 'د فلز ضد زنګ صنعتي رنګ', 'Industrial Anti-Rust Metal Paint'),
      category: 'industrial',
      description: L('فرمول مقاوم برای ماشین‌آلات، اسکلت فلزی و محیط‌های صنعتی.', 'د ماشین آلاتو، فلزي جوړښتونو او صنعتي چاپېریالونو لپاره مقاوم فورمول.', 'A durable formula for machinery, steel structures, and industrial environments.'),
      sizes: [L('۴ کیلو', '۴ کیلو', '4 kg'), L('۲۰ کیلو', '۲۰ کیلو', '20 kg')],
      finish: L('صنعتی', 'صنعتي', 'Industrial'),
      coverage: L('۷ تا ۹ متر مربع', '۷ تر ۹ متر مربع', '7–9 m²'),
      image: defaultCategoryImages.industrial,
      images: [defaultCategoryImages.industrial],
      colors: ['#d8d9d5', '#a8a79f', '#6e706c', '#373a3b'],
      featured: true,
      active: true,
      order: 5,
    },
    {
      id: 6,
      name: L('پرایمر نفوذی علیمی', 'د علیمي نفوذي پرایمر', 'Alimi Penetrating Primer'),
      category: 'protective',
      description: L('آماده‌سازی حرفه‌ای سطح و افزایش دوام لایه نهایی رنگ.', 'د سطحې مسلکي چمتووالی او د وروستي رنګ د طبقې د دوام زیاتوالی.', 'Professional surface preparation that improves the durability of the final coat.'),
      sizes: [L('۴ لیتر', '۴ لیتر', '4 L'), L('۱۰ لیتر', '۱۰ لیتر', '10 L'), L('۲۰ لیتر', '۲۰ لیتر', '20 L')],
      finish: L('زیرکار', 'پرایمر', 'Primer'),
      coverage: L('۱۰ تا ۱۴ متر مربع', '۱۰ تر ۱۴ متر مربع', '10–14 m²'),
      image: defaultCategoryImages.protective,
      images: [defaultCategoryImages.protective],
      colors: ['#f7f3ea', '#e7ddd0', '#cbbda9', '#9d8c79'],
      featured: false,
      active: true,
      order: 6,
    },
  ],
}

const clone = (value) => JSON.parse(JSON.stringify(value))
const localize = (value) => normalizeLocalizedValue(value, 'fa')

function normalizeLocalizedList(value, fallback = []) {
  const source = Array.isArray(value) ? value : Array.isArray(fallback) ? fallback : []
  return source.map((item) => localize(item))
}

function normalizeHero(hero = {}) {
  const fallback = defaultProductsData.hero
  const savedStats = Array.isArray(hero.stats) ? hero.stats : fallback.stats
  return {
    ...clone(fallback),
    ...hero,
    kicker: localize(hero.kicker ?? fallback.kicker),
    titleBefore: localize(hero.titleBefore ?? fallback.titleBefore),
    titleHighlight: localize(hero.titleHighlight ?? fallback.titleHighlight),
    description: localize(hero.description ?? fallback.description),
    featuredBadge: localize(hero.featuredBadge ?? fallback.featuredBadge),
    backgroundWord: String(hero.backgroundWord ?? fallback.backgroundWord),
    stats: savedStats.map((stat, index) => ({
      id: stat?.id || fallback.stats[index]?.id || `stat-${index + 1}`,
      value: String(stat?.value ?? fallback.stats[index]?.value ?? ''),
      label: localize(stat?.label ?? fallback.stats[index]?.label ?? ''),
    })),
  }
}

function normalizeCatalog(catalog = {}) {
  const fallback = defaultProductsData.catalog
  return {
    ...clone(fallback),
    ...catalog,
    kicker: localize(catalog.kicker ?? fallback.kicker),
    title: localize(catalog.title ?? fallback.title),
    searchPlaceholder: localize(catalog.searchPlaceholder ?? fallback.searchPlaceholder),
    emptyTitle: localize(catalog.emptyTitle ?? fallback.emptyTitle),
    emptyDescription: localize(catalog.emptyDescription ?? fallback.emptyDescription),
  }
}

function normalizeCategories(savedCategories) {
  const source = Array.isArray(savedCategories)
    ? savedCategories.filter((item) => item && item.id !== 'all')
    : clone(defaultProductsData.categories)

  return source.map((category, index) => {
    const fallback = defaultProductsData.categories.find((item) => item.id === category.id)
    return {
      id: String(category.id || `category-${Date.now()}-${index}`),
      label: localize(category.label ?? fallback?.label ?? 'کتگوری بدون نام'),
      description: localize(category.description ?? fallback?.description ?? ''),
      image: String(category.image || fallback?.image || defaultCategoryImages[category.id] || ''),
      active: category.active !== false,
      order: Number(category.order ?? fallback?.order ?? index + 1),
    }
  })
}

function normalizeProducts(savedProducts, categories = []) {
  const source = Array.isArray(savedProducts) ? savedProducts : clone(defaultProductsData.products)

  return source.map((product, index) => {
    const fallback = defaultProductsData.products.find((item) => String(item.id) === String(product?.id))
    const legacyImage = String(product?.image || fallback?.image || '')
    const rawImages = Array.isArray(product?.images) ? product.images.filter(Boolean).map(String) : []
    const images = rawImages.length ? rawImages : legacyImage ? [legacyImage] : []
    const category = categories.find((item) => String(item.id) === String(product?.category))

    return {
      ...(fallback || {}),
      ...(product || {}),
      id: product?.id ?? fallback?.id ?? Date.now() + index,
      name: localize(product?.name ?? fallback?.name ?? ''),
      category: String(product?.category ?? fallback?.category ?? categories[0]?.id ?? ''),
      categoryLabel: localize(product?.categoryLabel ?? category?.label ?? fallback?.categoryLabel ?? ''),
      description: localize(product?.description ?? fallback?.description ?? ''),
      finish: localize(product?.finish ?? fallback?.finish ?? ''),
      coverage: localize(product?.coverage ?? fallback?.coverage ?? ''),
      sizes: normalizeLocalizedList(product?.sizes, fallback?.sizes),
      image: images[0] || legacyImage,
      images,
      colors: Array.isArray(product?.colors)
        ? product.colors
        : Array.isArray(fallback?.colors)
          ? fallback.colors
          : [],
      featured: Boolean(product?.featured ?? fallback?.featured),
      active: product?.active !== false,
      order: Number(product?.order ?? fallback?.order ?? index + 1),
    }
  })
}

export function normalizeProductsData(data) {
  const source = data && typeof data === 'object' ? data : {}
  const categories = normalizeCategories(source.categories)
  return {
    ...clone(defaultProductsData),
    ...source,
    hero: normalizeHero(source.hero),
    catalog: normalizeCatalog(source.catalog),
    categories,
    products: normalizeProducts(source.products, categories),
  }
}

export function loadProductsData() {
  try {
    const saved = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY) || 'null')
    return normalizeProductsData(saved || clone(defaultProductsData))
  } catch {
    return normalizeProductsData(clone(defaultProductsData))
  }
}

export function saveProductsData(data) {
  const normalized = normalizeProductsData(data)
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(normalized))
  window.dispatchEvent(new CustomEvent(PRODUCTS_CHANGED_EVENT, { detail: normalized }))
  return normalized
}

export function resetProductsData() {
  return saveProductsData(clone(defaultProductsData))
}
