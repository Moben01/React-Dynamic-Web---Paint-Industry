import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react'

import { motion } from 'framer-motion'

import {
  loadProjectsData,
  PROJECTS_CHANGED_EVENT,
} from '../data/projectsStore'

import './Projects.css'

function Projects() {
  const [pageData, setPageData] = useState(
    loadProjectsData,
  )

  const [searchText, setSearchText] =
    useState('')

  useEffect(() => {
    const refreshProjects = () => {
      setPageData(loadProjectsData())
    }

    window.addEventListener(
      PROJECTS_CHANGED_EVENT,
      refreshProjects,
    )

    window.addEventListener(
      'storage',
      refreshProjects,
    )

    window.addEventListener('focus', refreshProjects)

    const handleVisibilityChange = () => {
      if (!document.hidden) refreshProjects()
    }

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    )

    return () => {
      window.removeEventListener(
        PROJECTS_CHANGED_EVENT,
        refreshProjects,
      )

      window.removeEventListener(
        'storage',
        refreshProjects,
      )

      window.removeEventListener('focus', refreshProjects)
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      )
    }
  }, [])

  const activeProjects = useMemo(
    () =>
      (Array.isArray(pageData.projects)
        ? pageData.projects
        : []
      )
        .filter(
          (project) =>
            project.active !== false &&
            Boolean(project.image),
        )
        .sort(
          (firstProject, secondProject) =>
            Number(firstProject.order || 0) -
            Number(secondProject.order || 0),
        ),
    [pageData.projects],
  )

  const featuredProject = useMemo(
    () =>
      activeProjects.find(
        (project) =>
          project.featured === true,
      ) || activeProjects[0],
    [activeProjects],
  )

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchText
      .trim()
      .toLocaleLowerCase()

    if (!normalizedSearch) {
      return activeProjects
    }

    return activeProjects.filter(
      (project) => {
        const category =
          project.categoryLabel ||
          project.category ||
          ''

        const searchableText = [
          project.title,
          project.description,
          project.location,
          project.client,
          project.year,
          project.status,
          category,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase()

        return searchableText.includes(
          normalizedSearch,
        )
      },
    )
  }, [activeProjects, searchText])

  const locationCount = useMemo(
    () =>
      new Set(
        activeProjects
          .map(
            (project) =>
              project.location,
          )
          .filter(Boolean),
      ).size,
    [activeProjects],
  )

  const completedCount = useMemo(
    () =>
      activeProjects.filter(
        (project) =>
          project.status ===
            'تکمیل‌شده' ||
          project.status ===
            'تکمیل شده' ||
          project.completed === true,
      ).length,
    [activeProjects],
  )

  const scrollToProjects = () => {
    document
      .getElementById(
        'completed-projects',
      )
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
  }

  const section = pageData.section || {}

  if (!featuredProject) {
    return (
      <main
        className="projects-page"
       
      >
        <div className="projects-page-container">
          <div className="projects-page-empty">
            {section.emptyMessage ||
              'هنوز هیچ پروژه‌ای ثبت نشده است.'}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main
      className="projects-page"
     
    >
      {/* بخش اول صفحه پروژه‌ها */}

      <section className="projects-hero">
        <div className="projects-hero-orb projects-hero-orb-one" />

        <div className="projects-hero-orb projects-hero-orb-two" />

        <div className="projects-container projects-hero-layout">
          <motion.div
            className="projects-hero-content"
            initial={{
              opacity: 0,
              y: 28,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.65,
            }}
          >
            <span className="projects-eyebrow">
              <Sparkles size={17} />

              {section.eyebrow ||
                'پروژه‌های اجراشده'}
            </span>

            <h1>
              {section.title ||
                'رنگ‌هایی که'}

              <span>
                {' '}
                {section.highlight ||
                  'فضا را تغییر داده‌اند'}
              </span>
            </h1>

            <p>
              {section.description ||
                'مجموعه‌ای از پروژه‌های ساختمانی، صنعتی و دکوراتیف شرکت رنگ‌سازی علیمی را مشاهده کنید.'}
            </p>

            <div className="projects-hero-actions">
              <button
                type="button"
                className="projects-primary-button"
                onClick={scrollToProjects}
              >
                مشاهده پروژه‌ها

                <ArrowLeft size={18} />
              </button>

              <Link
                className="projects-secondary-button"
                to="/contact"
              >
                ثبت پروژه جدید
              </Link>
            </div>

            <div className="projects-statistics">
              <div>
                <strong>
                  {activeProjects.length}+
                </strong>

                <span>
                  پروژه ثبت‌شده
                </span>
              </div>

              <div>
                <strong>
                  {locationCount}
                </strong>

                <span>
                  موقعیت کاری
                </span>
              </div>

              <div>
                <strong>
                  {completedCount}
                </strong>

                <span>
                  پروژه تکمیل‌شده
                </span>
              </div>
            </div>
          </motion.div>

          <motion.article
            className="projects-featured-card"
            initial={{
              opacity: 0,
              scale: 0.94,
              x: -30,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
            }}
            transition={{
              duration: 0.75,
              delay: 0.1,
            }}
          >
            <img
              src={featuredProject.image}
              alt={
                featuredProject.alt ||
                featuredProject.title
              }
              style={{
                objectPosition:
                  featuredProject.objectPosition ||
                  'center',
              }}
            />

            <span className="projects-featured-overlay" />

            <div className="projects-featured-top">
              <span>
                {featuredProject.year ||
                  ''}
              </span>

              <span className="projects-status-badge">
                {featuredProject.status ||
                  'تکمیل‌شده'}
              </span>
            </div>

            <div className="projects-featured-content">
              <small>
                {featuredProject.categoryLabel ||
                  featuredProject.category ||
                  'پروژه منتخب'}
              </small>

              <h2>
                {featuredProject.title}
              </h2>

              <div>
                <MapPin size={16} />

                {featuredProject.location ||
                  'افغانستان'}
              </div>
            </div>

            <Link
              to={`/projects/${encodeURIComponent(featuredProject.id)}`}
              aria-label="مشاهده پروژه منتخب"
            >
              <ExternalLink size={20} />
            </Link>
          </motion.article>
        </div>
      </section>

      {/* لیست تمام پروژه‌ها */}

      <section
        id="completed-projects"
        className="projects-page-hero"
      >
        <div className="projects-page-container">
          <motion.div
            className="projects-page-heading"
            initial={{
              opacity: 0,
              y: 24,
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
            }}
          >
            <span className="projects-page-eyebrow">
              <Sparkles size={17} />

              آرشیف پروژه‌ها
            </span>

            <h1>
              پروژه‌هایی که با موفقیت{' '}

              <strong>
                تکمیل کرده‌ایم
              </strong>
            </h1>

            <p>
              براساس نام پروژه، مشتری، موقعیت یا
              دسته‌بندی جستجو کنید.
            </p>
          </motion.div>

          <div className="projects-page-tools">
            <label className="projects-page-search">
              <Search size={18} />

              <input
                type="search"
                value={searchText}
                onChange={(event) =>
                  setSearchText(
                    event.target.value,
                  )
                }
                placeholder="جستجوی پروژه، مشتری یا موقعیت..."
              />
            </label>
          </div>
        </div>
      </section>

      <section className="projects-page-list-section">
        <div className="projects-page-container">
          {filteredProjects.length ? (
            <div className="projects-page-grid">
              {filteredProjects.map(
                (project, index) => {
                  const category =
                    project.categoryLabel ||
                    project.category ||
                    'پروژه'

                  return (
                    <motion.article
                      key={project.id}
                      className="projects-page-card"
                      initial={{
                        opacity: 0,
                        y: 24,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                        amount: 0.15,
                      }}
                      transition={{
                        duration: 0.4,
                        delay:
                          (index % 4) *
                          0.05,
                      }}
                    >
                      <div className="projects-page-card-image">
                        <img
                          src={project.image}
                          alt={
                            project.alt ||
                            project.title
                          }
                          style={{
                            objectPosition:
                              project.objectPosition ||
                              'center',
                          }}
                        />

                        <div className="projects-page-card-overlay" />

                        <span className="projects-page-card-category">
                          {category}
                        </span>

                        <span className="projects-page-card-year">
                          {project.year}
                        </span>

                        <Link
                          to={`/projects/${encodeURIComponent(project.id)}`}
                          className="projects-page-card-open"
                          aria-label={`مشاهده ${project.title}`}
                        >
                          <ExternalLink
                            size={20}
                          />
                        </Link>
                      </div>

                      <div className="projects-page-card-content">
                        <div className="projects-page-card-location">
                          <MapPin size={15} />

                          <span>
                            {project.location ||
                              'افغانستان'}
                          </span>
                        </div>

                        <h2>
                          {project.title}
                        </h2>

                        <p>
                          {project.description ||
                            'این پروژه توسط تیم متخصص شرکت رنگ‌سازی علیمی اجرا شده است.'}
                        </p>

                        <div className="projects-page-card-footer">
                          <div>
                            {project.client && (
                              <span>
                                مشتری:{' '}

                                <strong>
                                  {project.client}
                                </strong>
                              </span>
                            )}

                            {project.area && (
                              <span>
                                مساحت:{' '}

                                <strong>
                                  {project.area}
                                </strong>
                              </span>
                            )}
                          </div>

                          <Link to={`/projects/${encodeURIComponent(project.id)}`}>
                            بیشتر...

                            <ArrowLeft
                              size={17}
                            />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  )
                },
              )}
            </div>
          ) : (
            <div className="projects-page-empty">
              <Search size={36} />

              <h2>
                پروژه‌ای پیدا نشد
              </h2>

              <p>
                عبارت جستجو را تغییر دهید.
              </p>

              <button
                type="button"
                onClick={() =>
                  setSearchText('')
                }
              >
                نمایش تمام پروژه‌ها
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default Projects