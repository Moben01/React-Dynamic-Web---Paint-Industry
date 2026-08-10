import { loadProductsData } from '../data/productsStore'
import { loadProjectsData } from '../data/projectsStore'
import { getHeroContent, getSlides } from '../data/dashboardSlides'
import { localizedText } from '../i18n/localizedContent'

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

function collectStrings(value, bucket = []) {
  if (value == null) return bucket

  if (typeof value === 'string' || typeof value === 'number') {
    const text = String(value).trim()
    if (text) bucket.push(text)
    return bucket
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, bucket))
    return bucket
  }

  if (typeof value === 'object') {
    Object.values(value).forEach((item) => collectStrings(item, bucket))
  }

  return bucket
}

function searchableText(...values) {
  return normalizeSearchText(
    values.flatMap((value) => collectStrings(value, [])).join(' '),
  )
}

function scoreMatch(haystack, query) {
  if (!haystack || !query) return 0
  if (haystack === query) return 100
  if (haystack.startsWith(query)) return 80
  if (haystack.includes(` ${query}`)) return 65
  if (haystack.includes(query)) return 50

  const terms = query.split(' ').filter(Boolean)
  if (terms.length > 1 && terms.every((term) => haystack.includes(term))) {
    return 35
  }

  return 0
}

export function searchSite(rawQuery, language = 'fa', t = (_key, fallback) => fallback) {
  const query = normalizeSearchText(rawQuery)
  if (!query) return []

  const productsData = loadProductsData()
  const projectsData = loadProjectsData()
  const hero = getHeroContent()
  const slides = getSlides()

  const results = []

  const push = (result, sourceValues) => {
    const haystack = searchableText(...sourceValues)
    const score = scoreMatch(haystack, query)
    if (!score) return
    results.push({ ...result, score })
  }

  productsData.products
    .filter((item) => item.active !== false)
    .forEach((product) => {
      push(
        {
          id: `product:${product.id}`,
          type: 'product',
          entityId: product.id,
          title: localizedText(product.name, language),
          description: localizedText(product.description, language),
          image: product.image || product.images?.[0] || '',
          path: `/products/${encodeURIComponent(product.id)}`,
          label: t('header.products', 'محصولات'),
        },
        [
          product.name,
          product.description,
          product.categoryLabel,
          product.finish,
          product.coverage,
          product.sizes,
        ],
      )
    })

  productsData.categories
    .filter((item) => item.active !== false)
    .forEach((category) => {
      push(
        {
          id: `category:${category.id}`,
          type: 'category',
          title: localizedText(category.label, language),
          description: localizedText(category.description, language),
          image: category.image || '',
          path: `/products?category=${encodeURIComponent(category.id)}`,
          label: t('dashboard.categoryTitle', 'کتگوری'),
        },
        [category.label, category.description],
      )
    })

  projectsData.projects
    .filter((item) => item.active !== false)
    .forEach((project) => {
      push(
        {
          id: `project:${project.id}`,
          type: 'project',
          entityId: project.id,
          title: localizedText(project.title, language),
          description: localizedText(project.description, language),
          image: project.image || project.images?.[0] || '',
          path: `/projects/${encodeURIComponent(project.id)}`,
          label: t('header.projects', 'پروژه‌ها'),
        },
        [
          project.title,
          project.description,
          project.categoryLabel,
          project.location,
          project.client,
          project.status,
          project.year,
        ],
      )
    })

  slides
    .filter((item) => item.active !== false)
    .forEach((slide) => {
      push(
        {
          id: `slide:${slide.id}`,
          type: 'slide',
          title: localizedText(slide.title, language),
          description: localizedText(slide.subtitle, language),
          image: slide.image || '',
          path: '/',
          label: t('header.home', 'صفحه اصلی'),
        },
        [slide.title, slide.subtitle, slide.badge, slide.alt],
      )
    })

  const pageItems = [
    {
      id: 'page:home',
      title: t('header.home', 'صفحه اصلی'),
      path: '/',
      terms: ['صفحه اصلی', 'خانه', 'کورپاڼه', 'Home'],
    },
    {
      id: 'page:products',
      title: t('header.products', 'محصولات'),
      path: '/products',
      terms: ['محصولات', 'رنگ', 'محصول', 'Products', 'Paint', 'محصولات'],
    },
    {
      id: 'page:projects',
      title: t('header.projects', 'پروژه‌ها'),
      path: '/projects',
      terms: ['پروژه‌ها', 'پروژه', 'پروژې', 'Projects', 'Project'],
    },
    {
      id: 'page:about',
      title: t('header.about', 'درباره ما'),
      path: '/about',
      terms: ['درباره ما', 'زموږ په اړه', 'About us', 'About'],
    },
    {
      id: 'page:contact',
      title: t('header.contact', 'تماس'),
      path: '/contact',
      terms: ['تماس', 'اړیکه', 'Contact', 'شماره', 'phone'],
    },
  ]

  pageItems.forEach((page) => {
    push(
      {
        ...page,
        type: 'page',
        description: '',
        image: '',
        label: t('header.searchTitle', 'جستجو در وب‌سایت'),
      },
      [page.title, page.terms],
    )
  })

  push(
    {
      id: 'dashboard:hero',
      type: 'page',
      title: localizedText(hero.titleBefore, language),
      description: localizedText(hero.description, language),
      image: '',
      path: '/',
      label: t('header.home', 'صفحه اصلی'),
    },
    [
      hero.eyebrow,
      hero.titleBefore,
      hero.titleHighlight,
      hero.changingPrefix,
      hero.rotatingWords,
      hero.description,
    ],
  )

  const unique = new Map()
  results
    .sort((a, b) => b.score - a.score)
    .forEach((item) => {
      if (!unique.has(item.id)) unique.set(item.id, item)
    })

  return [...unique.values()].slice(0, 12)
}
