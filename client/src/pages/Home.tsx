import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import Seo from '../components/Seo'
import ExitSection from '../components/ExitSection'
import { useOpenNow } from '../hooks/useOpenNow'
import MapEmbed from '../components/MapEmbed'
import TestimonialCarousel from '../components/TestimonialCarousel'
import Magnetic from '../components/Magnetic'
import site from '../data/site.json'
import { heroDusk } from '../data/gallery'

type GalleryItem = {
  _id: string
  src: string
  alt: string
  category: string
  homePosition?: number | null
}

const reasons = [
  {
    title: '8 Unique Cuisines',
    body: 'From Mexican to Kathiyawadi, satisfy every craving without compromise.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    )
  },
  {
    title: 'Family Friendly',
    body: 'Spacious open seating perfect for large groups and kids.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  {
    title: 'Open Late',
    body: 'Your dependable pit stop for late-night highway travels.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
]

export default function Home() {
  const open = useOpenNow()
  const reduce = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  
  const [featuredImages, setFeaturedImages] = useState<GalleryItem[]>([])

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then((data: GalleryItem[]) => {
        const assigned = data.filter(d => d.homePosition != null)
        const unassigned = data.filter(d => d.homePosition == null)
        const finalImages: GalleryItem[] = []
        
        for (let i = 1; i <= 6; i++) {
          const item = assigned.find(d => d.homePosition === i)
          if (item) {
            finalImages.push(item)
          } else if (unassigned.length > 0) {
            finalImages.push(unassigned.shift()!)
          }
        }
        
        setFeaturedImages(finalImages)
      })
      .catch(err => console.error(err))
  }, [])

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacityBg = useTransform(scrollYProgress, [0, 1], [1, 0])

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  }

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
  }

  return (
    <>
      <Seo
        title="Jamnagar's Biggest Hangout"
        description="Highway 10 Food Court on the Lalpur–Rajkot Bypass — multi-brand dining, outdoor seating, open daily till 1 AM."
        path="/"
      />

      {/* EXIT 0 — Hero */}
      <section ref={heroRef} className="relative min-h-[100svh] overflow-hidden bg-asphalt">
        <motion.div style={{ y: reduce ? 0 : yBg, opacity: reduce ? 1 : opacityBg }} className="absolute inset-0">
          <img
            src={heroDusk}
            alt="Highway 10 Food Court at dusk with illuminated signage along the stone pathway"
            className="h-full w-full scale-105 object-cover object-[60%_center]"
          />
          <div className="absolute inset-0 bg-asphalt/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-asphalt via-asphalt/70 to-asphalt/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-transparent to-asphalt/45" />
        </motion.div>

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 pb-16 pt-28 md:px-8 md:pl-20 md:pb-24 pointer-events-none">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.1, margin: "0px 0px -50px 0px" }}
            className="max-w-2xl pointer-events-auto"
          >
            <motion.p variants={fadeInUp} className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-route-yellow">
              Exit 00 — Arrive
            </motion.p>
            <motion.h1 variants={fadeInUp} className="mt-5 font-serif text-4xl font-bold leading-[1.08] tracking-tight text-paper-cream sm:text-5xl md:text-6xl lg:text-[4rem]">
              Jamnagar&apos;s Biggest Hangout — Right on the Highway.
            </motion.h1>
            <motion.p variants={fadeInUp} className="mt-6 max-w-md text-base font-medium leading-relaxed text-dusk-grey">
              Multiple kitchens, one address on SH‑25. Pull off the Rajkot Bypass and settle in — for
              a quick bite or the whole evening.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-9 flex flex-wrap gap-4">
              <Magnetic strength={0.3}>
                <Link to="/reserve" className="btn-primary">
                  Reserve a Table
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Link to="/menu" className="btn-ghost">
                  View Menu
                </Link>
              </Magnetic>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick facts */}
      <div className="bg-asphalt relative z-10 -mt-8 pt-8">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.1, margin: "0px 0px -50px 0px" }}
          className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-8 md:grid-cols-3 md:px-8 md:pl-20"
        >
          <motion.div variants={fadeInUp} className="flex flex-col items-center justify-center rounded-[1.5rem] border border-[rgba(212,175,55,0.25)] bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] py-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            <div className="font-display text-2xl font-bold tracking-tight text-paper-cream">
              ★ {site.rating}
            </div>
            <div className="mt-2 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-dusk-grey">
              {site.reviewCount.toLocaleString()} Reviews
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col items-center justify-center rounded-[1.5rem] border border-[rgba(212,175,55,0.45)] bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] py-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            <div className="font-display text-2xl font-bold tracking-tight text-paper-cream">
              11 AM – 1 AM
            </div>
            <div className="mt-2 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-route-yellow">
              {open ? 'Open Now' : 'Open Daily'}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col items-center justify-center rounded-[1.5rem] border border-[rgba(212,175,55,0.25)] bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] py-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            <div className="font-display text-xl font-bold tracking-tight text-paper-cream">
              Dine-In
            </div>
            <div className="mt-2 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-dusk-grey">
              Family Friendly
            </div>
          </motion.div>
        </motion.div>
      </div>

      <ExitSection exit={0} title="Why Stop Here" tone="light" id="why" disableDefaultChildAnimation>
        <div className="grid gap-5 md:grid-cols-3">
          {reasons.map((r) => (
            <motion.article variants={fadeInUp} key={r.title} className="lux-card group">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(212,175,55,0.15)] text-route-yellow transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                {r.icon}
              </div>
              <h3 className="font-serif text-xl font-bold tracking-tight text-paper-cream">
                {r.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-dusk-grey">{r.body}</p>
            </motion.article>
          ))}
        </div>
      </ExitSection>

      <ExitSection exit={0} title="Along the Route" tone="dark" id="teaser" disableDefaultChildAnimation>
        <motion.p variants={fadeInUp} className="mb-8 max-w-lg text-sm leading-relaxed text-dusk-grey">
          Ambience from dusk to late night — a preview of the full gallery.
        </motion.p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {featuredImages.map((g) => (
            <motion.div variants={fadeInUp} key={g._id}>
              <Link
                to="/gallery"
                className="block h-full group relative aspect-[4/3] overflow-hidden rounded-[1.125rem] border border-[rgba(212,175,55,0.2)] shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-all duration-500 hover:scale-[1.02] hover:border-route-yellow hover:shadow-[0_8px_28px_rgba(212,175,55,0.28)]"
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-asphalt/0 transition duration-500 group-hover:bg-asphalt/30" />
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div variants={fadeInUp} className="mt-10">
          <Magnetic strength={0.15}>
            <Link
              to="/gallery"
              className="inline-block font-display text-xs font-semibold uppercase tracking-[0.18em] text-route-yellow transition-opacity hover:opacity-80"
            >
              Open full gallery →
            </Link>
          </Magnetic>
        </motion.div>
      </ExitSection>

      <ExitSection exit={0} title="Word on the Road" tone="light">
        <div className="w-full">
          <TestimonialCarousel />
        </div>
        <Magnetic strength={0.15} className="mt-10">
          <Link
            to="/reviews"
            className="inline-block font-display text-xs font-semibold uppercase tracking-[0.18em] text-route-yellow transition-opacity hover:opacity-80"
          >
            Read more reviews →
          </Link>
        </Magnetic>
      </ExitSection>

      <ExitSection exit={0} title="Find Us on SH-25" tone="dark">
        <MapEmbed />
      </ExitSection>
    </>
  )
}
