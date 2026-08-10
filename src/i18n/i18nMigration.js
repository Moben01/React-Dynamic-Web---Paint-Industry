import { normalizeLocalizedValue } from './localizedContent'
import { I18N_SCHEMA_VERSION, TRANSLATABLE_FIELDS } from './i18nSchema'

const MIGRATION_META_KEY = 'alimi-i18n-migration-meta-v1'
const STAGING_PREFIX = 'alimi-i18n-stage-v1:'
const BACKUP_PREFIX = 'alimi-i18n-backup-v1:'

const SOURCE_KEYS = {
  productsStore: 'alimi-products-data-v1',
  projectsStore: 'alimi-projects-data-v1',
  aboutStore: 'alimi-about-data-v1',
  contactStore: 'alimi-contact-data-v1',
  assistantSettings: 'alimi-assistant-settings-v3',
}

function safeParse(raw, fallback = null) {
  try {
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function localizeField(object, field) {
  if (!object || typeof object !== 'object' || !(field in object)) return object
  const current = object[field]

  if (Array.isArray(current)) {
    return {
      ...object,
      [field]: current.map((item) => normalizeLocalizedValue(item)),
    }
  }

  return {
    ...object,
    [field]: normalizeLocalizedValue(current),
  }
}

function localizeFields(object, fields = []) {
  return fields.reduce((next, field) => localizeField(next, field), { ...(object || {}) })
}

function localizeRows(rows, fields = []) {
  if (!Array.isArray(rows)) return rows
  return rows.map((row) => localizeFields(row, fields))
}

function migrateProductsStore(data) {
  if (!data || typeof data !== 'object') return data
  const schema = TRANSLATABLE_FIELDS.productsStore
  return {
    ...data,
    hero: {
      ...localizeFields(data.hero, schema.hero),
      stats: localizeRows(data.hero?.stats, schema.heroStats),
    },
    catalog: localizeFields(data.catalog, schema.catalog),
    categories: localizeRows(data.categories, schema.categories),
    products: localizeRows(data.products, schema.products),
  }
}

function migrateProjectsStore(data) {
  if (!data || typeof data !== 'object') return data
  const schema = TRANSLATABLE_FIELDS.projectsStore
  const pageCandidate = data.page || data.hero || data.archive || {}
  const migratedPage = localizeFields(pageCandidate, schema.page)
  const result = {
    ...data,
    projects: localizeRows(data.projects, schema.projects),
  }
  if (data.page) result.page = migratedPage
  if (data.hero) result.hero = migratedPage
  if (data.archive) result.archive = migratedPage
  return result
}

function migrateAboutStore(data) {
  if (!data || typeof data !== 'object') return data
  const schema = TRANSLATABLE_FIELDS.aboutStore
  let next = localizeFields(data, schema.scalar)
  for (const key of ['values', 'valueCards', 'features']) {
    if (Array.isArray(next[key])) next[key] = localizeRows(next[key], schema.valueCards)
  }
  return next
}

function migrateContactStore(data) {
  if (!data || typeof data !== 'object') return data
  const schema = TRANSLATABLE_FIELDS.contactStore
  const next = localizeFields(data, schema.scalar)
  if (Array.isArray(next.phones)) next.phones = localizeRows(next.phones, schema.phones)
  return next
}

function migrateAssistantSettings(data) {
  return localizeFields(data, TRANSLATABLE_FIELDS.assistantStore)
}

function migrateCmsSection(section, data) {
  const schema = TRANSLATABLE_FIELDS.cms
  if (!schema[section]) return data

  if (Array.isArray(data)) {
    return localizeRows(data, schema[section])
  }

  let next = localizeFields(data, schema[section])
  if (section === 'dashboard' && Array.isArray(next.rotatingWords)) {
    next.rotatingWords = next.rotatingWords.map((word) => normalizeLocalizedValue(word))
  }
  if (section === 'about' && Array.isArray(next.values)) {
    next.values = localizeRows(next.values, ['title', 'description'])
  }
  return next
}

function collectCmsSourceKeys() {
  const prefix = 'alimi-cms-v3:'
  const keys = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (key?.startsWith(prefix)) keys.push(key)
  }
  return keys
}

function backupOnce(key, raw) {
  const backupKey = `${BACKUP_PREFIX}${key}`
  if (localStorage.getItem(backupKey) === null && raw !== null) {
    localStorage.setItem(backupKey, raw)
  }
}

function stage(key, value) {
  localStorage.setItem(`${STAGING_PREFIX}${key}`, JSON.stringify(value))
}

export function prepareI18nMigration() {
  if (typeof window === 'undefined') return null

  const previous = safeParse(localStorage.getItem(MIGRATION_META_KEY), {}) || {}
  if (Number(previous.schemaVersion) >= I18N_SCHEMA_VERSION && previous.staged === true) {
    return previous
  }

  const stagedKeys = []

  for (const [group, key] of Object.entries(SOURCE_KEYS)) {
    const raw = localStorage.getItem(key)
    if (raw === null) continue
    const parsed = safeParse(raw, null)
    if (parsed === null) continue

    backupOnce(key, raw)

    let migrated = parsed
    if (group === 'productsStore') migrated = migrateProductsStore(parsed)
    if (group === 'projectsStore') migrated = migrateProjectsStore(parsed)
    if (group === 'aboutStore') migrated = migrateAboutStore(parsed)
    if (group === 'contactStore') migrated = migrateContactStore(parsed)
    if (group === 'assistantSettings') migrated = migrateAssistantSettings(parsed)

    stage(key, migrated)
    stagedKeys.push(key)
  }

  for (const key of collectCmsSourceKeys()) {
    const raw = localStorage.getItem(key)
    const parsed = safeParse(raw, null)
    if (parsed === null) continue
    backupOnce(key, raw)
    const section = key.split(':').pop()
    stage(key, migrateCmsSection(section, parsed))
    stagedKeys.push(key)
  }

  const meta = {
    schemaVersion: I18N_SCHEMA_VERSION,
    staged: true,
    stagedAt: new Date().toISOString(),
    stagedKeys,
    note: 'Phase 1 only: localized data is staged under alimi-i18n-stage-v1:*; current production keys are untouched.',
  }

  localStorage.setItem(MIGRATION_META_KEY, JSON.stringify(meta))
  return meta
}

export function getI18nMigrationStatus() {
  if (typeof window === 'undefined') return null
  return safeParse(localStorage.getItem(MIGRATION_META_KEY), null)
}

export function getStagedLocalizedData(sourceKey) {
  if (typeof window === 'undefined') return null
  return safeParse(localStorage.getItem(`${STAGING_PREFIX}${sourceKey}`), null)
}

export function restoreI18nBackup(sourceKey) {
  if (typeof window === 'undefined') return false
  const raw = localStorage.getItem(`${BACKUP_PREFIX}${sourceKey}`)
  if (raw === null) return false
  localStorage.setItem(sourceKey, raw)
  return true
}
