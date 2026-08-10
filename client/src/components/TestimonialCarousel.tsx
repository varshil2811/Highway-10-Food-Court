import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import TestimonialCard from './TestimonialCard'

type Review = {
  _id: string
  name: string
  quote: string
  meta: string
}

export default function TestimonialCarousel() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [displayReviews, setDisplayReviews] = useState<Review[]>([])
  const reduce = useReducedMotion()

  // Fetch reviews from DB
  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data)
        }
      })
      .catch(console.error)
  }, [])

  // Shuffle and pick 3 reviews
  const pickRandom = (all: Review[]) => {
    if (all.length === 0) return []
    const shuffled = [...all].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3)
  }

  useEffect(() => {
    if (reviews.length > 0) {
      setDisplayReviews(pickRandom(reviews))
    }
  }, [reviews])

  // Cycle every 3 seconds
  useEffect(() => {
    if (reduce || reviews.length <= 3) return // No need to cycle if 3 or fewer reviews
    const id = setInterval(() => {
      setDisplayReviews(pickRandom(reviews))
    }, 3000)
    return () => clearInterval(id)
  }, [reduce, reviews])

  if (reviews.length === 0) return null

  return (
    <div className="w-full">
      <div className="relative min-h-[160px]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={displayReviews.map(r => r._id).join('-')}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {displayReviews.map((t) => (
              <TestimonialCard key={t._id} quote={t.quote} name={t.name} meta={t.meta} dark />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
