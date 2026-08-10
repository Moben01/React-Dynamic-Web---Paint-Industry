import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock3, Mail, MapPin, Phone } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import {
  CONTACT_CHANGED_EVENT,
  loadContactData,
} from '../data/contactStore'
import { localizedText } from '../i18n/localizedContent'
import logo from '../../Assets/logo.png'
import isoLogo from '../../Assets/iso.jpeg'
import './Footer.css'

const copy = {
  fa: {
    about: 'شرکت رنگ‌سازی علیمی؛ همراه شما برای انتخاب رنگ، محصولات ساختمانی و پروژه‌های حرفه‌ای.',
    links: 'لینک‌های سریع',
    contact: 'تماس با ما',
    office: 'دفتر مرکزی',
    home: 'صفحه اصلی',
    products: 'محصولات',
    projects: 'پروژه‌ها',
    aboutUs: 'درباره ما',
    contactUs: 'تماس',
    rights: 'تمام حقوق محفوظ است.',
    hours: 'ساعات کاری',
  },
  ps: {
    about: 'د علیمي رنګ جوړونې شرکت؛ د رنګ، ساختماني محصولاتو او مسلکي پروژو لپاره ستاسو ملګری.',
    links: 'چټک لینکونه',
    contact: 'اړیکه',
    office: 'مرکزي دفتر',
    home: 'کور',
    products: 'محصولات',
    projects: 'پروژې',
    aboutUs: 'زموږ په اړه',
    contactUs: 'اړیکه',
    rights: 'ټول حقوق خوندي دي.',
    hours: 'کاري ساعتونه',
  },
  en: {
    about: 'Alimi Paint Company — your partner for paint selection, building products and professional projects.',
    links: 'Quick links',
    contact: 'Contact us',
    office: 'Head office',
    home: 'Home',
    products: 'Products',
    projects: 'Projects',
    aboutUs: 'About us',
    contactUs: 'Contact',
    rights: 'All rights reserved.',
    hours: 'Working hours',
  },
}

function Footer() {
  const { language, direction } = useLanguage()
  const [data, setData] = useState(loadContactData)
  const labels = copy[language] || copy.fa
  const text = (value) => localizedText(value, language)

  useEffect(() => {
    const refresh = () => setData(loadContactData())
    window.addEventListener(CONTACT_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(CONTACT_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const phones = useMemo(
    () => [...(data.phones || [])]
      .filter((phone) => phone.active !== false && phone.number)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [data.phones],
  )

  const email = data.contactItems?.find((item) => item.icon === 'mail' && item.active !== false)

  return (
    <footer className="site-footer" dir={direction}>
      <div className="site-footer-accent" />
      <div className="site-footer-container">
        <div className="site-footer-grid">
          <section className="site-footer-brand-column">
            <div className="site-footer-brand-logos">
              <img
                className="site-footer-iso-logo"
                src={isoLogo}
                alt="ISO"
              />
              <Link to="/" className="site-footer-logo-wrap" aria-label="Alimi Paint Company">
                <img src={logo} alt="Alimi Paint Company" />
              </Link>
            </div>
            <p>{labels.about}</p>
          </section>

          <section>
            <h3>{labels.links}</h3>
            <nav className="site-footer-links">
              <Link to="/">{labels.home}</Link>
              <Link to="/products">{labels.products}</Link>
              <Link to="/projects">{labels.projects}</Link>
              <Link to="/about">{labels.aboutUs}</Link>
              <Link to="/contact">{labels.contactUs}</Link>
            </nav>
          </section>

          <section>
            <h3>{labels.contact}</h3>
            <div className="site-footer-contact-list">
              {phones.map((phone) => (
                <a key={phone.id} href={`tel:${String(phone.number).replace(/[^+\d]/g, '')}`}>
                  <Phone size={17} />
                  <span><small>{text(phone.label)}</small><b dir="ltr">{phone.number}</b></span>
                </a>
              ))}
              {email?.value && (
                <a href={email.href || `mailto:${text(email.value)}`}>
                  <Mail size={17} />
                  <span><small>{text(email.title)}</small><b dir="ltr">{text(email.value)}</b></span>
                </a>
              )}
            </div>
          </section>

          <section>
            <h3>{labels.office}</h3>
            <div className="site-footer-office">
              <div><MapPin size={17} /><span>{text(data.location.address)}</span></div>
              <div><Clock3 size={17} /><span><small>{labels.hours}</small>{text(data.location.workingHours)}</span></div>
              {data.location.mapOpenUrl && (
                <a href={data.location.mapOpenUrl} target="_blank" rel="noreferrer">Google Maps</a>
              )}
            </div>
          </section>
        </div>

        <div className="site-footer-bottom">
          <span>© {new Date().getFullYear()} Alimi Paint Company</span>
          <span>{labels.rights}</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
