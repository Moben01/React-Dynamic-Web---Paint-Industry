import { useState } from 'react'
import {
  ExternalLink,
  Languages,
  LoaderCircle,
} from 'lucide-react'

import {
  openGoogleTranslate,
  translateToAllLanguages,
} from '../utils/translationApi'
import {
  confirmAdminAction,
  showAdminWarning,
} from '../utils/adminAlert'

function TranslateFieldButton({
  dariText,
  onTranslated,
}) {
  const [loading, setLoading] =
    useState(false)

  const translate = async () => {
    if (!String(dariText || '').trim()) {
      showAdminWarning('ابتدا متن دری را وارد کنید.')

      return
    }

    try {
      setLoading(true)

      const translations =
        await translateToAllLanguages(
          dariText,
        )

      onTranslated(translations)
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
      setLoading(false)
    }
  }

  return (
    <div className="admin-translation-actions">
      <button
        type="button"
        className="admin-translate-button"
        onClick={translate}
        disabled={loading}
      >
        {loading ? (
          <LoaderCircle
            size={16}
            className="spin"
          />
        ) : (
          <Languages size={16} />
        )}

        {loading
          ? 'در حال ترجمه...'
          : 'ترجمه به پشتو و انگلیسی'}
      </button>

      <button
        type="button"
        className="admin-google-translate-button"
        onClick={() =>
          openGoogleTranslate(
            dariText,
            'en',
          )
        }
      >
        <ExternalLink size={15} />
        Google Translate
      </button>
    </div>
  )
}

export default TranslateFieldButton