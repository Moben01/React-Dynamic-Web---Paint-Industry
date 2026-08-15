import { useMemo, useRef, useState } from 'react'
import {
  Eye,
  EyeOff,
  Images,
  LayoutTemplate,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Star,
  Store,
  Trash2,
  X,
} from 'lucide-react'
import LocalizedField from '../components/LocalizedField'
import {
  createLocalizedValue,
  localizedText,
  normalizeLocalizedValue,
} from '../i18n/localizedContent'
import {
  loadAgenciesData,
  resetAgenciesData,
  saveAgenciesData,
} from '../data/agenciesStore'
import {
  confirmAdminAction,
  showAdminError,
  showAdminSuccess,
  showAdminWarning,
} from '../utils/adminAlert'
import './AgenciesAdmin.css'

const L = (value = '') => createLocalizedValue(value, '', '')
const faText = (value) => localizedText(value, 'fa')
const MAX_IMAGE_SIZE = 12 * 1024 * 1024
const MAX_IMAGE_EDGE = 1440
const IMAGE_QUALITY = 0.72

const compressAgencyImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('خواندن عکس موفق نشد.'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('پردازش عکس موفق نشد.'))
      image.onload = () => {
        const ratio = Math.min(
          1,
          MAX_IMAGE_EDGE / Math.max(image.width, image.height),
        )
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * ratio))
        canvas.height = Math.max(1, Math.round(image.height * ratio))
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('پردازش عکس موفق نشد.'))
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        let dataUrl = canvas.toDataURL('image/webp', IMAGE_QUALITY)
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', IMAGE_QUALITY)
        }
        resolve(dataUrl)
      }
      image.src = String(reader.result || '')
    }
    reader.readAsDataURL(file)
  })

const emptyAgency = {
  id: '',
  name: L(''),
  address: L(''),
  city: L(''),
  phone: '',
  email: '',
  mapUrl: '',
  manager: L(''),
  summary: L(''),
  description: L(''),
  hours: L(''),
  servicesText: '',
  image: '',
  images: [],
  order: 1,
  active: true,
  featured: false,
}

