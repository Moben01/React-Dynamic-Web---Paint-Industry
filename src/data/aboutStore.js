export const ABOUT_STORAGE_KEY =
  'alimi-about-data-v1'

export const ABOUT_CHANGED_EVENT =
  'alimi-about-data-changed'

export const aboutValueIconOptions = [
  {
    value: 'shield',
    label: 'کیفیت و محافظت',
  },
  {
    value: 'target',
    label: 'هدف و دقت',
  },
  {
    value: 'handshake',
    label: 'همکاری با مشتری',
  },
  {
    value: 'leaf',
    label: 'تولید مسئولانه',
  },
  {
    value: 'award',
    label: 'تجربه و افتخار',
  },
  {
    value: 'users',
    label: 'تیم و مشتریان',
  },
]

export const defaultAboutData = {
  intro: {
    kicker:
      'درباره شرکت رنگ‌سازی علیمی',

    title:
      'ما فقط رنگ تولید نمی‌کنیم،',

    highlight:
      'هویت فضا را می‌سازیم.',

    description:
      'علیمی یک شرکت فعال در صنعت رنگ افغانستان است که با تمرکز بر کیفیت، دوام، انتخاب رنگ و خدمات حرفه‌ای، برای خانه‌ها، شرکت‌ها، فروشگاه‌ها و پروژه‌های صنعتی راه‌حل‌های قابل اعتماد ارائه می‌کند.',

    buttonText:
      'داستان ما را بخوانید',

    backgroundImages: [
      {
        id: 'about-bg-1',
        url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1920&auto=format&fit=crop&q=86',
        alt: 'اجرای رنگ ساختمانی',
        active: true,
        order: 1,
      },
      {
        id: 'about-bg-2',
        url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&auto=format&fit=crop&q=86',
        alt: 'فضای داخلی مدرن و رنگ‌آمیزی شده',
        active: true,
        order: 2,
      },
      {
        id: 'about-bg-3',
        url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1920&auto=format&fit=crop&q=86',
        alt: 'کار نقاشی و رنگ ساختمان',
        active: true,
        order: 3,
      },
      {
        id: 'about-bg-4',
        url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1920&auto=format&fit=crop&q=86',
        alt: 'فضای کاری مدرن',
        active: true,
        order: 4,
      },
    ],

    backgroundInterval: 5000,
  },

  vision: {
    kicker:
      'دیدگاه ما',

    title:
      'تبدیل‌شدن به یکی از قابل‌اعتمادترین نام‌ها در صنعت رنگ افغانستان.',

    stats: [
      {
        id: 'vision-stat-1',
        value: '۴۸+',
        label: 'پروژه تکمیل‌شده',
      },
      {
        id: 'vision-stat-2',
        value: '۱۲',
        label: 'ولایت تحت پوشش',
      },
      {
        id: 'vision-stat-3',
        value: '۳۰+',
        label: 'نوع محصول',
      },
      {
        id: 'vision-stat-4',
        value: '۹۵٪',
        label: 'رضایت مشتریان',
      },
    ],
  },

  story: {
    kicker:
      'داستان رشد علیمی',

    title:
      'از یک آغاز کوچک تا یک مسیر',

    highlight:
      'رو به توسعه',

    description:
      'ما قدم‌به‌قدم رشد کرده‌ایم؛ با تجربه بیشتر، محصولات متنوع‌تر و اعتماد مشتریانی که ما را برای پروژه‌های خود انتخاب کرده‌اند.',

    timeline: [
      {
        id: 'timeline-1',
        year: '۱۳۹۳',
        title: 'آغاز فعالیت',
        description:
          'فعالیت شرکت با تمرکز بر تولید رنگ‌های ساختمانی و پاسخ‌گویی به نیاز بازار داخلی آغاز شد.',
      },

      {
        id: 'timeline-2',
        year: '۱۳۹۶',
        title: 'گسترش خط تولید',
        description:
          'تنوع محصولات افزایش یافت و تولید رنگ‌های داخلی، بیرونی و پوشش‌های محافظتی توسعه پیدا کرد.',
      },

      {
        id: 'timeline-3',
        year: '۱۴۰۰',
        title: 'ورود به پروژه‌های بزرگ',
        description:
          'همکاری با پروژه‌های ساختمانی، صنعتی و تجارتی در چندین ولایت کشور آغاز شد.',
      },

      {
        id: 'timeline-4',
        year: 'امروز',
        title: 'برند رو به رشد',
        description:
          'علیمی با تمرکز بر کیفیت، طراحی مدرن و خدمات بهتر، مسیر توسعه خود را ادامه می‌دهد.',
      },
    ],
  },

  valuesSection: {
    kicker:
      'ارزش‌های ما',

    title:
      'اصولی که تصمیم‌های ما را',

    highlight:
      'هدایت می‌کنند',

    description:
      'برای ما کیفیت تنها یک ویژگی محصول نیست؛ روشی است که با آن تولید، همکاری و خدمات خود را مدیریت می‌کنیم.',
  },

  values: [
    {
      id: 'value-1',

      icon: 'shield',

      title:
        'کیفیت قابل اعتماد',

      description:
        'از انتخاب مواد اولیه تا بسته‌بندی نهایی، کیفیت محصول در تمام مراحل بررسی می‌شود.',

      active: true,

      order: 1,
    },

    {
      id: 'value-2',

      icon: 'target',

      title:
        'دقت در تولید',

      description:
        'فرمولاسیون هر محصول با توجه به شرایط اقلیمی و نیاز بازار افغانستان توسعه می‌یابد.',

      active: true,

      order: 2,
    },

    {
      id: 'value-3',

      icon: 'handshake',

      title:
        'همراهی با مشتری',

      description:
        'مشوره، انتخاب رنگ و پشتیبانی پس از فروش بخش مهمی از تجربه مشتریان ما است.',

      active: true,

      order: 3,
    },

    {
      id: 'value-4',

      icon: 'leaf',

      title:
        'تولید مسئولانه',

      description:
        'برای کاهش ضایعات، مصرف بهتر مواد و تولید محصولات بادوام‌تر تلاش می‌کنیم.',

      active: true,

      order: 4,
    },
  ],

  factory: {
    image:
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1400&auto=format&fit=crop&q=85',

    imageAlt:
      'فضای تولید و کار',

    kicker:
      'کیفیت از داخل کارخانه آغاز می‌شود',

    title:
      'تولید مدرن، بررسی دقیق و',

    highlight:
      'نتیجه قابل اعتماد',

    description:
      'محصولات ما با تمرکز بر پوشش‌دهی مناسب، دوام، رنگ‌بندی و استفاده آسان تولید می‌شوند. هر محصول پیش از عرضه، مراحل بررسی و کنترل کیفیت را طی می‌کند.',

    checklist: [
      {
        id: 'factory-item-1',
        text:
          'کنترل مواد اولیه و فرمولاسیون',
      },

      {
        id: 'factory-item-2',
        text:
          'بررسی کیفیت رنگ و پوشش‌دهی',
      },

      {
        id: 'factory-item-3',
        text:
          'بسته‌بندی مناسب و آماده عرضه',
      },
    ],
  },

  contact: {
    kicker:
      'همکاری با شرکت رنگ‌سازی علیمی',

    title:
      'برای ساختن فضاهای بهتر، همراه شما هستیم.',

    description:
      'برای دریافت مشوره، انتخاب محصول یا اجرای پروژه با تیم ما تماس بگیرید.',

    buttonText:
      'تماس با ما',

    phone:
      '+93000000000',
  },
}

