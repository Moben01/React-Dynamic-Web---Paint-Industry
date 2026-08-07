export const PROJECTS_STORAGE_KEY = 'alimi-projects-data-v1'
export const PROJECTS_CHANGED_EVENT = 'alimi-projects-data-changed'

export const projectCategoryOptions = [
  { value: 'exterior', label: 'نمای بیرونی' },
  { value: 'interior', label: 'فضای داخلی' },
  { value: 'industrial', label: 'صنعتی' },
  { value: 'commercial', label: 'تجارتی' },
]

export const defaultProjectsData = {
  section: {
    eyebrow: 'پروژه‌های اجراشده',
    title: 'رنگ‌هایی که',
    highlight: 'فضا را تغییر داده‌اند',
    description:
      'مجموعه‌ای از پروژه‌های ساختمانی، صنعتی و دکوراتیف شرکت رنگ‌سازی علیمی را مشاهده کنید.',
    backgroundWord: 'ALIMI',
    hint: 'برای مشاهده پروژه دیگر روی کارت کناری کلیک کنید',
    emptyMessage: 'هنوز هیچ پروژه فعالی ثبت نشده است.',
  },
  projects: [
    {
      id: 'project-1',
      title: 'رنگ‌آمیزی نمای مجتمع پامیر',
      category: 'exterior',
      categoryLabel: 'نمای بیرونی',
      location: 'کابل، افغانستان',
      year: '۱۴۰۵',
      status: 'تکمیل‌شده',
      client: 'شرکت ساختمانی پامیر',
      area: '۴٬۸۰۰ متر مربع',
      description:
        'اجرای پوشش اکریلیک مقاوم در برابر آفتاب و باران برای نمای کامل مجتمع.',
      image:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&auto=format&fit=crop&q=85',
      images: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&auto=format&fit=crop&q=85',
      ],
      alt: 'نمای ساختمان مدرن',
      objectPosition: 'center',
      featured: true,
      order: 1,
      active: true,
    },
    {
      id: 'project-2',
      title: 'بازسازی رنگ داخلی دفتر مرکزی',
      category: 'interior',
      categoryLabel: 'فضای داخلی',
      location: 'هرات، افغانستان',
      year: '۱۴۰۴',
      status: 'تکمیل‌شده',
      client: 'گروه تجارتی علیمی',
      area: '۱٬۹۰۰ متر مربع',
      description:
        'اجرای رنگ داخلی مات مخملی با ترکیب رنگی اختصاصی برای فضای اداری.',
      image:
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&auto=format&fit=crop&q=85',
      images: [
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&auto=format&fit=crop&q=85',
      ],
      alt: 'دفتر اداری مدرن',
      objectPosition: 'center',
      featured: false,
      order: 2,
      active: true,
    },
    {
      id: 'project-3',
      title: 'پوشش صنعتی کارخانه تولیدی',
      category: 'industrial',
      categoryLabel: 'صنعتی',
      location: 'مزار شریف، افغانستان',
      year: '۱۴۰۴',
      status: 'تکمیل‌شده',
      client: 'کارخانه تولیدی بلخ',
      area: '۷٬۲۰۰ متر مربع',
      description:
        'اجرای پوشش صنعتی ضد زنگ برای سازه‌های فلزی و تجهیزات خط تولید.',
      image:
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1400&auto=format&fit=crop&q=85',
      images: [
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1400&auto=format&fit=crop&q=85',
      ],
      alt: 'محیط صنعتی و کارخانه',
      objectPosition: 'center',
      featured: false,
      order: 3,
      active: true,
    },
  ],
}

const clone = (value) => JSON.parse(JSON.stringify(value))

function normalizeProject(project, index = 0) {
  const legacyImage = String(project?.image || '').trim()
  const images = Array.isArray(project?.images)
    ? project.images.map((item) => String(item || '').trim()).filter(Boolean)
    : []

  if (!images.length && legacyImage) images.push(legacyImage)

  const uniqueImages = [...new Set(images)]
  const image = uniqueImages[0] || legacyImage

  return {
    ...project,
    id: project?.id || `project-${Date.now()}-${index}`,
    image,
    images: uniqueImages,
    objectPosition: project?.objectPosition || 'center',
    active: project?.active !== false,
    featured: project?.featured === true,
    order: Number(project?.order || index + 1),
  }
}

export function loadProjectsData() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || 'null')
    if (!saved || typeof saved !== 'object') {
      const defaults = clone(defaultProjectsData)
      defaults.projects = defaults.projects.map(normalizeProject)
      return defaults
    }

    return {
      ...clone(defaultProjectsData),
      ...saved,
      section: {
        ...clone(defaultProjectsData.section),
        ...(saved.section || {}),
      },
      projects: Array.isArray(saved.projects)
        ? saved.projects.map(normalizeProject)
        : clone(defaultProjectsData.projects).map(normalizeProject),
    }
  } catch (error) {
    console.error('Unable to load projects data:', error)
    const defaults = clone(defaultProjectsData)
    defaults.projects = defaults.projects.map(normalizeProject)
    return defaults
  }
}

export function saveProjectsData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Projects data must be an object.')
  }

  const normalizedData = {
    ...clone(defaultProjectsData),
    ...data,
    section: {
      ...clone(defaultProjectsData.section),
      ...(data.section || {}),
    },
    projects: Array.isArray(data.projects)
      ? data.projects.map(normalizeProject)
      : [],
  }

  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(normalizedData))

  window.dispatchEvent(
    new CustomEvent(PROJECTS_CHANGED_EVENT, { detail: normalizedData }),
  )

  return normalizedData
}

export function resetProjectsData() {
  const data = clone(defaultProjectsData)
  data.projects = data.projects.map(normalizeProject)
  return saveProjectsData(data)
}
