import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const updateVisibility = () => {
      setVisible(window.scrollY > 420)
    }

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    return () => window.removeEventListener('scroll', updateVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      className={`scroll-to-top-button ${visible ? 'is-visible' : ''}`}
      onClick={scrollToTop}
      aria-label="رفتن به بالای صفحه"
      title="رفتن به بالای صفحه"
    >
      <ArrowUp size={21} />
    </button>
  )
}

export default ScrollToTopButton
