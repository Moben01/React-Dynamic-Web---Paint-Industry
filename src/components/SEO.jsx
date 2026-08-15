import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

const SITE_NAME = 'شرکت رنگ سازی علیمی'
const SITE_NAME_EN = 'Alimi Paint Company'
const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')
const DEFAULT_DESCRIPTION =
  'شرکت رنگ سازی علیمی؛ تولید و عرضه رنگ های ساختمانی و صنعتی، اجرای پروژه های رنگ آمیزی و همکاری با نمایندگی ها در افغانستان.'
const DEFAULT_DESCRIPTION_EN =
  'Alimi Paint Company provides architectural and industrial paints, painting projects, and agency partnerships in Afghanistan.'
const DEFAULT_KEYWORDS = [
  'رنگ سازی علیمی',
  'شرکت رنگ سازی علیمی',
  'رنگ ساختمانی',
  'رنگ صنعتی',
  'رنگ در افغانستان',
  'فروش رنگ',
  'نمایندگی رنگ',
  'Alimi Paint',
  'paint company Afghanistan',
]

const seoPages = {
  '/': {
    title: SITE_NAME,
    titleEn: SITE_NAME_EN,
    description: DEFAULT_DESCRIPTION,
    descriptionEn: DEFAULT_DESCRIPTION_EN,
  },
  '/home': {
    title: SITE_NAME,
    titleEn: SITE_NAME_EN,
    description: DEFAULT_DESCRIPTION,
    descriptionEn: DEFAULT_DESCRIPTION_EN,
  },
  '/products': {
    title: `محصولات رنگ | ${SITE_NAME}`,
    titleEn: `Paint Products | ${SITE_NAME_EN}`,
    description: 'مشاهده محصولات رنگ ساختمانی و صنعتی شرکت رنگ سازی علیمی برای خانه، پروژه و صنعت.',
    descriptionEn: 'Explore Alimi Paint architectural and industrial paint products for homes, projects, and industry.',
  },
  '/projects': {
    title: `پروژه ها | ${SITE_NAME}`,
    titleEn: `Projects | ${SITE_NAME_EN}`,
    description: 'نمونه پروژه های اجرا شده و خدمات رنگ آمیزی شرکت رنگ سازی علیمی.',
    descriptionEn: 'View completed painting projects and services by Alimi Paint Company.',
  },
  '/agencies': {
    title: `نمایندگی ها | ${SITE_NAME}`,
    titleEn: `Agencies | ${SITE_NAME_EN}`,
    description: 'لیست نمایندگی های شرکت رنگ سازی علیمی و راه های ارتباط با نمایندگی ها.',
    descriptionEn: 'Find Alimi Paint agencies and contact details for sales and cooperation.',
  },
  '/about': {
    title: `درباره ما | ${SITE_NAME}`,
    titleEn: `About Us | ${SITE_NAME_EN}`,
    description: 'درباره شرکت رنگ سازی علیمی، تجربه، ارزش ها و مسیر فعالیت در صنعت رنگ.',
    descriptionEn: 'Learn about Alimi Paint Company, its experience, values, and paint industry work.',
  },
  '/contact': {
    title: `تماس با ما | ${SITE_NAME}`,
    titleEn: `Contact | ${SITE_NAME_EN}`,
    description: 'راه های تماس با شرکت رنگ سازی علیمی برای خرید، مشوره، پروژه و همکاری.',
    descriptionEn: 'Contact Alimi Paint Company for sales, consultation, projects, and partnerships.',
  },
}

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

function upsertJsonLd(id, data) {
  let element = document.getElementById(id)
  if (!element) {
    element = document.createElement('script')
    element.id = id
    element.type = 'application/ld+json'
    document.head.appendChild(element)
  }
  element.textContent = JSON.stringify(data)
}

function normalizePublicPath(pathname) {
  if (pathname.startsWith('/admin')) return '/admin'
  if (pathname.startsWith('/products/')) return '/products'
  if (pathname.startsWith('/projects/')) return '/projects'
  if (pathname.startsWith('/agencies/')) return '/agencies'
  return pathname || '/'
}

function SEO() {
  const location = useLocation()
  const { language } = useLanguage()

  const meta = useMemo(() => {
    const normalizedPath = normalizePublicPath(location.pathname)
    const page = seoPages[normalizedPath] || seoPages['/']
    const isEnglish = language === 'en'
    const isAdmin = normalizedPath === '/admin'
    const title = isAdmin
      ? `مدیریت سایت | ${SITE_NAME}`
      : isEnglish
        ? page.titleEn
        : page.title
    const description = isEnglish ? page.descriptionEn : page.description
    const canonicalPath = normalizedPath === '/home' ? '/' : normalizedPath
    const url = `${SITE_URL}${canonicalPath}`

    return {
      title,
      description,
      url,
      isAdmin,
    }
  }, [language, location.pathname])

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : language === 'ps' ? 'ps' : 'fa'
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl'
    document.title = meta.title

    upsertMeta('meta[name="description"]', { name: 'description', content: meta.description })
    upsertMeta('meta[name="keywords"]', { name: 'keywords', content: DEFAULT_KEYWORDS.join(', ') })
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: meta.isAdmin ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    })
    upsertMeta('meta[name="author"]', { name: 'author', content: SITE_NAME_EN })
    upsertMeta('meta[name="language"]', { name: 'language', content: language })

    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: meta.title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: meta.description })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: meta.url })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: `${SITE_URL}/iso.jpeg` })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.title })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.description })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: `${SITE_URL}/iso.jpeg` })

    upsertLink('canonical', meta.url)

    upsertJsonLd('alimi-local-business-schema', {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: SITE_NAME,
      alternateName: SITE_NAME_EN,
      url: SITE_URL,
      image: `${SITE_URL}/iso.jpeg`,
      description: DEFAULT_DESCRIPTION,
      areaServed: 'Afghanistan',
      sameAs: [],
      makesOffer: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'رنگ ساختمانی و صنعتی',
          },
        },
      ],
    })
  }, [language, meta])

  return null
}

export default SEO