function AgenciesAdmin({ searchTerm = '' }) {
  const [data, setData] = useState(loadAgenciesData)
  const [activeSection, setActiveSection] = useState('agencies')
  const [form, setForm] = useState(emptyAgency)
  const [modalOpen, setModalOpen] = useState(false)
  const [processingImages, setProcessingImages] = useState(false)
  const fileRef = useRef(null)

  const persist = (nextData, message = '') => {
    try {
      const saved = saveAgenciesData(nextData)
      setData(saved)
      if (message) showAdminSuccess(message)
      return saved
    } catch (error) {
      console.error('Unable to save agencies:', error)
      showAdminError('ذخیره معلومات نمایندگی‌ها انجام نشد.')
      return null
    }
  }

  const updateSection = (field, value) => {
    setData((current) => ({
      ...current,
      section: { ...current.section, [field]: value },
    }))
  }

  const saveSection = () => persist(data, 'متن‌های صفحه نمایندگی‌ها ذخیره شد.')

  const openNew = () => {
    setForm({ ...emptyAgency, order: data.agencies.length + 1 })
    setModalOpen(true)
  }

  const openEdit = (agency) => {
    setForm({
      ...emptyAgency,
      ...agency,
      servicesText: (agency.services || []).map((service) => faText(service)).join('\n'),
      image: agency.image || agency.images?.[0] || '',
      images: agency.images?.length ? agency.images : agency.image ? [agency.image] : [],
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setForm(emptyAgency)
    setProcessingImages(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submit = (event) => {
    event.preventDefault()
    if (!faText(form.name).trim()) {
      showAdminWarning('نام نمایندگی الزامی است.')
      return
    }

    const services = String(form.servicesText || '')
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => createLocalizedValue(item, '', ''))
    const images = Array.isArray(form.images) ? form.images.filter(Boolean) : []
    const selectedImage = String(form.image || '').trim()
    if (selectedImage && !images.includes(selectedImage)) images.unshift(selectedImage)
    if (!images.length) {
      showAdminWarning('حداقل یک عکس برای نمایندگی انتخاب کنید.')
      return
    }

    const record = {
      id: form.id || `agency-${Date.now()}`,
      name: normalizeLocalizedValue(form.name),
      address: normalizeLocalizedValue(form.address),
      city: normalizeLocalizedValue(form.city),
      manager: normalizeLocalizedValue(form.manager),
      summary: normalizeLocalizedValue(form.summary),
      description: normalizeLocalizedValue(form.description),
      hours: normalizeLocalizedValue(form.hours),
      phone: String(form.phone || '').trim(),
      email: String(form.email || '').trim(),
      mapUrl: String(form.mapUrl || '').trim(),
      image: selectedImage || images[0] || '',
      images,
      services,
      order: Number(form.order) || data.agencies.length + 1,
      active: Boolean(form.active),
      featured: Boolean(form.featured),
    }

    const nextAgencies = form.id
      ? data.agencies.map((agency) => String(agency.id) === String(form.id) ? record : agency)
      : [...data.agencies, record]

    persist({ ...data, agencies: nextAgencies }, form.id ? 'نمایندگی ویرایش شد.' : 'نمایندگی جدید ثبت شد.')
    closeModal()
  }

  const selectImages = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return

    const invalidType = files.find((file) => !file.type.startsWith('image/'))
    if (invalidType) {
      showAdminWarning('فقط فایل تصویری انتخاب کنید.')
      return
    }

    const tooLarge = files.find((file) => file.size > MAX_IMAGE_SIZE)
    if (tooLarge) {
      showAdminWarning('حجم هر عکس باید کمتر از ۱۲ مگابایت باشد.')
      return
    }

    setProcessingImages(true)
    try {
      const preparedImages = await Promise.all(files.map(compressAgencyImage))
      setForm((current) => {
        const images = [...(current.images || []), ...preparedImages]
        return {
          ...current,
          images,
          image: current.image || images[0] || '',
        }
      })
    } catch (error) {
      console.error(error)
      showAdminError('آماده‌سازی عکس‌های نمایندگی انجام نشد.')
    } finally {
      setProcessingImages(false)
    }
  }

  const setPrimaryImage = (index) => {
    setForm((current) => {
      const images = [...(current.images || [])]
      if (!images[index]) return current
      const [selected] = images.splice(index, 1)
      images.unshift(selected)
      return { ...current, images, image: selected }
    })
  }

  const removeImage = (index) => {
    setForm((current) => {
      const images = (current.images || []).filter((_, imageIndex) => imageIndex !== index)
      return { ...current, images, image: images[0] || '' }
    })
  }

  const toggleActive = (agencyId) => {
    persist({
      ...data,
      agencies: data.agencies.map((agency) =>
        String(agency.id) === String(agencyId)
          ? { ...agency, active: agency.active === false }
          : agency,
      ),
    })
  }

  const requestDelete = async (agency) => {
    const confirmed = await confirmAdminAction({
      title: 'حذف نمایندگی',
      text: `آیا نمایندگی «${faText(agency.name)}» حذف شود؟`,
      confirmText: 'حذف',
      cancelText: 'انصراف',
    })
    if (!confirmed) return
    persist({
      ...data,
      agencies: data.agencies.filter((item) => String(item.id) !== String(agency.id)),
    }, 'نمایندگی حذف شد.')
  }

  const resetAll = async () => {
    const confirmed = await confirmAdminAction({
      title: 'بازگردانی معلومات اولیه',
      text: 'تمام معلومات نمایندگی‌ها به حالت اولیه برگردد؟',
      confirmText: 'بازگردانی',
    })
    if (!confirmed) return
    setData(resetAgenciesData())
    showAdminSuccess('معلومات نمایندگی‌ها بازگردانی شد.')
  }

  const filteredAgencies = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return [...data.agencies]
      .filter((agency) =>
        `${faText(agency.name)} ${faText(agency.city)} ${faText(agency.address)} ${agency.phone}`
          .toLowerCase()
          .includes(query),
      )
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
  }, [data.agencies, searchTerm])

  return (
    <div className="agencies-admin">
      <div className="agencies-admin-tabs">
        <button type="button" className={activeSection === 'content' ? 'active' : ''} onClick={() => setActiveSection('content')}>
          <LayoutTemplate size={18} /> متن‌های صفحه
        </button>
        <button type="button" className={activeSection === 'agencies' ? 'active' : ''} onClick={() => setActiveSection('agencies')}>
          <Store size={18} /> لیست نمایندگی‌ها
        </button>
        <button type="button" className="reset" onClick={resetAll}>
          <RotateCcw size={16} /> بازگردانی معلومات اولیه
        </button>
      </div>

      {activeSection === 'content' && (
        <section className="agencies-admin-card">
          <div className="agencies-admin-fields">
            <LocalizedField label="نوشته کوچک بالا" value={data.section.kicker} onChange={(value) => updateSection('kicker', value)} showTranslationTools={false} />
            <LocalizedField label="عنوان اصلی" value={data.section.title} onChange={(value) => updateSection('title', value)} showTranslationTools={false} />
            <LocalizedField className="agencies-admin-full" label="توضیحات" multiline rows={4} value={data.section.description} onChange={(value) => updateSection('description', value)} showTranslationTools={false} />
            <LocalizedField label="دکمه اول" value={data.section.primaryAction} onChange={(value) => updateSection('primaryAction', value)} showTranslationTools={false} />
            <LocalizedField label="دکمه تماس" value={data.section.secondaryAction} onChange={(value) => updateSection('secondaryAction', value)} showTranslationTools={false} />
            <LocalizedField label="عنوان مسیر نمایندگی" value={data.section.locatorTitle} onChange={(value) => updateSection('locatorTitle', value)} showTranslationTools={false} />
            <LocalizedField className="agencies-admin-full" label="متن مسیر نمایندگی" multiline rows={3} value={data.section.locatorText} onChange={(value) => updateSection('locatorText', value)} showTranslationTools={false} />
          </div>
          <footer><button type="button" onClick={saveSection}><Save size={17} /> ذخیره متن‌ها</button></footer>
        </section>
      )}

      {activeSection === 'agencies' && (
        <>
          <div className="agencies-admin-toolbar">
            <p>نمایندگی‌ها محدود نیستند؛ هر تعداد نمایندگی می‌توانید اضافه کنید.</p>
            <button type="button" onClick={openNew}><Plus size={18} /> نمایندگی جدید</button>
          </div>
          <div className="agencies-admin-list">
            {filteredAgencies.map((agency) => (
              <article key={agency.id} className={agency.active === false ? 'is-disabled' : ''}>
                <img className="agencies-admin-thumb" src={agency.image || agency.images?.[0]} alt={faText(agency.name)} />
                <div>
                  <small>{faText(agency.city) || 'شهر ثبت نشده'}</small>
                  <h3>{faText(agency.name)}</h3>
                  <p>{faText(agency.address)}</p>
                </div>
                <strong dir="ltr">{agency.phone || '-'}</strong>
                <footer>
                  <button type="button" onClick={() => toggleActive(agency.id)} title="فعال/غیرفعال">{agency.active === false ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  <button type="button" onClick={() => openEdit(agency)} title="ویرایش"><Pencil size={16} /></button>
                  <button type="button" className="danger" onClick={() => requestDelete(agency)} title="حذف"><Trash2 size={16} /></button>
                </footer>
              </article>
            ))}
          </div>
        </>
      )}

      {modalOpen && (
        <div className="agencies-admin-backdrop" onMouseDown={closeModal}>
          <form className="agencies-admin-modal" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div><h2>{form.id ? 'ویرایش نمایندگی' : 'افزودن نمایندگی'}</h2><p>معلومات کامل نمایندگی را وارد کنید.</p></div>
              <button type="button" onClick={closeModal}><X size={20} /></button>
            </header>
            <div className="agencies-admin-fields">
              <LocalizedField label="نام نمایندگی" required value={form.name} onChange={(value) => updateForm('name', value)} showTranslationTools={false} />
              <LocalizedField label="شهر" value={form.city} onChange={(value) => updateForm('city', value)} showTranslationTools={false} />
              <LocalizedField className="agencies-admin-full" label="آدرس" value={form.address} onChange={(value) => updateForm('address', value)} showTranslationTools={false} />
              <label><span>شماره تماس</span><input dir="ltr" value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} /></label>
              <label><span>ایمیل</span><input dir="ltr" type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} /></label>
              <label><span>لینک نقشه</span><input dir="ltr" value={form.mapUrl} onChange={(event) => updateForm('mapUrl', event.target.value)} /></label>
              <LocalizedField label="مسئول نمایندگی" value={form.manager} onChange={(value) => updateForm('manager', value)} showTranslationTools={false} />
              <LocalizedField label="خلاصه کوتاه" value={form.summary} onChange={(value) => updateForm('summary', value)} showTranslationTools={false} />
              <LocalizedField className="agencies-admin-full" label="توضیحات کامل" multiline rows={5} value={form.description} onChange={(value) => updateForm('description', value)} showTranslationTools={false} />
              <LocalizedField label="ساعات کاری" value={form.hours} onChange={(value) => updateForm('hours', value)} showTranslationTools={false} />
              <label><span>ترتیب نمایش</span><input type="number" min="1" value={form.order} onChange={(event) => updateForm('order', event.target.value)} /></label>
              <div className="agencies-admin-full agencies-admin-image-picker">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={processingImages}>
                  <Images size={24} />
                  {processingImages ? 'در حال آماده‌سازی عکس‌ها...' : 'انتخاب عکس‌های نمایندگی'}
                </button>
                <input ref={fileRef} type="file" accept="image/webp,image/jpeg,image/png" multiple hidden onChange={selectImages} />
                <div className="agencies-admin-gallery">
                  {(form.images || []).length ? (
                    form.images.map((image, index) => (
                      <div key={`${image.slice(0, 32)}-${index}`} className={index === 0 ? 'is-primary' : ''}>
                        <img src={image} alt={`عکس ${index + 1} نمایندگی`} />
                        {index === 0 && <span>عکس اصلی</span>}
                        <footer>
                          <button type="button" onClick={() => setPrimaryImage(index)} title="انتخاب به عنوان عکس اصلی"><Star size={14} /></button>
                          <button type="button" onClick={() => removeImage(index)} title="حذف عکس"><Trash2 size={14} /></button>
                        </footer>
                      </div>
                    ))
                  ) : (
                    <p>هنوز عکسی انتخاب نشده است.</p>
                  )}
                </div>
              </div>
              <label className="agencies-admin-full"><span>خدمات، هر مورد در یک خط</span><textarea rows="4" value={form.servicesText} onChange={(event) => updateForm('servicesText', event.target.value)} /></label>
              <label className="check"><input type="checkbox" checked={form.active} onChange={(event) => updateForm('active', event.target.checked)} /><span>نمایندگی فعال باشد</span></label>
            </div>
            <footer className="agencies-admin-actions">
              <button type="button" onClick={closeModal}>انصراف</button>
              <button type="submit" className="save"><Save size={16} /> ذخیره نمایندگی</button>
            </footer>
          </form>
        </div>
      )}
    </div>
  )
}

export default AgenciesAdmin
