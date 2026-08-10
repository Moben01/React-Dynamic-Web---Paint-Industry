export const LANGUAGE_CODES = ['fa', 'ps', 'en']
export const DEFAULT_CONTENT_LANGUAGE = 'fa'

export function isLocalizedValue(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      LANGUAGE_CODES.some((code) => Object.prototype.hasOwnProperty.call(value, code)),
  )
}

export function createLocalizedValue(dari = '', pashto = '', english = '') {
  return {
    fa: String(dari ?? ''),
    ps: String(pashto ?? ''),
    en: String(english ?? ''),
  }
}

export function normalizeLocalizedValue(value, sourceLanguage = DEFAULT_CONTENT_LANGUAGE) {
  if (isLocalizedValue(value)) {
    return {
      fa: String(value.fa ?? ''),
      ps: String(value.ps ?? ''),
      en: String(value.en ?? ''),
    }
  }

  const next = createLocalizedValue()
  next[LANGUAGE_CODES.includes(sourceLanguage) ? sourceLanguage : DEFAULT_CONTENT_LANGUAGE] =
    String(value ?? '')
  return next
}

export function localizedText(value, language = DEFAULT_CONTENT_LANGUAGE, options = {}) {
  if (!isLocalizedValue(value)) return String(value ?? '')

  const normalized = normalizeLocalizedValue(value)
  const requested = LANGUAGE_CODES.includes(language) ? language : DEFAULT_CONTENT_LANGUAGE
  const fallbackOrder = options.fallbackOrder || [requested, 'fa', 'ps', 'en']

  for (const code of fallbackOrder) {
    const text = String(normalized[code] ?? '').trim()
    if (text) return normalized[code]
  }

  return ''
}

export function updateLocalizedValue(currentValue, language, newValue) {
  const normalized = normalizeLocalizedValue(currentValue)
  const code = LANGUAGE_CODES.includes(language) ? language : DEFAULT_CONTENT_LANGUAGE

  return {
    ...normalized,
    [code]: String(newValue ?? ''),
  }
}

export function hasTranslation(value, language) {
  if (!isLocalizedValue(value)) return language === DEFAULT_CONTENT_LANGUAGE && Boolean(String(value ?? '').trim())
  return Boolean(String(value?.[language] ?? '').trim())
}

export function translationCompletion(value) {
  const normalized = normalizeLocalizedValue(value)
  const completed = LANGUAGE_CODES.filter((code) => normalized[code].trim()).length
  return {
    completed,
    total: LANGUAGE_CODES.length,
    complete: completed === LANGUAGE_CODES.length,
  }
}

export function localizedArray(values, language = DEFAULT_CONTENT_LANGUAGE) {
  if (!Array.isArray(values)) return []
  return values.map((value) => localizedText(value, language))
}
