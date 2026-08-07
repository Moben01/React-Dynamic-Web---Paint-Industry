import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Award,
  Check,
  Factory,
  HeartHandshake,
  Leaf,
  Palette,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  ABOUT_CHANGED_EVENT,
  loadAboutData,
} from '../data/aboutStore'
import './About.css'

const valueIconMap = {
  shield: ShieldCheck,
  target: Target,
  handshake: HeartHandshake,
  leaf: Leaf,
  award: Award,
  users: Users,
}

function About() {
  const [pageData, setPageData] = useState(loadAboutData)

  useEffect(() => {
    const refreshData = () => {
      setPageData(loadAboutData())
    }

    window.addEventListener(
      ABOUT_CHANGED_EVENT,
      refreshData,
    )
    window.addEventListener('storage', refreshData)

    return () => {
      window.removeEventListener(
        ABOUT_CHANGED_EVENT,
        refreshData,
      )
      window.removeEventListener(
        'storage',
        refreshData,
      )
    }
  }, [])

  const backgroundImages = useMemo(
    () =>
      [...(pageData.intro.backgroundImages || [])]
        .filter((item) => item?.url && item.active !== false)
        .sort(
          (first, second) =>
            Number(first.order || 0) - Number(second.order || 0),
        ),
    [pageData.intro.backgroundImages],
  )

  const [backgroundIndex, setBackgroundIndex] = useState(0)

  useEffect(() => {
    setBackgroundIndex(0)
  }, [backgroundImages.length])

  useEffect(() => {
    if (backgroundImages.length <= 1) return undefined

    const interval = window.setInterval(
      () =>
        setBackgroundIndex((current) =>
          (current + 1) % backgroundImages.length,
        ),
      Math.max(3000, Number(pageData.intro.backgroundInterval || 5000)),
    )

    return () => window.clearInterval(interval)
  }, [backgroundImages.length, pageData.intro.backgroundInterval])

  const visibleValues = useMemo(
    () =>
      [...pageData.values]
        .filter((item) => item.active !== false)
        .sort(
          (first, second) =>
            Number(first.order || 0) -
            Number(second.order || 0),
        ),
    [pageData.values],
  )

  return (
    <div className="about-shell">
      <main className="about-page">
        <section className="about-intro">
          <div className="about-intro-backgrounds" aria-hidden="true">
            {backgroundImages.map((item, index) => (
              <motion.div
                key={item.id || `${item.url}-${index}`}
                className="about-intro-background"
                initial={false}
                animate={{
                  opacity: index === backgroundIndex ? 1 : 0,
                  scale: index === backgroundIndex ? 1.035 : 1,
                }}
                transition={{
                  opacity: { duration: 1.05, ease: 'easeInOut' },
                  scale: { duration: 7, ease: 'linear' },
                }}
                style={{ backgroundImage: `url(${item.url})` }}
              />
            ))}
          </div>

          <div className="about-intro-overlay" aria-hidden="true" />
          <div className="about-intro-accent about-intro-accent-one" aria-hidden="true" />
          <div className="about-intro-accent about-intro-accent-two" aria-hidden="true" />

          <div className="about-container about-intro-layout">
            <motion.div
              className="about-intro-copy"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
            >
              <span className="about-kicker">
                <Sparkles size={17} />
                {pageData.intro.kicker}
              </span>

              <h1>
                {pageData.intro.title}
                <span> {pageData.intro.highlight}</span>
              </h1>

              <p>{pageData.intro.description}</p>

              <a href="#story" className="about-read-story">
                {pageData.intro.buttonText}
                <ArrowLeft size={18} />
              </a>

              {backgroundImages.length > 1 && (
                <div className="about-intro-dots" aria-label="تصاویر پس‌زمینه">
                  {backgroundImages.map((item, index) => (
                    <button
                      type="button"
                      key={item.id || `${item.url}-${index}`}
                      className={index === backgroundIndex ? 'active' : ''}
                      onClick={() => setBackgroundIndex(index)}
                      aria-label={`نمایش تصویر ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <section className="about-statement">
          <div className="about-container">
            <motion.div
              className="about-statement-card"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{
                once: true,
                amount: 0.25,
              }}
              transition={{ duration: 0.65 }}
            >
              <span>{pageData.vision.kicker}</span>
              <h2>{pageData.vision.title}</h2>

              <div className="about-statement-meta">
                {pageData.vision.stats.map((stat) => (
                  <div key={stat.id}>
                    <strong>{stat.value}</strong>
                    <small>{stat.label}</small>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section
          className="about-story-section"
          id="story"
        >
          <div className="about-container about-story-layout">
            <div className="about-story-heading">
              <span className="about-kicker">
                <Factory size={17} />
                {pageData.story.kicker}
              </span>

              <h2>
                {pageData.story.title}
                <span>
                  {' '}
                  {pageData.story.highlight}
                </span>
              </h2>

              <p>{pageData.story.description}</p>
            </div>

            <div className="about-timeline">
              {pageData.story.timeline.map(
                (item, index) => (
                  <motion.article
                    key={item.id}
                    initial={{
                      opacity: 0,
                      x: -25,
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.2,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                    }}
                  >
                    <span className="about-timeline-year">
                      {item.year}
                    </span>

                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </motion.article>
                ),
              )}
            </div>
          </div>
        </section>

        <section
          className="about-values-section"
          id="values"
        >
          <div className="about-container">
            <div className="about-values-top">
              <div>
                <span className="about-kicker">
                  <Users size={17} />
                  {pageData.valuesSection.kicker}
                </span>

                <h2>
                  {pageData.valuesSection.title}
                  <span>
                    {' '}
                    {pageData.valuesSection.highlight}
                  </span>
                </h2>
              </div>

              <p>
                {pageData.valuesSection.description}
              </p>
            </div>

            <div className="about-values-grid">
              {visibleValues.map((item, index) => {
                const Icon =
                  valueIconMap[item.icon] ||
                  ShieldCheck

                return (
                  <motion.article
                    key={item.id}
                    initial={{
                      opacity: 0,
                      y: 28,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.2,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.07,
                    }}
                  >
                    <span className="about-value-index">
                      {String(index + 1).padStart(
                        2,
                        '0',
                      )}
                    </span>

                    <div className="about-value-icon">
                      <Icon size={25} />
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </motion.article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="about-factory-section">
          <div className="about-container about-factory-layout">
            <div className="about-factory-image">
              <img
                src={pageData.factory.image}
                alt={pageData.factory.imageAlt}
              />
              <span />
            </div>

            <div className="about-factory-content">
              <span className="about-kicker">
                <Palette size={17} />
                {pageData.factory.kicker}
              </span>

              <h2>
                {pageData.factory.title}
                <span>
                  {' '}
                  {pageData.factory.highlight}
                </span>
              </h2>

              <p>{pageData.factory.description}</p>

              <ul>
                {pageData.factory.checklist.map(
                  (item) => (
                    <li key={item.id}>
                      <Check size={17} />
                      {item.text}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </section>

        <section
          className="about-contact-section"
          id="contact"
        >
          <div className="about-container">
            <div className="about-contact-card">
              <div>
                <span>
                  {pageData.contact.kicker}
                </span>
                <h2>{pageData.contact.title}</h2>
                <p>
                  {pageData.contact.description}
                </p>
              </div>

              <a
                href={`tel:${pageData.contact.phone}`}
              >
                {pageData.contact.buttonText}
                <Phone size={18} />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default About