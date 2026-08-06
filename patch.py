import os
import sys

def patch_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        if old not in content:
            print(f'Warning: String not found in {path}')
            print(f'{old[:50]}...')
        content = content.replace(old, new)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Patched {path}')

# 1. Update MenuMetadata.js
patch_file('server/models/MenuMetadata.js', [
    (
'''  categories: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true }
    }
  ]
  },''',
'''  categories: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true }
    }
  ],
  galleryCategories: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true }
    }
  ]
  },'''
    )
])

# 2. Update GalleryItem.js
patch_file('server/models/GalleryItem.js', [
    (
'''    category: {
      type: String,
      required: true,
      trim: true,
      enum: ['Ambience', 'Food', 'Events/Nights']
    },''',
'''    category: {
      type: String,
      required: true,
      trim: true
    },'''
    )
])

# 3. Update menu.js routes
patch_file('server/routes/menu.js', [
    (
'''// GET all menu items
router.get('/', async (req, res) => {''',
'''// DELETE a stall
router.delete('/metadata/stall/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    if (id === 'all') return res.status(400).json({ error: 'Cannot delete the "all" stall' })

    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      const metadata = await getMenuMetadata()
      metadata.stalls = metadata.stalls.filter(s => s.id !== id)
      await metadata.save()
      res.json(metadata.stalls)
    } else {
      memoryMetadata.stalls = memoryMetadata.stalls.filter(s => s.id !== id)
      res.json(memoryMetadata.stalls)
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE a category
router.delete('/metadata/category/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    if (id === 'all') return res.status(400).json({ error: 'Cannot delete the "all" category' })

    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      const metadata = await getMenuMetadata()
      metadata.categories = metadata.categories.filter(c => c.id !== id)
      await metadata.save()
      res.json(metadata.categories)
    } else {
      memoryMetadata.categories = memoryMetadata.categories.filter(c => c.id !== id)
      res.json(memoryMetadata.categories)
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST add a new gallery category
router.post('/metadata/galleryCategory', requireAdmin, async (req, res) => {
  try {
    const { id, name } = req.body
    if (!id || !name) return res.status(400).json({ error: 'id and name required' })

    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      const metadata = await getMenuMetadata()
      if (!metadata.galleryCategories) metadata.galleryCategories = []
      if (metadata.galleryCategories.some(c => c.id === id)) {
        return res.status(400).json({ error: 'Gallery category already exists' })
      }
      metadata.galleryCategories.push({ id, name })
      await metadata.save()
      res.status(201).json(metadata.galleryCategories)
    } else {
      if (!memoryMetadata.galleryCategories) memoryMetadata.galleryCategories = []
      if (memoryMetadata.galleryCategories.some(c => c.id === id)) {
        return res.status(400).json({ error: 'Gallery category already exists' })
      }
      memoryMetadata.galleryCategories.push({ id, name })
      res.status(201).json(memoryMetadata.galleryCategories)
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE a gallery category
router.delete('/metadata/galleryCategory/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    if (id === 'all') return res.status(400).json({ error: 'Cannot delete the "all" category' })

    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      const metadata = await getMenuMetadata()
      if (metadata.galleryCategories) {
        metadata.galleryCategories = metadata.galleryCategories.filter(c => c.id !== id)
        await metadata.save()
      }
      res.json(metadata.galleryCategories || [])
    } else {
      if (memoryMetadata.galleryCategories) {
        memoryMetadata.galleryCategories = memoryMetadata.galleryCategories.filter(c => c.id !== id)
      }
      res.json(memoryMetadata.galleryCategories || [])
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET all menu items
router.get('/', async (req, res) => {'''
    )
])

# 4. Update Gallery.tsx
patch_file('client/src/pages/Gallery.tsx', [
    (
'''  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setItems(data)
      })
      .catch(err => {
        console.error('Failed to load gallery items', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])''',
'''  const [items, setItems] = useState([])
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
  }, [])'''
    ),
    (
'''<GalleryGrid items={items} />''',
'''<GalleryGrid items={items} categories={categories} />'''
    )
])

