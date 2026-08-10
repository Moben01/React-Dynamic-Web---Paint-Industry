import {
  CMS_EVENT,
  DEFAULT_CMS,
  getCMS,
  resetCMS,
  saveCMS,
} from './cmsData'
import {
  normalizeLocalizedValue,
} from '../i18n/localizedContent'

export const UPDATED_EVENT = CMS_EVENT
export const HERO_UPDATED_EVENT = CMS_EVENT
export const PROJECTS_UPDATED_EVENT = CMS_EVENT
export const PROJECTS_CONTENT_UPDATED_EVENT = CMS_EVENT

export const DEFAULT_SLIDES = DEFAULT_CMS.slides
export const DEFAULT_HERO_CONTENT = DEFAULT_CMS.dashboard
export const DEFAULT_PROJECTS = DEFAULT_CMS.projects

const HERO_LOCALIZED_FIELDS = [
  'eyebrow',
  'titleBefore',
  'titleHighlight',
  'changingPrefix',
  'rotatingWords',
  'description',
  'primaryButtonText',
  'secondaryButtonText',
]

const SLIDE_LOCALIZED_FIELDS = [
  'title',
  'subtitle',
  'badge',
  'alt',
]

function normalizeHero(data = {}) {
  const normalized = {
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

  HERO_LOCALIZED_FIELDS.forEach((field) => {
    const value = normalized[field]

    if (field === 'rotatingWords' && Array.isArray(value)) {
      normalized[field] = normalizeLocalizedValue(value.join('\n'))
    } else {
      normalized[field] = normalizeLocalizedValue(value)
    }
  })

  return normalized
}

function normalizeSlide(slide, index = 0) {
  const active = slide?.active ?? slide?.isActive ?? true
  const normalized = {
    ...slide,
    active,
    isActive: active,
    order: Number(slide?.order) || index + 1,
  }

  SLIDE_LOCALIZED_FIELDS.forEach((field) => {
    normalized[field] = normalizeLocalizedValue(normalized[field] ?? '')
  })

  return normalized
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
  return normalizeHero(getCMS('dashboard'))
}

export function saveHeroContent(value) {
  return normalizeHero(saveCMS('dashboard', normalizeHero(value)))
}

export function resetHeroContent() {
  return normalizeHero(resetCMS('dashboard'))
}

export const getDashboardSlides = getSlides
export const getActiveDashboardSlides = getActiveSlides
export const saveDashboardSlides = saveSlides
export const resetDashboardSlides = resetSlides
export const getDashboardHeroContent = getHeroContent
export const saveDashboardHeroContent = saveHeroContent
export const resetDashboardHeroContent = resetHeroContent
export const DASHBOARD_HERO_UPDATED_EVENT = HERO_UPDATED_EVENT
