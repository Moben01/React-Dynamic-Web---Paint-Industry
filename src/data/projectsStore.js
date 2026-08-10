import {
  createLocalizedValue,
  normalizeLocalizedValue,
} from '../i18n/localizedContent'
import { hydrateRemoteSection, saveRemoteSection } from './remoteStore'

export const PROJECTS_STORAGE_KEY = 'alimi-projects-data-v1'
export const PROJECTS_CHANGED_EVENT = 'alimi-projects-data-changed'

const L = (fa = '', ps = '', en = '') => createLocalizedValue(fa, ps, en)
const clone = (value) => JSON.parse(JSON.stringify(value))
const localize = (value) => normalizeLocalizedValue(value, 'fa')

export const projectCategoryOptions = [
  { value: 'exterior', label: L('نمای بیرونی', 'بهرنۍ نما', 'Exterior') },
  { value: 'interior', label: L('فضای داخلی', 'داخلي فضا', 'Interior') },
  { value: 'industrial', label: L('صنعتی', 'صنعتي', 'Industrial') },
  { value: 'commercial', label: L('تجارتی', 'سوداګریز', 'Commercial') },
]

export const defaultProjectsData = {
  section: {
    eyebrow: L('پروژه‌های اجراشده', 'ترسره شوې پروژې', 'Completed projects'),
    title: L('رنگ‌هایی که', 'هغه رنګونه چې', 'Colors that'),
    highlight: L('فضا را تغییر داده‌اند', 'فضا یې بدله کړې', 'transformed spaces'),
    description: L(
      'مجموعه‌ای از پروژه‌های ساختمانی، صنعتی و دکوراتیف شرکت رنگ‌سازی علیمی را مشاهده کنید.',
      'د علیمي رنګ جوړونې شرکت ساختماني، صنعتي او دکوراتیفي پروژې وګورئ.',
      'Explore a selection of architectural, industrial, and decorative projects completed by Alimi Paint Company.',
    ),
    backgroundWord: 'ALIMI',
    hint: L(
      'برای مشاهده پروژه دیگر روی کارت کناری کلیک کنید',
      'د بلې پروژې د لیدلو لپاره پر څنګ کارت کلیک وکړئ',
      'Click the side card to view another project',
    ),
    emptyMessage: L(
      'هنوز هیچ پروژه فعالی ثبت نشده است.',
      'تر اوسه کومه فعاله پروژه نه ده ثبت شوې.',
      'No active projects have been added yet.',
    ),
  },
  projects: [
    {
      id: 'project-1',
      title: L('رنگ‌آمیزی نمای مجتمع پامیر', 'د پامیر کمپلکس د نما رنګول', 'Pamir Complex Exterior Painting'),
      category: 'exterior',
      categoryLabel: L('نمای بیرونی', 'بهرنۍ نما', 'Exterior'),
      location: L('کابل، افغانستان', 'کابل، افغانستان', 'Kabul, Afghanistan'),
      year: '۱۴۰۵',
      status: L('تکمیل‌شده', 'بشپړه شوې', 'Completed'),
      client: L('شرکت ساختمانی پامیر', 'د پامیر ساختماني شرکت', 'Pamir Construction Company'),
      area: L('۴٬۸۰۰ متر مربع', '۴٬۸۰۰ متر مربع', '4,800 m²'),
      description: L(
        'اجرای پوشش اکریلیک مقاوم در برابر آفتاب و باران برای نمای کامل مجتمع.',
        'د کمپلکس د ټولې نما لپاره د لمر او باران پر وړاندې مقاوم اکریلیک پوښښ.',
        'Application of a weather-resistant acrylic coating across the complete exterior of the complex.',
      ),
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&auto=format&fit=crop&q=85',
      images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&auto=format&fit=crop&q=85'],
      alt: L('نمای ساختمان مدرن', 'د عصري ودانۍ نما', 'Modern building exterior'),
      objectPosition: 'center',
      featured: true,
      order: 1,
      active: true,
    },
    {
      id: 'project-2',
      title: L('بازسازی رنگ داخلی دفتر مرکزی', 'د مرکزي دفتر د داخلي رنګ نوي کول', 'Head Office Interior Repainting'),
      category: 'interior',
      categoryLabel: L('فضای داخلی', 'داخلي فضا', 'Interior'),
      location: L('هرات، افغانستان', 'هرات، افغانستان', 'Herat, Afghanistan'),
      year: '۱۴۰۴',
      status: L('تکمیل‌شده', 'بشپړه شوې', 'Completed'),
      client: L('گروه تجارتی علیمی', 'د علیمي سوداګریز ګروپ', 'Alimi Business Group'),
      area: L('۱٬۹۰۰ متر مربع', '۱٬۹۰۰ متر مربع', '1,900 m²'),
      description: L(
        'اجرای رنگ داخلی مات مخملی با ترکیب رنگی اختصاصی برای فضای اداری.',
        'د اداري فضا لپاره د ځانګړي رنګ ترکیب سره د مخملي مات داخلي رنګ پلي کول.',
        'Velvet-matte interior painting with a custom color palette for an office environment.',
      ),
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&auto=format&fit=crop&q=85',
      images: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&auto=format&fit=crop&q=85'],
      alt: L('دفتر اداری مدرن', 'عصري اداري دفتر', 'Modern office interior'),
      objectPosition: 'center',
      featured: false,
      order: 2,
      active: true,
    },
    {
      id: 'project-3',
      title: L('پوشش صنعتی کارخانه تولیدی', 'د تولیدي فابریکې صنعتي پوښښ', 'Industrial Factory Coating'),
      category: 'industrial',
      categoryLabel: L('صنعتی', 'صنعتي', 'Industrial'),
      location: L('مزار شریف، افغانستان', 'مزار شریف، افغانستان', 'Mazar-e-Sharif, Afghanistan'),
      year: '۱۴۰۴',
      status: L('تکمیل‌شده', 'بشپړه شوې', 'Completed'),
      client: L('کارخانه تولیدی بلخ', 'د بلخ تولیدي فابریکه', 'Balkh Manufacturing Plant'),
      area: L('۷٬۲۰۰ متر مربع', '۷٬۲۰۰ متر مربع', '7,200 m²'),
      description: L(
        'اجرای پوشش صنعتی ضد زنگ برای سازه‌های فلزی و تجهیزات خط تولید.',
        'د فلزي جوړښتونو او د تولید د کرښې تجهیزاتو لپاره د زنګ ضد صنعتي پوښښ.',
        'Anti-rust industrial coating for steel structures and production-line equipment.',
      ),
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1400&auto=format&fit=crop&q=85',
      images: ['https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1400&auto=format&fit=crop&q=85'],
      alt: L('محیط صنعتی و کارخانه', 'صنعتي چاپېریال او فابریکه', 'Industrial factory environment'),
      objectPosition: 'center',
      featured: false,
      order: 3,
      active: true,
    },
  ],
}

