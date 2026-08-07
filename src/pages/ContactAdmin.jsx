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
  id: '', icon: 'mail', title: '', value: '', note: '', href: '', active: true, order: 1,
}

const emptyPhone = {
  id: '', label: '', number: '', note: '', active: true, order: 1,
}

const heroLabels = {
  kicker: 'نوشته کوچک بالای عنوان',
  title: 'عنوان اصلی',
  highlight: 'بخش رنگی عنوان',
  description: 'توضیحات',
  primaryButtonText: 'متن دکمه ارسال پیام',
  secondaryButtonText: 'متن دکمه تماس مستقیم',
  orbitTitle: 'عنوان انیمیشن',
  orbitDescription: 'توضیح انیمیشن',
}

const formLabels = {
  kicker: 'نوشته کوچک بالای عنوان',
  title: 'عنوان اصلی',
  highlight: 'بخش رنگی عنوان',
  description: 'توضیحات',
  supportTitle: 'عنوان یادداشت کمکی',
  supportDescription: 'توضیح یادداشت کمکی',
  submitButtonText: 'متن دکمه ارسال',
  successMessage: 'پیام موفقیت',
}

const fieldLabels = {
  fullNameLabel: 'لیبل نام کامل',
  fullNamePlaceholder: 'راهنمای فیلد نام کامل',
  phoneLabel: 'لیبل شماره تماس',
  phonePlaceholder: 'راهنمای فیلد شماره تماس',
  emailLabel: 'لیبل ایمیل',
  emailPlaceholder: 'راهنمای فیلد ایمیل',
  subjectLabel: 'لیبل موضوع',
  subjectPlaceholder: 'راهنمای فیلد موضوع',
  messageLabel: 'لیبل متن پیام',
  messagePlaceholder: 'راهنمای فیلد متن پیام',
}

const locationLabels = {
  mapTitle: 'عنوان روی نقشه',
  mapAddress: 'آدرس کوتاه روی نقشه',
  mapEmbedUrl: 'لینک Embed گوگل مپ',
  mapOpenUrl: 'لینک بازکردن در گوگل مپ',
  kicker: 'نوشته کوچک بالای عنوان',
  title: 'عنوان اصلی',
  highlight: 'بخش رنگی عنوان',
  description: 'توضیحات',
  addressLabel: 'لیبل آدرس',
  address: 'آدرس دفتر',
  workingHoursLabel: 'لیبل ساعات کاری',
  workingHours: 'ساعات کاری',
}

const ctaLabels = {
  kicker: 'نوشته کوچک کارت',
  title: 'عنوان کارت',
  buttonText: 'متن دکمه تماس',
  phone: 'شماره تماس جایگزین',
}

