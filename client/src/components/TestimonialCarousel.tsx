import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import testimonials from '../data/testimonials.json'
import TestimonialCard from './TestimonialCard'

export default function TestimonialCarousel() {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  const slides = testimonials.slice(0, 5)

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setI((v) => (v + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [reduce, slides.length])

  const t = slides[i]

  return (
    <div>
      <div className="relative min-h-[160px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={t.id}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <TestimonialCard quote={t.quote} name={t.name} meta={t.meta} dark />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-5 flex gap-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Show review ${idx + 1}`}
            onClick={() => setI(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === i ? 'w-8 bg-route-yellow' : 'w-5 bg-[rgba(212,175,55,0.25)]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
