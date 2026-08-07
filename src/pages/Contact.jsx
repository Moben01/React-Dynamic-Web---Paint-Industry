import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  Check,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  CONTACT_CHANGED_EVENT,
  createContactMessage,
  loadContactData,
} from '../data/contactStore'
import './Contact.css'

const iconMap = {
  phone: Phone,
  mail: Mail,
  map: MapPin,
  clock: Clock3,
}

function Contact() {
  const [pageData, setPageData] = useState(loadContactData)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  })

  useEffect(() => {
    const refresh = () => setPageData(loadContactData())
    window.addEventListener(CONTACT_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(CONTACT_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const activePhones = useMemo(
    () => [...(pageData.phones || [])]
      .filter((phone) => phone.active !== false && phone.number)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [pageData.phones],
  )

  const contactItems = useMemo(
    () => [...pageData.contactItems]
      .filter((item) => item.active !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [pageData.contactItems],
  )

  const displayedContactItems = useMemo(() => {
    const phones = activePhones.map((phone, index) => ({
      id: phone.id,
      icon: 'phone',
      title: phone.label || `شماره تماس ${index + 1}`,
      value: phone.number,
      note: phone.note || '',
      href: `tel:${String(phone.number).replace(/[^+\d]/g, '')}`,
      order: Number(phone.order || index + 1),
    }))
    return [...phones, ...contactItems]
  }, [activePhones, contactItems])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    createContactMessage(formData)
    setSubmitted(true)
    setFormData({ fullName: '', phone: '', email: '', subject: '', message: '' })
    window.setTimeout(() => setSubmitted(false), 3500)
  }

  const primaryPhone = activePhones[0]
  const primaryPhoneHref = primaryPhone?.number ? `tel:${String(primaryPhone.number).replace(/[^+\d]/g, '')}` : `tel:${pageData.finalCta.phone}`
  const fields = pageData.formSection.fields

  return (
    <div className="contact-shell">
      <main className="contact-page">
        <section className="contact-hero">
          <div className="contact-hero-grid-bg" aria-hidden="true" />
          <div className="contact-container contact-hero-layout">
            <motion.div
              className="contact-hero-copy"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
            >
              <span className="contact-kicker"><Sparkles size={17} />{pageData.hero.kicker}</span>
              <h1>{pageData.hero.title}<span> {pageData.hero.highlight}</span></h1>
              <p>{pageData.hero.description}</p>
              <div className="contact-hero-actions">
                <a href="#contact-form" className="contact-primary-btn">
                  {pageData.hero.primaryButtonText}<ArrowLeft size={18} />
                </a>
                <a
                  href={primaryPhoneHref}
                  className="contact-secondary-btn"
                >
                  {pageData.hero.secondaryButtonText}<Phone size={17} />
                </a>
              </div>
            </motion.div>

            <motion.div
              className="contact-orbit-visual"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.08 }}
            >
              <div className="contact-orbit-ring contact-orbit-ring-one" />
              <div className="contact-orbit-ring contact-orbit-ring-two" />
              <div className="contact-orbit-core">
                <MessageCircle size={46} />
                <strong>{pageData.hero.orbitTitle}</strong>
                <span>{pageData.hero.orbitDescription}</span>
              </div>
              <div className="contact-floating-point contact-point-phone"><Phone size={20} /></div>
              <div className="contact-floating-point contact-point-mail"><Mail size={20} /></div>
              <div className="contact-floating-point contact-point-location"><MapPin size={20} /></div>
            </motion.div>
          </div>
        </section>

        <section className="contact-info-section">
          <div className="contact-container">
            <div className="contact-info-grid">
              {displayedContactItems.map((item, index) => {
                const Icon = iconMap[item.icon] || Phone
                return (
                  <motion.a
                    href={item.href}
                    key={item.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                  >
                    <span className="contact-info-index">{String(index + 1).padStart(2, '0')}</span>
                    <div className="contact-info-icon"><Icon size={23} /></div>
                    <small>{item.title}</small>
                    <strong>{item.value}</strong>
                    <p>{item.note}</p>
                  </motion.a>
                )
              })}
            </div>
          </div>
        </section>

        <section className="contact-form-section" id="contact-form">
          <div className="contact-container contact-form-layout">
            <div className="contact-form-intro">
              <span className="contact-kicker"><Send size={17} />{pageData.formSection.kicker}</span>
              <h2>{pageData.formSection.title}<span> {pageData.formSection.highlight}</span></h2>
              <p>{pageData.formSection.description}</p>
              <div className="contact-support-note">
                <div><Building2 size={22} /></div>
                <span>
                  <strong>{pageData.formSection.supportTitle}</strong>
                  {pageData.formSection.supportDescription}
                </span>
              </div>
            </div>

            <motion.form
              className="contact-form-card"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <div className="contact-form-row">
                <label><span>{fields.fullNameLabel}</span><div><UserRound size={18} /><input name="fullName" value={formData.fullName} onChange={handleChange} placeholder={fields.fullNamePlaceholder} required /></div></label>
                <label><span>{fields.phoneLabel}</span><div><Phone size={18} /><input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder={fields.phonePlaceholder} required /></div></label>
              </div>
              <div className="contact-form-row">
                <label><span>{fields.emailLabel}</span><div><Mail size={18} /><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={fields.emailPlaceholder} /></div></label>
                <label><span>{fields.subjectLabel}</span><div><MessageCircle size={18} /><input name="subject" value={formData.subject} onChange={handleChange} placeholder={fields.subjectPlaceholder} required /></div></label>
              </div>
              <label className="contact-message-field">
                <span>{fields.messageLabel}</span>
                <textarea name="message" value={formData.message} onChange={handleChange} placeholder={fields.messagePlaceholder} required />
              </label>
              <button type="submit" className="contact-submit-button">{pageData.formSection.submitButtonText}<Send size={18} /></button>
              {submitted && <div className="contact-success-message"><Check size={18} />{pageData.formSection.successMessage}</div>}
            </motion.form>
          </div>
        </section>

        <section className="contact-map-section" id="map">
          <div className="contact-container contact-map-layout">
            <div className="contact-map-card contact-map-card-live">
              {pageData.location.mapEmbedUrl ? (
                <iframe
                  className="contact-google-map"
                  src={pageData.location.mapEmbedUrl}
                  title={pageData.location.mapTitle || 'Google Map'}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <>
                  <div className="contact-map-pattern" aria-hidden="true" />
                  <div className="contact-map-marker"><MapPin size={28} /></div>
                  <span className="contact-map-road contact-road-one" />
                  <span className="contact-map-road contact-road-two" />
                  <span className="contact-map-road contact-road-three" />
                </>
              )}
              <div className="contact-map-label">
                <strong>{pageData.location.mapTitle}</strong>
                <span>{pageData.location.mapAddress}</span>
                {pageData.location.mapOpenUrl && (
                  <a href={pageData.location.mapOpenUrl} target="_blank" rel="noreferrer">بازکردن در گوگل مپ</a>
                )}
              </div>
            </div>

            <div className="contact-location-copy">
              <span className="contact-kicker"><MapPin size={17} />{pageData.location.kicker}</span>
              <h2>{pageData.location.title}<span> {pageData.location.highlight}</span></h2>
              <p>{pageData.location.description}</p>
              <div className="contact-location-details">
                <div><small>{pageData.location.addressLabel}</small><strong>{pageData.location.address}</strong></div>
                <div id="working-hours"><small>{pageData.location.workingHoursLabel}</small><strong>{pageData.location.workingHours}</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-final-cta">
          <div className="contact-container">
            <div className="contact-final-card">
              <div><span>{pageData.finalCta.kicker}</span><h2>{pageData.finalCta.title}</h2></div>
              <a href={primaryPhoneHref}>{pageData.finalCta.buttonText}<Phone size={18} /></a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Contact