import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/Layout'
import Admin from './pages/Admin'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Gallery from './pages/Gallery'
import Reserve from './pages/Reserve'
import About from './pages/About'
import Reviews from './pages/Reviews'
import SmoothScroll from './components/SmoothScroll'

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <SmoothScroll>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/reserve" element={<Reserve />} />
              <Route path="/about" element={<About />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/login" element={<Admin />} />
              <Route path="/admin/dashboard" element={<Admin />} />
              <Route path="/stall-admin/dashboard" element={<Admin />} />
            </Route>
          </Routes>
        </SmoothScroll>
      </BrowserRouter>
    </HelmetProvider>
  )
}
