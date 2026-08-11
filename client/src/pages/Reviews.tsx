import { useState, useEffect, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Seo from '../components/Seo'
import ExitSection, { childVariant, staggerContainer } from '../components/ExitSection'
import TestimonialCard from '../components/TestimonialCard'
import site from '../data/site.json'

type ReviewItem = {
  _id: string
  name: string
  quote: string
  meta: string
}

export default function Reviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reviewForm, setReviewForm] = useState({ name: '', quote: '', meta: '' })
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews')
        const data = await res.json()
        if (res.ok) {
          setReviews(data)
        }
      } catch (err) {
        console.error('Failed to load reviews:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  async function handleReviewSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      })

      if (!res.ok) {
        let msg = 'Failed to submit review'
        try {
          const data = await res.json()
          msg = data.error || msg
        } catch {}
        throw new Error(msg)
      }

      setSubmitStatus('success')
      setReviewForm({ name: '', quote: '', meta: '' })
    } catch (err) {
      setSubmitStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const inputClass = "w-full rounded-xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)] px-4 py-3 font-body text-sm text-paper-cream outline-none transition-all placeholder:text-dusk-grey focus:border-route-yellow/50 focus:bg-[rgba(212,175,55,0.1)] focus:ring-1 focus:ring-route-yellow/50"

  return (
    <>
      <Seo
        title="Reviews"
        description={`★ ${site.rating} from ${site.reviewCount.toLocaleString()} reviews — what visitors say about Highway 10 Food Court, Jamnagar.`}
        path="/reviews"
      />
      <ExitSection exit={5} title="Reviews" tone="light" className="!pt-28 md:!pt-36 relative" disableDefaultChildAnimation>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.1, margin: "0px 0px -50px 0px" }}
        >
        <motion.div variants={childVariant} className="lux-card mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-serif text-5xl font-bold tracking-tight text-route-yellow">
              ★ {site.rating}
              <span className="ml-2 font-body text-base font-medium text-dusk-grey">/ 5</span>
            </div>
            <p className="mt-3 font-body text-xs uppercase tracking-[0.18em] text-dusk-grey">
              Based on {site.reviewCount.toLocaleString()} Google reviews
            </p>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <button onClick={() => setIsModalOpen(true)} className="btn-primary !text-xs">
              Write a Review
            </button>
            <a href={site.maps} target="_blank" rel="noreferrer" className="btn-ghost !text-xs">
              See all on Google
            </a>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-10 text-dusk-grey">Loading reviews...</div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.1 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {reviews.map((t) => (
              <motion.div variants={childVariant} key={t._id}>
                <TestimonialCard quote={t.quote} name={t.name} meta={t.meta} />
              </motion.div>
            ))}
            {reviews.length === 0 && (
              <div className="col-span-full text-center py-10 text-dusk-grey">
                No reviews found. Be the first to write one!
              </div>
            )}
          </motion.div>
        )}
        </motion.div>
      </ExitSection>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-asphalt/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="lux-card relative z-10 w-full max-w-lg shadow-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-dusk-grey hover:text-paper-cream transition-colors text-2xl leading-none"
              >
                &times;
              </button>
              
              {submitStatus === 'success' ? (
                <div className="py-8 text-center">
                  <div className="mb-4 text-5xl text-route-yellow">✓</div>
                  <h3 className="mb-2 font-serif text-2xl font-bold text-paper-cream">Thank You!</h3>
                  <p className="text-dusk-grey">
                    Your review has been successfully submitted and is now live on our website.
                  </p>
                  <button onClick={() => {
                    setIsModalOpen(false); 
                    setSubmitStatus('idle');
                    // We should also trigger a refetch of reviews here so the user sees their new review.
                    window.location.reload();
                  }} className="btn-ghost mt-8">
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="mb-6 font-serif text-2xl font-bold tracking-tight text-route-yellow">
                    Write a Review
                  </h3>
                  {submitStatus === 'error' && (
                    <div className="mb-4 rounded-xl bg-red-900/20 p-4 text-sm text-red-400 border border-red-500/20">
                      {errorMessage}
                    </div>
                  )}
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Your Name</label>
                      <input 
                        value={reviewForm.name} 
                        onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))} 
                        required 
                        className={inputClass} 
                        placeholder="E.g. John Doe" 
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Your Review</label>
                      <textarea 
                        value={reviewForm.quote} 
                        onChange={e => setReviewForm(p => ({ ...p, quote: e.target.value }))} 
                        required 
                        rows={4} 
                        className={inputClass} 
                        placeholder="Tell us about your experience..." 
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Visit Details (Optional)</label>
                      <input 
                        value={reviewForm.meta} 
                        onChange={e => setReviewForm(p => ({ ...p, meta: e.target.value }))} 
                        className={inputClass} 
                        placeholder="E.g. Family · Dinner" 
                      />
                    </div>
                    <div className="pt-4">
                      <button type="submit" disabled={submitStatus === 'loading'} className="btn-primary w-full">
                        {submitStatus === 'loading' ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
