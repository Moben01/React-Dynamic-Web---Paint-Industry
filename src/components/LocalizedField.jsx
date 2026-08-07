import { useMemo, useState } from 'react'
import {
  ExternalLink,
  Languages,
  LoaderCircle,
} from 'lucide-react'

import {
  normalizeLocalizedValue,
  updateLocalizedValue,
} from '../i18n/localizedContent'

import {
  openGoogleTranslate,
  translateToAllLanguages,
} from '../utils/translationApi'
import {
  confirmAdminAction,
  showAdminWarning,
} from '../utils/adminAlert'

const fieldLanguages = [
  {
    id: 'fa',
    label: 'دری',
    direction: 'rtl',
  },
  {
    id: 'ps',
    label: 'پښتو',
    direction: 'rtl',
  },
  {
    id: 'en',
    label: 'English',
    direction: 'ltr',
  },
]

function LocalizedField({
  label,
  value,
  onChange,
  required = false,
  multiline = false,
  rows = 4,
  placeholder = {},
}) {
  const [activeLanguage, setActiveLanguage] =
    useState('fa')

  const [translating, setTranslating] =
    useState(false)

  const localizedValue = useMemo(
    () => normalizeLocalizedValue(value),
    [value],
  )

  const currentLanguage =
    fieldLanguages.find(
      (item) =>
        item.id === activeLanguage,
    ) || fieldLanguages[0]

  const changeValue = (nextValue) => {
    onChange(
      updateLocalizedValue(
        localizedValue,
        activeLanguage,
        nextValue,
      ),
    )
  }

  const translateDariText = async () => {
    const dariText =
      localizedValue.fa.trim()

    if (!dariText) {
      showAdminWarning('ابتدا متن دری را وارد کنید.')
      return
    }

    try {
      setTranslating(true)

      const result =
        await translateToAllLanguages(
          dariText,
        )

      onChange({
        ...localizedValue,
        ...result,
      })
    } catch (error) {
      console.error(error)

      const openTranslator = await confirmAdminAction({
        title: 'ترجمه خودکار در دسترس نیست',
        text: 'API ترجمه تنظیم نشده یا پاسخ نداد. Google Translate باز شود؟',
        confirmText: 'باز کردن Google Translate',
        cancelText: 'انصراف',
        icon: 'info',
      })

      if (openTranslator) {
        openGoogleTranslate(
          dariText,
          'en',
        )
      }
    } finally {
      setTranslating(false)
    }
  }

  const InputComponent = multiline
    ? 'textarea'
    : 'input'

  return (
    <div className="localized-field">
      <div className="localized-field-heading">
        <span>
          {label}
          {required ? ' *' : ''}
        </span>

        <div className="localized-field-tabs">
          {fieldLanguages.map(
            (item) => (
              <button
                type="button"
                key={item.id}
                className={
                  activeLanguage === item.id
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveLanguage(
                    item.id,
                  )
                }
              >
                {item.label}

                {localizedValue[
                  item.id
                ]?.trim() && (
                  <i title="ترجمه وارد شده" />
                )}
              </button>
            ),
          )}
        </div>
      </div>

      <InputComponent
        rows={
          multiline ? rows : undefined
        }
        dir={
          currentLanguage.direction
        }
        value={
          localizedValue[
            activeLanguage
          ]
        }
        onChange={(event) =>
          changeValue(
            event.target.value,
          )
        }
        placeholder={
          placeholder[
            activeLanguage
          ] || ''
        }
      />

      <div className="localized-field-actions">
        <button
          type="button"
          className="localized-translate-button"
          onClick={translateDariText}
          disabled={
            translating ||
            !localizedValue.fa.trim()
          }
        >
          {translating ? (
            <LoaderCircle
              size={15}
              className="spin"
            />
          ) : (
            <Languages size={15} />
          )}

          {translating
            ? 'در حال ترجمه...'
            : 'ترجمه دری به پشتو و انگلیسی'}
        </button>

        <button
          type="button"
          className="localized-google-button"
          onClick={() =>
            openGoogleTranslate(
              localizedValue.fa,
              activeLanguage === 'fa'
                ? 'en'
                : activeLanguage,
            )
          }
          disabled={
            !localizedValue.fa.trim()
          }
        >
          <ExternalLink size={14} />
          Google Translate
        </button>
      </div>
    </div>
  )
}

export default LocalizedField