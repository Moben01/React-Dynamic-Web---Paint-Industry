import { useMemo, useState } from 'react'
import { Eye, EyeOff, Pencil, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react'
import {
  contactIconOptions,
  deleteContactMessage,
  loadContactData,
  loadContactMessages,
  resetContactData,
  saveContactData,
  updateContactMessage,
} from '../data/contactStore'
import {
  confirmAdminAction,
  showAdminSuccess,
  showAdminWarning,
} from '../utils/adminAlert'
import './ContactAdmin.css'

const emptyItem = {
  id: '', icon: 'phone', title: '', value: '', note: '', href: '', active: true, order: 1,
}

function ContactAdmin() {
  const [data, setData] = useState(loadContactData)
  const [messages, setMessages] = useState(loadContactMessages)
  const [section, setSection] = useState('hero')
  const [itemModal, setItemModal] = useState(false)
  const [itemDraft, setItemDraft] = useState(emptyItem)

  const persist = (nextData, message = '') => {
    setData(nextData)
    saveContactData(nextData)
    if (message) showAdminSuccess(message)
  }

  const updateSection = (sectionName, field, value) => {
    setData((current) => ({
      ...current,
      [sectionName]: { ...current[sectionName], [field]: value },
    }))
  }

  const updateFieldText = (field, value) => {
    setData((current) => ({
      ...current,
      formSection: {
        ...current.formSection,
        fields: { ...current.formSection.fields, [field]: value },
      },
    }))
  }

  const saveCurrent = () => persist(data, 'تغییرات صفحه تماس ذخیره شد.')

  const openNewItem = () => {
    setItemDraft({ ...emptyItem, order: data.contactItems.length + 1 })
    setItemModal(true)
  }

  const openEditItem = (item) => {
    setItemDraft({ ...item })
    setItemModal(true)
  }

  const saveItem = (event) => {
    event.preventDefault()
    if (!itemDraft.title.trim()) {
      showAdminWarning('عنوان مورد تماس الزامی است.')
      return
    }

    const record = {
      ...itemDraft,
      id: itemDraft.id || `contact-item-${Date.now()}`,
      title: itemDraft.title.trim(),
      value: itemDraft.value.trim(),
      note: itemDraft.note.trim(),
      href: itemDraft.href.trim(),
      active: itemDraft.active !== false,
      order: Number(itemDraft.order) || data.contactItems.length + 1,
    }

    const contactItems = itemDraft.id
      ? data.contactItems.map((item) => item.id === itemDraft.id ? record : item)
      : [...data.contactItems, record]

    persist({ ...data, contactItems }, itemDraft.id ? 'مورد تماس ویرایش شد.' : 'مورد تماس اضافه شد.')
    setItemModal(false)
  }

  const toggleItem = (id) => persist({
    ...data,
    contactItems: data.contactItems.map((item) =>
      item.id === id ? { ...item, active: item.active === false } : item,
    ),
  })

  const removeItem = async (id) => {
    const item = data.contactItems.find((entry) => entry.id === id)
    const confirmed = await confirmAdminAction({
      title: 'حذف مورد تماس',
      text: item?.title
        ? `آیا «${item.title}» حذف شود؟ این عمل قابل برگشت نیست.`
        : 'این مورد تماس حذف شود؟ این عمل قابل برگشت نیست.',
      confirmText: 'حذف',
      cancelText: 'انصراف',
    })

    if (!confirmed) return

    persist(
      {
        ...data,
        contactItems: data.contactItems.filter((entry) => entry.id !== id),
      },
      'مورد تماس حذف شد.',
    )
  }


  const markMessage = (id) => setMessages(updateContactMessage(id, { status: 'پاسخ داده‌شده' }))
  const removeMessage = async (id) => {
    const confirmed = await confirmAdminAction({
      title: 'حذف پیام',
      text: 'این پیام حذف شود؟ این عمل قابل برگشت نیست.',
      confirmText: 'حذف',
      cancelText: 'انصراف',
    })

    if (!confirmed) return

    setMessages(deleteContactMessage(id))
    showAdminSuccess('پیام حذف شد.')
  }


  const resetAll = async () => {
    const confirmed = await confirmAdminAction({
      title: 'بازگردانی معلومات اولیه',
      text: 'تمام معلومات صفحه تماس به حالت اولیه برگردد؟',
      confirmText: 'بله، بازگردانی شود',
    })

    if (!confirmed) return

    setData(resetContactData())
    showAdminSuccess('معلومات صفحه تماس به حالت اولیه بازگردانده شد.')
  }


  const sortedItems = useMemo(
    () => [...data.contactItems].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [data.contactItems],
  )

  return (
    <div className="contact-admin">
      <div className="contact-admin-tabs">
        {[
          ['hero', 'بخش معرفی'],
          ['items', 'راه‌های تماس'],
          ['form', 'فورم پیام'],
          ['location', 'موقعیت'],
          ['cta', 'کارت پایانی'],
          ['messages', 'پیام‌ها'],
        ].map(([id, label]) => (
          <button type="button" key={id} className={section === id ? 'active' : ''} onClick={() => setSection(id)}>{label}</button>
        ))}
        <button type="button" className="contact-admin-reset" onClick={resetAll}><RotateCcw size={16} />بازگردانی اولیه</button>
      </div>

      {section === 'hero' && (
        <AdminCard title="بخش بالای صفحه تماس" description="عنوان، توضیح، دکمه‌ها و متن انیمیشن را مدیریت کنید." onSave={saveCurrent}>
          {Object.entries(data.hero).map(([key, value]) => (
            <Field key={key} label={key} value={value} onChange={(next) => updateSection('hero', key, next)} full={key === 'description'} textarea={key === 'description'} />
          ))}
        </AdminCard>
      )}

      {section === 'items' && (
        <>
          <div className="contact-admin-toolbar">
            <div><strong>راه‌های تماس</strong><span>شماره، ایمیل، آدرس و ساعات کاری</span></div>
            <button type="button" onClick={openNewItem}><Plus size={16} />افزودن مورد</button>
          </div>
          <div className="contact-admin-items-grid">
            {sortedItems.map((item) => (
              <article key={item.id} className={item.active === false ? 'disabled' : ''}>
                <small>{item.icon}</small><h3>{item.title}</h3><strong>{item.value}</strong><p>{item.note}</p>
                <footer>
                  <button type="button" onClick={() => toggleItem(item.id)}>{item.active === false ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  <button type="button" onClick={() => openEditItem(item)}><Pencil size={16} /></button>
                  <button type="button" className="danger" onClick={() => removeItem(item.id)}><Trash2 size={16} /></button>
                </footer>
              </article>
            ))}
          </div>
        </>
      )}

      {section === 'form' && (
        <AdminCard title="متن‌های فورم تماس" description="عنوان‌ها، راهنما و متن فیلدها را مدیریت کنید." onSave={saveCurrent}>
          {Object.entries(data.formSection).filter(([key]) => key !== 'fields').map(([key, value]) => (
            <Field key={key} label={key} value={value} onChange={(next) => updateSection('formSection', key, next)} full={key === 'description' || key === 'supportDescription'} textarea={key === 'description' || key === 'supportDescription'} />
          ))}
          {Object.entries(data.formSection.fields).map(([key, value]) => (
            <Field key={key} label={key} value={value} onChange={(next) => updateFieldText(key, next)} />
          ))}
        </AdminCard>
      )}

      {section === 'location' && (
        <AdminCard title="موقعیت و ساعات کاری" description="تمام متن‌های بخش نقشه را تغییر دهید." onSave={saveCurrent}>
          {Object.entries(data.location).map(([key, value]) => (
            <Field key={key} label={key} value={value} onChange={(next) => updateSection('location', key, next)} full={key === 'description'} textarea={key === 'description'} />
          ))}
        </AdminCard>
      )}

      {section === 'cta' && (
        <AdminCard title="کارت پایانی تماس" description="عنوان، دکمه و شماره تماس را مدیریت کنید." onSave={saveCurrent}>
          {Object.entries(data.finalCta).map(([key, value]) => (
            <Field key={key} label={key} value={value} onChange={(next) => updateSection('finalCta', key, next)} />
          ))}
        </AdminCard>
      )}

      {section === 'messages' && (
        <div className="contact-admin-messages">
          <div className="contact-admin-toolbar"><div><strong>پیام‌های دریافت‌شده</strong><span>{messages.length} پیام ثبت شده است.</span></div></div>
          {!messages.length ? <div className="contact-admin-empty">هنوز پیامی ثبت نشده است.</div> : messages.map((message) => (
            <article key={message.id}>
              <header><div><h3>{message.fullName}</h3><span>{message.subject}</span></div><b>{message.status}</b></header>
              <p>{message.message}</p>
              <div><span dir="ltr">{message.phone}</span><span dir="ltr">{message.email || 'ایمیل ثبت نشده'}</span><time>{new Date(message.createdAt).toLocaleString()}</time></div>
              <footer><button type="button" onClick={() => markMessage(message.id)}>پاسخ داده‌شده</button><button type="button" className="danger" onClick={() => removeMessage(message.id)}>حذف</button></footer>
            </article>
          ))}
        </div>
      )}

      {itemModal && (
        <div className="contact-admin-backdrop">
          <form className="contact-admin-modal" onSubmit={saveItem}>
            <header><h2>{itemDraft.id ? 'ویرایش راه تماس' : 'افزودن راه تماس'}</h2><button type="button" onClick={() => setItemModal(false)}><X size={20} /></button></header>
            <div className="contact-admin-form-grid">
              <Field label="عنوان" value={itemDraft.title} onChange={(value) => setItemDraft((current) => ({ ...current, title: value }))} />
              <label><span>آیکن</span><select value={itemDraft.icon} onChange={(event) => setItemDraft((current) => ({ ...current, icon: event.target.value }))}>{contactIconOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
              <Field label="مقدار" value={itemDraft.value} onChange={(value) => setItemDraft((current) => ({ ...current, value }))} />
              <Field label="یادداشت" value={itemDraft.note} onChange={(value) => setItemDraft((current) => ({ ...current, note: value }))} />
              <Field label="لینک" value={itemDraft.href} onChange={(value) => setItemDraft((current) => ({ ...current, href: value }))} />
              <Field label="ترتیب" type="number" value={itemDraft.order} onChange={(value) => setItemDraft((current) => ({ ...current, order: value }))} />
              <label className="contact-admin-checkbox"><input type="checkbox" checked={itemDraft.active !== false} onChange={(event) => setItemDraft((current) => ({ ...current, active: event.target.checked }))} /><span>فعال باشد</span></label>
            </div>
            <footer><button type="button" onClick={() => setItemModal(false)}>انصراف</button><button type="submit" className="primary"><Save size={16} />ذخیره</button></footer>
          </form>
        </div>
      )}
    </div>
  )
}

function AdminCard({ title, description, children, onSave }) {
  return <section className="contact-admin-card"><header><div><h3>{title}</h3><p>{description}</p></div></header><div className="contact-admin-form-grid">{children}</div><footer><button type="button" onClick={onSave}><Save size={16} />ذخیره تغییرات</button></footer></section>
}

function Field({ label, value, onChange, textarea = false, full = false, type = 'text' }) {
  return <label className={full ? 'contact-admin-full' : ''}><span>{label}</span>{textarea ? <textarea rows="4" value={value} onChange={(event) => onChange(event.target.value)} /> : <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />}</label>
}

export default ContactAdmin