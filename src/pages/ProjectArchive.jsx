import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  MapPin,
  Sparkles,
} from 'lucide-react'
import {
  AnimatePresence,
  motion,
} from 'framer-motion'
import {
  loadProjectsData,
  PROJECTS_CHANGED_EVENT,
} from '../data/projectsStore'
import './ProjectArchive.css'

function ProjectArchive() {
  const [pageData, setPageData] = useState(loadProjectsData)
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    const refreshProjects = () => {
      setPageData(loadProjectsData())
    }

    window.addEventListener(
      PROJECTS_CHANGED_EVENT,
      refreshProjects,
    )
    window.addEventListener('storage', refreshProjects)
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
      [...pageData.projects]
        .filter(
          (project) =>
            project.active !== false &&
            Boolean(project.image),
        )
        .sort(
          (first, second) =>
            Number(first.order || 0) -
            Number(second.order || 0),
        ),
    [pageData.projects],
  )

  useEffect(() => {
    if (!activeProjects.length) {
      setActiveIndex(0)
      return
    }

    if (activeIndex >= activeProjects.length) {
      setActiveIndex(0)
    }
  }, [activeIndex, activeProjects.length])

  const getProjectIndex = (offset) => {
    if (!activeProjects.length) return 0

    return (
      activeIndex +
      offset +
      activeProjects.length
    ) % activeProjects.length
  }

  const currentProject =
    activeProjects[getProjectIndex(0)]
  const previousProject =
    activeProjects[getProjectIndex(-1)]
  const nextProject =
    activeProjects[getProjectIndex(1)]

  const showProject = (
    nextIndex,
    nextDirection = 1,
  ) => {
    if (!activeProjects.length) return
    setDirection(nextDirection)
    setActiveIndex(nextIndex)
  }

  const showPrevious = () => {
    if (activeProjects.length <= 1) return
    showProject(getProjectIndex(-1), -1)
  }

  const showNext = () => {
    if (activeProjects.length <= 1) return
    showProject(getProjectIndex(1), 1)
  }

  const projectVariants = {
    enter: (animationDirection) => ({
      opacity: 0,
      x: animationDirection > 0 ? 80 : -80,
      scale: 0.93,
      filter: 'blur(7px)',
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: (animationDirection) => ({
      opacity: 0,
      x: animationDirection > 0 ? -80 : 80,
      scale: 0.94,
      filter: 'blur(7px)',
    }),
  }

  return (
    <section
      className="project-archive-section"
      id="projects"
     
    >
      <div
        className="project-archive-background-word"
        aria-hidden="true"
      >
        {pageData.section.backgroundWord}
      </div>

      <div className="project-archive-container">
        <header className="project-archive-header">
          <div className="project-archive-heading">
            <span className="project-archive-eyebrow">
              <Sparkles size={17} />
              {pageData.section.eyebrow}
            </span>

            <h2>
              {pageData.section.title}{' '}
              <strong>
                {pageData.section.highlight}
              </strong>
            </h2>

            <p>{pageData.section.description}</p>
          </div>

          <div className="project-archive-navigation">
            <button
              type="button"
              onClick={showPrevious}
              disabled={activeProjects.length <= 1}
              aria-label="پروژه قبلی"
            >
              <ArrowRight size={21} />
            </button>

            <button
              type="button"
              onClick={showNext}
              disabled={activeProjects.length <= 1}
              aria-label="پروژه بعدی"
            >
              <ArrowLeft size={21} />
            </button>
          </div>
        </header>

        {currentProject ? (
          <>
            <div className="project-archive-stage">
              {activeProjects.length > 1 && (
                <button
                  type="button"
                  className="project-archive-side-card project-archive-side-right"
                  onClick={showPrevious}
                  aria-label="نمایش پروژه قبلی"
                >
                  <img
                    src={previousProject.image}
                    alt={
                      previousProject.alt ||
                      previousProject.title
                    }
                    style={{
                      objectPosition:
                        previousProject.objectPosition ||
                        'center',
                    }}
                  />
                  <div className="project-archive-side-overlay" />
                  <span>{previousProject.title}</span>
                </button>
              )}

              <AnimatePresence
                mode="wait"
                custom={direction}
              >
                <motion.article
                  key={currentProject.id}
                  className="project-archive-main-card"
                  custom={direction}
                  variants={projectVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.48,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <img
                    src={currentProject.image}
                    alt={
                      currentProject.alt ||
                      currentProject.title
                    }
                    style={{
                      objectPosition:
                        currentProject.objectPosition ||
                        'center',
                    }}
                  />

                  <div className="project-archive-main-overlay" />

                  <span className="project-archive-number">
                    {String(activeIndex + 1).padStart(
                      2,
                      '0',
                    )}
                  </span>

                  <span className="project-archive-year">
                    {currentProject.year}
                  </span>

                  <div className="project-archive-card-content">
                    <small>
                      {currentProject.categoryLabel ||
                        currentProject.category}
                    </small>

                    <h3>{currentProject.title}</h3>

                    <div className="project-archive-location">
                      <MapPin size={14} />
                      <span>
                        {currentProject.location ||
                          'افغانستان'}
                      </span>
                    </div>
                  </div>

                  <Link
  className="project-archive-open-button"
  to="/projects"
  aria-label={`مشاهده ${currentProject.title}`}
>
  <ExternalLink size={22} />
</Link>
                </motion.article>
              </AnimatePresence>

              {activeProjects.length > 1 && (
                <button
                  type="button"
                  className="project-archive-side-card project-archive-side-left"
                  onClick={showNext}
                  aria-label="نمایش پروژه بعدی"
                >
                  <img
                    src={nextProject.image}
                    alt={
                      nextProject.alt ||
                      nextProject.title
                    }
                    style={{
                      objectPosition:
                        nextProject.objectPosition ||
                        'center',
                    }}
                  />
                  <div className="project-archive-side-overlay" />
                  <span>{nextProject.title}</span>
                </button>
              )}
            </div>

            <div className="project-archive-pagination">
              <strong>
                {String(activeIndex + 1).padStart(2, '0')}
              </strong>

              <div>
                {activeProjects.map(
                  (project, index) => (
                    <button
                      type="button"
                      key={project.id}
                      className={
                        index === activeIndex
                          ? 'project-archive-dot project-archive-dot-active'
                          : 'project-archive-dot'
                      }
                      onClick={() =>
                        showProject(
                          index,
                          index > activeIndex ? 1 : -1,
                        )
                      }
                      aria-label={`نمایش پروژه ${
                        index + 1
                      }`}
                    />
                  ),
                )}
              </div>

              <strong>
                {String(activeProjects.length).padStart(
                  2,
                  '0',
                )}
              </strong>
            </div>

            <div className="project-archive-hint">
              <i>
                <span />
              </i>
              <p>{pageData.section.hint}</p>
            </div>
          </>
        ) : (
          <div className="project-archive-empty">
            {pageData.section.emptyMessage}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProjectArchive