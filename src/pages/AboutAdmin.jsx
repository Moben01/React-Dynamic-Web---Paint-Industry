import { useRef, useState } from 'react'
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
  aboutValueIconOptions,
  loadAboutData,
  resetAboutData,
  saveAboutData,
} from '../data/aboutStore'
import {
  confirmAdminAction,
  showAdminSuccess,
  showAdminWarning,
} from '../utils/adminAlert'
import './AboutAdmin.css'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ABOUT_BG_WIDTH = 1920
const ABOUT_BG_HEIGHT = 900

function compressBackgroundImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('read-error'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('image-error'))
      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = ABOUT_BG_WIDTH
        canvas.height = ABOUT_BG_HEIGHT

        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('canvas-error'))
          return
        }

        const sourceRatio = image.width / image.height
        const targetRatio = ABOUT_BG_WIDTH / ABOUT_BG_HEIGHT
        let sx = 0
        let sy = 0
        let sw = image.width
        let sh = image.height

        if (sourceRatio > targetRatio) {
          sw = image.height * targetRatio
          sx = (image.width - sw) / 2
        } else {
          sh = image.width / targetRatio
          sy = (image.height - sh) / 2
        }

        context.drawImage(
          image,
          sx,
          sy,
          sw,
          sh,
          0,
          0,
          ABOUT_BG_WIDTH,
          ABOUT_BG_HEIGHT,
        )

        resolve(canvas.toDataURL('image/webp', 0.82))
      }
      image.src = String(reader.result || '')
    }

    reader.readAsDataURL(file)
  })
}

