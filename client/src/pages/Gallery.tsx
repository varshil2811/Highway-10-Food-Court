import { useState, useEffect } from 'react'
import Seo from '../components/Seo'
import ExitSection from '../components/ExitSection'
import GalleryGrid from '../components/GalleryGrid'
import { entranceNight } from '../data/gallery'

export default function Gallery() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/gallery').then(res => res.json()),
      fetch('/api/menu/metadata').then(res => res.json())
    ])
      .then(([galleryData, metadataData]) => {
        if (galleryData.error) throw new Error(galleryData.error)
        setItems(galleryData)
        if (metadataData.galleryCategories) {
          setCategories(metadataData.galleryCategories)
        }
      })
      .catch(err => {
        console.error('Failed to load gallery items', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Seo
        title="Photo Gallery"
        description="Ambience, food counters, and night vibes at Highway 10 Food Court, Jamnagar."
        path="/gallery"
      />

      <div className="relative h-52 overflow-hidden md:h-72">
        <img
          src={entranceNight}
          alt="Highway 10 night entrance with glowing signage and lit archway"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-asphalt/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-transparent to-asphalt/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-8 md:pl-20">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-route-yellow">
              Exit 02
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-paper-cream md:text-5xl">
              Gallery
            </h1>
          </div>
        </div>
      </div>

      <ExitSection exit={2} title="On Camera" tone="dark" className="!pt-10">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="aspect-video w-full rounded-xl bg-white/5 animate-pulse border border-[rgba(255,255,255,0.05)]"></div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-900/20 p-6 text-center text-sm text-red-400 border border-red-500/20">
            <p>Failed to load gallery.</p>
          </div>
        ) : (
          <GalleryGrid items={items} categories={categories} />
        )}
      </ExitSection>
    </>
  )
}
