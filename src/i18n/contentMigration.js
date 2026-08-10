import { normalizeLocalizedValue } from './localizedContent'
import { defaultProductsData, PRODUCTS_STORAGE_KEY } from '../data/productsStore'
import { defaultProjectsData, PROJECTS_STORAGE_KEY } from '../data/projectsStore'
import { defaultAboutData, ABOUT_STORAGE_KEY } from '../data/aboutStore'
import { defaultContactData, CONTACT_STORAGE_KEY } from '../data/contactStore'
import { DEFAULT_CMS } from '../data/cmsData'
import { defaultAssistantSettings } from '../data/assistantStore'

export const LOCALIZATION_MIGRATION_VERSION = 1
export const LOCALIZATION_MIGRATION_MARKER = `alimi-i18n-migration-v${LOCALIZATION_MIGRATION_VERSION}`
export const LOCALIZATION_SHADOW_PREFIX = `alimi-i18n-shadow-v${LOCALIZATION_MIGRATION_VERSION}`
export const LOCALIZATION_BACKUP_PREFIX = `alimi-i18n-backup-v${LOCALIZATION_MIGRATION_VERSION}`

const clone = (value) => JSON.parse(JSON.stringify(value))
const l = (value) => normalizeLocalizedValue(value, 'fa')
const la = (value) => (Array.isArray(value) ? value.map((item) => l(item)) : [])

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? clone(fallback) : JSON.parse(raw)
  } catch {
    return clone(fallback)
  }
}

function backupAndShadow(sourceKey, sourceValue, localizedValue) {
  const backupKey = `${LOCALIZATION_BACKUP_PREFIX}:${sourceKey}`
  const shadowKey = `${LOCALIZATION_SHADOW_PREFIX}:${sourceKey}`

  if (localStorage.getItem(backupKey) === null) {
    localStorage.setItem(backupKey, JSON.stringify(sourceValue))
  }

  localStorage.setItem(shadowKey, JSON.stringify(localizedValue))
  return { sourceKey, backupKey, shadowKey }
}

function migrateProducts(data) {
  const source = { ...clone(defaultProductsData), ...(data || {}) }
  const hero = { ...clone(defaultProductsData.hero), ...(source.hero || {}) }
  const catalog = { ...clone(defaultProductsData.catalog), ...(source.catalog || {}) }

  return {
    ...source,
    hero: {
      ...hero,
      kicker: l(hero.kicker),
      titleBefore: l(hero.titleBefore),
      titleHighlight: l(hero.titleHighlight),
      description: l(hero.description),
      featuredBadge: l(hero.featuredBadge),
      backgroundWord: l(hero.backgroundWord),
      stats: (hero.stats || []).map((item) => ({ ...item, value: l(item.value), label: l(item.label) })),
    },
    catalog: {
      ...catalog,
      kicker: l(catalog.kicker),
      title: l(catalog.title),
      searchPlaceholder: l(catalog.searchPlaceholder),
      emptyTitle: l(catalog.emptyTitle),
      emptyDescription: l(catalog.emptyDescription),
    },
    categories: (source.categories || []).map((item) => ({
      ...item,
      label: l(item.label),
      description: l(item.description),
    })),
    products: (source.products || []).map((item) => ({
      ...item,
      name: l(item.name),
      categoryLabel: l(item.categoryLabel),
      description: l(item.description),
      finish: l(item.finish),
      coverage: l(item.coverage),
      sizes: la(item.sizes),
    })),
  }
}

function migrateProjects(data) {
  const source = { ...clone(defaultProjectsData), ...(data || {}) }
  const section = { ...clone(defaultProjectsData.section), ...(source.section || {}) }

  return {
    ...source,
    section: Object.fromEntries(
      Object.entries(section).map(([key, value]) => [key, typeof value === 'string' ? l(value) : value]),
    ),
    projects: (source.projects || []).map((item) => ({
      ...item,
      title: l(item.title),
      categoryLabel: l(item.categoryLabel),
      location: l(item.location),
      year: l(item.year),
      status: l(item.status),
      client: l(item.client),
      area: l(item.area),
      description: l(item.description),
      alt: l(item.alt),
    })),
  }
}

