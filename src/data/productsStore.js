export const PRODUCTS_STORAGE_KEY = 'alimi-products-data-v1'
export const PRODUCTS_CHANGED_EVENT = 'alimi-products-data-changed'

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

const defaultCategoryDescriptions = {
  interior: 'رنگ‌های زیبا برای فضای داخلی',
  exterior: 'مقاوم برای نمای بیرونی ساختمان',
  industrial: 'پوشش حرفه‌ای برای صنعت و فلز',
  protective: 'محافظت بیشتر از سطح و رنگ',
}

export const defaultProductsData = {
  hero: {
    kicker: 'مجموعه محصولات علیمی',
    titleBefore: 'رنگ مناسب برای',
    titleHighlight: 'هر فضا',
    description:
      'از رنگ‌های داخلی و نمای بیرونی تا پوشش‌های صنعتی و محافظتی؛ محصولی را انتخاب کنید که زیبایی، دوام و کیفیت را هم‌زمان ارائه می‌کند.',
    stats: [
      { id: 'stat-1', value: '۵۰+', label: 'محصول تخصصی' },
      { id: 'stat-2', value: '۱۲۰+', label: 'ترکیب رنگی' },
      { id: 'stat-3', value: '۱۲ سال', label: 'تجربه تولید' },
    ],
    featuredProductId: 1,
    featuredBadge: 'انتخاب ویژه',
    backgroundWord: 'ALEMI',
  },

  catalog: {
    kicker: 'کاتالوگ محصولات',
    title: 'محصول مناسب خود را پیدا کنید',
    searchPlaceholder: 'جستجو در محصولات...',
    emptyTitle: 'محصولی پیدا نشد',
    emptyDescription: 'عبارت جستجو یا دسته‌بندی را تغییر دهید.',
  },

  categories: [
    {
      id: 'interior',
      label: 'رنگ‌های داخلی',
      description: defaultCategoryDescriptions.interior,
      image: defaultCategoryImages.interior,
      active: true,
      order: 1,
    },
    {
      id: 'exterior',
      label: 'رنگ‌های نمای بیرونی',
      description: defaultCategoryDescriptions.exterior,
      image: defaultCategoryImages.exterior,
      active: true,
      order: 2,
    },
    {
      id: 'industrial',
      label: 'رنگ‌های صنعتی',
      description: defaultCategoryDescriptions.industrial,
      image: defaultCategoryImages.industrial,
      active: true,
      order: 3,
    },
    {
      id: 'protective',
      label: 'پوشش‌های محافظتی',
      description: defaultCategoryDescriptions.protective,
      image: defaultCategoryImages.protective,
      active: true,
      order: 4,
    },
  ],

  products: [
    {
      id: 1,
      name: 'رنگ پلاستیک ممتاز علیمی',
      category: 'interior',
      categoryLabel: 'رنگ‌های داخلی',
      description: 'پوشش نرم، مات و یک‌دست برای دیوارهای داخلی با اجرای آسان.',
      sizes: ['۴ کیلو', '۱۲ کیلو', '۲۰ کیلو'],
      finish: 'مات مخملی',
      coverage: '۹ تا ۱۱ متر مربع',
      image:
        'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&auto=format&fit=crop&q=85',
      colors: ['#f5f1e8', '#d8c6aa', '#cfa184', '#9e765e'],
      featured: true,
      active: true,
      order: 1,
    },
    {
      id: 2,
      name: 'رنگ روغنی براق حرفه‌ای',
      category: 'interior',
      categoryLabel: 'رنگ‌های داخلی',
      description: 'مقاوم در برابر شست‌وشو، مناسب دروازه، پنجره و سطوح داخلی.',
      sizes: ['۱ کیلو', '۴ کیلو', '۲۰ کیلو'],
      finish: 'براق',
      coverage: '۱۰ تا ۱۲ متر مربع',
      image:
        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&auto=format&fit=crop&q=85',
      colors: ['#ffffff', '#c8d7e8', '#7d9db5', '#2f5268'],
      featured: false,
      active: true,
      order: 2,
    },
    {
      id: 3,
      name: 'رنگ اکریلیک نمای ساختمان',
      category: 'exterior',
      categoryLabel: 'رنگ‌های نمای بیرونی',
      description: 'مقاوم در برابر آفتاب، باران و تغییرات شدید آب‌وهوایی.',
      sizes: ['۱۲ کیلو', '۲۰ کیلو'],
      finish: 'نیمه‌مات',
      coverage: '۸ تا ۱۰ متر مربع',
      image:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=85',
      colors: ['#ece6da', '#d9b483', '#b9784d', '#6c4938'],
      featured: true,
      active: true,
      order: 3,
    },
    {
      id: 4,
      name: 'پوشش ضد آب بام و دیوار',
      category: 'exterior',
      categoryLabel: 'رنگ‌های نمای بیرونی',
      description: 'لایه محافظ انعطاف‌پذیر برای جلوگیری از نفوذ آب و رطوبت.',
      sizes: ['۵ کیلو', '۱۰ کیلو', '۲۰ کیلو'],
      finish: 'محافظتی',
      coverage: '۶ تا ۸ متر مربع',
      image:
        'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=1200&auto=format&fit=crop&q=85',
      colors: ['#f0f5f7', '#aacbd7', '#4d899e', '#174f65'],
      featured: false,
      active: true,
      order: 4,
    },
    {
      id: 5,
      name: 'رنگ صنعتی ضد زنگ فلز',
      category: 'industrial',
      categoryLabel: 'رنگ‌های صنعتی',
      description: 'فرمول مقاوم برای ماشین‌آلات، اسکلت فلزی و محیط‌های صنعتی.',
      sizes: ['۴ کیلو', '۲۰ کیلو'],
      finish: 'صنعتی',
      coverage: '۷ تا ۹ متر مربع',
      image:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=85',
      colors: ['#d8d9d5', '#a8a79f', '#6e706c', '#373a3b'],
      featured: true,
      active: true,
      order: 5,
    },
    {
      id: 6,
      name: 'پرایمر نفوذی علیمی',
      category: 'protective',
      categoryLabel: 'پوشش‌های محافظتی',
      description: 'آماده‌سازی حرفه‌ای سطح و افزایش دوام لایه نهایی رنگ.',
      sizes: ['۴ لیتر', '۱۰ لیتر', '۲۰ لیتر'],
      finish: 'زیرکار',
      coverage: '۱۰ تا ۱۴ متر مربع',
      image:
        'https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?w=1200&auto=format&fit=crop&q=85',
      colors: ['#f7f3ea', '#e7ddd0', '#cbbda9', '#9d8c79'],
      featured: false,
      active: true,
      order: 6,
    },
  ],
}

