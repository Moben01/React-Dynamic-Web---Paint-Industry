import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
  NavLink,
  useLocation,
} from 'react-router-dom'

import {
  Check,
  Languages,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react'

import { useLanguage } from '../i18n/LanguageContext'
import SiteSearch from '../components/SiteSearch'

import logo from '../../Assets/logo.png'
import './Header.css'

const themes = [
  {
    id: 'alimi',

    labels: {
      fa: 'سفید و نارنجی',
      ps: 'سپین او نارنجي',
      en: 'White and Orange',
    },

    swatches: [
      '#ffffff',
      '#ff6b1a',
      '#1c1c1c',
    ],
  },

  {
    id: 'midnight',

    labels: {
      fa: 'شب مدرن',
      ps: 'عصري شپه',
      en: 'Modern Midnight',
    },

    swatches: [
      '#111318',
      '#ff7a25',
      '#f7f7f7',
    ],
  },

  {
    id: 'sand',

    labels: {
      fa: 'گرم و لوکس',
      ps: 'تود او لوکس',
      en: 'Warm and Luxurious',
    },

    swatches: [
      '#fbf4e8',
      '#d65d24',
      '#34241b',
    ],
  },

  {
    id: 'ocean',

    labels: {
      fa: 'آرام و حرفه‌ای',
      ps: 'ارام او مسلکي',
      en: 'Calm and Professional',
    },

    swatches: [
      '#f7fbff',
      '#ff6b1a',
      '#15364a',
    ],
  },
]

function Header() {
  const location = useLocation()

  const {
    language,
    setLanguage,
    direction,
    currentLanguage,
    languages,
    t,
  } = useLanguage()

  const [menuOpen, setMenuOpen] =
    useState(false)

  const [themeOpen, setThemeOpen] =
    useState(false)

  const [searchOpen, setSearchOpen] = useState(false)

  const [
    languageOpen,
    setLanguageOpen,
  ] = useState(false)

  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem(
        'alimi-theme',
      ) || 'alimi',
  )

  const currentTheme = useMemo(
    () =>
      themes.find(
        (item) => item.id === theme,
      ) || themes[0],
    [theme],
  )

  const currentThemeLabel =
    currentTheme.labels?.[language] ||
    currentTheme.labels?.fa ||
    currentTheme.id

  useEffect(() => {
    document.documentElement.dataset.theme =
      theme

    localStorage.setItem(
      'alimi-theme',
      theme,
    )
  }, [theme])

  useEffect(() => {
    setMenuOpen(false)
    setThemeOpen(false)
    setLanguageOpen(false)
    setSearchOpen(false)

    if (location.hash) {
      window.requestAnimationFrame(
        () => {
          const section =
            document.querySelector(
              location.hash,
            )

          section?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        },
      )
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'auto',
      })
    }
  }, [
    location.pathname,
    location.hash,
  ])

  useEffect(() => {
    const closeDropdowns = (event) => {
      const target = event.target

      if (
        !target.closest(
          '.site-header-language-picker',
        )
      ) {
        setLanguageOpen(false)
      }

      if (
        !target.closest(
          '.site-header-theme-picker',
        )
      ) {
        setThemeOpen(false)
      }
    }

    const closeWithEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setThemeOpen(false)
        setLanguageOpen(false)
        setSearchOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      closeDropdowns,
    )

    document.addEventListener(
      'keydown',
      closeWithEscape,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        closeDropdowns,
      )

      document.removeEventListener(
        'keydown',
        closeWithEscape,
      )
    }
  }, [])

  const selectTheme = (themeId) => {
    setTheme(themeId)
    setThemeOpen(false)
  }

  const selectLanguage = (
    languageId,
  ) => {
    setLanguage(languageId)
    setLanguageOpen(false)
    setMenuOpen(false)
  }

  const toggleThemeMenu = () => {
    setThemeOpen(
      (current) => !current,
    )

    setLanguageOpen(false)
  }

  const toggleLanguageMenu = () => {
    setLanguageOpen(
      (current) => !current,
    )

    setThemeOpen(false)
  }

  const toggleMobileMenu = () => {
    setMenuOpen(
      (current) => !current,
    )

    setThemeOpen(false)
    setLanguageOpen(false)
  }

  const closeMobileMenu = () => {
    setMenuOpen(false)
    setThemeOpen(false)
    setLanguageOpen(false)
  }

  const navClassName = ({
    isActive,
  }) =>
    isActive
      ? 'site-header-active-link'
      : undefined

  return (
    <header
      className="site-header"
      dir={direction}
      data-direction={direction}
      data-language={language}
    >
      <div className="site-header-container">
        <Link
          to="/"
          className="site-header-brand"
          aria-label={t(
            'header.brandAria',
            'Alimi Paint Company',
          )}
          onClick={closeMobileMenu}
        >
          <img
            className="site-header-logo"
            src={logo}
            alt={t(
              'header.brandAria',
              'Alimi Paint Company',
            )}
          />
        </Link>

        <nav
          className={
            menuOpen
              ? 'site-header-navigation site-header-navigation-open'
              : 'site-header-navigation'
          }
          aria-label={t(
            'header.mainNavigation',
            'Main navigation',
          )}
        >
          <NavLink
            to="/"
            end
            className={navClassName}
            onClick={closeMobileMenu}
          >
            {t(
              'header.home',
              'Home',
            )}
          </NavLink>

          <NavLink
            to="/products"
            className={navClassName}
            onClick={closeMobileMenu}
          >
            {t(
              'header.products',
              'Products',
            )}
          </NavLink>

          <NavLink
            to="/projects"
            className={navClassName}
            onClick={closeMobileMenu}
          >
            {t(
              'header.projects',
              'Projects',
            )}
          </NavLink>

          <NavLink
            to="/about"
            className={navClassName}
            onClick={closeMobileMenu}
          >
            {t(
              'header.about',
              'About us',
            )}
          </NavLink>

          <NavLink
            to="/contact"
            className={navClassName}
            onClick={closeMobileMenu}
          >
            {t(
              'header.contact',
              'Contact',
            )}
          </NavLink>
        </nav>

        <div className="site-header-actions">
          <div className="site-header-language-picker">
            <button
              type="button"
              className="site-header-language-button"
              onClick={
                toggleLanguageMenu
              }
              aria-label={t(
                'common.selectLanguage',
                'Select language',
              )}
              title={t(
                'common.selectLanguage',
                'Select language',
              )}
              aria-expanded={
                languageOpen
              }
              aria-haspopup="menu"
            >
              <Languages size={19} />

              <span className="site-header-language-name">
                {currentLanguage.shortLabel}
              </span>
            </button>

            {languageOpen && (
              <div
                className="site-header-language-menu"
                role="menu"
              >
                <strong>
                  {t(
                    'common.selectLanguage',
                    'Select language',
                  )}
                </strong>

                {languages.map(
                  (item) => (
                    <button
                      type="button"
                      role="menuitem"
                      key={item.id}
                      className={
                        language ===
                        item.id
                          ? 'site-header-language-active'
                          : ''
                      }
                      onClick={() =>
                        selectLanguage(
                          item.id,
                        )
                      }
                    >
                      <span>
                        {item.label}
                      </span>

                      {language ===
                        item.id && (
                        <Check
                          size={16}
                        />
                      )}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="site-header-theme-picker">
            <button
              type="button"
              className="site-header-theme-button"
              onClick={
                toggleThemeMenu
              }
              aria-label={t(
                'header.selectTheme',
                'Select appearance',
              )}
              title={t(
                'header.selectTheme',
                'Select appearance',
              )}
              aria-expanded={themeOpen}
              aria-haspopup="menu"
            >
              {theme ===
              'midnight' ? (
                <Moon size={19} />
              ) : (
                <Sun size={19} />
              )}
            </button>

            {themeOpen && (
              <div
                className="site-header-theme-menu"
                role="menu"
              >
                <strong>
                  {t(
                    'header.selectTheme',
                    'Select appearance',
                  )}
                </strong>

                {themes.map(
                  (item) => {
                    const label =
                      item.labels?.[
                        language
                      ] ||
                      item.labels?.fa ||
                      item.id

                    return (
                      <button
                        type="button"
                        role="menuitem"
                        key={item.id}
                        onClick={() =>
                          selectTheme(
                            item.id,
                          )
                        }
                      >
                        <span className="site-header-theme-swatches">
                          {item.swatches.map(
                            (color) => (
                              <i
                                key={
                                  color
                                }
                                style={{
                                  backgroundColor:
                                    color,
                                }}
                              />
                            ),
                          )}
                        </span>

                        <span>
                          {label}
                        </span>

                        {item.id ===
                          theme && (
                          <Check
                            size={16}
                          />
                        )}
                      </button>
                    )
                  },
                )}

                <small>
                  {t(
                    'header.currentTheme',
                    'Current theme',
                  )}
                  :{' '}
                  {currentThemeLabel}
                </small>
              </div>
            )}
          </div>

          <button
            type="button"
            className="site-header-search-button"
            onClick={() => {
              setSearchOpen(true)
              setMenuOpen(false)
              setThemeOpen(false)
              setLanguageOpen(false)
            }}
            aria-label={t('header.search', 'Search')}
            title={t('header.search', 'Search')}
          >
            <Search size={19} />
          </button>

          <button
            type="button"
            className="site-header-menu-button"
            onClick={toggleMobileMenu}
            aria-label={
              menuOpen
                ? t(
                    'common.closeMenu',
                    'Close menu',
                  )
                : t(
                    'common.openMenu',
                    'Open menu',
                  )
            }
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X size={21} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>
      </div>

      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}

export default Header