import { useMemo, useRef, useState } from 'react'
import {
  Eye,
  EyeOff,
  ImagePlus,
  Images,
  LayoutTemplate,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import {
  loadProjectsData,
  projectCategoryOptions,
  resetProjectsData,
  saveProjectsData,
} from '../data/projectsStore'
import {
  confirmAdminAction,
  showAdminError,
  showAdminSuccess,
  showAdminWarning,
} from '../utils/adminAlert'
import './ProjectsAdmin.css'

const MAX_IMAGE_SIZE = 12 * 1024 * 1024
const MAX_IMAGE_EDGE = 1440
const IMAGE_QUALITY = 0.7

const compressProjectImage = (file) =>
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

const emptyForm = {
  id: '',
  title: '',
  category: 'exterior',
  categoryLabel: 'نمای بیرونی',
  location: '',
  year: String(new Date().getFullYear()),
  status: 'تکمیل‌شده',
  client: '',
  area: '',
  description: '',
  image: '',
  images: [],
  alt: '',
  objectPosition: 'center',
  featured: false,
  order: 1,
  active: true,
}

function ProjectsAdmin({ searchTerm = '' }) {
  const [data, setData] = useState(loadProjectsData)
  const [activeSection, setActiveSection] = useState('content')
  const [form, setForm] = useState(emptyForm)
  const [modalOpen, setModalOpen] = useState(false)
  const [processingImages, setProcessingImages] = useState(false)
  const fileRef = useRef(null)

  const persist = (nextData, message = '') => {
    try {
      const savedData = saveProjectsData(nextData)
      setData(savedData)
      if (message) showAdminSuccess(message)
      return savedData
    } catch (error) {
      console.error('Unable to save projects:', error)
      showAdminError(
        'ذخیره پروژه انجام نشد. فضای ذخیره‌سازی مرورگر پر است. لطفاً بعضی عکس‌های قدیمی را حذف کنید یا تصاویر کوچک‌تری انتخاب کنید.',
      )
      return null
    }
  }

  const updateSection = (field, value) => {
    setData((current) => ({
      ...current,
      section: { ...current.section, [field]: value },
    }))
  }

  const saveSection = () => persist(data, 'متن‌های صفحه پروژه‌ها ذخیره شد.')

  const openNew = () => {
    setForm({
      ...emptyForm,
      order: data.projects.length + 1,
      featured: data.projects.length === 0,
    })
    setModalOpen(true)
  }

  const openEdit = (project) => {
    const images = Array.isArray(project.images) && project.images.length
      ? project.images.filter(Boolean)
      : project.image
        ? [project.image]
        : []
    setForm({
      ...emptyForm,
      ...project,
      images,
      image: images[0] || project.image || '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setForm(emptyForm)
    setProcessingImages(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const changeCategory = (value) => {
    const category =
      projectCategoryOptions.find((item) => item.value === value) ||
      projectCategoryOptions[0]
    setForm((current) => ({
      ...current,
      category: category.value,
      categoryLabel: category.label,
    }))
  }

  const selectImages = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return

    const invalidType = files.find((file) => !file.type.startsWith('image/'))
    if (invalidType) {
      showAdminWarning('فقط فایل‌های تصویری انتخاب کنید.')
      return
    }

    const tooLarge = files.find((file) => file.size > MAX_IMAGE_SIZE)
    if (tooLarge) {
      showAdminWarning('حجم هر فایل اصلی باید کمتر از ۱۲ مگابایت باشد.')
      return
    }

    setProcessingImages(true)
    try {
      const preparedImages = await Promise.all(files.map(compressProjectImage))
      setForm((current) => {
        const currentImages = Array.isArray(current.images)
          ? current.images.filter(Boolean)
          : current.image
            ? [current.image]
            : []
        const images = [...currentImages, ...preparedImages]
        return { ...current, images, image: images[0] || '' }
      })
    } catch (error) {
      console.error(error)
      showAdminError('آماده‌سازی عکس‌های پروژه انجام نشد.')
    } finally {
      setProcessingImages(false)
    }
  }

  const removeProjectImage = (index) => {
    setForm((current) => {
      const images = (current.images || []).filter((_, i) => i !== index)
      return { ...current, images, image: images[0] || '' }
    })
  }

  const setPrimaryProjectImage = (index) => {
    setForm((current) => {
      const images = [...(current.images || [])]
      if (!images[index]) return current
      const [selected] = images.splice(index, 1)
      images.unshift(selected)
      return { ...current, images, image: selected }
    })
  }

  const submit = (event) => {
    event.preventDefault()
    const images = Array.isArray(form.images)
      ? form.images.filter(Boolean)
      : form.image
        ? [form.image]
        : []

    if (!form.title.trim()) {
      showAdminWarning('عنوان پروژه الزامی است.')
      return
    }
    if (!images.length) {
      showAdminWarning('حداقل یک عکس برای پروژه انتخاب کنید.')
      return
    }

    const record = {
      ...form,
      id: form.id || `project-${Date.now()}`,
      title: form.title.trim(),
      categoryLabel: form.categoryLabel.trim(),
      location: form.location.trim(),
      year: String(form.year || '').trim(),
      client: form.client.trim(),
      area: form.area.trim(),
      description: form.description.trim(),
      image: images[0],
      images,
      alt: form.alt.trim() || form.title.trim(),
      order: Number(form.order) || data.projects.length + 1,
      featured: Boolean(form.featured),
      active: Boolean(form.active),
    }

    let nextProjects = form.id
      ? data.projects.map((project) =>
          String(project.id) === String(form.id) ? record : project,
        )
      : [...data.projects, record]

    if (record.featured) {
      nextProjects = nextProjects.map((project) => ({
        ...project,
        featured: String(project.id) === String(record.id),
      }))
    }

    try {
      const savedData = saveProjectsData({ ...data, projects: nextProjects })
      setData(savedData)
      closeModal()
      window.setTimeout(
        () => showAdminSuccess(form.id ? 'پروژه ویرایش شد.' : 'پروژه جدید ثبت شد.'),
        0,
      )
    } catch (error) {
      console.error('Unable to save project:', error)
      showAdminError(
        'پروژه ذخیره نشد. فضای ذخیره‌سازی مرورگر پر است. لطفاً تعداد یا حجم عکس‌ها را کمتر کنید.',
      )
    }
  }

  const toggleActive = (projectId) => {
    persist({
      ...data,
      projects: data.projects.map((project) =>
        String(project.id) === String(projectId)
          ? { ...project, active: project.active === false }
          : project,
      ),
    })
  }

  const makeFeatured = (projectId) => {
    persist({
      ...data,
      projects: data.projects.map((project) => ({
        ...project,
        featured: String(project.id) === String(projectId),
      })),
    })
  }

  const requestDelete = async (project) => {
    const confirmed = await confirmAdminAction({
      title: 'حذف پروژه',
      text: `آیا پروژه «${project.title}» حذف شود؟ این عمل قابل برگشت نیست.`,
      confirmText: 'حذف',
      cancelText: 'انصراف',
    })
    if (!confirmed) return

    const nextProjects = data.projects
      .filter((item) => String(item.id) !== String(project.id))
      .map((item, index) => ({ ...item, order: index + 1 }))

    if (
      project.featured &&
      nextProjects.length &&
      !nextProjects.some((item) => item.featured)
    ) {
      nextProjects[0] = { ...nextProjects[0], featured: true }
    }

    persist({ ...data, projects: nextProjects }, 'پروژه حذف شد.')
  }

  const resetAll = async () => {
    const confirmed = await confirmAdminAction({
      title: 'بازگردانی معلومات اولیه',
      text: 'تمام معلومات پروژه‌ها به حالت اولیه برگردد؟',
      confirmText: 'بله، بازگردانی شود',
    })
    if (!confirmed) return
    setData(resetProjectsData())
    showAdminSuccess('معلومات پروژه‌ها به حالت اولیه بازگردانده شد.')
  }

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return [...data.projects]
      .filter((project) =>
        `${project.title} ${project.categoryLabel} ${project.location} ${project.client} ${project.status}`
          .toLowerCase()
          .includes(query),
      )
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
  }, [data.projects, searchTerm])

  return (
    <div className="projects-admin">
      <div className="projects-admin-tabs">
        <button
          type="button"
          className={activeSection === 'content' ? 'active' : ''}
          onClick={() => setActiveSection('content')}
        >
          <LayoutTemplate size={18} />
          متن‌های صفحه
        </button>
        <button
          type="button"
          className={activeSection === 'projects' ? 'active' : ''}
          onClick={() => setActiveSection('projects')}
        >
          <ImagePlus size={18} />
          لیست پروژه‌ها
        </button>
        <button type="button" className="reset" onClick={resetAll}>
          <RotateCcw size={16} />
          بازگردانی معلومات اولیه
        </button>
      </div>

      {activeSection === 'content' && (
        <section className="projects-admin-section-card">
          <header>
            <div>
              <h3>محتوای بالای صفحه پروژه‌ها</h3>
              <p>تمام عنوان‌ها، توضیحات و نوشته پس‌زمینه این بخش را مدیریت کنید.</p>
            </div>
          </header>
          <div className="projects-admin-section-form">
            <label>
              <span>نوشته کوچک بالا</span>
              <input value={data.section.eyebrow} onChange={(e) => updateSection('eyebrow', e.target.value)} />
            </label>
            <label>
              <span>قسمت اول عنوان</span>
              <input value={data.section.title} onChange={(e) => updateSection('title', e.target.value)} />
            </label>
            <label>
              <span>قسمت رنگی عنوان</span>
              <input value={data.section.highlight} onChange={(e) => updateSection('highlight', e.target.value)} />
            </label>
            <label>
              <span>نوشته بزرگ پس‌زمینه</span>
              <input value={data.section.backgroundWord} onChange={(e) => updateSection('backgroundWord', e.target.value)} dir="ltr" />
            </label>
            <label className="full">
              <span>توضیحات</span>
              <textarea rows="4" value={data.section.description} onChange={(e) => updateSection('description', e.target.value)} />
            </label>
            <label className="full">
              <span>متن راهنما پایین اسلایدر</span>
              <input value={data.section.hint} onChange={(e) => updateSection('hint', e.target.value)} />
            </label>
            <label className="full">
              <span>پیام نبودن پروژه</span>
              <input value={data.section.emptyMessage} onChange={(e) => updateSection('emptyMessage', e.target.value)} />
            </label>
          </div>
          <footer>
            <button type="button" onClick={saveSection}>
              <Save size={17} /> ذخیره متن‌های صفحه
            </button>
          </footer>
        </section>
      )}

      {activeSection === 'projects' && (
        <>
          <div className="projects-admin-toolbar">
            <p>پروژه‌های فعال در سایت نمایش داده می‌شوند. پروژه منتخب با نشان ستاره مشخص است.</p>
            <button type="button" onClick={openNew}>
              <Plus size={18} /> پروژه جدید
            </button>
          </div>

          <div className="projects-admin-grid">
            {filteredProjects.map((project) => (
              <article key={project.id} className={project.active === false ? 'is-disabled' : ''}>
                <div className="projects-admin-image">
                  <img src={project.image} alt={project.alt || project.title} style={{ objectPosition: project.objectPosition || 'center' }} />
                  <span>{project.year}</span>
                  {project.featured && <b><Star size={14} fill="currentColor" /> منتخب</b>}
                  {(project.images?.length || (project.image ? 1 : 0)) > 1 && (
                    <em className="projects-admin-image-count"><Images size={13} /> {project.images.length} عکس</em>
                  )}
                </div>
                <div className="projects-admin-content">
                  <small>{project.categoryLabel}</small>
                  <h3>{project.title}</h3>
                  <p>{project.location || 'موقعیت ثبت نشده'}</p>
                  <div>
                    <span>{project.status}</span>
                    <strong>{project.active === false ? 'غیرفعال' : 'فعال'}</strong>
                  </div>
                </div>
                <footer>
                  <button type="button" onClick={() => toggleActive(project.id)} title={project.active === false ? 'فعال‌کردن' : 'غیرفعال‌کردن'}>
                    {project.active === false ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button type="button" onClick={() => makeFeatured(project.id)} title="انتخاب به‌عنوان پروژه منتخب"><Star size={16} /></button>
                  <button type="button" onClick={() => openEdit(project)} title="ویرایش"><Pencil size={16} /></button>
                  <button type="button" className="danger" onClick={() => requestDelete(project)} title="حذف"><Trash2 size={16} /></button>
                </footer>
              </article>
            ))}
          </div>

          {!filteredProjects.length && <div className="projects-admin-empty">هیچ پروژه‌ای مطابق جستجو پیدا نشد.</div>}
        </>
      )}

      {modalOpen && (
        <div className="projects-admin-backdrop" onMouseDown={closeModal}>
          <form className="projects-admin-modal" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()}>
            <header>
              <div>
                <h2>{form.id ? 'ویرایش پروژه' : 'افزودن پروژه'}</h2>
                <p>معلومات پروژه و تمام عکس‌های آن را وارد کنید.</p>
              </div>
              <button type="button" onClick={closeModal}><X size={20} /></button>
            </header>

            <div className="projects-admin-form-layout projects-admin-form-layout-gallery">
              <aside>
                <button
                  type="button"
                  className="projects-admin-upload projects-admin-upload-multiple"
                  onClick={() => fileRef.current?.click()}
                  disabled={processingImages}
                >
                  <span>
                    <Images size={35} />
                    <strong>{processingImages ? 'در حال آماده‌سازی عکس‌ها...' : 'انتخاب چند عکس پروژه'}</strong>
                    <small>JPG, PNG, WEBP — می‌توانید چند عکس را یکجا انتخاب کنید</small>
                  </span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/webp,image/jpeg,image/png"
                  multiple
                  hidden
                  onChange={selectImages}
                />

                <div className="projects-admin-gallery-preview">
                  {(form.images || []).length ? (
                    form.images.map((image, index) => (
                      <div key={`${image.slice(0, 40)}-${index}`} className={index === 0 ? 'is-primary' : ''}>
                        <img src={image} alt={`عکس ${index + 1} پروژه`} />
                        {index === 0 && <span>عکس اصلی</span>}
                        <div className="projects-admin-gallery-actions">
                          <button type="button" onClick={() => setPrimaryProjectImage(index)} title="انتخاب به‌عنوان عکس اصلی"><Star size={14} /></button>
                          <button type="button" onClick={() => removeProjectImage(index)} title="حذف عکس"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>هنوز عکسی انتخاب نشده است.</p>
                  )}
                </div>
              </aside>

              <div className="projects-admin-fields">
                <label><span>عنوان پروژه *</span><input value={form.title} onChange={(e) => updateForm('title', e.target.value)} /></label>
                <label><span>دسته‌بندی</span><select value={form.category} onChange={(e) => changeCategory(e.target.value)}>{projectCategoryOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
                <label><span>عنوان دسته‌بندی روی کارت</span><input value={form.categoryLabel} onChange={(e) => updateForm('categoryLabel', e.target.value)} /></label>
                <label><span>موقعیت</span><input value={form.location} onChange={(e) => updateForm('location', e.target.value)} /></label>
                <label><span>سال</span><input value={form.year} onChange={(e) => updateForm('year', e.target.value)} /></label>
                <label><span>حالت پروژه</span><select value={form.status} onChange={(e) => updateForm('status', e.target.value)}><option value="تکمیل‌شده">تکمیل‌شده</option><option value="در حال اجرا">در حال اجرا</option><option value="متوقف‌شده">متوقف‌شده</option></select></label>
                <label><span>مشتری</span><input value={form.client} onChange={(e) => updateForm('client', e.target.value)} /></label>
                <label><span>مساحت</span><input value={form.area} onChange={(e) => updateForm('area', e.target.value)} /></label>
                <label><span>ترتیب نمایش</span><input type="number" min="1" value={form.order} onChange={(e) => updateForm('order', e.target.value)} /></label>
                <label><span>موقعیت عکس اصلی</span><select value={form.objectPosition} onChange={(e) => updateForm('objectPosition', e.target.value)}><option value="center">وسط</option><option value="top">بالا</option><option value="bottom">پایین</option><option value="left">چپ</option><option value="right">راست</option></select></label>
                <label className="is-full"><span>متن Alt تصویر</span><input value={form.alt} onChange={(e) => updateForm('alt', e.target.value)} /></label>
                <label className="is-full"><span>توضیحات</span><textarea rows="5" value={form.description} onChange={(e) => updateForm('description', e.target.value)} /></label>
                <label className="check"><input type="checkbox" checked={form.featured} onChange={(e) => updateForm('featured', e.target.checked)} /><span>پروژه منتخب باشد</span></label>
                <label className="check"><input type="checkbox" checked={form.active} onChange={(e) => updateForm('active', e.target.checked)} /><span>پروژه فعال باشد</span></label>
              </div>
            </div>

            <footer className="projects-admin-actions">
              <button type="button" onClick={closeModal}>انصراف</button>
              <button type="submit" className="save" disabled={processingImages}><Save size={16} /> ذخیره پروژه</button>
            </footer>
          </form>
        </div>
      )}
    </div>
  )
}

export default ProjectsAdmin
