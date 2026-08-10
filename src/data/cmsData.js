import { hydrateRemoteSection, saveRemoteSection, resetRemoteSection } from './remoteStore'

const PREFIX = 'alimi-cms-v3'
export const CMS_EVENT = 'alimi-cms-updated'

const image = (url) => `${url}?auto=format&fit=crop&w=1400&q=86`

export const DEFAULT_CMS = {
  site: {
    companyName: 'شرکت رنگ‌سازی علیمی',
    shortName: 'علیمی',
    tagline: 'صنعت رنگ افغانستان',
    logo: '',
    phone: '+93 700 000 000',
    email: 'info@alimipaint.af',
    address: 'کابل، افغانستان',
    workingHours: 'شنبه تا پنج‌شنبه، ۸ صبح تا ۵ عصر',
    language: 'fa',
  },
  dashboard: {
    eyebrow: 'تجربه‌ای تازه از صنعت رنگ',
    title: 'تولید رنگ',
    highlight: 'عبدالله عالمی',
    rotatingPrefix: 'ما رنگ می‌سازیم برای',
    rotatingWords: ['زیبایی', 'کیفیت', 'دوام', 'آرامش'],
    description: 'تولیدکننده رنگ‌های ساختمانی و صنعتی با کیفیت پایدار، فرمولاسیون حرفه‌ای و رنگ‌بندی مناسب برای هر نوع فضا.',
    primaryText: 'مشاهده محصولات',
    primaryLink: '/products',
    secondaryText: 'درباره شرکت',
    secondaryLink: '/about',
    projectsEyebrow: 'آرشیف پروژه‌ها',
    projectsTitle: 'پروژه‌هایی که',
    projectsHighlight: 'با موفقیت تکمیل کرده‌ایم',
    projectsDescription: 'نمونه‌ای از پروژه‌های واقعی شرکت علیمی؛ دقیقاً همان پروژه‌هایی که در صفحه پروژه‌ها نمایش داده می‌شوند.',
  },
  slides: [
    { id: 'slide-1', title: 'رنگ ساختمانی علیمی', subtitle: 'پوشش زیبا و دوام بیشتر', badge: 'ALIMI PAINT', image: image('https://images.unsplash.com/photo-1579783928621-7a13d66a62d1'), objectPosition: 'center', active: true, order: 1 },
    { id: 'slide-2', title: 'رنگ‌های مدرن داخلی', subtitle: 'ترکیب آرامش و زیبایی برای خانه', badge: 'COLLECTION 2026', image: image('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0'), objectPosition: 'center', active: true, order: 2 },
    { id: 'slide-3', title: 'پوشش صنعتی مقاوم', subtitle: 'محافظت حرفه‌ای برای سطوح فلزی', badge: 'INDUSTRIAL', image: image('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab'), objectPosition: 'center', active: true, order: 3 },
  ],
  categories: [
    { id: 'interior', name: 'رنگ داخلی', description: 'رنگ‌های زیبا و قابل شست‌وشو برای فضای داخلی', icon: 'home', active: true, order: 1 },
    { id: 'exterior', name: 'نمای بیرونی', description: 'مقاوم در برابر آفتاب، باران و تغییرات آب‌وهوا', icon: 'building', active: true, order: 2 },
    { id: 'industrial', name: 'رنگ صنعتی', description: 'پوشش حرفه‌ای برای کارخانه و ماشین‌آلات', icon: 'factory', active: true, order: 3 },
    { id: 'protective', name: 'پوشش محافظتی', description: 'محافظت بیشتر در برابر رطوبت و فرسایش', icon: 'shield', active: true, order: 4 },
  ],
  productsPage: {
    eyebrow: 'مجموعه محصولات علیمی', title: 'رنگ مناسب برای', highlight: 'هر فضا', description: 'از رنگ‌های داخلی و نمای بیرونی تا پوشش‌های صنعتی و محافظتی؛ محصولی را انتخاب کنید که زیبایی، دوام و کیفیت را هم‌زمان ارائه کند.'
  },
  products: [
    { id: 'product-1', name: 'رنگ پلاستیک ممتاز علیمی', categoryId: 'interior', description: 'پوشش نرم، مات و یک‌دست برای دیوارهای داخلی با اجرای آسان.', sizes: ['۴ کیلو', '۱۲ کیلو', '۲۰ کیلو'], finish: 'مات مخملی', coverage: '۹ تا ۱۱ متر مربع', price: '۲٬۵۰۰ افغانی', image: image('https://images.unsplash.com/photo-1562259949-e8e7689d7828'), colors: ['#f5f1e8', '#d8c6aa', '#cfa184', '#9e765e'], featured: true, active: true, order: 1 },
    { id: 'product-2', name: 'رنگ اکریلیک نمای ساختمان', categoryId: 'exterior', description: 'مقاوم در برابر آفتاب، باران و تغییرات شدید آب‌وهوایی.', sizes: ['۱۲ کیلو', '۲۰ کیلو'], finish: 'نیمه‌مات', coverage: '۸ تا ۱۰ متر مربع', price: '۳٬۲۰۰ افغانی', image: image('https://images.unsplash.com/photo-1600585154340-be6161a56a0c'), colors: ['#ece6da', '#d9b483', '#b9784d', '#6c4938'], featured: true, active: true, order: 2 },
    { id: 'product-3', name: 'رنگ صنعتی ضد زنگ فلز', categoryId: 'industrial', description: 'فرمول مقاوم برای ماشین‌آلات، اسکلت فلزی و محیط‌های صنعتی.', sizes: ['۴ کیلو', '۲۰ کیلو'], finish: 'صنعتی', coverage: '۷ تا ۹ متر مربع', price: '۴٬۸۰۰ افغانی', image: image('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab'), colors: ['#d8d9d5', '#a8a79f', '#6e706c', '#373a3b'], featured: false, active: true, order: 3 },
    { id: 'product-4', name: 'پرایمر نفوذی علیمی', categoryId: 'protective', description: 'آماده‌سازی حرفه‌ای سطح و افزایش دوام لایه نهایی رنگ.', sizes: ['۴ لیتر', '۱۰ لیتر', '۲۰ لیتر'], finish: 'زیرکار', coverage: '۱۰ تا ۱۴ متر مربع', price: '۱٬۹۰۰ افغانی', image: image('https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f'), colors: ['#f7f3ea', '#e7ddd0', '#cbbda9', '#9d8c79'], featured: false, active: true, order: 4 },
  ],
  projectsPage: {
    eyebrow: 'پروژه‌های تکمیل‌شده شرکت علیمی', title: 'نتیجه‌ای که با', highlight: 'رنگ دیده می‌شود', description: 'مجموعه‌ای از پروژه‌های ساختمانی، صنعتی، تجارتی و دکوراتیف که با محصولات و تیم اجرایی شرکت علیمی تکمیل شده‌اند.'
  },
  projects: [
    { id: 'project-1', title: 'رنگ‌آمیزی مجتمع مسکونی آفتاب', category: 'exterior', categoryLabel: 'نمای بیرونی', location: 'کابل، افغانستان', year: '2026', status: 'تکمیل‌شده', client: 'گروپ ساختمانی آفتاب', area: '۱۲٬۵۰۰ متر مربع', description: 'اجرای کامل پوشش نمای بیرونی با رنگ‌های مقاوم در برابر آفتاب، باران و تغییرات شدید آب‌وهوا.', image: image('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3'), featured: true, active: true, order: 1 },
    { id: 'project-2', title: 'طراحی رنگ ویلای نارنجستان', category: 'interior', categoryLabel: 'فضای داخلی', location: 'هرات، افغانستان', year: '2026', status: 'تکمیل‌شده', client: 'شرکت نارنجستان', area: '۳٬۸۰۰ متر مربع', description: 'طراحی و اجرای پالت رنگی گرم برای فضای داخلی ویلا با تمرکز بر نور و آرامش.', image: image('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0'), featured: false, active: true, order: 2 },
  ],
  about: {
    eyebrow: 'درباره شرکت رنگ‌سازی علیمی', title: 'ما فقط رنگ تولید نمی‌کنیم،', highlight: 'هویت فضا را می‌سازیم.', description: 'علیمی یک شرکت فعال در صنعت رنگ افغانستان است که با تمرکز بر کیفیت، دوام، انتخاب رنگ و خدمات حرفه‌ای راه‌حل‌های قابل اعتماد ارائه می‌کند.', mainImage: image('https://images.unsplash.com/photo-1562259949-e8e7689d7828'), secondaryImage: image('https://images.unsplash.com/photo-1572297870735-d53e4b5fd772'), storyTitle: 'از یک ایده کوچک تا یک برند قابل اعتماد', story: 'هدف ما از آغاز، تولید رنگ‌هایی بوده است که با شرایط اقلیمی افغانستان سازگار باشند و در عین زیبایی، دوام بالایی ارائه کنند.', values: [
      { id: 'v1', title: 'کیفیت قابل اعتماد', description: 'کنترل کیفیت در تمام مراحل تولید.', icon: 'shield' },
      { id: 'v2', title: 'دقت در تولید', description: 'فرمولاسیون متناسب با نیاز بازار.', icon: 'target' },
      { id: 'v3', title: 'همراهی با مشتری', description: 'مشوره و پشتیبانی حرفه‌ای.', icon: 'heart' },
    ]
  },
  contact: {
    eyebrow: 'در ارتباط با شرکت رنگ‌سازی علیمی', title: 'برای مشوره، خرید یا اجرای پروژه', highlight: 'با ما صحبت کنید.', description: 'تیم ما آماده است تا برای انتخاب محصول، ترکیب رنگ، دریافت قیمت و اجرای پروژه‌ها به شما راهنمایی ارائه کند.', responseTitle: 'ما پاسخ می‌دهیم', responseSubtitle: 'سریع، واضح و حرفه‌ای'
  },
  reviews: [
    { id: 'review-1', productId: 'product-1', name: 'محمد احمدی', rating: 5, comment: 'پوشش بسیار خوب و رنگ یکنواخت داشت.', status: 'approved', createdAt: new Date().toISOString() }
  ],
  likes: { 'product-1': 12, 'product-2': 8, 'product-3': 4, 'product-4': 6 },
  messages: [],
}

