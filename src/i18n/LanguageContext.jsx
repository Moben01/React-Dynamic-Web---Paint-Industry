import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { translations } from './translations'

const LANGUAGE_STORAGE_KEY = 'alimi-language'

const languageInformation = {
  fa: {
    id: 'fa',
    label: 'دری',
    shortLabel: 'دری',
    direction: 'rtl',
  },

  ps: {
    id: 'ps',
    label: 'پښتو',
    shortLabel: 'پښتو',
    direction: 'rtl',
  },

  en: {
    id: 'en',
    label: 'English',
    shortLabel: 'EN',
    direction: 'ltr',
  },
}

const LanguageContext = createContext(null)

function getTranslationValue(object, path) {
  return path
    .split('.')
    .reduce(
      (current, key) => current?.[key],
      object,
    )
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () =>
      localStorage.getItem(
        LANGUAGE_STORAGE_KEY,
      ) || 'fa',
  )

  const currentLanguage =
    languageInformation[language] ||
    languageInformation.fa

  const direction = currentLanguage.direction

  useEffect(() => {
    localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      language,
    )

    document.documentElement.lang = language
    document.documentElement.dir = direction

    document.body.dir = direction
    document.body.dataset.language = language
    document.body.dataset.direction = direction

    window.dispatchEvent(
      new CustomEvent(
        'alimi-language-changed',
        {
          detail: {
            language,
            direction,
          },
        },
      ),
    )
  }, [direction, language])

  const t = (key, fallback = '') => {
    const selectedValue = getTranslationValue(
      translations[language],
      key,
    )

    if (selectedValue !== undefined) {
      return selectedValue
    }

    const dariValue = getTranslationValue(
      translations.fa,
      key,
    )

    return dariValue ?? fallback ?? key
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      direction,
      isRtl: direction === 'rtl',
      currentLanguage,
      languages: Object.values(
        languageInformation,
      ),
      t,
    }),
    [language, direction],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error(
      'useLanguage must be used inside LanguageProvider',
    )
  }

  return context
}