const clone = (value) =>
  JSON.parse(JSON.stringify(value))

export function loadAboutData() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(
        ABOUT_STORAGE_KEY,
      ) || 'null',
    )

    if (
      !saved ||
      typeof saved !== 'object'
    ) {
      return clone(defaultAboutData)
    }

    return {
      ...clone(defaultAboutData),
      ...saved,

      intro: {
        ...clone(defaultAboutData.intro),
        ...(saved.intro || {}),
        backgroundImages:
          Array.isArray(saved.intro?.backgroundImages) &&
          saved.intro.backgroundImages.length
            ? saved.intro.backgroundImages
            : saved.intro?.largeImage
              ? [
                  {
                    id: 'about-bg-legacy',
                    url: saved.intro.largeImage,
                    alt: saved.intro.largeImageAlt || 'تصویر درباره ما',
                    active: true,
                    order: 1,
                  },
                  ...clone(defaultAboutData.intro.backgroundImages).slice(1),
                ]
              : clone(defaultAboutData.intro.backgroundImages),
      },

      vision: {
        ...clone(
          defaultAboutData.vision,
        ),
        ...(saved.vision || {}),

        stats: Array.isArray(
          saved.vision?.stats,
        )
          ? saved.vision.stats
          : clone(
              defaultAboutData.vision
                .stats,
            ),
      },

      story: {
        ...clone(
          defaultAboutData.story,
        ),
        ...(saved.story || {}),

        timeline: Array.isArray(
          saved.story?.timeline,
        )
          ? saved.story.timeline
          : clone(
              defaultAboutData.story
                .timeline,
            ),
      },

      valuesSection: {
        ...clone(
          defaultAboutData
            .valuesSection,
        ),
        ...(saved.valuesSection || {}),
      },

      values: Array.isArray(
        saved.values,
      )
        ? saved.values
        : clone(
            defaultAboutData.values,
          ),

      factory: {
        ...clone(
          defaultAboutData.factory,
        ),
        ...(saved.factory || {}),

        checklist: Array.isArray(
          saved.factory?.checklist,
        )
          ? saved.factory.checklist
          : clone(
              defaultAboutData.factory
                .checklist,
            ),
      },

      contact: {
        ...clone(
          defaultAboutData.contact,
        ),
        ...(saved.contact || {}),
      },
    }
  } catch (error) {
    console.error(
      'Unable to load About data:',
      error,
    )

    return clone(defaultAboutData)
  }
}

export function saveAboutData(data) {
  if (
    !data ||
    typeof data !== 'object'
  ) {
    throw new Error(
      'About data must be an object.',
    )
  }

  localStorage.setItem(
    ABOUT_STORAGE_KEY,
    JSON.stringify(data),
  )

  window.dispatchEvent(
    new CustomEvent(
      ABOUT_CHANGED_EVENT,
      {
        detail: data,
      },
    ),
  )

  return data
}

export function resetAboutData() {
  const data = clone(
    defaultAboutData,
  )

  saveAboutData(data)

  return data
}