function migrateAbout(data) {
  const source = { ...clone(defaultAboutData), ...(data || {}) }
  const textKeys = (object, keys) => keys.reduce((next, key) => ({ ...next, [key]: l(object?.[key]) }), { ...object })

  return {
    ...source,
    intro: {
      ...textKeys(source.intro || {}, ['kicker', 'title', 'highlight', 'description', 'buttonText']),
      backgroundImages: (source.intro?.backgroundImages || []).map((image) => ({ ...image, alt: l(image.alt) })),
    },
    vision: {
      ...textKeys(source.vision || {}, ['kicker', 'title']),
      stats: (source.vision?.stats || []).map((item) => ({ ...item, value: l(item.value), label: l(item.label) })),
    },
    story: {
      ...textKeys(source.story || {}, ['kicker', 'title', 'highlight', 'description']),
      timeline: (source.story?.timeline || []).map((item) => ({
        ...item,
        year: l(item.year),
        title: l(item.title),
        description: l(item.description),
      })),
    },
    valuesSection: textKeys(source.valuesSection || {}, ['kicker', 'title', 'highlight', 'description']),
    values: (source.values || []).map((item) => ({ ...item, title: l(item.title), description: l(item.description) })),
    factory: {
      ...textKeys(source.factory || {}, ['imageAlt', 'kicker', 'title', 'highlight', 'description']),
      checklist: (source.factory?.checklist || []).map((item) => ({ ...item, text: l(item.text) })),
    },
    contact: textKeys(source.contact || {}, Object.keys(source.contact || {}).filter((key) => typeof source.contact?.[key] === 'string')),
  }
}

function migrateContact(data) {
  const source = { ...clone(defaultContactData), ...(data || {}) }
  const localizeObjectStrings = (object, excluded = []) =>
    Object.fromEntries(Object.entries(object || {}).map(([key, value]) => [
      key,
      typeof value === 'string' && !excluded.includes(key) ? l(value) : value,
    ]))

  return {
    ...source,
    hero: localizeObjectStrings(source.hero),
    phones: (source.phones || []).map((item) => ({ ...item, label: l(item.label), note: l(item.note) })),
    contactItems: (source.contactItems || []).map((item) => ({
      ...item,
      title: l(item.title),
      value: item.icon === 'mail' ? item.value : l(item.value),
      note: l(item.note),
    })),
    formSection: {
      ...localizeObjectStrings(source.formSection, ['fields']),
      fields: localizeObjectStrings(source.formSection?.fields),
    },
    location: localizeObjectStrings(source.location, ['mapEmbedUrl', 'mapOpenUrl']),
    finalCta: localizeObjectStrings(source.finalCta, ['phone']),
  }
}

function migrateCmsSection(section, value) {
  const source = clone(value)

  if (section === 'site') {
    return {
      ...source,
      companyName: l(source.companyName),
      shortName: l(source.shortName),
      tagline: l(source.tagline),
      address: l(source.address),
      workingHours: l(source.workingHours),
    }
  }

  if (section === 'dashboard') {
    const excluded = new Set(['primaryLink', 'secondaryLink'])
    return Object.fromEntries(Object.entries(source).map(([key, item]) => {
      if (key === 'rotatingWords') return [key, la(item)]
      if (typeof item === 'string' && !excluded.has(key)) return [key, l(item)]
      return [key, item]
    }))
  }

  if (section === 'slides') {
    return source.map((item) => ({ ...item, title: l(item.title), subtitle: l(item.subtitle), badge: l(item.badge) }))
  }

  if (section === 'categories') {
    return source.map((item) => ({ ...item, name: l(item.name), description: l(item.description) }))
  }

  if (section === 'productsPage' || section === 'projectsPage' || section === 'contact') {
    return Object.fromEntries(Object.entries(source).map(([key, item]) => [key, typeof item === 'string' ? l(item) : item]))
  }

  if (section === 'products') {
    return source.map((item) => ({
      ...item,
      name: l(item.name),
      description: l(item.description),
      finish: l(item.finish),
      coverage: l(item.coverage),
      price: l(item.price),
      sizes: la(item.sizes),
    }))
  }

  if (section === 'projects') {
    return source.map((item) => ({
      ...item,
      title: l(item.title),
      categoryLabel: l(item.categoryLabel),
      location: l(item.location),
      year: l(item.year),
      status: l(item.status),
      client: l(item.client),
      area: l(item.area),
      description: l(item.description),
    }))
  }

  if (section === 'about') {
    return {
      ...source,
      eyebrow: l(source.eyebrow),
      title: l(source.title),
      highlight: l(source.highlight),
      description: l(source.description),
      storyTitle: l(source.storyTitle),
      story: l(source.story),
      values: (source.values || []).map((item) => ({ ...item, title: l(item.title), description: l(item.description) })),
    }
  }

  return source
}

