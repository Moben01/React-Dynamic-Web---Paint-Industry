import {
  createLocalizedValue,
  normalizeLocalizedValue,
} from '../i18n/localizedContent'
import { hydrateRemoteSection, saveRemoteSection } from './remoteStore'

export const AGENCIES_STORAGE_KEY = 'alimi-agencies-data-v1'
export const AGENCIES_CHANGED_EVENT = 'alimi-agencies-data-changed'

const L = (fa = '', ps = '', en = '') => createLocalizedValue(fa, ps, en)
const clone = (value) => JSON.parse(JSON.stringify(value))
const localize = (value) => normalizeLocalizedValue(value, 'fa')

export const defaultAgenciesData = {
  section: {
    kicker: L('شبکه فروش علیمی', 'د علیمي د پلور شبکه', 'Alimi sales network'),
    title: L('نمایندگی‌های فعال در کنار مشتریان', 'نمایندګۍ د پیرودونکو تر څنګ', 'Authorized agencies close to every customer'),
    description: L(
      'برای خرید محصولات اصلی، مشوره انتخاب رنگ و هماهنگی سفارش‌های ساختمانی، نمایندگی‌های علیمی نقطه تماس سریع و مطمئن شما هستند.',
      'د اصلي محصولاتو پېرلو، د رنګ انتخاب مشورې او د ساختماني فرمایشونو لپاره د علیمي نمایندګۍ ستاسو چټک او باوري تماس دی.',
      'For original products, color advice, and construction orders, Alimi agencies are your fast and trusted local contact.',
    ),
    primaryAction: L('درخواست نمایندگی', 'د نمایندګۍ غوښتنه', 'Request agency'),
    secondaryAction: L('تماس با دفتر مرکزی', 'مرکزي دفتر سره اړیکه', 'Call head office'),
    locatorTitle: L('مسیر ارتباط با نمایندگی', 'د نمایندګۍ سره د اړیکې لاره', 'Find the right agency path'),
    locatorText: L(
      'از نزدیک‌ترین نمایندگی شروع کنید؛ اگر شهر شما هنوز در شبکه فعال نیست، دفتر مرکزی مسیر همکاری یا ارسال محصول را هماهنگ می‌کند.',
      'له نږدې نمایندګۍ پیل وکړئ؛ که ستاسو ښار لا فعال نه وي، مرکزي دفتر د همکاری یا محصول رسولو لار تنظیموي.',
      'Start with the nearest branch. If your city is not active yet, head office can coordinate partnership or product delivery.',
    ),
    stepsTitle: L('چطور نمایندگی بگیریم؟', 'نمایندګي څنګه اخیستل کېږي؟', 'How to become an agency'),
    benefitsTitle: L('مزایای همکاری', 'د همکاری ګټې', 'Partnership benefits'),
    ctaTitle: L('آماده‌اید در شهر خود نماینده علیمی باشید؟', 'چمتو یاست په خپل ښار کې د علیمي نماینده شئ؟', 'Ready to represent Alimi in your city?'),
    ctaText: L(
      'با دفتر مرکزی تماس بگیرید تا شرایط همکاری و موجودی محصولات برای موقعیت شما بررسی شود.',
      'له مرکزي دفتر سره اړیکه ونیسئ تر څو د همکاری شرایط او د محصول موجودي وڅېړل شي.',
      'Contact head office to review partnership terms and product availability for your location.',
    ),
  },
  stats: [
    { id: 'partners', value: '12+', label: L('نمایندگی آماده همکاری', 'فعاله نمایندګۍ', 'ready agency partners') },
    { id: 'provinces', value: '6', label: L('ولایت تحت پوشش', 'تر پوښښ لاندې ولایتونه', 'covered provinces') },
    { id: 'followup', value: '24h', label: L('پیگیری سفارش‌ها', 'د فرمایش تعقیب', 'order follow-up') },
  ],
  steps: [
    { id: 'send', title: L('ارسال مشخصات', 'معلومات واستوئ', 'Send details'), description: L('نام فروشگاه، شهر، شماره تماس و تجربه فروش رنگ را شریک سازید.', 'د پلورنځي نوم، ښار، د تماس شمېره او د رنګ پلور تجربه شریک کړئ.', 'Share store name, city, phone number, and paint sales experience.') },
    { id: 'review', title: L('بررسی ظرفیت', 'ظرفیت ارزونه', 'Capacity review'), description: L('تیم علیمی موقعیت، بازار و توان توزیع را بررسی می‌کند.', 'د علیمي ټیم موقعیت، بازار او د وېش توان ارزوي.', 'The Alimi team reviews location, market, and distribution capacity.') },
    { id: 'start', title: L('شروع همکاری', 'همکاري پیل', 'Start partnership'), description: L('پس از تایید، شرایط فروش، مواد تبلیغاتی و برنامه سفارش تنظیم می‌شود.', 'له تایید وروسته د پلور شرایط، تبلیغاتي مواد او د فرمایش پلان برابرېږي.', 'After approval, sales terms, promotional materials, and order planning are arranged.') },
  ],
  benefits: [
    L('دسترسی به محصولات اصلی', 'اصلي محصولاتو ته لاسرسی', 'Original product access'),
    L('پشتیبانی تخنیکی', 'تخنیکي ملاتړ', 'Technical support'),
    L('هماهنگی سفارش‌های پروژه‌ای', 'د پروژوي فرمایشونو همغږي', 'Project order coordination'),
    L('هویت فروشگاهی معتبر', 'باوري فروشگاهي هویت', 'Trusted retail identity'),
  ],
  agencies: [
    {
      id: 'agency-kabul',
      name: L('کابل مرکزی', 'کابل مرکز', 'Central Kabul'),
      address: L('شهر نو، سرک عمومی فروشگاه‌های رنگ', 'شهر نو، د رنګ پلورنځیو عمومي سړک', 'Shahr-e Naw, main paint market road'),
      city: L('کابل', 'کابل', 'Kabul'),
      phone: '+93 700 000 101',
      manager: L('مدیر فروش کابل', 'د کابل د پلور مدیر', 'Kabul sales manager'),
      summary: L('فروش عمده و مشوره پروژه', 'عمده پلور او د پروژې مشوره', 'Wholesale and project advice'),
      description: L('این نمایندگی برای فروش عمده، تامین سفارش‌های ساختمانی و راهنمایی انتخاب رنگ در کابل فعال است.', 'دا نمایندګي په کابل کې د عمده پلور، ساختماني فرمایشونو او د رنګ انتخاب لارښوونې لپاره فعاله ده.', 'This agency supports wholesale, construction orders, and color selection in Kabul.'),
      services: [L('فروش عمده', 'عمده پلور', 'Wholesale'), L('مشوره رنگ', 'د رنګ مشوره', 'Color advice'), L('هماهنگی پروژه', 'د پروژې همغږي', 'Project coordination')],
      hours: L('شنبه تا پنجشنبه، 8 صبح تا 5 عصر', 'شنبه تر پنجشنبه، سهار 8 تر ماښام 5', 'Saturday to Thursday, 8 AM to 5 PM'),
      order: 1,
      active: true,
      featured: true,
    },
  ],
}

