import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
export type GalleryItem = {
  _id: string
  src: string
  alt: string
  category: string
}

type Props = {
  items: GalleryItem[]
  categories: { id: string, name: string }[]
}

export default function GalleryGrid({ items, categories }: Props) {
  const [tab, setTab] = useState<string>('All')
  const [active, setActive] = useState<GalleryItem | null>(null)
  const reduce = useReducedMotion()

  const filtered = tab === 'All' ? items : items.filter((i) => i.category === tab)

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setTab('All')}
          className={`rounded-full px-4 py-2 font-display text-xs font-semibold transition-all duration-300 ${tab === 'All'
              ? 'bg-route-yellow text-ink shadow-[0_8px_24px_rgba(212,175,55,0.25)]'
              : 'border border-[rgba(212,175,55,0.2)] text-dusk-grey hover:border-route-yellow hover:text-route-yellow'
            }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setTab(c.name)}
            className={`rounded-full px-4 py-2 font-display text-xs font-semibold transition-all duration-300 ${tab === c.name
                ? 'bg-route-yellow text-ink shadow-[0_8px_24px_rgba(212,175,55,0.25)]'
                : 'border border-[rgba(212,175,55,0.2)] text-dusk-grey hover:border-route-yellow hover:text-route-yellow'
              }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filtered.map((item) => (
            <motion.button
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              key={item._id + item.category + tab}
              type="button"
              onClick={() => setActive(item)}
              className="group block w-full overflow-hidden rounded-[1.125rem] border border-[rgba(255,255,255,0.08)] text-left shadow-[0_12px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-500 hover:scale-[1.02] hover:border-[rgba(212,175,55,0.35)] hover:shadow-[0_8px_30px_-10px_rgba(212,175,55,0.3)]"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="aspect-video w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                loading="lazy"
              />
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-asphalt/92 p-4 backdrop-blur-md"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal
            aria-label={active.alt}
          >
            <motion.img
              src={active.src}
              alt={active.alt}
              className="max-h-[85vh] max-w-5xl rounded-[1.125rem] object-contain shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
              initial={reduce ? false : { scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              className="absolute right-4 top-4 font-display text-sm font-semibold text-route-yellow transition-opacity hover:opacity-80"
              onClick={() => setActive(null)}
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