function migrateAssistantSettings(settings) {
  const source = { ...clone(defaultAssistantSettings), ...(settings || {}) }
  return {
    ...source,
    title: l(source.title),
    statusText: l(source.statusText),
    namePromptTitle: l(source.namePromptTitle),
    namePromptText: l(source.namePromptText),
    namePlaceholder: l(source.namePlaceholder),
    welcomeMessage: l(source.welcomeMessage),
    messagePlaceholder: l(source.messagePlaceholder),
  }
}

export function runLocalizationStageOneMigration({ force = false } = {}) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null

  if (!force) {
    const existing = localStorage.getItem(LOCALIZATION_MIGRATION_MARKER)
    if (existing) {
      try { return JSON.parse(existing) } catch { return { version: LOCALIZATION_MIGRATION_VERSION } }
    }
  }

  const entries = []

  const products = readJson(PRODUCTS_STORAGE_KEY, defaultProductsData)
  entries.push(backupAndShadow(PRODUCTS_STORAGE_KEY, products, migrateProducts(products)))

  const projects = readJson(PROJECTS_STORAGE_KEY, defaultProjectsData)
  entries.push(backupAndShadow(PROJECTS_STORAGE_KEY, projects, migrateProjects(projects)))

  const about = readJson(ABOUT_STORAGE_KEY, defaultAboutData)
  entries.push(backupAndShadow(ABOUT_STORAGE_KEY, about, migrateAbout(about)))

  const contact = readJson(CONTACT_STORAGE_KEY, defaultContactData)
  entries.push(backupAndShadow(CONTACT_STORAGE_KEY, contact, migrateContact(contact)))

  for (const section of Object.keys(DEFAULT_CMS)) {
    if (['reviews', 'likes', 'messages'].includes(section)) continue
    const sourceKey = `alimi-cms-v3:${section}`
    const value = readJson(sourceKey, DEFAULT_CMS[section])
    entries.push(backupAndShadow(sourceKey, value, migrateCmsSection(section, value)))
  }

  const assistantKey = 'alimi-assistant-settings-v3'
  const assistant = readJson(assistantKey, defaultAssistantSettings)
  entries.push(backupAndShadow(assistantKey, assistant, migrateAssistantSettings(assistant)))

  const manifest = {
    version: LOCALIZATION_MIGRATION_VERSION,
    createdAt: new Date().toISOString(),
    sourceLanguage: 'fa',
    strategy: 'shadow-first',
    liveDataChanged: false,
    entries,
  }

  localStorage.setItem(LOCALIZATION_MIGRATION_MARKER, JSON.stringify(manifest))
  window.dispatchEvent(new CustomEvent('alimi-i18n-stage1-ready', { detail: manifest }))
  return manifest
}

export function getLocalizedShadow(sourceKey, fallback = null) {
  if (typeof localStorage === 'undefined') return fallback
  return readJson(`${LOCALIZATION_SHADOW_PREFIX}:${sourceKey}`, fallback)
}

export function clearLocalizationStageOneMigration() {
  if (typeof localStorage === 'undefined') return
  const markerRaw = localStorage.getItem(LOCALIZATION_MIGRATION_MARKER)
  let marker = null
  try { marker = JSON.parse(markerRaw || 'null') } catch { marker = null }

  for (const entry of marker?.entries || []) {
    localStorage.removeItem(entry.shadowKey)
  }
  localStorage.removeItem(LOCALIZATION_MIGRATION_MARKER)
}
