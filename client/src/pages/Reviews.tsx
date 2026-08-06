import Seo from '../components/Seo'
import ExitSection from '../components/ExitSection'
import TestimonialCard from '../components/TestimonialCard'
import testimonials from '../data/testimonials.json'
import site from '../data/site.json'

export default function Reviews() {
  return (
    <>
      <Seo
        title="Reviews"
        description={`★ ${site.rating} from ${site.reviewCount.toLocaleString()} reviews — what visitors say about Highway 10 Food Court, Jamnagar.`}
        path="/reviews"
      />
      <ExitSection exit={5} title="Reviews" tone="light" className="!pt-28 md:!pt-36">
        <div className="lux-card mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-serif text-5xl font-bold tracking-tight text-route-yellow">
              ★ {site.rating}
              <span className="ml-2 font-body text-base font-medium text-dusk-grey">/ 5</span>
            </div>
            <p className="mt-3 font-body text-xs uppercase tracking-[0.18em] text-dusk-grey">
              Based on {site.reviewCount.toLocaleString()} Google reviews
            </p>
          </div>
          <a href={site.maps} target="_blank" rel="noreferrer" className="btn-ghost !text-xs">
            See all on Google
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} quote={t.quote} name={t.name} meta={t.meta} />
          ))}
        </div>

        <div className="lux-card mt-12 text-center">
          <p className="font-serif text-xl font-bold tracking-tight text-paper-cream md:text-2xl">
            Had a great time?
          </p>
          <p className="mt-3 text-sm text-dusk-grey">
            Leave us a review on Google — it helps travellers find the exit.
          </p>
          <a href={site.maps} target="_blank" rel="noreferrer" className="btn-primary mt-6">
            Leave a Review
          </a>
        </div>
      </ExitSection>
    </>
  )
}
