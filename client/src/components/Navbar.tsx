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
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const location = useLocation()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
      setOpen(false);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 24);
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
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
              setOpen(false);
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

        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)] text-paper-cream transition-all duration-300 hover:border-route-yellow hover:bg-[rgba(212,175,55,0.1)] lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F9F6F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F9F6F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-[rgba(212,175,55,0.2)] bg-asphalt/95 px-4 py-5 backdrop-blur-xl lg:hidden shadow-2xl"
        >
          <nav className="flex flex-col gap-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => { setOpen(false); }}
                className={({ isActive }) =>
                  `font-display text-base font-semibold transition-colors ${
                    isActive ? 'text-route-yellow' : 'text-paper-cream'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <a href={`tel:${site.phoneRaw}`} className="pt-2 font-body text-sm text-route-yellow">
              {site.phone}
            </a>
            <a
              href={site.maps}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-center !text-xs"
            >
              Get Directions
            </a>
          </nav>
        </motion.div>
      )}
    </motion.header>
  )
}
