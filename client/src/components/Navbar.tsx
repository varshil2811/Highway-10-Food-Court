import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import site from '../data/site.json'
import Magnetic from './Magnetic'
import Logo from './Logo'

const links = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/reserve', label: 'Reserve' },
  { to: '/about', label: 'About' },
  { to: '/reviews', label: 'Reviews' },
]

export default function Navbar() {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const location = useLocation()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 24);
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 },
      }}
      initial="hidden"
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 w-full z-50 transition-colors duration-500 ease-out ${
        scrolled
          ? 'border-b border-[rgba(255,255,255,0.08)] bg-asphalt/60 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8 md:pl-20">
        <Magnetic strength={0.15}>
          <Link 
            to="/" 
            className="flex items-center gap-3 group" 
            onClick={() => { 
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <Logo className="w-11 h-auto text-paper-cream transition-transform duration-500 group-hover:scale-105" />
            <div>
              <div className="font-serif text-lg font-bold leading-none tracking-tight text-paper-cream">
                Highway 10
              </div>
              <div className="mt-1 font-body text-[10px] tracking-[0.14em] text-dusk-grey">
                Food Court · Jamnagar
              </div>
            </div>
          </Link>
        </Magnetic>

        {(location.pathname.startsWith('/admin') || location.pathname.startsWith('/stall-admin')) ? (
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }} 
            className="shrink-0 flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-[10px] sm:text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20 uppercase tracking-wider border border-red-500/20"
          >
            Logout
          </button>
        ) : (
          <>
            <nav className="hidden items-center gap-7 lg:flex">
              {links.map((l) => (
                <Magnetic key={l.to} strength={0.2}>
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) =>
                      `nav-link px-2 py-1 ${isActive ? 'nav-link-active text-paper-cream' : ''}`
                    }
                  >
                    {l.label}
                  </NavLink>
                </Magnetic>
              ))}
            </nav>

            <div className="hidden items-center gap-4 md:flex">
              <Magnetic strength={0.2}>
                <a
                  href={`tel:${site.phoneRaw}`}
                  className="font-body text-sm text-dusk-grey transition-colors duration-300 hover:text-route-yellow px-2 py-1"
                >
                  {site.phone}
                </a>
              </Magnetic>
              <Magnetic strength={0.2}>
                <a href={site.maps} target="_blank" rel="noreferrer" className="btn-primary !px-5 !py-2.5 !text-xs">
                  Get Directions
                </a>
              </Magnetic>
            </div>
          </>
        )}
      </div>
    </motion.header>
  )
}
