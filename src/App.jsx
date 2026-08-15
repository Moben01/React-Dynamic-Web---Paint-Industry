import { Navigate, Route, Routes } from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import Management from './pages/management'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Projects from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'
import Agencies from './pages/Agencies'
import AgencyDetails from './pages/AgencyDetails'
import About from './pages/About'
import Contact from './pages/Contact'
import Header from './pages/Header'
import BotAssistant from './pages/BotAssistant'
import Footer from './components/Footer'
import ScrollToTopButton from './components/ScrollToTopButton'
import SEO from './components/SEO'

function PublicLayout() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:productId" element={<ProductDetails />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
        <Route path="/agencies" element={<Agencies />} />
        <Route path="/agencies/:agencyId" element={<AgencyDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <ScrollToTopButton />
      <BotAssistant />
    </>
  )
}

function App() {
  return (
    <>
      <SEO />
      <Routes>
        <Route path="/admin/*" element={<Management />} />
        <Route path="/*" element={<PublicLayout />} />
      </Routes>
    </>
  )
}

export default App