const clone = (value) => JSON.parse(JSON.stringify(value))

function normalizeCategories(savedCategories) {
  const source = Array.isArray(savedCategories)
    ? savedCategories.filter((item) => item && item.id !== 'all')
    : clone(defaultProductsData.categories)

  return source.map((category, index) => {
    const fallback = defaultProductsData.categories.find(
      (item) => item.id === category.id,
    )

    return {
      id: String(category.id || `category-${Date.now()}-${index}`),
      label: String(category.label || fallback?.label || 'کتگوری بدون نام'),
      description: String(
        category.description ||
          fallback?.description ||
          defaultCategoryDescriptions[category.id] ||
          '',
      ).slice(0, 30),
      image: String(
        category.image ||
          fallback?.image ||
          defaultCategoryImages[category.id] ||
          '',
      ),
      active: category.active !== false,
      order: Number(category.order ?? fallback?.order ?? index + 1),
    }
  })
}


function normalizeProducts(savedProducts) {
  const source = Array.isArray(savedProducts)
    ? savedProducts
    : clone(defaultProductsData.products)

  return source.map((product, index) => {
    const fallback = defaultProductsData.products.find(
      (item) => String(item.id) === String(product?.id),
    )

    const legacyImage = String(product?.image || fallback?.image || '')
    const images = Array.isArray(product?.images)
      ? product.images.filter(Boolean).map(String)
      : []

    const normalizedImages = images.length
      ? images
      : legacyImage
        ? [legacyImage]
        : []

    return {
      ...(fallback || {}),
      ...(product || {}),
      image: normalizedImages[0] || legacyImage,
      images: normalizedImages,
      colors: Array.isArray(product?.colors)
        ? product.colors
        : Array.isArray(fallback?.colors)
          ? fallback.colors
          : [],
      sizes: Array.isArray(product?.sizes)
        ? product.sizes
        : Array.isArray(fallback?.sizes)
          ? fallback.sizes
          : [],
      active: product?.active !== false,
      order: Number(product?.order ?? fallback?.order ?? index + 1),
    }
  })
}

export function loadProductsData() {
  try {
    const saved = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY) || 'null')

    if (!saved || typeof saved !== 'object') {
      const initial = clone(defaultProductsData)
      initial.products = normalizeProducts(initial.products)
      return initial
    }

    return {
      ...clone(defaultProductsData),
      ...saved,
      hero: {
        ...clone(defaultProductsData.hero),
        ...(saved.hero || {}),
      },
      catalog: {
        ...clone(defaultProductsData.catalog),
        ...(saved.catalog || {}),
      },
      categories: normalizeCategories(saved.categories),
      products: normalizeProducts(saved.products),
    }
  } catch {
    const fallback = clone(defaultProductsData)
    fallback.products = normalizeProducts(fallback.products)
    return fallback
  }
}

export function saveProductsData(data) {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(data))

  window.dispatchEvent(
    new CustomEvent(PRODUCTS_CHANGED_EVENT, {
      detail: data,
    }),
  )

  return data
}

export function resetProductsData() {
  const data = clone(defaultProductsData)
  saveProductsData(data)
  return data
}