function AboutAdmin() {
  const [data, setData] = useState(loadAboutData)
  const [activeSection, setActiveSection] =
    useState('intro')
  const [valueModal, setValueModal] =
    useState(false)
  const [valueDraft, setValueDraft] =
    useState(null)
  const [backgroundUrl, setBackgroundUrl] = useState('')
  const backgroundInputRef = useRef(null)
  const imageRefs = {
    factoryImage: useRef(null),
  }

  const persist = (
    nextData,
    message = '',
  ) => {
    setData(nextData)
    saveAboutData(nextData)

    if (message) {
      showAdminSuccess(message)
    }
  }

  const updateSection = (
    section,
    field,
    value,
  ) => {
    setData((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }))
  }

  const updateVisionStat = (
    index,
    field,
    value,
  ) => {
    setData((current) => ({
      ...current,
      vision: {
        ...current.vision,
        stats: current.vision.stats.map(
          (stat, statIndex) =>
            statIndex === index
              ? {
                  ...stat,
                  [field]: value,
                }
              : stat,
        ),
      },
    }))
  }

  const updateTimeline = (
    index,
    field,
    value,
  ) => {
    setData((current) => ({
      ...current,
      story: {
        ...current.story,
        timeline:
          current.story.timeline.map(
            (item, itemIndex) =>
              itemIndex === index
                ? {
                    ...item,
                    [field]: value,
                  }
                : item,
          ),
      },
    }))
  }

  const addTimeline = () => {
    setData((current) => ({
      ...current,
      story: {
        ...current.story,
        timeline: [
          ...current.story.timeline,
          {
            id: `timeline-${Date.now()}`,
            year: '',
            title: '',
            description: '',
          },
        ],
      },
    }))
  }

  const removeTimeline = (id) => {
    setData((current) => ({
      ...current,
      story: {
        ...current.story,
        timeline:
          current.story.timeline.filter(
            (item) => item.id !== id,
          ),
      },
    }))
  }

  const updateChecklist = (
    index,
    value,
  ) => {
    setData((current) => ({
      ...current,
      factory: {
        ...current.factory,
        checklist:
          current.factory.checklist.map(
            (item, itemIndex) =>
              itemIndex === index
                ? { ...item, text: value }
                : item,
          ),
      },
    }))
  }

  const addChecklist = () => {
    setData((current) => ({
      ...current,
      factory: {
        ...current.factory,
        checklist: [
          ...current.factory.checklist,
          {
            id: `factory-item-${Date.now()}`,
            text: '',
          },
        ],
      },
    }))
  }

  const removeChecklist = (id) => {
    setData((current) => ({
      ...current,
      factory: {
        ...current.factory,
        checklist:
          current.factory.checklist.filter(
            (item) => item.id !== id,
          ),
      },
    }))
  }

  const selectImage = (
    event,
    section,
    field,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (!file.type.startsWith('image/')) {
      showAdminWarning('فقط فایل تصویری انتخاب کنید.')
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showAdminWarning('حجم عکس باید کمتر از ۳ مگابایت باشد.')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      updateSection(
        section,
        field,
        String(reader.result || ''),
      )
    }

    reader.readAsDataURL(file)
  }

  const addBackgroundFiles = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''

    if (!files.length) return

    const invalid = files.find((file) => !file.type.startsWith('image/'))
    if (invalid) {
      showAdminWarning('فقط فایل‌های تصویری انتخاب کنید.')
      return
    }

    const tooLarge = files.find((file) => file.size > MAX_IMAGE_SIZE)
    if (tooLarge) {
      showAdminWarning('حجم هر عکس باید کمتر از ۵ مگابایت باشد.')
      return
    }

    try {
      const prepared = await Promise.all(files.map(compressBackgroundImage))
      setData((current) => {
        const currentImages = current.intro.backgroundImages || []
        const next = prepared.map((url, index) => ({
          id: `about-bg-${Date.now()}-${index}`,
          url,
          alt: `پس‌زمینه درباره ما ${currentImages.length + index + 1}`,
          active: true,
          order: currentImages.length + index + 1,
        }))

        return {
          ...current,
          intro: {
            ...current.intro,
            backgroundImages: [...currentImages, ...next],
          },
        }
      })
    } catch {
      showAdminWarning('پردازش یکی از عکس‌ها موفق نشد. دوباره تلاش کنید.')
    }
  }

  const addBackgroundUrl = () => {
    const url = backgroundUrl.trim()
    if (!url) {
      showAdminWarning('آدرس عکس را وارد کنید.')
      return
    }

    setData((current) => {
      const currentImages = current.intro.backgroundImages || []
      return {
        ...current,
        intro: {
          ...current.intro,
          backgroundImages: [
            ...currentImages,
            {
              id: `about-bg-url-${Date.now()}`,
              url,
              alt: `پس‌زمینه درباره ما ${currentImages.length + 1}`,
              active: true,
              order: currentImages.length + 1,
            },
          ],
        },
      }
    })
    setBackgroundUrl('')
  }

  const removeBackground = async (id) => {
    const images = data.intro.backgroundImages || []
    if (images.length <= 1) {
      showAdminWarning('حداقل یک عکس پس‌زمینه باید باقی بماند.')
      return
    }

    const confirmed = await confirmAdminAction({
      title: 'حذف عکس پس‌زمینه',
      text: 'این عکس از اسلایدر پس‌زمینه حذف شود؟',
      confirmText: 'حذف',
    })

    if (!confirmed) return

    setData((current) => ({
      ...current,
      intro: {
        ...current.intro,
        backgroundImages: (current.intro.backgroundImages || [])
          .filter((item) => item.id !== id)
          .map((item, index) => ({ ...item, order: index + 1 })),
      },
    }))
  }

  const toggleBackground = (id) => {
    setData((current) => ({
      ...current,
      intro: {
        ...current.intro,
        backgroundImages: (current.intro.backgroundImages || []).map((item) =>
          item.id === id ? { ...item, active: item.active === false } : item,
        ),
      },
    }))
  }

  const updateBackgroundAlt = (id, value) => {
    setData((current) => ({
      ...current,
      intro: {
        ...current.intro,
        backgroundImages: (current.intro.backgroundImages || []).map((item) =>
          item.id === id ? { ...item, alt: value } : item,
        ),
      },
    }))
  }

  const openNewValue = () => {
    setValueDraft({
      id: '',
      icon: 'shield',
      title: '',
      description: '',
      active: true,
      order: data.values.length + 1,
    })
    setValueModal(true)
  }

  const openEditValue = (value) => {
    setValueDraft({ ...value })
    setValueModal(true)
  }

  const saveValue = (event) => {
    event.preventDefault()

    if (!valueDraft.title.trim()) {
      showAdminWarning('عنوان ارزش الزامی است.')
      return
    }

    const record = {
      ...valueDraft,
      id:
        valueDraft.id ||
        `value-${Date.now()}`,
      title: valueDraft.title.trim(),
      description:
        valueDraft.description.trim(),
      order:
        Number(valueDraft.order) ||
        data.values.length + 1,
      active:
        valueDraft.active !== false,
    }

    const nextValues = valueDraft.id
      ? data.values.map((item) =>
          item.id === valueDraft.id
            ? record
            : item,
        )
      : [...data.values, record]

    persist(
      {
        ...data,
        values: nextValues,
      },
      valueDraft.id
        ? 'ارزش ویرایش شد.'
        : 'ارزش جدید اضافه شد.',
    )

    setValueModal(false)
    setValueDraft(null)
  }

  const removeValue = async (id) => {
    const value = data.values.find((item) => item.id === id)
    const confirmed = await confirmAdminAction({
      title: 'حذف ارزش',
      text: value?.title
        ? `آیا «${value.title}» حذف شود؟ این عمل قابل برگشت نیست.`
        : 'این ارزش حذف شود؟ این عمل قابل برگشت نیست.',
      confirmText: 'حذف',
      cancelText: 'انصراف',
    })

    if (!confirmed) return

    persist(
      {
        ...data,
        values: data.values.filter((item) => item.id !== id),
      },
      'ارزش حذف شد.',
    )
  }

  const toggleValue = (id) => {
    persist({
      ...data,
      values: data.values.map((item) =>
        item.id === id
          ? {
              ...item,
              active:
                item.active === false,
            }
          : item,
      ),
    })
  }

  const saveCurrentSection = () => {
    persist(
      data,
      'تغییرات صفحه درباره ما ذخیره شد.',
    )
  }

  const resetAll = async () => {
    const confirmed = await confirmAdminAction({
      title: 'بازگردانی معلومات اولیه',
      text: 'تمام معلومات درباره ما به حالت اولیه برگردد؟',
      confirmText: 'بله، بازگردانی شود',
    })

    if (!confirmed) return

    setData(resetAboutData())
    showAdminSuccess('معلومات صفحه درباره ما به حالت اولیه بازگردانده شد.')
  }

  return (
    <div className="about-admin">
      <div className="about-admin-tabs">
        {[
          ['intro', 'بخش معرفی'],
          ['vision', 'دیدگاه و آمار'],
          ['story', 'داستان شرکت'],
          ['values', 'ارزش‌ها'],
          ['factory', 'کارخانه'],
          ['contact', 'تماس پایانی'],
        ].map(([id, label]) => (
          <button
            type="button"
            key={id}
            className={
              activeSection === id
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveSection(id)
            }
          >
            {label}
          </button>
        ))}

        <button
          type="button"
          className="about-admin-reset"
          onClick={resetAll}
        >
          <RotateCcw size={16} />
          بازگردانی اولیه
        </button>
      </div>

      {activeSection === 'intro' && (
        <section className="about-admin-card">
          <header>
            <div>
              <h3>بخش اول صفحه درباره ما</h3>
              <p>
                متن معرفی و اسلایدر عکس‌های پس‌زمینه را مدیریت کنید.
              </p>
            </div>
          </header>

          <div className="about-admin-form-grid">
            <label>
              <span>نوشته کوچک بالا</span>
              <input
                value={data.intro.kicker}
                onChange={(event) =>
                  updateSection('intro', 'kicker', event.target.value)
                }
              />
            </label>

            <label>
              <span>قسمت اول عنوان</span>
              <input
                value={data.intro.title}
                onChange={(event) =>
                  updateSection('intro', 'title', event.target.value)
                }
              />
            </label>

            <label>
              <span>قسمت رنگی عنوان</span>
              <input
                value={data.intro.highlight}
                onChange={(event) =>
                  updateSection('intro', 'highlight', event.target.value)
                }
              />
            </label>

            <label>
              <span>متن دکمه</span>
              <input
                value={data.intro.buttonText}
                onChange={(event) =>
                  updateSection('intro', 'buttonText', event.target.value)
                }
              />
            </label>

            <label className="about-admin-full">
              <span>توضیحات</span>
              <textarea
                rows="4"
                value={data.intro.description}
                onChange={(event) =>
                  updateSection('intro', 'description', event.target.value)
                }
              />
            </label>

            <label>
              <span>زمان تغییر هر عکس</span>
              <select
                value={Number(data.intro.backgroundInterval || 5000)}
                onChange={(event) =>
                  updateSection('intro', 'backgroundInterval', Number(event.target.value))
                }
              >
                <option value={3000}>۳ ثانیه</option>
                <option value={4000}>۴ ثانیه</option>
                <option value={5000}>۵ ثانیه</option>
                <option value={7000}>۷ ثانیه</option>
                <option value={10000}>۱۰ ثانیه</option>
              </select>
            </label>
          </div>

          <div className="about-bg-manager">
            <div className="about-bg-manager-head">
              <div>
                <h4>عکس‌های پس‌زمینه</h4>
                <p>
                  اندازه پیشنهادی: <strong>1920 × 900 پیکسل</strong> — JPG، PNG یا WebP — حجم هر عکس کمتر از ۵MB.
                  عکس‌های آپلودی به‌صورت خودکار به WebP و همین اندازه تبدیل می‌شوند.
                </p>
              </div>

              <button
                type="button"
                className="about-bg-upload-button"
                onClick={() => backgroundInputRef.current?.click()}
              >
                <ImagePlus size={18} />
                افزودن چند عکس
              </button>
              <input
                ref={backgroundInputRef}
                type="file"
                accept="image/webp,image/jpeg,image/png"
                multiple
                hidden
                onChange={addBackgroundFiles}
              />
            </div>

            <div className="about-bg-url-row">
              <input
                value={backgroundUrl}
                onChange={(event) => setBackgroundUrl(event.target.value)}
                placeholder="https://... آدرس عکس از اینترنت"
                dir="ltr"
              />
              <button type="button" onClick={addBackgroundUrl}>
                <Plus size={17} />
                افزودن از لینک
              </button>
            </div>

            <div className="about-bg-grid">
              {(data.intro.backgroundImages || []).map((item, index) => (
                <article
                  className={`about-bg-item ${item.active === false ? 'is-disabled' : ''}`}
                  key={item.id || `${item.url}-${index}`}
                >
                  <div className="about-bg-preview">
                    <img src={item.url} alt={item.alt || `پس‌زمینه ${index + 1}`} />
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </div>

                  <div className="about-bg-item-body">
                    <label>
                      <span>متن Alt</span>
                      <input
                        value={item.alt || ''}
                        onChange={(event) => updateBackgroundAlt(item.id, event.target.value)}
                      />
                    </label>

                    <div className="about-bg-actions">
                      <button
                        type="button"
                        className={item.active === false ? '' : 'active'}
                        onClick={() => toggleBackground(item.id)}
                        title={item.active === false ? 'فعال‌کردن' : 'غیرفعال‌کردن'}
                      >
                        {item.active === false ? <EyeOff size={16} /> : <Eye size={16} />}
                        {item.active === false ? 'غیرفعال' : 'فعال'}
                      </button>

                      <button
                        type="button"
                        className="danger"
                        onClick={() => removeBackground(item.id)}
                        title="حذف"
                      >
                        <Trash2 size={16} />
                        حذف
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <SaveFooter onSave={saveCurrentSection} />
        </section>
      )}

      {activeSection === 'vision' && (
        <section className="about-admin-card">
          <header>
            <div>
              <h3>دیدگاه و آمار شرکت</h3>
              <p>
                متن کارت تیره و چهار آمار این بخش را ویرایش کنید.
              </p>
            </div>
          </header>

          <div className="about-admin-form-grid">
            <label>
              <span>نوشته کوچک</span>
              <input
                value={data.vision.kicker}
                onChange={(event) =>
                  updateSection(
                    'vision',
                    'kicker',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="about-admin-full">
              <span>عنوان دیدگاه</span>
              <textarea
                rows="3"
                value={data.vision.title}
                onChange={(event) =>
                  updateSection(
                    'vision',
                    'title',
                    event.target.value,
                  )
                }
              />
            </label>
          </div>

          <div className="about-admin-stats">
            {data.vision.stats.map(
              (stat, index) => (
                <article key={stat.id}>
                  <strong>
                    آمار {index + 1}
                  </strong>

                  <label>
                    <span>مقدار</span>
                    <input
                      value={stat.value}
                      onChange={(event) =>
                        updateVisionStat(
                          index,
                          'value',
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>عنوان</span>
                    <input
                      value={stat.label}
                      onChange={(event) =>
                        updateVisionStat(
                          index,
                          'label',
                          event.target.value,
                        )
                      }
                    />
                  </label>
                </article>
              ),
            )}
          </div>

          <SaveFooter
            onSave={saveCurrentSection}
          />
        </section>
      )}

      {activeSection === 'story' && (
        <section className="about-admin-card">
          <header>
            <div>
              <h3>داستان رشد شرکت</h3>
              <p>
                عنوان‌ها و مراحل خط زمانی شرکت را مدیریت کنید.
              </p>
            </div>

            <button
              type="button"
              onClick={addTimeline}
            >
              <Plus size={16} />
              افزودن مرحله
            </button>
          </header>

          <div className="about-admin-form-grid">
            <label>
              <span>نوشته کوچک</span>
              <input
                value={data.story.kicker}
                onChange={(event) =>
                  updateSection(
                    'story',
                    'kicker',
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>قسمت اول عنوان</span>
              <input
                value={data.story.title}
                onChange={(event) =>
                  updateSection(
                    'story',
                    'title',
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>قسمت رنگی عنوان</span>
              <input
                value={data.story.highlight}
                onChange={(event) =>
                  updateSection(
                    'story',
                    'highlight',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="about-admin-full">
              <span>توضیحات</span>
              <textarea
                rows="4"
                value={data.story.description}
                onChange={(event) =>
                  updateSection(
                    'story',
                    'description',
                    event.target.value,
                  )
                }
              />
            </label>
          </div>

          <div className="about-admin-repeat-list">
            {data.story.timeline.map(
              (item, index) => (
                <article key={item.id}>
                  <div>
                    <strong>
                      مرحله {index + 1}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        removeTimeline(item.id)
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <label>
                    <span>سال</span>
                    <input
                      value={item.year}
                      onChange={(event) =>
                        updateTimeline(
                          index,
                          'year',
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>عنوان</span>
                    <input
                      value={item.title}
                      onChange={(event) =>
                        updateTimeline(
                          index,
                          'title',
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label className="wide">
                    <span>توضیحات</span>
                    <textarea
                      rows="3"
                      value={item.description}
                      onChange={(event) =>
                        updateTimeline(
                          index,
                          'description',
                          event.target.value,
                        )
                      }
                    />
                  </label>
                </article>
              ),
            )}
          </div>

          <SaveFooter
            onSave={saveCurrentSection}
          />
        </section>
      )}

      {activeSection === 'values' && (
        <>
          <section className="about-admin-card">
            <header>
              <div>
                <h3>عنوان بخش ارزش‌ها</h3>
                <p>
                  متن بالای کارت‌های ارزش‌های شرکت را ویرایش کنید.
                </p>
              </div>
            </header>

            <div className="about-admin-form-grid">
              <label>
                <span>نوشته کوچک</span>
                <input
                  value={
                    data.valuesSection.kicker
                  }
                  onChange={(event) =>
                    updateSection(
                      'valuesSection',
                      'kicker',
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>قسمت اول عنوان</span>
                <input
                  value={
                    data.valuesSection.title
                  }
                  onChange={(event) =>
                    updateSection(
                      'valuesSection',
                      'title',
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>قسمت رنگی عنوان</span>
                <input
                  value={
                    data.valuesSection
                      .highlight
                  }
                  onChange={(event) =>
                    updateSection(
                      'valuesSection',
                      'highlight',
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="about-admin-full">
                <span>توضیحات</span>
                <textarea
                  rows="3"
                  value={
                    data.valuesSection
                      .description
                  }
                  onChange={(event) =>
                    updateSection(
                      'valuesSection',
                      'description',
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>

            <SaveFooter
              onSave={saveCurrentSection}
            />
          </section>

          <div className="about-admin-toolbar">
            <div>
              <strong>
                کارت‌های ارزش‌های شرکت
              </strong>
              <span>
                {data.values.length} مورد ثبت شده است.
              </span>
            </div>

            <button
              type="button"
              onClick={openNewValue}
            >
              <Plus size={16} />
              افزودن ارزش
            </button>
          </div>

          <div className="about-admin-values-grid">
            {[...data.values]
              .sort(
                (first, second) =>
                  Number(first.order || 0) -
                  Number(second.order || 0),
              )
              .map((item) => (
                <article
                  key={item.id}
                  className={
                    item.active === false
                      ? 'disabled'
                      : ''
                  }
                >
                  <small>{item.icon}</small>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>

                  <footer>
                    <button
                      type="button"
                      onClick={() =>
                        toggleValue(item.id)
                      }
                      title={
                        item.active === false
                          ? 'فعال‌کردن'
                          : 'غیرفعال‌کردن'
                      }
                    >
                      {item.active === false ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openEditValue(item)
                      }
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      className="danger"
                      onClick={() =>
                        removeValue(item.id)
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </footer>
                </article>
              ))}
          </div>
        </>
      )}

      {activeSection === 'factory' && (
        <section className="about-admin-card">
          <header>
            <div>
              <h3>بخش کارخانه و کنترل کیفیت</h3>
              <p>
                تصویر، عنوان، توضیحات و فهرست کنترلی را مدیریت کنید.
              </p>
            </div>

            <button
              type="button"
              onClick={addChecklist}
            >
              <Plus size={16} />
              افزودن مورد
            </button>
          </header>

          <div className="about-admin-factory-layout">
            <ImageEditor
              title="تصویر کارخانه"
              value={data.factory.image}
              alt={data.factory.imageAlt}
              inputRef={
                imageRefs.factoryImage
              }
              onFile={(event) =>
                selectImage(
                  event,
                  'factory',
                  'image',
                )
              }
              onUrl={(value) =>
                updateSection(
                  'factory',
                  'image',
                  value,
                )
              }
              onAlt={(value) =>
                updateSection(
                  'factory',
                  'imageAlt',
                  value,
                )
              }
            />

            <div className="about-admin-form-grid">
              <label>
                <span>نوشته کوچک</span>
                <input
                  value={data.factory.kicker}
                  onChange={(event) =>
                    updateSection(
                      'factory',
                      'kicker',
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>قسمت اول عنوان</span>
                <input
                  value={data.factory.title}
                  onChange={(event) =>
                    updateSection(
                      'factory',
                      'title',
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>قسمت رنگی عنوان</span>
                <input
                  value={
                    data.factory.highlight
                  }
                  onChange={(event) =>
                    updateSection(
                      'factory',
                      'highlight',
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="about-admin-full">
                <span>توضیحات</span>
                <textarea
                  rows="4"
                  value={
                    data.factory.description
                  }
                  onChange={(event) =>
                    updateSection(
                      'factory',
                      'description',
                      event.target.value,
                    )
                  }
                />
              </label>

              {data.factory.checklist.map(
                (item, index) => (
                  <label
                    key={item.id}
                    className="about-admin-check-row about-admin-full"
                  >
                    <span>
                      مورد {index + 1}
                    </span>

                    <div>
                      <input
                        value={item.text}
                        onChange={(event) =>
                          updateChecklist(
                            index,
                            event.target.value,
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeChecklist(item.id)
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </label>
                ),
              )}
            </div>
          </div>

          <SaveFooter
            onSave={saveCurrentSection}
          />
        </section>
      )}

      {activeSection === 'contact' && (
        <section className="about-admin-card">
          <header>
            <div>
              <h3>کارت تماس پایین صفحه</h3>
              <p>
                عنوان، توضیح، دکمه و شماره تماس را تغییر دهید.
              </p>
            </div>
          </header>

          <div className="about-admin-form-grid">
            <label>
              <span>نوشته کوچک</span>
              <input
                value={data.contact.kicker}
                onChange={(event) =>
                  updateSection(
                    'contact',
                    'kicker',
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>عنوان</span>
              <input
                value={data.contact.title}
                onChange={(event) =>
                  updateSection(
                    'contact',
                    'title',
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>متن دکمه</span>
              <input
                value={data.contact.buttonText}
                onChange={(event) =>
                  updateSection(
                    'contact',
                    'buttonText',
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>شماره تماس</span>
              <input
                value={data.contact.phone}
                onChange={(event) =>
                  updateSection(
                    'contact',
                    'phone',
                    event.target.value,
                  )
                }
                dir="ltr"
              />
            </label>

            <label className="about-admin-full">
              <span>توضیحات</span>
              <textarea
                rows="4"
                value={
                  data.contact.description
                }
                onChange={(event) =>
                  updateSection(
                    'contact',
                    'description',
                    event.target.value,
                  )
                }
              />
            </label>
          </div>

          <SaveFooter
            onSave={saveCurrentSection}
          />
        </section>
      )}

      {valueModal && valueDraft && (
        <div className="about-admin-backdrop">
          <form
            className="about-admin-modal"
            onSubmit={saveValue}
          >
            <header>
              <div>
                <h2>
                  {valueDraft.id
                    ? 'ویرایش ارزش'
                    : 'افزودن ارزش'}
                </h2>
                <p>
                  معلومات کارت ارزش شرکت را وارد کنید.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setValueModal(false)
                }
              >
                <X size={20} />
              </button>
            </header>

            <div className="about-admin-form-grid">
              <label>
                <span>عنوان *</span>
                <input
                  value={valueDraft.title}
                  onChange={(event) =>
                    setValueDraft(
                      (current) => ({
                        ...current,
                        title:
                          event.target.value,
                      }),
                    )
                  }
                />
              </label>

              <label>
                <span>آیکن</span>
                <select
                  value={valueDraft.icon}
                  onChange={(event) =>
                    setValueDraft(
                      (current) => ({
                        ...current,
                        icon:
                          event.target.value,
                      }),
                    )
                  }
                >
                  {aboutValueIconOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                <span>ترتیب نمایش</span>
                <input
                  type="number"
                  min="1"
                  value={valueDraft.order}
                  onChange={(event) =>
                    setValueDraft(
                      (current) => ({
                        ...current,
                        order:
                          event.target.value,
                      }),
                    )
                  }
                />
              </label>

              <label className="about-admin-checkbox">
                <input
                  type="checkbox"
                  checked={
                    valueDraft.active !== false
                  }
                  onChange={(event) =>
                    setValueDraft(
                      (current) => ({
                        ...current,
                        active:
                          event.target.checked,
                      }),
                    )
                  }
                />
                <span>فعال باشد</span>
              </label>

              <label className="about-admin-full">
                <span>توضیحات</span>
                <textarea
                  rows="4"
                  value={
                    valueDraft.description
                  }
                  onChange={(event) =>
                    setValueDraft(
                      (current) => ({
                        ...current,
                        description:
                          event.target.value,
                      }),
                    )
                  }
                />
              </label>
            </div>


            <footer>
              <button
                type="button"
                onClick={() =>
                  setValueModal(false)
                }
              >
                انصراف
              </button>

              <button
                type="submit"
                className="primary"
              >
                <Save size={16} />
                ذخیره
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  )
}

function ImageEditor({
  title,
  value,
  alt,
  inputRef,
  onFile,
  onUrl,
  onAlt,
}) {
  return (
    <article className="about-admin-image-editor">
      <button
        type="button"
        onClick={() =>
          inputRef.current?.click()
        }
      >
        {value ? (
          <img src={value} alt={alt || title} />
        ) : (
          <span>
            <ImagePlus size={30} />
            انتخاب تصویر
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/webp,image/jpeg,image/png"
        hidden
        onChange={onFile}
      />

      <label>
        <span>{title} — آدرس تصویر</span>
        <input
          value={value}
          onChange={(event) =>
            onUrl(event.target.value)
          }
          dir="ltr"
        />
      </label>

      <label>
        <span>متن Alt</span>
        <input
          value={alt}
          onChange={(event) =>
            onAlt(event.target.value)
          }
        />
      </label>
    </article>
  )
}

function SaveFooter({ onSave }) {
  return (
    <footer className="about-admin-save-footer">
      <button
        type="button"
        onClick={onSave}
      >
        <Save size={17} />
        ذخیره تغییرات
      </button>
    </footer>
  )
}

export default AboutAdmin