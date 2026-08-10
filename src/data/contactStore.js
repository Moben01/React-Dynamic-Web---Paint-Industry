import { normalizeLocalizedValue } from '../i18n/localizedContent'
import { hydrateRemoteSection, saveRemoteSection } from './remoteStore'

export const CONTACT_STORAGE_KEY = 'alimi-contact-data-v1'
export const CONTACT_MESSAGES_STORAGE_KEY = 'alimi-contact-messages-v1'
export const CONTACT_CHANGED_EVENT = 'alimi-contact-data-changed'
export const CONTACT_MESSAGES_CHANGED_EVENT = 'alimi-contact-messages-changed'

export const contactIconOptions = [
  { value: 'mail', label: 'ایمیل' },
  { value: 'map', label: 'آدرس' },
  { value: 'clock', label: 'ساعات کاری' },
]

export const defaultContactData = {
  hero: {
    kicker: 'در ارتباط با شرکت رنگ‌سازی علیمی',
    title: 'برای مشوره، خرید یا اجرای پروژه',
    highlight: 'با ما صحبت کنید.',
    description: 'تیم ما آماده است تا برای انتخاب محصول، ترکیب رنگ، دریافت قیمت و اجرای پروژه‌های ساختمانی و صنعتی به شما راهنمایی ارائه کند.',
    primaryButtonText: 'ارسال پیام',
    secondaryButtonText: 'تماس مستقیم',
    orbitTitle: 'ما پاسخ می‌دهیم',
    orbitDescription: 'سریع، واضح و حرفه‌ای',
  },

  phones: [
    {
      id: 'phone-1',
      label: 'شماره تماس اصلی',
      number: '+93 700 000 000',
      note: 'شنبه تا پنج‌شنبه',
      active: true,
      order: 1,
    },
  ],

  contactItems: [
    {
      id: 'contact-item-2',
      icon: 'mail',
      title: 'ایمیل',
      value: 'info@alimipaint.af',
      note: 'پاسخ در اولین فرصت',
      href: 'mailto:info@alimipaint.af',
      active: true,
      order: 2,
    },
    {
      id: 'contact-item-3',
      icon: 'map',
      title: 'آدرس',
      value: 'کابل، افغانستان',
      note: 'دفتر مرکزی شرکت',
      href: '#map',
      active: true,
      order: 3,
    },
    {
      id: 'contact-item-4',
      icon: 'clock',
      title: 'ساعات کاری',
      value: '۸ صبح تا ۵ عصر',
      note: 'جمعه رخصتی',
      href: '#working-hours',
      active: true,
      order: 4,
    },
  ],

  formSection: {
    kicker: 'پیام خود را ارسال کنید',
    title: 'درباره نیاز خود',
    highlight: 'برای ما بنویسید',
    description: 'معلومات تماس و موضوع درخواست خود را وارد کنید. تیم ما پس از بررسی، با شما در تماس خواهد شد.',
    supportTitle: 'برای پروژه‌های ساختمانی و صنعتی',
    supportDescription: 'نوع پروژه، موقعیت و مساحت تقریبی را در پیام ذکر کنید.',
    submitButtonText: 'ارسال پیام',
    successMessage: 'پیام شما با موفقیت ثبت شد.',
    fields: {
      fullNameLabel: 'نام کامل',
      fullNamePlaceholder: 'نام و تخلص',
      phoneLabel: 'شماره تماس',
      phonePlaceholder: '+93 ...',
      emailLabel: 'ایمیل',
      emailPlaceholder: 'example@email.com',
      subjectLabel: 'موضوع',
      subjectPlaceholder: 'موضوع پیام',
      messageLabel: 'متن پیام',
      messagePlaceholder: 'درخواست یا سوال خود را اینجا بنویسید...',
    },
  },

  location: {
    mapTitle: 'دفتر مرکزی علیمی',
    mapAddress: 'کابل، افغانستان',
    mapEmbedUrl: 'https://www.google.com/maps?q=Kabul%2C%20Afghanistan&output=embed',
    mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=Kabul%2C%20Afghanistan',
    kicker: 'موقعیت دفتر مرکزی',
    title: 'برای ملاقات حضوری',
    highlight: 'به دفتر ما بیایید',
    description: 'پیش از مراجعه حضوری، برای هماهنگی زمان ملاقات با شماره شرکت تماس بگیرید.',
    addressLabel: 'آدرس',
    address: 'کابل، افغانستان',
    workingHoursLabel: 'ساعات کاری',
    workingHours: 'شنبه تا پنج‌شنبه، ۸:۰۰ تا ۱۷:۰۰',
  },

  finalCta: {
    kicker: 'پاسخ‌گویی و مشوره حرفه‌ای',
    title: 'یک تماس، شروع یک همکاری تازه.',
    buttonText: 'همین حالا تماس بگیرید',
    phone: '+93700000000',
  },
}

const clone = (value) => JSON.parse(JSON.stringify(value))
const localize = (value) => normalizeLocalizedValue(value, 'fa')
const localizeSection = (section = {}) =>
  Object.fromEntries(
    Object.entries(section).map(([key, value]) => [key, localize(value)]),
  )

const normalizeHero = (hero = {}) =>
  localizeSection({ ...clone(defaultContactData.hero), ...hero })

const normalizeFormSection = (formSection = {}) => {
  const { fields: _defaultFields, ...defaultFormText } = clone(defaultContactData.formSection)
  const { fields: savedFields, ...savedFormText } = formSection

  return {
    ...localizeSection({ ...defaultFormText, ...savedFormText }),
    fields: localizeSection({
      ...clone(defaultContactData.formSection.fields),
      ...(savedFields || {}),
    }),
  }
}

