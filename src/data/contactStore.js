export const CONTACT_STORAGE_KEY =
  'alimi-contact-data-v1'

export const CONTACT_MESSAGES_STORAGE_KEY =
  'alimi-contact-messages-v1'

export const CONTACT_CHANGED_EVENT =
  'alimi-contact-data-changed'

export const CONTACT_MESSAGES_CHANGED_EVENT =
  'alimi-contact-messages-changed'

export const contactIconOptions = [
  {
    value: 'phone',
    label: 'شماره تماس',
  },
  {
    value: 'mail',
    label: 'ایمیل',
  },
  {
    value: 'map',
    label: 'آدرس',
  },
  {
    value: 'clock',
    label: 'ساعات کاری',
  },
]

export const defaultContactData = {
  hero: {
    kicker:
      'در ارتباط با شرکت رنگ‌سازی علیمی',

    title:
      'برای مشوره، خرید یا اجرای پروژه',

    highlight:
      'با ما صحبت کنید.',

    description:
      'تیم ما آماده است تا برای انتخاب محصول، ترکیب رنگ، دریافت قیمت و اجرای پروژه‌های ساختمانی و صنعتی به شما راهنمایی ارائه کند.',

    primaryButtonText:
      'ارسال پیام',

    secondaryButtonText:
      'تماس مستقیم',

    orbitTitle:
      'ما پاسخ می‌دهیم',

    orbitDescription:
      'سریع، واضح و حرفه‌ای',
  },

  contactItems: [
    {
      id: 'contact-item-1',

      icon: 'phone',

      title: 'شماره تماس',

      value: '+93 700 000 000',

      note: 'شنبه تا پنج‌شنبه',

      href: 'tel:+93700000000',

      active: true,

      order: 1,
    },

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
    kicker:
      'پیام خود را ارسال کنید',

    title:
      'درباره نیاز خود',

    highlight:
      'برای ما بنویسید',

    description:
      'معلومات تماس و موضوع درخواست خود را وارد کنید. تیم ما پس از بررسی، با شما در تماس خواهد شد.',

    supportTitle:
      'برای پروژه‌های ساختمانی و صنعتی',

    supportDescription:
      'نوع پروژه، موقعیت و مساحت تقریبی را در پیام ذکر کنید.',

    submitButtonText:
      'ارسال پیام',

    successMessage:
      'پیام شما با موفقیت ثبت شد.',

    fields: {
      fullNameLabel:
        'نام کامل',

      fullNamePlaceholder:
        'نام و تخلص',

      phoneLabel:
        'شماره تماس',

      phonePlaceholder:
        '+93 ...',

      emailLabel:
        'ایمیل',

      emailPlaceholder:
        'example@email.com',

      subjectLabel:
        'موضوع',

      subjectPlaceholder:
        'موضوع پیام',

      messageLabel:
        'متن پیام',

      messagePlaceholder:
        'درخواست یا سوال خود را اینجا بنویسید...',
    },
  },

  location: {
    mapTitle:
      'دفتر مرکزی علیمی',

    mapAddress:
      'کابل، افغانستان',

    kicker:
      'موقعیت دفتر مرکزی',

    title:
      'برای ملاقات حضوری',

    highlight:
      'به دفتر ما بیایید',

    description:
      'پیش از مراجعه حضوری، برای هماهنگی زمان ملاقات با شماره شرکت تماس بگیرید.',

    addressLabel:
      'آدرس',

    address:
      'کابل، افغانستان',

    workingHoursLabel:
      'ساعات کاری',

    workingHours:
      'شنبه تا پنج‌شنبه، ۸:۰۰ تا ۱۷:۰۰',
  },

  finalCta: {
    kicker:
      'پاسخ‌گویی و مشوره حرفه‌ای',

    title:
      'یک تماس، شروع یک همکاری تازه.',

    buttonText:
      'همین حالا تماس بگیرید',

    phone:
      '+93700000000',
  },
}

const clone = (value) =>
  JSON.parse(JSON.stringify(value))