# 5. Update GalleryGrid.tsx
patch_file('client/src/components/GalleryGrid.tsx', [
    (
'''type Props = {
  items: GalleryItem[]
}

const categories = ['All', 'Ambience', 'Food', 'Events/Nights'] as const

export default function GalleryGrid({ items }: Props) {
  const [tab, setTab] = useState<(typeof categories)[number]>('All')''',
'''type Props = {
  items: GalleryItem[]
  categories: { id: string, name: string }[]
}

export default function GalleryGrid({ items, categories }: Props) {
  const [tab, setTab] = useState<string>('All')'''
    ),
    (
'''      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setTab(c)}
            className={`rounded-full px-4 py-2 font-display text-xs font-semibold transition-all duration-300 ${tab === c
              ? 'bg-route-yellow text-ink shadow-[0_8px_24px_rgba(212,175,55,0.25)]'
              : 'border border-[rgba(212,175,55,0.2)] text-dusk-grey hover:border-route-yellow hover:text-route-yellow'
              }`}
          >
            {c}
          </button>
        ))}
      </div>''',
'''      <div className="mb-8 flex flex-wrap gap-2">
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
      </div>'''
    )
])

# 6. Admin.tsx
patch_file('client/src/pages/Admin.tsx', [
    (
'''import Seo from '../components/Seo'
import ExitSection from '../components/ExitSection'

type MenuItem = {''',
'''import Seo from '../components/Seo'
import ExitSection from '../components/ExitSection'

function useVerticalScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        el.scrollTop += e.deltaY
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])
  return ref
}

type MenuItem = {'''
    ),
    (
'''  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'menu' | 'gallery'>('menu')

  // Metadata State
  const [stalls, setStalls] = useState<MetadataItem[]>([])
  const [categories, setCategories] = useState<MetadataItem[]>([])
  const [newStallForm, setNewStallForm] = useState({ id: '', name: '' })
  const [newCategoryForm, setNewCategoryForm] = useState({ id: '', name: '' })''',
'''  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'menu' | 'gallery'>('menu')

  const stallsScrollRef = useVerticalScroll<HTMLUListElement>()
  const categoriesScrollRef = useVerticalScroll<HTMLUListElement>()
  const galleryCategoriesScrollRef = useVerticalScroll<HTMLUListElement>()

  // Metadata State
  const [stalls, setStalls] = useState<MetadataItem[]>([])
  const [categories, setCategories] = useState<MetadataItem[]>([])
  const [galleryCategories, setGalleryCategories] = useState<MetadataItem[]>([])
  const [newStallForm, setNewStallForm] = useState({ id: '', name: '' })
  const [newCategoryForm, setNewCategoryForm] = useState({ id: '', name: '' })
  const [newGalleryCategoryForm, setNewGalleryCategoryForm] = useState({ id: '', name: '' })'''
    ),
    (
'''  // Gallery Form
  const [galleryForm, setGalleryForm] = useState({
    alt: '', category: 'Ambience', file: null as File | null
  })''',
'''  // Gallery Form
  const [galleryForm, setGalleryForm] = useState({
    alt: '', category: '', file: null as File | null
  })

  useEffect(() => {
    if (galleryCategories.length > 0 && !galleryForm.category) {
      setGalleryForm(p => ({ ...p, category: galleryCategories[0].name }))
    }
  }, [galleryCategories, galleryForm.category])'''
    ),
    (
'''      const data = await res.json()
      if (res.ok) {
        setStalls(data.stalls)
        setCategories(data.categories)
      }''',
'''      const data = await res.json()
      if (res.ok) {
        setStalls(data.stalls)
        setCategories(data.categories)
        setGalleryCategories(data.galleryCategories || [])
      }'''
    ),
    (
'''    } catch (err) {
      console.error(err)
    }
  }

  // --- GALLERY LOGIC ---''',
'''    } catch (err) {
      console.error(err)
    }
  }

  async function handleAddGalleryCategory(e: FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/menu/metadata/galleryCategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({
          id: newGalleryCategoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          name: newGalleryCategoryForm.name
        })
      })
      if (res.ok) {
        setNewGalleryCategoryForm({ id: '', name: '' })
        fetchMetadata()
      } else {
        const data = await res.json()
        alert(data.error)
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDeleteGalleryCategory(id: string) {
    if (!window.confirm('Are you sure you want to delete this gallery category?')) return
    try {
      const res = await fetch(`/api/menu/metadata/galleryCategory/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password }
      })
      if (res.ok) {
        fetchMetadata()
      } else {
        const data = await res.json()
        alert(data.error)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // --- GALLERY LOGIC ---'''
    ),
    (
'''                      <ul className="mt-2 space-y-1 mb-3 max-h-32 overflow-y-auto pr-2">
                        {stalls.filter(s => s.id !== 'all').map(s => (
                          <li key={s.id} className="flex justify-between items-center text-xs text-paper-cream bg-white/5 px-2 py-1.5 rounded">
                            <span>{s.name}</span>
                            <button onClick={() => handleDeleteStall(s.id)} className="text-red-400 hover:text-red-300 font-bold ml-2">×</button>
                          </li>
                        ))}
                      </ul>''',
'''                      <ul ref={stallsScrollRef} className="mt-2 space-y-1 mb-3 max-h-60 overflow-y-auto overscroll-contain pr-2 custom-scrollbar">
                        {stalls.filter(s => s.id !== 'all').map(s => (
                          <li key={s.id} className="flex justify-between items-center text-xs text-paper-cream bg-white/5 px-2 py-1.5 rounded">
                            <span>{s.name}</span>
                            <button onClick={() => handleDeleteStall(s.id)} className="text-red-400 hover:text-red-300 font-bold ml-2">×</button>
                          </li>
                        ))}
                      </ul>'''
    ),
    (
'''                      <ul className="mt-2 space-y-1 mb-3 max-h-32 overflow-y-auto pr-2">
                        {categories.filter(c => c.id !== 'all').map(c => (
                          <li key={c.id} className="flex justify-between items-center text-xs text-paper-cream bg-white/5 px-2 py-1.5 rounded">
                            <span>{c.name}</span>
                            <button onClick={() => handleDeleteCategory(c.id)} className="text-red-400 hover:text-red-300 font-bold ml-2">×</button>
                          </li>
                        ))}
                      </ul>''',
'''                      <ul ref={categoriesScrollRef} className="mt-2 space-y-1 mb-3 max-h-60 overflow-y-auto overscroll-contain pr-2 custom-scrollbar">
                        {categories.filter(c => c.id !== 'all').map(c => (
                          <li key={c.id} className="flex justify-between items-center text-xs text-paper-cream bg-white/5 px-2 py-1.5 rounded">
                            <span>{c.name}</span>
                            <button onClick={() => handleDeleteCategory(c.id)} className="text-red-400 hover:text-red-300 font-bold ml-2">×</button>
                          </li>
                        ))}
                      </ul>'''
    ),
    (
'''              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="lux-card">
                  <h3 className="mb-5 font-serif text-xl font-bold tracking-tight text-route-yellow">
                    Upload Image
                  </h3>
                  <form onSubmit={handleGallerySubmit} className="space-y-4">''',
'''              <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
                <div className="lux-card">
                  <h3 className="mb-4 font-serif text-lg font-bold tracking-tight text-route-yellow">
                    Manage Gallery Categories
                  </h3>
                  <div>
                    <ul ref={galleryCategoriesScrollRef} className="mt-2 space-y-1 mb-3 max-h-60 overflow-y-auto overscroll-contain pr-2 custom-scrollbar">
                      {galleryCategories.map(c => (
                        <li key={c.id} className="flex justify-between items-center text-xs text-paper-cream bg-white/5 px-2 py-1.5 rounded">
                          <span>{c.name}</span>
                          <button onClick={() => handleDeleteGalleryCategory(c.id)} className="text-red-400 hover:text-red-300 font-bold ml-2">×</button>
                        </li>
                      ))}
                    </ul>
                    <form onSubmit={handleAddGalleryCategory} className="flex gap-2">
                      <input value={newGalleryCategoryForm.name} onChange={e => setNewGalleryCategoryForm({ ...newGalleryCategoryForm, name: e.target.value })} required className={`${inputClass} !py-1.5 !text-xs`} placeholder="New Category Name..." />
                      <button type="submit" className="btn-primary !px-3 !py-1.5 !text-xs">+</button>
                    </form>
                  </div>
                </div>

                <div className="lux-card">
                  <h3 className="mb-5 font-serif text-xl font-bold tracking-tight text-route-yellow">
                    Upload Image
                  </h3>
                  <form onSubmit={handleGallerySubmit} className="space-y-4">'''
    ),
    (
'''                    <div>
                      <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Category</label>
                      <select
                        value={galleryForm.category}
                        onChange={e => setGalleryForm(p => ({ ...p, category: e.target.value }))}
                        className={inputClass}
                      >
                        <option value="Ambience">Ambience</option>
                        <option value="Food">Food</option>
                        <option value="Events/Nights">Events/Nights</option>
                      </select>
                    </div>''',
'''                    <div>
                      <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Category</label>
                      <select
                        value={galleryForm.category}
                        onChange={e => setGalleryForm(p => ({ ...p, category: e.target.value }))}
                        className={inputClass}
                      >
                        {galleryCategories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>'''
    )
])
