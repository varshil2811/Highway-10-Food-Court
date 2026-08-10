import Seo from '../components/Seo'
import ExitSection from '../components/ExitSection'
import { entranceNight, interior } from '../data/gallery'

const stats = [
  { label: 'Food counters', value: 'Multi-brand' },
  { label: 'Open daily', value: '11 AM – 1 AM' },
  { label: 'Seating', value: 'Indoor + Outdoor' },
  { label: 'Built for', value: 'Families & travellers' },
]

export default function About() {
  return (
    <>
      <Seo
        title="About Us"
        description="Highway 10 is a multi-brand food court on the Lalpur–Rajkot Bypass — a hangout stop for travellers, families, and friends in Jamnagar."
        path="/about"
      />

      <div className="relative min-h-[50vh] overflow-hidden md:min-h-[55vh]">
        <img
          src={entranceNight}
          alt="Wide establishing shot of Highway 10 entrance at night with illuminated HIGHWAY 10 letters"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-asphalt/55 to-asphalt/35" />
        <div className="relative mx-auto flex min-h-[50vh] max-w-6xl items-end px-4 pb-14 md:min-h-[55vh] md:px-8 md:pl-20">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-route-yellow">
              Exit 04
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-paper-cream md:text-5xl">
              About Us
            </h1>
          </div>
        </div>
      </div>

      <ExitSection exit={4} title="The Stretch" tone="light" className="!pt-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-5 text-base font-medium leading-relaxed text-dusk-grey">
            <p>
              Highway 10 isn&apos;t one restaurant — it&apos;s a whole stretch of them, brought
              together under one roof on the Lalpur–Rajkot Bypass. It was built with a simple idea:
              travellers, families, and friends need a place to actually stop and relax, not just
              refuel. Multiple food counters run side by side here, professionally managed, so you
              get variety without the drive-around.
            </p>
            <p>
              Whether you&apos;re breaking up a highway trip, bringing the family out for the
              evening, or meeting friends late on a weeknight, Highway 10 stays open until 1 AM to
              match how Jamnagar actually hangs out.
            </p>
            <p>
              Pull off SH-25 at Khimliya — outdoor seating under the lights, indoor halls with
              colour and energy, and enough counters that everyone finds their plate.
            </p>
          </div>
          <div className="overflow-hidden rounded-[1.125rem] border border-[rgba(212,175,55,0.2)] shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-all duration-500 hover:scale-[1.02] hover:border-route-yellow hover:shadow-[0_8px_28px_rgba(212,175,55,0.28)]">
            <img
              src={interior}
              alt="Colourful chairs and warm lighting inside Highway 10 food court dining hall"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="lux-card px-4 py-5 text-center">
              <div className="font-display text-lg font-bold tracking-tight text-paper-cream md:text-xl">
                {s.value}
              </div>
              <div className="mt-2 font-body text-[10px] uppercase tracking-[0.18em] text-dusk-grey">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </ExitSection>
    </>
  )
}