export function loadContactData() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(
        CONTACT_STORAGE_KEY,
      ) || 'null',
    )

    if (
      !saved ||
      typeof saved !== 'object'
    ) {
      return clone(defaultContactData)
    }

    return {
      ...clone(defaultContactData),
      ...saved,

      hero: {
        ...clone(
          defaultContactData.hero,
        ),
        ...(saved.hero || {}),
      },

      contactItems: Array.isArray(
        saved.contactItems,
      )
        ? saved.contactItems
        : clone(
            defaultContactData
              .contactItems,
          ),

      formSection: {
        ...clone(
          defaultContactData
            .formSection,
        ),
        ...(saved.formSection || {}),

        fields: {
          ...clone(
            defaultContactData
              .formSection.fields,
          ),
          ...(
            saved.formSection?.fields ||
            {}
          ),
        },
      },

      location: {
        ...clone(
          defaultContactData.location,
        ),
        ...(saved.location || {}),
      },

      finalCta: {
        ...clone(
          defaultContactData.finalCta,
        ),
        ...(saved.finalCta || {}),
      },
    }
  } catch (error) {
    console.error(
      'Unable to load contact data:',
      error,
    )

    return clone(defaultContactData)
  }
}

export function saveContactData(data) {
  if (
    !data ||
    typeof data !== 'object'
  ) {
    throw new Error(
      'Contact data must be an object.',
    )
  }

  localStorage.setItem(
    CONTACT_STORAGE_KEY,
    JSON.stringify(data),
  )

  window.dispatchEvent(
    new CustomEvent(
      CONTACT_CHANGED_EVENT,
      {
        detail: data,
      },
    ),
  )

  return data
}

export function resetContactData() {
  const data = clone(
    defaultContactData,
  )

  saveContactData(data)

  return data
}

export function loadContactMessages() {
  try {
    const messages = JSON.parse(
      localStorage.getItem(
        CONTACT_MESSAGES_STORAGE_KEY,
      ) || '[]',
    )

    return Array.isArray(messages)
      ? messages
      : []
  } catch (error) {
    console.error(
      'Unable to load contact messages:',
      error,
    )

    return []
  }
}

export function saveContactMessages(
  messages,
) {
  if (!Array.isArray(messages)) {
    throw new Error(
      'Contact messages must be an array.',
    )
  }

  localStorage.setItem(
    CONTACT_MESSAGES_STORAGE_KEY,
    JSON.stringify(messages),
  )

  window.dispatchEvent(
    new CustomEvent(
      CONTACT_MESSAGES_CHANGED_EVENT,
      {
        detail: messages,
      },
    ),
  )

  return messages
}

export function createContactMessage(
  message,
) {
  if (
    !message ||
    typeof message !== 'object'
  ) {
    throw new Error(
      'Contact message must be an object.',
    )
  }

  const messages =
    loadContactMessages()

  const record = {
    id:
      `message-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    fullName:
      String(
        message.fullName || '',
      ).trim(),

    phone:
      String(
        message.phone || '',
      ).trim(),

    email:
      String(
        message.email || '',
      ).trim(),

    subject:
      String(
        message.subject || '',
      ).trim(),

    message:
      String(
        message.message || '',
      ).trim(),

    status:
      message.status || 'جدید',

    createdAt:
      message.createdAt ||
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),
  }

  saveContactMessages([
    record,
    ...messages,
  ])

  return record
}

export function updateContactMessage(
  messageId,
  updates,
) {
  const messages =
    loadContactMessages().map(
      (message) =>
        String(message.id) ===
        String(messageId)
          ? {
              ...message,
              ...updates,
              updatedAt:
                new Date().toISOString(),
            }
          : message,
    )

  saveContactMessages(messages)

  return messages
}

export function deleteContactMessage(
  messageId,
) {
  const messages =
    loadContactMessages().filter(
      (message) =>
        String(message.id) !==
        String(messageId),
    )

  saveContactMessages(messages)

  return messages
}