function clone(value) { return JSON.parse(JSON.stringify(value)) }
function key(section) { return `${PREFIX}:${section}` }
function emit(section, value) { window.dispatchEvent(new CustomEvent(CMS_EVENT, { detail: { section, value } })) }

export function getCMS(section) {
  try {
    hydrateRemoteSection(
      `cms:${section}`,
      (value) => value,
      key(section),
      CMS_EVENT,
    )
    const raw = localStorage.getItem(key(section))
    return raw === null ? clone(DEFAULT_CMS[section]) : JSON.parse(raw)
  } catch { return clone(DEFAULT_CMS[section]) }
}

export function saveCMS(section, value) {
  localStorage.setItem(key(section), JSON.stringify(value))
  emit(section, value)
  saveRemoteSection(`cms:${section}`, value).catch((error) => {
    console.warn(`${section} saved locally; PostgreSQL API unavailable:`, error.message)
  })
  return value
}

export function resetCMS(section) {
  localStorage.removeItem(key(section))
  const value = clone(DEFAULT_CMS[section])
  emit(section, value)
  resetRemoteSection(`cms:${section}`).catch(() => {})
  return value
}

export function getAllCMS() {
  return Object.keys(DEFAULT_CMS).reduce((acc, section) => {
    acc[section] = getCMS(section)
    return acc
  }, {})
}

export function uid(prefix = 'item') { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

export function addReview(review) {
  const reviews = getCMS('reviews')
  const next = [{ ...review, id: uid('review'), status: 'pending', createdAt: new Date().toISOString() }, ...reviews]
  saveCMS('reviews', next)
  return next
}

export function toggleProductLike(productId) {
  const likes = getCMS('likes')
  const likedKey = `${PREFIX}:liked:${productId}`
  const liked = localStorage.getItem(likedKey) === '1'
  const next = { ...likes, [productId]: Math.max(0, Number(likes[productId] || 0) + (liked ? -1 : 1)) }
  localStorage.setItem(likedKey, liked ? '0' : '1')
  saveCMS('likes', next)
  return { likes: next, liked: !liked }
}

export function isProductLiked(productId) { return localStorage.getItem(`${PREFIX}:liked:${productId}`) === '1' }

export function addMessage(message) {
  const messages = getCMS('messages')
  const next = [{ ...message, id: uid('message'), status: 'new', createdAt: new Date().toISOString() }, ...messages]
  saveCMS('messages', next)
  return next
}
