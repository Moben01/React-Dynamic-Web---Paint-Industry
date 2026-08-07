export const LANGUAGE_CODES = ['fa', 'ps', 'en']

export function createLocalizedValue(
  dari = '',
  pashto = '',
  english = '',
) {
  return {
    fa: String(dari || ''),
    ps: String(pashto || ''),
    en: String(english || ''),
  }
}

export function normalizeLocalizedValue(value) {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return {
      fa: String(value.fa || ''),
      ps: String(value.ps || ''),
      en: String(value.en || ''),
    }
  }

  return {
    fa: String(value || ''),
    ps: '',
    en: '',
  }
}

export function localizedText(
  value,
  language = 'fa',
) {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return (
      value[language] ||
      value.fa ||
      value.ps ||
      value.en ||
      ''
    )
  }

  return String(value || '')
}

export function updateLocalizedValue(
  currentValue,
  language,
  newValue,
) {
  const normalized =
    normalizeLocalizedValue(currentValue)

  return {
    ...normalized,
    [language]: newValue,
  }
}