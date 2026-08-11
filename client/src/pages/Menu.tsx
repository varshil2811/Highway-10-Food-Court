import { useMemo, useState, useEffect } from 'react'
import Seo from '../components/Seo'
import ExitSection, { childVariant, staggerContainer } from '../components/ExitSection'
import MenuCard from '../components/MenuCard'
import { motion } from 'framer-motion'

type MenuItem = {
  _id: string
  name: string
  description: string
  stall: string
  category: string
  veg: boolean
  jain: boolean
  bestseller: boolean
  price: string
  image?: string
}

type MetadataItem = { id: string, name: string }

const orderSteps = [
  { n: '1', title: 'Order at the Counter', body: 'Pick your stall and place the order' },
  { n: '2', title: 'Get your Token', body: 'Keep the token number handy' },
  { n: '3', title: 'We Notify You', body: 'Listen for your number or check board' },
  { n: '4', title: 'Pick up & Enjoy', body: 'Collect and settle in' },
]

export default function Menu() {
  const [stall, setStall] = useState('all')
  const [category, setCategory] = useState('all')
  const [items, setItems] = useState<MenuItem[]>([])
  const [stalls, setStalls] = useState<MetadataItem[]>([{ id: 'all', name: 'All Stalls' }])
  const [categories, setCategories] = useState<MetadataItem[]>([{ id: 'all', name: 'All Categories' }])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/menu').then(res => res.json()),
      fetch('/api/menu/metadata').then(res => res.json())
    ])
      .then(([menuData, metadata]) => {
        setItems(menuData)
        if (metadata.stalls) setStalls(metadata.stalls)
        if (metadata.categories) setCategories(metadata.categories)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load menu data', err)
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const stallOk = stall === 'all' || item.stall === stall
      const categoryOk = category === 'all' || item.category === category
      return stallOk && categoryOk
    })
  }, [stall, category, items])

  const stallName = stalls.find((s) => s.id === stall)?.name ?? 'All Stalls'
  const categoryName = categories.find((c) => c.id === category)?.name ?? 'All Categories'

  return (
    <>
      <Seo
        title="Menu"
        description="Browse Highway 10's multi-brand counters — kulchas, dosas, street food, global bites, coffee & desserts."
        path="/menu"
      />

      <ExitSection exit={1} title="Menu" tone="light" className="!pt-28 md:!pt-36" disableDefaultChildAnimation>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.1, margin: "0px 0px -50px 0px" }}
        >
          <motion.p variants={childVariant} className="mb-8 max-w-2xl text-sm leading-relaxed text-dusk-grey">
            Multi-brand food court — pricing may vary slightly by counter. Prices marked ₹ — until
            counters confirm current rates.
          </motion.p>

        {/* How ordering works */}
        <motion.div variants={childVariant} className="lux-card mb-10 !p-5 md:!p-6">
          <h3 className="font-display text-lg font-bold tracking-tight text-paper-cream md:text-xl">
            How Ordering Works
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {orderSteps.map((step) => (
              <div key={step.n} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.1)] font-display text-sm font-semibold text-route-yellow">
                  {step.n}
                </div>
                <div>
                  <p className="font-display text-xs font-semibold text-paper-cream">{step.title}</p>
                  <p className="mt-0.5 text-xs text-dusk-grey">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={childVariant} className="grid gap-8 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr]">
          {/* Sidebar filters */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="lux-card !p-4 md:!p-5 hidden lg:block">
              <div className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="text-route-yellow"
                >
                  <path
                    d="M4 5h16l-6.5 7.5V19l-3 1.5v-8L4 5z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3 className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-route-yellow">
                  Filter by Stall
                </h3>
              </div>

              <ul className="mt-4 space-y-1">
                {stalls.map((s) => {
                  const active = stall === s.id
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => setStall(s.id)}
                        className={`w-full rounded-xl px-3 py-2.5 text-left font-body text-sm transition-all duration-300 ${active
                          ? 'bg-[rgba(212,175,55,0.15)] font-medium text-route-yellow'
                          : 'text-dusk-grey hover:bg-[rgba(212,175,55,0.06)] hover:text-paper-cream'
                          }`}
                      >
                        {s.name}
                      </button>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-6 border-t border-[rgba(212,175,55,0.2)] pt-5">
                <h3 className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-route-yellow">
                  Category
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const active = category === c.id
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`rounded-full px-3.5 py-1.5 font-display text-xs font-semibold transition-all duration-300 ${active
                          ? 'bg-route-yellow text-ink shadow-[0_8px_24px_rgba(212,175,55,0.25)]'
                          : 'border border-[rgba(212,175,55,0.2)] text-dusk-grey hover:border-route-yellow hover:text-route-yellow'
                          }`}
                      >
                        {c.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Mobile: stall chips when sidebar stacks */}
            <div className="mt-4 flex flex-col gap-5 lg:hidden">
              <div>
                <h3 className="mb-3 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-route-yellow">Stall</h3>
                <div className="flex flex-wrap gap-2">
                  {stalls.map((s) => (
                    <button
                      key={`m-${s.id}`}
                      type="button"
                      onClick={() => setStall(s.id)}
                      className={`min-h-[44px] flex items-center justify-center rounded-full px-4 py-2 font-display text-sm font-semibold transition-all duration-300 ${stall === s.id
                        ? 'bg-route-yellow text-ink shadow-[0_8px_24px_rgba(212,175,55,0.25)]'
                        : 'border border-[rgba(212,175,55,0.2)] text-dusk-grey hover:border-route-yellow hover:text-route-yellow'
                        }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-route-yellow">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={`mc-${c.id}`}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`min-h-[44px] flex items-center justify-center rounded-full px-4 py-2 font-display text-sm font-semibold transition-all duration-300 ${category === c.id
                        ? 'bg-route-yellow text-ink shadow-[0_8px_24px_rgba(212,175,55,0.25)]'
                        : 'border border-[rgba(212,175,55,0.2)] text-dusk-grey hover:border-route-yellow hover:text-route-yellow'
                        }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Item grid */}
          <div>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-route-yellow">
                  Showing
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-paper-cream">
                  {stallName}
                  {category !== 'all' ? (
                    <span className="text-dusk-grey"> · {categoryName}</span>
                  ) : null}
                </h3>
              </div>
              <p className="font-body text-xs text-dusk-grey">
                {filtered.length} item{filtered.length === 1 ? '' : 's'}
              </p>
            </div>

            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="lux-card animate-pulse !p-4 min-h-[140px] flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 rounded bg-white/5"></div>
                      <div className="h-3 w-1/2 rounded bg-white/5"></div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <div className="h-3 w-16 rounded bg-white/5"></div>
                      <div className="h-4 w-12 rounded bg-[rgba(212,175,55,0.1)]"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="lux-card text-center">
                <p className="font-display text-lg font-bold text-paper-cream">No items found</p>
                <p className="mt-2 text-sm text-dusk-grey">
                  Try another stall or category combination.
                </p>
                <button
                  type="button"
                  className="btn-primary mt-5 !text-xs"
                  onClick={() => {
                    setStall('all')
                    setCategory('all')
                  }}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.1, margin: "0px 0px -50px 0px" }}
                className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              >
                {filtered.map((item) => (
                  <motion.div variants={childVariant} key={item._id}>
                    <MenuCard
                      name={item.name}
                      description={item.description}
                      veg={item.veg}
                      jain={item.jain}
                      price={item.price}
                      bestseller={item.bestseller}
                      image={item.image}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
        </motion.div>
      </ExitSection>
    </>
  )
}
