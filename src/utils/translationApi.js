const TRANSLATION_API_URL =
  import.meta.env.VITE_TRANSLATION_API_URL ||
  ''

export async function translateText({
  text,
  sourceLanguage = 'fa',
  targetLanguage,
}) {
  const cleanText = String(text || '').trim()

  if (!cleanText) {
    throw new Error('متن برای ترجمه خالی است.')
  }

  if (!TRANSLATION_API_URL) {
    throw new Error(
      'Translation API is not configured.',
    )
  }

  const response = await fetch(
    TRANSLATION_API_URL,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        text: cleanText,
        sourceLanguage,
        targetLanguage,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(
      'Translation request failed.',
    )
  }

  const result = await response.json()

  return (
    result.translation ||
    result.translatedText ||
    ''
  )
}

export async function translateToAllLanguages(
  dariText,
) {
  const [pashto, english] =
    await Promise.all([
      translateText({
        text: dariText,
        sourceLanguage: 'fa',
        targetLanguage: 'ps',
      }),

      translateText({
        text: dariText,
        sourceLanguage: 'fa',
        targetLanguage: 'en',
      }),
    ])

  return {
    fa: dariText,
    ps: pashto,
    en: english,
  }
}

export function openGoogleTranslate(
  text,
  targetLanguage = 'en',
) {
  const cleanText = String(text || '').trim()

  const url =
    `https://translate.google.com/?sl=fa` +
    `&tl=${encodeURIComponent(
      targetLanguage,
    )}` +
    `&text=${encodeURIComponent(
      cleanText,
    )}` +
    `&op=translate`

  window.open(
    url,
    '_blank',
    'noopener,noreferrer',
  )
}