function normalizeSection(section = {}) {
  const fallback = defaultAgenciesData.section
  const next = { ...clone(fallback), ...section }
  Object.keys(fallback).forEach((key) => {
    next[key] = localize(section[key] ?? fallback[key])
  })
  return next
}

function normalizeAgency(agency, index = 0) {
  return {
    ...(agency || {}),
    id: agency?.id || `agency-${Date.now()}-${index}`,
    name: localize(agency?.name || ''),
    address: localize(agency?.address || ''),
    city: localize(agency?.city || ''),
    manager: localize(agency?.manager || ''),
    summary: localize(agency?.summary || ''),
    description: localize(agency?.description || ''),
    hours: localize(agency?.hours || ''),
    phone: String(agency?.phone || '').trim(),
    email: String(agency?.email || '').trim(),
    mapUrl: String(agency?.mapUrl || '').trim(),
    image: (() => {
      const images = Array.isArray(agency?.images)
        ? agency.images.map((item) => String(item || '').trim()).filter(Boolean)
        : []
      const legacyImage = String(agency?.image || '').trim()
      if (!images.length && legacyImage) images.push(legacyImage)
      return images[0] || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=1200&auto=format&fit=crop&q=85'
    })(),
    images: (() => {
      const images = Array.isArray(agency?.images)
        ? agency.images.map((item) => String(item || '').trim()).filter(Boolean)
        : []
      const legacyImage = String(agency?.image || '').trim()
      if (!images.length && legacyImage) images.push(legacyImage)
      if (!images.length) images.push('https://images.unsplash.com/photo-1560472355-536de3962603?w=1200&auto=format&fit=crop&q=85')
      return [...new Set(images)]
    })(),
    services: Array.isArray(agency?.services) ? agency.services.map(localize) : [],
    order: Number(agency?.order ?? index + 1),
    active: agency?.active !== false,
    featured: agency?.featured === true,
  }
}

export function normalizeAgenciesData(data) {
  const source = data && typeof data === 'object' ? data : {}
  return {
    ...clone(defaultAgenciesData),
    ...source,
    section: normalizeSection(source.section),
    stats: Array.isArray(source.stats) ? source.stats.map((stat, index) => ({
      id: stat?.id || `stat-${index}`,
      value: String(stat?.value || ''),
      label: localize(stat?.label || ''),
    })) : clone(defaultAgenciesData.stats),
    steps: Array.isArray(source.steps) ? source.steps.map((step, index) => ({
      id: step?.id || `step-${index}`,
      title: localize(step?.title || ''),
      description: localize(step?.description || ''),
    })) : clone(defaultAgenciesData.steps),
    benefits: Array.isArray(source.benefits) ? source.benefits.map(localize) : clone(defaultAgenciesData.benefits),
    agencies: Array.isArray(source.agencies)
      ? source.agencies.map(normalizeAgency)
      : clone(defaultAgenciesData.agencies).map(normalizeAgency),
  }
}

export function loadAgenciesData() {
  try {
    hydrateRemoteSection('agencies', normalizeAgenciesData, AGENCIES_STORAGE_KEY, AGENCIES_CHANGED_EVENT)
    const saved = JSON.parse(localStorage.getItem(AGENCIES_STORAGE_KEY) || 'null')
    return normalizeAgenciesData(saved || clone(defaultAgenciesData))
  } catch (error) {
    console.error('Unable to load agencies data:', error)
    return normalizeAgenciesData(clone(defaultAgenciesData))
  }
}

export function saveAgenciesData(data) {
  const normalizedData = normalizeAgenciesData(data)
  localStorage.setItem(AGENCIES_STORAGE_KEY, JSON.stringify(normalizedData))
  window.dispatchEvent(new CustomEvent(AGENCIES_CHANGED_EVENT, { detail: normalizedData }))
  saveRemoteSection('agencies', normalizedData).catch((error) => {
    console.warn('Agencies saved locally; API unavailable:', error.message)
  })
  return normalizedData
}

export function resetAgenciesData() {
  return saveAgenciesData(clone(defaultAgenciesData))
}