function ContactAdmin() {
  const [data, setData] = useState(loadContactData)
  const [messages, setMessages] = useState(loadContactMessages)
  const [section, setSection] = useState('hero')
  const [itemModal, setItemModal] = useState(false)
  const [itemDraft, setItemDraft] = useState(emptyItem)
  const [phoneModal, setPhoneModal] = useState(false)
  const [phoneDraft, setPhoneDraft] = useState(emptyPhone)

  const persist = (nextData, message = '') => {
    try {
      saveContactData(nextData)
      setData(nextData)
      if (message) showAdminSuccess(message)
      return true
    } catch (error) {
      showAdminWarning('ذخیره معلومات انجام نشد. لطفاً دوباره تلاش کنید.')
      console.error(error)
      return false
    }
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
      showAdminWarning('عنوان راه تماس الزامی است.')
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

    if (persist({ ...data, contactItems }, itemDraft.id ? 'راه تماس ویرایش شد.' : 'راه تماس اضافه شد.')) {
      setItemModal(false)
    }
  }

  const toggleItem = (id) => persist({
    ...data,
    contactItems: data.contactItems.map((item) =>
      item.id === id ? { ...item, active: item.active === false } : item,
    ),
  })

  const removeItem = async (id) => {
    const ok = await confirmAdminAction({
      title: 'حذف راه تماس',
      text: 'این مورد تماس حذف شود؟',
      confirmText: 'حذف',
    })
    if (!ok) return
    persist({ ...data, contactItems: data.contactItems.filter((item) => item.id !== id) }, 'راه تماس حذف شد.')
  }

  const openNewPhone = () => {
    setPhoneDraft({ ...emptyPhone, order: (data.phones?.length || 0) + 1 })
    setPhoneModal(true)
  }

  const openEditPhone = (phone) => {
    setPhoneDraft({ ...phone })
    setPhoneModal(true)
  }

  const savePhone = (event) => {
    event.preventDefault()
    if (!phoneDraft.number.trim()) {
      showAdminWarning('شماره تماس را وارد کنید.')
      return
    }

    const record = {
      ...phoneDraft,
      id: phoneDraft.id || `phone-${Date.now()}`,
      label: phoneDraft.label.trim() || 'شماره تماس',
      number: phoneDraft.number.trim(),
      note: phoneDraft.note.trim(),
      active: phoneDraft.active !== false,
      order: Number(phoneDraft.order) || (data.phones?.length || 0) + 1,
    }

    const phones = phoneDraft.id
      ? data.phones.map((phone) => phone.id === phoneDraft.id ? record : phone)
      : [...(data.phones || []), record]

    if (persist({ ...data, phones }, phoneDraft.id ? 'شماره تماس ویرایش شد.' : 'شماره تماس اضافه شد.')) {
      setPhoneModal(false)
    }
  }

  const togglePhone = (id) => persist({
    ...data,
    phones: data.phones.map((phone) =>
      phone.id === id ? { ...phone, active: phone.active === false } : phone,
    ),
  })

  const removePhone = async (id) => {
    const ok = await confirmAdminAction({
      title: 'حذف شماره تماس',
      text: 'این شماره تماس حذف شود؟',
      confirmText: 'حذف',
    })
    if (!ok) return
    persist({ ...data, phones: data.phones.filter((phone) => phone.id !== id) }, 'شماره تماس حذف شد.')
  }

  const markMessage = (id) => setMessages(updateContactMessage(id, { status: 'پاسخ داده‌شده' }))

  const removeMessage = async (id) => {
    const ok = await confirmAdminAction({ title: 'حذف پیام', text: 'این پیام حذف شود؟', confirmText: 'حذف' })
    if (!ok) return
    setMessages(deleteContactMessage(id))
    showAdminSuccess('پیام حذف شد.')
  }

  const resetAll = async () => {
    const ok = await confirmAdminAction({
      title: 'بازگردانی معلومات اولیه',
      text: 'تمام معلومات صفحه تماس به حالت اولیه برگردد؟',
      confirmText: 'بازگردانی',
    })
    if (!ok) return
    const next = resetContactData()
    setData(next)
    showAdminSuccess('معلومات اولیه بازگردانی شد.')
  }

  const sortedItems = useMemo(() => [...data.contactItems].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)), [data.contactItems])
  const sortedPhones = useMemo(() => [...(data.phones || [])].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)), [data.phones])

  return (
    <div className="contact-admin">
      <div className="contact-admin-tabs">
        {[
          ['hero', 'بخش معرفی'],
          ['phones', 'شماره‌های تماس'],
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
        <AdminCard title="بخش بالای صفحه تماس" description="عنوان، توضیح و دکمه‌های بخش معرفی را مدیریت کنید." onSave={saveCurrent}>
          {Object.entries(data.hero).map(([key, value]) => (
            <Field key={key} label={heroLabels[key] || key} value={value} onChange={(next) => updateSection('hero', key, next)} full={key === 'description'} textarea={key === 'description'} />
          ))}
        </AdminCard>
      )}

      {section === 'phones' && (
        <>
          <div className="contact-admin-toolbar">
            <div><strong>شماره‌های تماس</strong><span>هر تعداد شماره که نیاز دارید اضافه کنید. شماره‌های فعال در صفحه تماس و Footer نمایش داده می‌شوند.</span></div>
            <button type="button" onClick={openNewPhone}><Plus size={16} />افزودن شماره</button>
          </div>
          <div className="contact-admin-items-grid">
            {sortedPhones.map((phone) => (
              <article key={phone.id} className={phone.active === false ? 'disabled' : ''}>
                <small>شماره تماس</small><h3>{phone.label}</h3><strong dir="ltr">{phone.number}</strong><p>{phone.note || 'بدون یادداشت'}</p>
                <footer>
                  <button type="button" onClick={() => togglePhone(phone.id)}>{phone.active === false ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  <button type="button" onClick={() => openEditPhone(phone)}><Pencil size={16} /></button>
                  <button type="button" className="danger" onClick={() => removePhone(phone.id)}><Trash2 size={16} /></button>
                </footer>
              </article>
            ))}
          </div>
        </>
      )}

      {section === 'items' && (
        <>
          <div className="contact-admin-toolbar">
            <div><strong>راه‌های تماس دیگر</strong><span>ایمیل، آدرس و ساعات کاری را مدیریت کنید.</span></div>
            <button type="button" onClick={openNewItem}><Plus size={16} />افزودن مورد</button>
          </div>
          <div className="contact-admin-items-grid">
            {sortedItems.map((item) => (
              <article key={item.id} className={item.active === false ? 'disabled' : ''}>
                <small>{contactIconOptions.find((option) => option.value === item.icon)?.label || item.icon}</small><h3>{item.title}</h3><strong>{item.value}</strong><p>{item.note}</p>
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
        <AdminCard title="متن‌های فورم تماس" description="تمام لیبل‌ها و متن‌های فورم را به زبان دری مدیریت کنید." onSave={saveCurrent}>
          {Object.entries(data.formSection).filter(([key]) => key !== 'fields').map(([key, value]) => (
            <Field key={key} label={formLabels[key] || key} value={value} onChange={(next) => updateSection('formSection', key, next)} full={key === 'description' || key === 'supportDescription'} textarea={key === 'description' || key === 'supportDescription'} />
          ))}
          {Object.entries(data.formSection.fields).map(([key, value]) => (
            <Field key={key} label={fieldLabels[key] || key} value={value} onChange={(next) => updateFieldText(key, next)} />
          ))}
        </AdminCard>
      )}

      {section === 'location' && (
        <AdminCard title="موقعیت و ساعات کاری" description="موقعیت دفتر، گوگل مپ و ساعات کاری را مدیریت کنید." onSave={saveCurrent}>
          {Object.entries(data.location).map(([key, value]) => (
            <Field
              key={key}
              label={locationLabels[key] || key}
              value={value}
              onChange={(next) => updateSection('location', key, next)}
              full={key === 'description' || key === 'mapEmbedUrl' || key === 'mapOpenUrl'}
              textarea={key === 'description'}
              placeholder={key === 'mapEmbedUrl' ? 'https://www.google.com/maps?q=Kabul%2C%20Afghanistan&output=embed' : key === 'mapOpenUrl' ? 'https://www.google.com/maps/search/?api=1&query=Kabul%2C%20Afghanistan' : ''}
              hint={key === 'mapEmbedUrl' ? 'مثال ساده: https://www.google.com/maps?q=Kabul%2C%20Afghanistan&output=embed — یا در Google Maps از Share > Embed a map استفاده کنید و فقط آدرس داخل src="..." را اینجا Paste کنید.' : key === 'mapOpenUrl' ? 'این لینک وقتی کاربر روی «بازکردن در گوگل مپ» کلیک کند باز می‌شود.' : ''}
            />
          ))}
        </AdminCard>
      )}

      {section === 'cta' && (
        <AdminCard title="کارت پایانی تماس" description="عنوان و دکمه تماس پایین صفحه را مدیریت کنید." onSave={saveCurrent}>
          {Object.entries(data.finalCta).map(([key, value]) => (
            <Field key={key} label={ctaLabels[key] || key} value={value} onChange={(next) => updateSection('finalCta', key, next)} />
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
              <label><span>نوع معلومات</span><select value={itemDraft.icon} onChange={(event) => setItemDraft((current) => ({ ...current, icon: event.target.value }))}>{contactIconOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
              <Field label="مقدار" value={itemDraft.value} onChange={(value) => setItemDraft((current) => ({ ...current, value }))} />
              <Field label="یادداشت" value={itemDraft.note} onChange={(value) => setItemDraft((current) => ({ ...current, note: value }))} />
              <Field label="لینک" value={itemDraft.href} onChange={(value) => setItemDraft((current) => ({ ...current, href: value }))} placeholder="mailto:... یا #map" />
              <Field label="ترتیب نمایش" type="number" value={itemDraft.order} onChange={(value) => setItemDraft((current) => ({ ...current, order: value }))} />
              <label className="contact-admin-checkbox"><input type="checkbox" checked={itemDraft.active !== false} onChange={(event) => setItemDraft((current) => ({ ...current, active: event.target.checked }))} /><span>فعال باشد</span></label>
            </div>
            <footer><button type="button" onClick={() => setItemModal(false)}>انصراف</button><button type="submit" className="primary"><Save size={16} />ذخیره</button></footer>
          </form>
        </div>
      )}

      {phoneModal && (
        <div className="contact-admin-backdrop">
          <form className="contact-admin-modal" onSubmit={savePhone}>
            <header><h2>{phoneDraft.id ? 'ویرایش شماره تماس' : 'افزودن شماره تماس'}</h2><button type="button" onClick={() => setPhoneModal(false)}><X size={20} /></button></header>
            <div className="contact-admin-form-grid">
              <Field label="عنوان شماره" value={phoneDraft.label} onChange={(value) => setPhoneDraft((current) => ({ ...current, label: value }))} placeholder="مثلاً: فروش / دفتر مرکزی" />
              <Field label="شماره تماس" value={phoneDraft.number} onChange={(value) => setPhoneDraft((current) => ({ ...current, number: value }))} placeholder="+93 700 000 000" />
              <Field label="یادداشت" value={phoneDraft.note} onChange={(value) => setPhoneDraft((current) => ({ ...current, note: value }))} placeholder="مثلاً: پاسخ‌گویی ۸ صبح تا ۵ عصر" />
              <Field label="ترتیب نمایش" type="number" value={phoneDraft.order} onChange={(value) => setPhoneDraft((current) => ({ ...current, order: value }))} />
              <label className="contact-admin-checkbox"><input type="checkbox" checked={phoneDraft.active !== false} onChange={(event) => setPhoneDraft((current) => ({ ...current, active: event.target.checked }))} /><span>فعال باشد</span></label>
            </div>
            <footer><button type="button" onClick={() => setPhoneModal(false)}>انصراف</button><button type="submit" className="primary"><Save size={16} />ذخیره شماره</button></footer>
          </form>
        </div>
      )}
    </div>
  )
}

function AdminCard({ title, description, children, onSave }) {
  return <section className="contact-admin-card"><header><div><h3>{title}</h3><p>{description}</p></div></header><div className="contact-admin-form-grid">{children}</div><footer><button type="button" onClick={onSave}><Save size={16} />ذخیره تغییرات</button></footer></section>
}

function Field({ label, value, onChange, textarea = false, full = false, type = 'text', placeholder = '', hint = '' }) {
  return (
    <label className={full ? 'contact-admin-full' : ''}>
      <span>{label}</span>
      {textarea
        ? <textarea rows="4" value={value ?? ''} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
        : <input type={type} value={value ?? ''} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />}
      {hint ? <small className="contact-admin-field-hint">{hint}</small> : null}
    </label>
  )
}

export default ContactAdmin