function normalizeSection(section = {}) {
  const fallback = defaultProjectsData.section
  return {
    ...clone(fallback),
    ...section,
    eyebrow: localize(section.eyebrow ?? fallback.eyebrow),
    title: localize(section.title ?? fallback.title),
    highlight: localize(section.highlight ?? fallback.highlight),
    description: localize(section.description ?? fallback.description),
    hint: localize(section.hint ?? fallback.hint),
    emptyMessage: localize(section.emptyMessage ?? fallback.emptyMessage),
    backgroundWord: String(section.backgroundWord ?? fallback.backgroundWord),
  }
}

function normalizeProject(project, index = 0) {
  const fallback = defaultProjectsData.projects.find(
    (item) => String(item.id) === String(project?.id),
  )
  const legacyImage = String(project?.image || fallback?.image || '').trim()
  const images = Array.isArray(project?.images)
    ? project.images.map((item) => String(item || '').trim()).filter(Boolean)
    : []
  if (!images.length && legacyImage) images.push(legacyImage)
  const uniqueImages = [...new Set(images)]
  const image = uniqueImages[0] || legacyImage
  const categoryOption = projectCategoryOptions.find(
    (item) => String(item.value) === String(project?.category),
  )

  return {
    ...(fallback || {}),
    ...(project || {}),
    id: project?.id || `project-${Date.now()}-${index}`,
    title: localize(project?.title ?? fallback?.title ?? ''),
    category: String(project?.category ?? fallback?.category ?? 'exterior'),
    categoryLabel: localize(
      project?.categoryLabel ?? fallback?.categoryLabel ?? categoryOption?.label ?? '',
    ),
    location: localize(project?.location ?? fallback?.location ?? ''),
    year: String(project?.year ?? fallback?.year ?? ''),
    status: localize(project?.status ?? fallback?.status ?? ''),
    client: localize(project?.client ?? fallback?.client ?? ''),
    area: localize(project?.area ?? fallback?.area ?? ''),
    description: localize(project?.description ?? fallback?.description ?? ''),
    image,
    images: uniqueImages,
    alt: localize(project?.alt ?? fallback?.alt ?? project?.title ?? ''),
    objectPosition: project?.objectPosition || fallback?.objectPosition || 'center',
    active: project?.active !== false,
    featured: project?.featured === true,
    order: Number(project?.order ?? fallback?.order ?? index + 1),
  }
}

export function normalizeProjectsData(data) {
  const source = data && typeof data === 'object' ? data : {}
  return {
    ...clone(defaultProjectsData),
    ...source,
    section: normalizeSection(source.section),
    projects: Array.isArray(source.projects)
      ? source.projects.map(normalizeProject)
      : clone(defaultProjectsData.projects).map(normalizeProject),
  }
}

export function loadProjectsData() {
  try {
    hydrateRemoteSection(
      'projects',
      normalizeProjectsData,
      PROJECTS_STORAGE_KEY,
      PROJECTS_CHANGED_EVENT,
    )
    const saved = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || 'null')
    return normalizeProjectsData(saved || clone(defaultProjectsData))
  } catch (error) {
    console.error('Unable to load projects data:', error)
    return normalizeProjectsData(clone(defaultProjectsData))
  }
}

export function saveProjectsData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Projects data must be an object.')
  }
  const normalizedData = normalizeProjectsData(data)
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(normalizedData))
  window.dispatchEvent(
    new CustomEvent(PROJECTS_CHANGED_EVENT, { detail: normalizedData }),
  )
  saveRemoteSection('projects', normalizedData).catch((error) => {
    console.warn('Projects saved locally; PostgreSQL API unavailable:', error.message)
  })
  return normalizedData
}

export function resetProjectsData() {
  return saveProjectsData(clone(defaultProjectsData))
}