const normalizeLocation = (location = {}) => {
  const { mapEmbedUrl, mapOpenUrl, ...defaultLocationText } = clone(defaultContactData.location)
  const {
    mapEmbedUrl: savedMapEmbedUrl,
    mapOpenUrl: savedMapOpenUrl,
    ...savedLocationText
  } = location

  return {
    ...localizeSection({ ...defaultLocationText, ...savedLocationText }),
    mapEmbedUrl: savedMapEmbedUrl || mapEmbedUrl,
    mapOpenUrl: savedMapOpenUrl || mapOpenUrl,
  }
}

const normalizeFinalCta = (finalCta = {}) => {
  const { phone, ...defaultFinalCtaText } = clone(defaultContactData.finalCta)
  const { phone: savedPhone, ...savedFinalCtaText } = finalCta

  return {
    ...localizeSection({ ...defaultFinalCtaText, ...savedFinalCtaText }),
    phone: savedPhone || phone,
  }
}

const normalizePhones = (saved) => {
  if (Array.isArray(saved?.phones) && saved.phones.length) {
    return saved.phones.map((phone, index) => ({
      id: phone.id || `phone-${Date.now()}-${index}`,
      label: localize(phone.label || `شماره تماس ${index + 1}`),
      number: phone.number || '',
      note: localize(phone.note || ''),
      whatsapp: phone.whatsapp === true,
      active: phone.active !== false,
      order: Number(phone.order) || index + 1,
    }))
  }

  const oldPhoneItem = Array.isArray(saved?.contactItems)
    ? saved.contactItems.find((item) => item.icon === 'phone')
    : null

  if (oldPhoneItem?.value) {
    return [{
      id: 'phone-1',
      label: localize(oldPhoneItem.title || 'شماره تماس اصلی'),
      number: oldPhoneItem.value,
      note: localize(oldPhoneItem.note || ''),
      whatsapp: oldPhoneItem.whatsapp === true,
      active: oldPhoneItem.active !== false,
      order: 1,
    }]
  }

  return clone(defaultContactData.phones).map((phone) => ({
    ...phone,
    label: localize(phone.label),
    note: localize(phone.note),
    whatsapp: phone.whatsapp === true,
  }))
}

const normalizeContactItems = (saved) => {
  const items = Array.isArray(saved?.contactItems)
    ? saved.contactItems.filter((item) => item.icon !== 'phone')
    : clone(defaultContactData.contactItems)

  return items.map((item, index) => ({
    id: item.id || `contact-item-${Date.now()}-${index}`,
    icon: item.icon || 'mail',
    title: localize(item.title || ''),
    value: localize(item.value || ''),
    note: localize(item.note || ''),
    href: item.href || '',
    active: item.active !== false,
    order: Number(item.order) || index + 1,
  }))
}

const normalizeContactData = (data = defaultContactData) => ({
  ...clone(defaultContactData),
  ...data,
  hero: normalizeHero(data.hero),
  phones: normalizePhones(data),
  contactItems: normalizeContactItems(data),
  formSection: normalizeFormSection(data.formSection),
  location: normalizeLocation(data.location),
  finalCta: normalizeFinalCta(data.finalCta),
})

export function loadContactData() {
  try {
    hydrateRemoteSection(
      'contact',
      normalizeContactData,
      CONTACT_STORAGE_KEY,
      CONTACT_CHANGED_EVENT,
    )
    const saved = JSON.parse(localStorage.getItem(CONTACT_STORAGE_KEY) || 'null')

    if (!saved || typeof saved !== 'object') {
      return normalizeContactData(defaultContactData)
    }

    return normalizeContactData(saved)
  } catch (error) {
    console.error('Unable to load contact data:', error)
    return clone(defaultContactData)
  }
}

export function saveContactData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Contact data must be an object.')
  }

  localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(data))
  window.dispatchEvent(new CustomEvent(CONTACT_CHANGED_EVENT, { detail: data }))
  saveRemoteSection('contact', normalizeContactData(data)).catch((error) => {
    console.warn('Contact data saved locally; PostgreSQL API unavailable:', error.message)
  })
  return data
}

export function resetContactData() {
  const data = normalizeContactData(defaultContactData)
  saveContactData(data)
  return data
}

export function loadContactMessages() {
  try {
    hydrateRemoteSection(
      'contactMessages',
      (value) => (Array.isArray(value) ? value : []),
      CONTACT_MESSAGES_STORAGE_KEY,
      CONTACT_MESSAGES_CHANGED_EVENT,
    )
    const messages = JSON.parse(localStorage.getItem(CONTACT_MESSAGES_STORAGE_KEY) || '[]')
    return Array.isArray(messages) ? messages : []
  } catch {
    return []
  }
}

function saveMessages(messages) {
  localStorage.setItem(CONTACT_MESSAGES_STORAGE_KEY, JSON.stringify(messages))
  window.dispatchEvent(new CustomEvent(CONTACT_MESSAGES_CHANGED_EVENT, { detail: messages }))
  saveRemoteSection('contactMessages', messages).catch((error) => {
    console.warn('Contact messages saved locally; PostgreSQL API unavailable:', error.message)
  })
  return messages
}

export function createContactMessage(payload) {
  const messages = loadContactMessages()
  const message = {
    id: `message-${Date.now()}`,
    ...payload,
    status: 'جدید',
    createdAt: new Date().toISOString(),
  }
  saveMessages([message, ...messages])
  return message
}

export function updateContactMessage(id, changes) {
  return saveMessages(loadContactMessages().map((message) => (
    message.id === id ? { ...message, ...changes } : message
  )))
}

export function deleteContactMessage(id) {
  return saveMessages(loadContactMessages().filter((message) => message.id !== id))
}
