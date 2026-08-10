/*
  Central list of CMS fields that contain human-readable content.
  Technical values (ids, URLs, images, booleans, order, colors, phone, email, etc.)
  intentionally stay language-neutral.
*/
export const I18N_SCHEMA_VERSION = 1

export const TRANSLATABLE_FIELDS = {
  cms: {
    site: ['companyName', 'shortName', 'tagline', 'address', 'workingHours'],
    dashboard: [
      'eyebrow', 'title', 'highlight', 'rotatingPrefix', 'rotatingWords', 'description',
      'primaryText', 'secondaryText', 'projectsEyebrow', 'projectsTitle',
      'projectsHighlight', 'projectsDescription',
    ],
    slides: ['title', 'subtitle', 'badge'],
    categories: ['name', 'description'],
    productsPage: ['eyebrow', 'title', 'highlight', 'description'],
    products: ['name', 'description', 'sizes', 'finish', 'coverage', 'price'],
    projectsPage: ['eyebrow', 'title', 'highlight', 'description'],
    projects: ['title', 'categoryLabel', 'location', 'status', 'client', 'area', 'description'],
    about: ['eyebrow', 'title', 'highlight', 'description', 'storyTitle', 'story'],
    contact: ['eyebrow', 'title', 'highlight', 'description', 'responseTitle', 'responseSubtitle'],
    reviews: ['name', 'comment'],
  },

  productsStore: {
    hero: ['kicker', 'titleBefore', 'titleHighlight', 'description', 'featuredBadge', 'backgroundWord'],
    heroStats: ['value', 'label'],
    catalog: ['kicker', 'title', 'searchPlaceholder', 'emptyTitle', 'emptyDescription'],
    categories: ['label', 'description'],
    products: ['name', 'categoryLabel', 'description', 'sizes', 'finish', 'coverage'],
  },

  projectsStore: {
    page: ['kicker', 'titleBefore', 'titleHighlight', 'description', 'searchPlaceholder', 'emptyTitle', 'emptyDescription'],
    projects: ['title', 'categoryLabel', 'location', 'status', 'client', 'area', 'description', 'alt'],
  },

  aboutStore: {
    scalar: [
      'eyebrow', 'titleBefore', 'titleHighlight', 'description', 'buttonText',
      'experienceTitle', 'experienceText', 'visionKicker', 'visionTitle', 'visionDescription',
      'storyKicker', 'storyTitle', 'storyDescription', 'factoryKicker', 'factoryTitle',
      'factoryDescription', 'finalKicker', 'finalTitle', 'finalDescription', 'finalButtonText',
    ],
    valueCards: ['title', 'description'],
  },

  contactStore: {
    scalar: [
      'kicker', 'title', 'highlight', 'description', 'addressLabel', 'address',
      'workingHoursLabel', 'workingHours', 'mapTitle', 'mapAddress', 'responseKicker',
      'responseTitle', 'responseDescription', 'responseButtonText',
    ],
    phones: ['label'],
  },

  assistantStore: [
    'title', 'statusText', 'namePromptTitle', 'namePromptText',
    'namePlaceholder', 'welcomeMessage', 'messagePlaceholder',
  ],
}
