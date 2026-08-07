import { useEffect, useRef, useState } from 'react'
import {
  Eye,
  EyeOff,
  ImagePlus,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import {
  getHeroContent,
  getSlides,
  resetHeroContent,
  saveHeroContent,
  saveSlides,
} from '../data/dashboardSlides'
import {
  confirmAdminAction,
  showAdminError,
  showAdminSuccess,
  showAdminWarning,
} from '../utils/adminAlert'
import './DashboardImages.css'

const MAX_SOURCE_IMAGE_SIZE = 2 * 1024 * 1024
const MAX_IMAGE_WIDTH = 1200
const MAX_IMAGE_HEIGHT = 1500
const TARGET_DATA_URL_LENGTH = 520 * 1024

const emptySlideForm = {
  id: '',
  image: '',
  title: '',
  subtitle: '',
  badge: 'ALIMI PAINT',
  alt: '',
  objectPosition: 'center',
  order: 1,
  active: true,
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'))
    image.src = source
  })
}

async function optimizeImageSource(source) {
  if (!source || !source.startsWith('data:image/')) {
    return source
  }

  const image = await loadImage(source)

  const ratio = Math.min(
    1,
    MAX_IMAGE_WIDTH / image.naturalWidth,
    MAX_IMAGE_HEIGHT / image.naturalHeight,
  )

  const width = Math.max(1, Math.round(image.naturalWidth * ratio))
  const height = Math.max(1, Math.round(image.naturalHeight * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) return source

  context.drawImage(image, 0, 0, width, height)

  let quality = 0.82
  let result = canvas.toDataURL('image/webp', quality)

  while (result.length > TARGET_DATA_URL_LENGTH && quality > 0.48) {
    quality -= 0.08
    result = canvas.toDataURL('image/webp', quality)
  }

  return result
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('FILE_READ_FAILED'))
    reader.readAsDataURL(file)
  })
}

function isStorageQuotaError(error) {
  return (
    error?.name === 'QuotaExceededError' ||
    error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    error?.code === 22 ||
    error?.code === 1014
  )
}

