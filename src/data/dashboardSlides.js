import {
  CMS_EVENT,
  DEFAULT_CMS,
  getCMS,
  resetCMS,
  saveCMS,
} from './cmsData'

export const UPDATED_EVENT = CMS_EVENT
export const HERO_UPDATED_EVENT = CMS_EVENT
export const PROJECTS_UPDATED_EVENT = CMS_EVENT
export const PROJECTS_CONTENT_UPDATED_EVENT = CMS_EVENT

export const DEFAULT_SLIDES = DEFAULT_CMS.slides
export const DEFAULT_HERO_CONTENT = DEFAULT_CMS.dashboard
export const DEFAULT_PROJECTS = DEFAULT_CMS.projects

function normalizeSlide(slide, index = 0) {
  const active = slide?.active ?? slide?.isActive ?? true

  return {
    ...slide,
    active,
    // isActive را نیز نگه می‌داریم تا اطلاعات قدیمی پروژه بدون مشکل کار کند.
    isActive: active,
    order: Number(slide?.order) || index + 1,
  }
}

export function getSlides() {
  return getCMS('slides')
    .map((slide, index) => normalizeSlide(slide, index))
    .sort((a, b) => (a.order || 0) - (b.order || 0))
}

export function getActiveSlides() {
  return getSlides().filter(
    (slide) => slide.active !== false && slide.image,
  )
}

export function saveSlides(value) {
  const normalized = value
    .map((slide, index) => normalizeSlide(slide, index))
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  return saveCMS('slides', normalized)
}

export function resetSlides() {
  return resetCMS('slides').map((slide, index) =>
    normalizeSlide(slide, index),
  )
}

export function getHeroContent() {
  const data = getCMS('dashboard')

  return {
    ...data,
    titleBefore: data.titleBefore ?? data.title ?? '',
    titleHighlight: data.titleHighlight ?? data.highlight ?? '',
    changingPrefix: data.changingPrefix ?? data.rotatingPrefix ?? '',
    primaryButtonText:
      data.primaryButtonText ?? data.primaryText ?? '',
    primaryButtonLink:
      data.primaryButtonLink ?? data.primaryLink ?? '',
    secondaryButtonText:
      data.secondaryButtonText ?? data.secondaryText ?? '',
    secondaryButtonLink:
      data.secondaryButtonLink ?? data.secondaryLink ?? '',
  }
}

export function saveHeroContent(value) {
  return saveCMS('dashboard', {
    ...value,
    title: value.titleBefore || value.title || '',
    highlight: value.titleHighlight || value.highlight || '',
    rotatingPrefix:
      value.changingPrefix || value.rotatingPrefix || '',
    primaryText:
      value.primaryButtonText || value.primaryText || '',
    primaryLink:
      value.primaryButtonLink || value.primaryLink || '',
    secondaryText:
      value.secondaryButtonText || value.secondaryText || '',
    secondaryLink:
      value.secondaryButtonLink || value.secondaryLink || '',
  })
}

export function resetHeroContent() {
  const data = resetCMS('dashboard')

  return {
    ...data,
    titleBefore: data.title ?? '',
    titleHighlight: data.highlight ?? '',
    changingPrefix: data.rotatingPrefix ?? '',
    primaryButtonText: data.primaryText ?? '',
    primaryButtonLink: data.primaryLink ?? '',
    secondaryButtonText: data.secondaryText ?? '',
    secondaryButtonLink: data.secondaryLink ?? '',
  }
}

export function getProjects() {
  return getCMS('projects')
}

export function getActiveProjects() {
  return getCMS('projects')
    .filter((item) => item.active !== false && item.image)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
}

export function saveProjects(value) {
  return saveCMS('projects', value)
}

export function resetProjects() {
  return resetCMS('projects')
}

export function getProjectsContent() {
  const data = getCMS('dashboard')

  return {
    eyebrow: data.projectsEyebrow,
    titleBefore: data.projectsTitle,
    titleHighlight: data.projectsHighlight,
    description: data.projectsDescription,
    hint: 'برای مشاهده جزئیات روی پروژه کلیک کنید',
  }
}

export function saveProjectsContent(value) {
  const data = getCMS('dashboard')

  return saveCMS('dashboard', {
    ...data,
    projectsEyebrow: value.eyebrow,
    projectsTitle: value.titleBefore,
    projectsHighlight: value.titleHighlight,
    projectsDescription: value.description,
  })
}

export const getAllDashboardSlides = getSlides
export const getActiveDashboardSlides = getActiveSlides
export const saveDashboardSlides = saveSlides
export const resetDashboardSlides = resetSlides
export const getDashboardHeroContent = getHeroContent
export const saveDashboardHeroContent = saveHeroContent
export const resetDashboardHeroContent = resetHeroContent
export const DASHBOARD_HERO_UPDATED_EVENT = HERO_UPDATED_EVENT