function DashboardImages() {
  const [slides, setSlides] = useState(() => getSlides())
  const [heroForm, setHeroForm] = useState(() => getHeroContent())
  const [slideForm, setSlideForm] = useState(emptySlideForm)
  const [slideModalOpen, setSlideModalOpen] = useState(false)
  const [imageProcessing, setImageProcessing] = useState(false)
  const slideFileRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const compactOldImages = async () => {
      const hasLargeStoredImages = slides.some(
        (slide) =>
          typeof slide.image === 'string' &&
          slide.image.startsWith('data:image/') &&
          slide.image.length > TARGET_DATA_URL_LENGTH,
      )

      if (!hasLargeStoredImages) return

      try {
        const optimizedSlides = await Promise.all(
          slides.map(async (slide) => {
            if (
              typeof slide.image !== 'string' ||
              !slide.image.startsWith('data:image/') ||
              slide.image.length <= TARGET_DATA_URL_LENGTH
            ) {
              return slide
            }

            try {
              return {
                ...slide,
                image: await optimizeImageSource(slide.image),
              }
            } catch {
              return slide
            }
          }),
        )

        if (cancelled) return

        const saved = saveSlides(optimizedSlides)
        setSlides(saved)
      } catch {
        // اگر تصاویر قدیمی قابل فشرده‌سازی نبودند، اطلاعات فعلی دست‌نخورده می‌ماند.
      }
    }

    compactOldImages()

    return () => {
      cancelled = true
    }
    // فقط هنگام بازشدن صفحه اجرا شود.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateSlideForm = (name, value) => {
    setSlideForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const updateHeroForm = (name, value) => {
    setHeroForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const closeSlideModal = () => {
    setSlideModalOpen(false)
    setImageProcessing(false)

    if (slideFileRef.current) {
      slideFileRef.current.value = ''
    }
  }

  const openNewSlide = () => {
    setSlideForm({
      ...emptySlideForm,
      order: slides.length + 1,
    })
    setSlideModalOpen(true)
  }

  const openEditSlide = (slide) => {
    setSlideForm({
      ...slide,
      active: slide.active ?? slide.isActive ?? true,
    })
    setSlideModalOpen(true)
  }

  const handleSlideImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showAdminWarning('فقط فایل تصویری انتخاب کنید.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_SOURCE_IMAGE_SIZE) {
      showAdminWarning('حجم عکس اصلی باید کمتر از ۲ مگابایت باشد.')
      event.target.value = ''
      return
    }

    setImageProcessing(true)

    try {
      const dataUrl = await fileToDataUrl(file)
      const optimized = await optimizeImageSource(dataUrl)
      updateSlideForm('image', optimized)
    } catch {
      showAdminError('خواندن یا آماده‌سازی عکس موفق نشد. دوباره تلاش کنید.')
    } finally {
      setImageProcessing(false)
    }
  }

  const persistSlides = (nextSlides) => {
    try {
      const saved = saveSlides(nextSlides)
      setSlides(saved)
      return saved
    } catch (storageError) {
      if (isStorageQuotaError(storageError)) {
        showAdminError(
          'فضای ذخیره‌سازی مرورگر پر شده است. تصاویر قدیمی را ویرایش و دوباره ذخیره کنید تا فشرده شوند، یا یکی از تصاویر بسیار بزرگ را حذف کنید.',
          'فضای ذخیره‌سازی پر است',
        )
      } else {
        showAdminError('ذخیره معلومات موفق نشد. دوباره تلاش کنید.')
      }
      return null
    }
  }

  const saveSlide = async (event) => {
    event.preventDefault()

    if (imageProcessing) {
      showAdminWarning('لطفاً تا آماده‌شدن عکس صبر کنید.')
      return
    }

    if (!slideForm.image) {
      showAdminWarning('عکس الزامی است.')
      return
    }

    if (!slideForm.title.trim()) {
      showAdminWarning('عنوان الزامی است.')
      return
    }

    let finalImage = slideForm.image

    if (
      finalImage.startsWith('data:image/') &&
      finalImage.length > TARGET_DATA_URL_LENGTH
    ) {
      try {
        setImageProcessing(true)
        finalImage = await optimizeImageSource(finalImage)
      } catch {
        // اگر فشرده‌سازی دوباره شکست خورد، همان عکس فعلی ذخیره می‌شود.
      } finally {
        setImageProcessing(false)
      }
    }

    const record = {
      ...slideForm,
      image: finalImage,
      id: slideForm.id || `slide-${Date.now()}`,
      title: slideForm.title.trim(),
      subtitle: slideForm.subtitle.trim(),
      badge: slideForm.badge.trim() || 'ALIMI PAINT',
      alt: slideForm.alt.trim() || slideForm.title.trim(),
      order: Number(slideForm.order) || slides.length + 1,
      active: slideForm.active !== false,
      isActive: slideForm.active !== false,
    }

    const nextSlides = slideForm.id
      ? slides.map((item) =>
          item.id === slideForm.id ? record : item,
        )
      : [...slides, record]

    const saved = persistSlides(nextSlides)
    if (saved) {
      closeSlideModal()
      showAdminSuccess(slideForm.id ? 'عکس ویرایش شد.' : 'عکس جدید اضافه شد.')
    }
  }

  const askRemoveSlide = async (slide) => {
    const confirmed = await confirmAdminAction({
      title: 'حذف عکس داشبورد',
      text: `آیا عکس «${slide.title || 'بدون عنوان'}» حذف شود؟ این عمل قابل برگشت نیست.`,
      confirmText: 'حذف',
      cancelText: 'انصراف',
    })

    if (!confirmed) return

    const nextSlides = slides
      .filter((item) => item.id !== slide.id)
      .map((item, index) => ({
        ...item,
        order: index + 1,
      }))

    try {
      const saved = saveSlides(nextSlides)
      setSlides(saved)
      showAdminSuccess('عکس حذف شد.')
    } catch {
      showAdminError('حذف عکس موفق نشد. دوباره تلاش کنید.')
    }
  }


  const toggleSlide = (id) => {
    const nextSlides = slides.map((item) => {
      if (item.id !== id) return item

      const currentActive = item.active ?? item.isActive ?? true

      return {
        ...item,
        active: !currentActive,
        isActive: !currentActive,
      }
    })

    try {
      setSlides(saveSlides(nextSlides))
    } catch {
      showAdminError('تغییر وضعیت عکس ذخیره نشد.')
    }
  }

  const saveHero = (event) => {
    event.preventDefault()

    const rotatingWords = Array.isArray(heroForm.rotatingWords)
      ? heroForm.rotatingWords
      : String(heroForm.rotatingWords || '')
          .split('\n')
          .map((word) => word.trim())
          .filter(Boolean)

    if (!heroForm.titleBefore.trim()) {
      showAdminWarning('عنوان اصلی الزامی است.')
      return
    }

    if (!heroForm.titleHighlight.trim()) {
      showAdminWarning('عنوان نارنجی الزامی است.')
      return
    }

    try {
      const saved = saveHeroContent({
        ...heroForm,
        rotatingWords,
      })

      setHeroForm(getHeroContent(saved))
      showAdminSuccess('متن‌های داشبورد با موفقیت ذخیره شد.')
    } catch {
      showAdminError('ذخیره متن‌های داشبورد موفق نشد.')
    }
  }

  const restoreHero = async () => {
    const confirmed = await confirmAdminAction({
      title: 'بازگردانی متن‌های پیش‌فرض',
      text: 'متن‌های پیش‌فرض داشبورد بازگردانده شوند؟',
      confirmText: 'بله، بازگردانی شود',
    })

    if (!confirmed) return

    setHeroForm(resetHeroContent())
    showAdminSuccess('متن‌های پیش‌فرض بازگردانده شد.')
  }


  return (
    <div className="dashboard-images-page">
      <header className="dashboard-images-header">
        <div>
          <small>مدیریت صفحه اصلی</small>
          <h1>عکس‌ها و متن‌های داشبورد</h1>
          <p>فقط اسلایدر و متن‌های بخش اول داشبورد را مدیریت کنید.</p>
        </div>

        <button type="button" onClick={openNewSlide}>
          <Plus size={18} />
          عکس جدید
        </button>
      </header>

      <section className="dashboard-admin-section">
        <div className="dashboard-admin-section-header">
          <div>
            <small>قسمت سمت راست داشبورد</small>
            <h2>متن‌های بخش اول</h2>
          </div>

          <button type="button" onClick={restoreHero}>
            <RotateCcw size={16} />
            بازگردانی پیش‌فرض
          </button>
        </div>

        <form className="dashboard-admin-form" onSubmit={saveHero}>
          <div className="dashboard-admin-grid">
            <label>
              <span>متن کوچک بالای عنوان</span>
              <input
                value={heroForm.eyebrow || ''}
                maxLength={60}
                onChange={(event) =>
                  updateHeroForm('eyebrow', event.target.value)
                }
              />
            </label>

            <label>
              <span>بخش اول عنوان</span>
              <input
                value={heroForm.titleBefore || ''}
                maxLength={35}
                onChange={(event) =>
                  updateHeroForm('titleBefore', event.target.value)
                }
              />
            </label>

            <label>
              <span>بخش نارنجی عنوان</span>
              <input
                value={heroForm.titleHighlight || ''}
                maxLength={40}
                onChange={(event) =>
                  updateHeroForm('titleHighlight', event.target.value)
                }
              />
            </label>

            <label>
              <span>متن قبل از کلمه متغیر</span>
              <input
                value={heroForm.changingPrefix || ''}
                maxLength={50}
                onChange={(event) =>
                  updateHeroForm('changingPrefix', event.target.value)
                }
              />
            </label>

            <label className="is-full">
              <span>کلمه‌های متغیر</span>
              <textarea
                rows={5}
                value={
                  Array.isArray(heroForm.rotatingWords)
                    ? heroForm.rotatingWords.join('\n')
                    : heroForm.rotatingWords || ''
                }
                onChange={(event) =>
                  updateHeroForm('rotatingWords', event.target.value)
                }
              />
              <small>هر کلمه را در یک خط جدا بنویسید.</small>
            </label>

            <label className="is-full">
              <span>توضیحات</span>
              <textarea
                rows={4}
                maxLength={220}
                value={heroForm.description || ''}
                onChange={(event) =>
                  updateHeroForm('description', event.target.value)
                }
              />
            </label>

            <label>
              <span>متن دکمه اصلی</span>
              <input
                value={heroForm.primaryButtonText || ''}
                onChange={(event) =>
                  updateHeroForm('primaryButtonText', event.target.value)
                }
              />
            </label>

            <label>
              <span>لینک دکمه اصلی</span>
              <input
                value={heroForm.primaryButtonLink || ''}
                onChange={(event) =>
                  updateHeroForm('primaryButtonLink', event.target.value)
                }
              />
            </label>

            <label>
              <span>متن دکمه دوم</span>
              <input
                value={heroForm.secondaryButtonText || ''}
                onChange={(event) =>
                  updateHeroForm('secondaryButtonText', event.target.value)
                }
              />
            </label>

            <label>
              <span>لینک دکمه دوم</span>
              <input
                value={heroForm.secondaryButtonLink || ''}
                onChange={(event) =>
                  updateHeroForm('secondaryButtonLink', event.target.value)
                }
              />
            </label>
          </div>

          <div className="dashboard-admin-form-actions">
            <button type="submit">
              <Save size={17} />
              ذخیره متن‌ها
            </button>
          </div>
        </form>
      </section>

      <section className="dashboard-admin-section">
        <div className="dashboard-admin-section-header">
          <div>
            <small>اسلایدر صفحه اصلی</small>
            <h2>عکس‌های داشبورد</h2>
          </div>
        </div>

        <div className="dashboard-images-guide">
          <span>
            <strong>سایز:</strong> حداکثر ۱۲۰۰ × ۱۵۰۰
          </span>
          <span>
            <strong>فرمت:</strong> WebP، JPG یا PNG
          </span>
          <span>
            <strong>حجم فایل اصلی:</strong> کمتر از ۲MB
          </span>
          <span>
            <strong>تعداد:</strong> بدون محدودیت ۳ عکس
          </span>
        </div>

        {slides.length === 0 ? (
          <div className="dashboard-images-empty">
            هنوز هیچ عکسی برای اسلایدر ثبت نشده است.
          </div>
        ) : (
          <div className="dashboard-images-grid">
            {slides.map((slide) => {
              const isActive = slide.active ?? slide.isActive ?? true

              return (
                <article
                  key={slide.id}
                  className={!isActive ? 'is-disabled' : ''}
                >
                  <div className="dashboard-images-card-photo">
                    <img
                      src={slide.image}
                      alt={slide.alt || slide.title}
                      style={{ objectPosition: slide.objectPosition }}
                    />

                    <div className="dashboard-images-card-overlay" />

                    <div className="dashboard-images-card-text">
                      <small>{slide.badge}</small>
                      <h3>{slide.title}</h3>
                      <p>{slide.subtitle}</p>
                    </div>
                  </div>

                  <footer>
                    <button
                      type="button"
                      title={isActive ? 'مخفی‌کردن' : 'نمایش‌دادن'}
                      onClick={() => toggleSlide(slide.id)}
                    >
                      {isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>

                    <button
                      type="button"
                      title="ویرایش"
                      onClick={() => openEditSlide(slide)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      className="danger"
                      title="حذف"
                      onClick={() => askRemoveSlide(slide)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </footer>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {slideModalOpen && (
        <div
          className="dashboard-images-modal-backdrop"
          onMouseDown={closeSlideModal}
        >
          <form
            className="dashboard-images-modal"
            onSubmit={saveSlide}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="dashboard-images-modal-title">
              <h2>{slideForm.id ? 'ویرایش عکس' : 'اضافه‌کردن عکس'}</h2>

              <button type="button" onClick={closeSlideModal}>
                <X size={20} />
              </button>
            </div>

            <div className="dashboard-images-form-layout">
              <div className="dashboard-images-upload-column">
                <button
                  type="button"
                  className="dashboard-images-upload"
                  disabled={imageProcessing}
                  onClick={() => slideFileRef.current?.click()}
                >
                  {slideForm.image ? (
                    <img
                      src={slideForm.image}
                      alt="پیش‌نمایش"
                      style={{ objectPosition: slideForm.objectPosition }}
                    />
                  ) : (
                    <span>
                      <ImagePlus size={34} />
                      <strong>
                        {imageProcessing ? 'در حال آماده‌سازی...' : 'انتخاب عکس'}
                      </strong>
                      <small>حداکثر ۱۲۰۰ × ۱۵۰۰، کمتر از ۲MB</small>
                    </span>
                  )}
                </button>

                <input
                  ref={slideFileRef}
                  type="file"
                  accept="image/webp,image/jpeg,image/png"
                  hidden
                  onChange={handleSlideImage}
                />

                {imageProcessing && (
                  <div className="dashboard-images-processing">
                    عکس برای ذخیره‌سازی بهینه می‌شود...
                  </div>
                )}
              </div>

              <div className="dashboard-images-fields">
                <label>
                  عنوان اصلی
                  <input
                    value={slideForm.title}
                    maxLength={45}
                    onChange={(event) =>
                      updateSlideForm('title', event.target.value)
                    }
                  />
                </label>

                <label>
                  متن توضیح
                  <textarea
                    rows={3}
                    value={slideForm.subtitle}
                    maxLength={90}
                    onChange={(event) =>
                      updateSlideForm('subtitle', event.target.value)
                    }
                  />
                </label>

                <label>
                  متن کوچک
                  <input
                    value={slideForm.badge}
                    maxLength={24}
                    onChange={(event) =>
                      updateSlideForm('badge', event.target.value)
                    }
                  />
                </label>

                <label>
                  موقعیت عکس
                  <select
                    value={slideForm.objectPosition}
                    onChange={(event) =>
                      updateSlideForm('objectPosition', event.target.value)
                    }
                  >
                    <option value="center">وسط</option>
                    <option value="top">بالا</option>
                    <option value="bottom">پایین</option>
                    <option value="left">چپ</option>
                    <option value="right">راست</option>
                  </select>
                </label>

                <label>
                  ترتیب نمایش
                  <input
                    type="number"
                    min="1"
                    value={slideForm.order}
                    onChange={(event) =>
                      updateSlideForm('order', event.target.value)
                    }
                  />
                </label>

                <label>
                  متن جایگزین عکس
                  <input
                    value={slideForm.alt}
                    maxLength={80}
                    onChange={(event) =>
                      updateSlideForm('alt', event.target.value)
                    }
                  />
                </label>

                <label className="dashboard-images-check">
                  <input
                    type="checkbox"
                    checked={slideForm.active !== false}
                    onChange={(event) =>
                      updateSlideForm('active', event.target.checked)
                    }
                  />
                  نمایش در داشبورد
                </label>
              </div>
            </div>


            <div className="dashboard-images-modal-actions">
              <button type="button" onClick={closeSlideModal}>
                انصراف
              </button>

              <button
                type="submit"
                className="save"
                disabled={imageProcessing}
              >
                <Save size={17} />
                {imageProcessing ? 'در حال آماده‌سازی...' : 'ذخیره'}
              </button>
            </div>
          </form>
        </div>
      )}


    </div>
  )
}

export default DashboardImages
