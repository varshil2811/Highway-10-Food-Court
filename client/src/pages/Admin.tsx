import { useState, useEffect, type FormEvent, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import ReservationsTab from '../components/ReservationsTab'
import UsersTab from '../components/UsersTab'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Utensils, Image as ImageIcon, Star, Mail, Users as UsersIcon } from 'lucide-react'
import Seo from '../components/Seo'
import ExitSection from '../components/ExitSection'
import EmailMgmtTab from '../components/EmailMgmtTab'

function useVerticalScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
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

type GalleryItem = {
  _id: string
  src: string
  alt: string
  category: string
  homePosition?: number | null
  media_type?: 'image' | 'video'
}

type MetadataItem = {
  id: string
  name: string
}

type ReviewItem = {
  _id: string
  name: string
  quote: string
  meta: string
}

type User = {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'stall_owner'
}

export default function Admin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  )
  const [loginError, setLoginError] = useState('')
  const isAuthenticated = !!token

  const [activeTab, setActiveTab] = useState<'menu' | 'gallery' | 'reviews' | 'emails' | 'reservations' | 'users'>(
    user?.role === 'stall_owner' ? 'reservations' : 'reservations'
  )

  useEffect(() => {
    if (!isAuthenticated) {
      if (location.pathname !== '/login') {
        navigate('/login')
      }
    } else {
      if (user?.role === 'super_admin' && location.pathname !== '/admin/dashboard') {
        navigate('/admin/dashboard')
      } else if (user?.role === 'stall_owner' && location.pathname !== '/stall-admin/dashboard') {
        navigate('/stall-admin/dashboard')
      }
    }
  }, [isAuthenticated, location.pathname, user?.role, navigate])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to login')
      
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setActiveTab(data.user.role === 'stall_owner' ? 'reservations' : 'reservations')
      
      const redirectUrl = data.user.role === 'super_admin' ? '/admin/dashboard' : '/stall-admin/dashboard'
      navigate(redirectUrl)
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Error logging in')
    }
  }

  function handleLogout() {
    setToken('')
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const stallsScrollRef = useVerticalScroll<HTMLUListElement>()
  const categoriesScrollRef = useVerticalScroll<HTMLUListElement>()
  const galleryCategoriesScrollRef = useVerticalScroll<HTMLUListElement>()

  // Metadata State
  const [stalls, setStalls] = useState<MetadataItem[]>([])
  const [categories, setCategories] = useState<MetadataItem[]>([])
  const [galleryCategories, setGalleryCategories] = useState<MetadataItem[]>([])
  const [newStallForm, setNewStallForm] = useState({ id: '', name: '' })
  const [newCategoryForm, setNewCategoryForm] = useState({ id: '', name: '' })
  const [newGalleryCategoryForm, setNewGalleryCategoryForm] = useState({ id: '', name: '' })

  // Menu State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [menuError, setMenuError] = useState('')
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null)

  // Gallery State
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [galleryError, setGalleryError] = useState('')
  const [galleryFilter, setGalleryFilter] = useState('All')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Menu Form
  const [menuForm, setMenuForm] = useState({
    name: '', description: '', stall: 'kulchas', category: 'veg',
    veg: false, jain: false, bestseller: false, price: '0', file: null as File | null
  })

  const menuFormRef = useRef<HTMLDivElement>(null)
  const galleryFormRef = useRef<HTMLDivElement>(null)

  // Gallery Form
  const [galleryForm, setGalleryForm] = useState({
    alt: '', category: '', files: [] as File[]
  })
  const [uploadProgress, setUploadProgress] = useState(0)

  // Reviews State
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState('')


  useEffect(() => {
    if (galleryCategories.length > 0 && !galleryForm.category) {
      setGalleryForm(p => ({ ...p, category: galleryCategories[0].name }))
    }
  }, [galleryCategories, galleryForm.category])

  async function fetchMetadata() {
    try {
      const res = await fetch('/api/menu/metadata')
      const data = await res.json()
      if (res.ok) {
        setStalls(data.stalls)
        setCategories(data.categories)
        setGalleryCategories(data.galleryCategories || [])
      }
    } catch (err) {
      console.error('Failed to load metadata', err)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetadata()
      if (activeTab === 'menu') fetchMenu()
      if (activeTab === 'gallery') fetchGallery()
      if (activeTab === 'reviews') fetchReviews(true)
    }
  }, [isAuthenticated, activeTab, user])

  // Auto-poll reviews in the background when on the reviews tab
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isAuthenticated && activeTab === 'reviews') {
      interval = setInterval(() => {
        fetchReviews(false) // Fetch without triggering the loading spinner to prevent flicker
      }, 5000) // Poll every 5 seconds
    }
    return () => clearInterval(interval)
  }, [isAuthenticated, activeTab])

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeTab])

  // --- MENU LOGIC ---
  async function fetchMenu() {
    try {
      setMenuError('')
      setMenuLoading(true)
      const res = await fetch('/api/menu')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch')
      setMenuItems(data)
    } catch (err) {
      setMenuError(err instanceof Error ? err.message : 'Error fetching items')
    } finally {
      setMenuLoading(false)
    }
  }

  function handleMenuInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setMenuForm(prev => ({ ...prev, [name]: val }))
  }

  function handleMenuEdit(item: MenuItem) {
    setEditingMenu(item)
    setMenuForm({
      name: item.name, description: item.description || '', stall: item.stall,
      category: item.category, veg: item.veg, jain: item.jain,
      bestseller: item.bestseller, price: item.price || '0', file: null
    })
    setTimeout(() => {
      menuFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function handleMenuCancelEdit() {
    setEditingMenu(null)
    setMenuForm({
      name: '', description: '', stall: 'kulchas', category: 'veg',
      veg: false, jain: false, bestseller: false, price: '0', file: null
    })
  }

  async function handleMenuSubmit(e: FormEvent) {
    e.preventDefault()
    setMenuError('')
    try {
      const url = editingMenu ? `/api/menu/${editingMenu._id}` : '/api/menu'
      const method = editingMenu ? 'PUT' : 'POST'

      const formData = new FormData()
      formData.append('name', menuForm.name)
      formData.append('description', menuForm.description)
      formData.append('stall', menuForm.stall)
      formData.append('category', menuForm.category)
      formData.append('price', menuForm.price)
      formData.append('veg', menuForm.veg.toString())
      formData.append('jain', menuForm.jain.toString())
      formData.append('bestseller', menuForm.bestseller.toString())
      if (menuForm.file) {
        formData.append('image', menuForm.file)
      }

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      if (!res.ok) {
        let errorMsg = 'Failed to save item'
        try {
          const data = await res.json()
          errorMsg = data.error || errorMsg
        } catch {
          errorMsg = `Server error: ${res.status} ${res.statusText}`
        }
        throw new Error(errorMsg)
      }
      handleMenuCancelEdit()
      fetchMenu()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      let msg = err instanceof Error ? err.message : 'Error saving item'
      if (msg === 'Failed to fetch') msg = 'Network error: Failed to reach the server. Is the backend running?'
      setMenuError(msg)
    }
  }

  async function handleMenuDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to delete')
      fetchMenu()
    } catch (err) {
      setMenuError(err instanceof Error ? err.message : 'Error deleting item')
    }
  }

  async function handleAddStall(e: FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/menu/metadata/stall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          id: newStallForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          name: newStallForm.name
        })
      })
      if (res.ok) {
        setNewStallForm({ id: '', name: '' })
        fetchMetadata()
      } else {
        const data = await res.json()
        alert(data.error)
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleAddCategory(e: FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/menu/metadata/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          id: newCategoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          name: newCategoryForm.name
        })
      })
      if (res.ok) {
        setNewCategoryForm({ id: '', name: '' })
        fetchMetadata()
      } else {
        const data = await res.json()
        alert(data.error)
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDeleteStall(id: string) {
    if (!window.confirm('Are you sure you want to delete this stall?')) return
    try {
      const res = await fetch(`/api/menu/metadata/stall/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
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

  async function handleDeleteCategory(id: string) {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      const res = await fetch(`/api/menu/metadata/category/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
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

  async function handleAddGalleryCategory(e: FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/menu/metadata/galleryCategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
        headers: { 'Authorization': `Bearer ${token}` }
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

  // --- REVIEWS LOGIC ---
  async function fetchReviews(showLoading = true) {
    try {
      setReviewsError('')
      if (showLoading) setReviewsLoading(true)
      const res = await fetch('/api/reviews')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch')
      setReviews(data)
    } catch (err) {
      setReviewsError(err instanceof Error ? err.message : 'Error fetching reviews')
    } finally {
      if (showLoading) setReviewsLoading(false)
    }
  }

  async function handleReviewDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to delete')
      fetchReviews()
    } catch (err) {
      setReviewsError(err instanceof Error ? err.message : 'Error deleting review')
    }
  }

  // --- GALLERY LOGIC ---
  async function fetchGallery() {
    try {
      setGalleryError('')
      setGalleryLoading(true)
      const res = await fetch('/api/gallery')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch')
      setGalleryItems(data)
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : 'Error fetching gallery')
    } finally {
      setGalleryLoading(false)
    }
  }

  async function handleGallerySubmit(e: FormEvent) {
    e.preventDefault()
    setGalleryError('')
    if (galleryForm.files.length === 0) return setGalleryError('Please select at least one media file')

    try {
      const fd = new FormData()
      galleryForm.files.forEach(f => fd.append('media', f))
      fd.append('alt', galleryForm.alt)
      fd.append('category', galleryForm.category)

      setGalleryLoading(true)
      setUploadProgress(0)

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/gallery');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            let errorMsg = 'Failed to upload media';
            try {
              const data = JSON.parse(xhr.responseText);
              errorMsg = data.error || errorMsg;
            } catch {
              errorMsg = `Server error: ${xhr.status} ${xhr.statusText}`;
            }
            reject(new Error(errorMsg));
          }
        };

        xhr.onerror = () => reject(new Error('Network error: Failed to reach the server. Is the backend running?'));
        
        xhr.send(fd);
      });

      setGalleryForm({ alt: '', category: 'Ambience', files: [] })
      if (fileInputRef.current) fileInputRef.current.value = ''
      setUploadProgress(0)
      fetchGallery()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : 'Error uploading media')
    } finally {
      setGalleryLoading(false)
    }
  }

  async function handleGalleryDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this gallery image?')) return
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to delete')
      fetchGallery()
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : 'Error deleting image')
    }
  }

  async function handleGalleryPositionToggle(id: string, newPos: number | null) {
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ homePosition: newPos })
      })
      if (!res.ok) throw new Error('Failed to update')
      fetchGallery()
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : 'Error updating image')
    }
  }

  const filteredGalleryItems = galleryFilter === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === galleryFilter)

  if (!isAuthenticated) {
    return (
      <ExitSection exit={0} title="Staff & Admin Login" tone="dark" className="!pt-28 md:!pt-36">
        <div className="mx-auto max-w-sm">
          <form onSubmit={handleLogin} className="lux-card">
            <h3 className="mb-4 font-serif text-xl font-bold tracking-tight text-route-yellow">
              Secure Login
            </h3>
            {loginError && <div className="mb-4 rounded-lg bg-red-900/20 p-3 text-sm text-red-400 border border-red-500/20">{loginError}</div>}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="lux-input mb-4" placeholder="Email Address..." required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="lux-input mb-4" placeholder="Password..." required />
            <button type="submit" className="btn-primary w-full">Login</button>
            <div className="mt-6 text-center">
              <Link to="/" className="text-sm font-semibold text-dusk-grey hover:text-route-yellow transition-colors inline-flex items-center gap-2">
                ← Return to Website
              </Link>
            </div>
          </form>
        </div>
      </ExitSection>
    )
  }

  const inputClass = 'lux-input'

  return (
    <>
      <Seo title="Admin Panel" description="Highway 10 Administration" path="/admin" />
      <ExitSection exit={0} title="Administration" tone="dark" className="!pt-28 md:!pt-36">

        <div className="mb-6 flex justify-end">
          <button onClick={handleLogout} className="rounded-lg bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all duration-300">
            Logout
          </button>
        </div>

        <div className="mb-10 hidden lg:inline-flex flex-wrap gap-2 rounded-xl bg-[rgba(212,175,55,0.03)] p-1.5 border border-[rgba(212,175,55,0.1)] shadow-inner">
          <button
            onClick={() => setActiveTab('reservations')}
            className={`rounded-lg px-6 py-2.5 font-display text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === 'reservations' ? 'bg-[rgba(212,175,55,0.15)] text-route-yellow shadow-sm' : 'text-dusk-grey hover:text-paper-cream hover:bg-white/5'}`}
          >
            Reservations
          </button>
          {user?.role === 'super_admin' && (
            <>
              <button
                onClick={() => setActiveTab('menu')}
                className={`rounded-lg px-6 py-2.5 font-display text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === 'menu' ? 'bg-[rgba(212,175,55,0.15)] text-route-yellow shadow-sm' : 'text-dusk-grey hover:text-paper-cream hover:bg-white/5'}`}
              >
                Menu Items
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`rounded-lg px-6 py-2.5 font-display text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === 'gallery' ? 'bg-[rgba(212,175,55,0.15)] text-route-yellow shadow-sm' : 'text-dusk-grey hover:text-paper-cream hover:bg-white/5'}`}
              >
                Gallery Images
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`rounded-lg px-6 py-2.5 font-display text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === 'reviews' ? 'bg-[rgba(212,175,55,0.15)] text-route-yellow shadow-sm' : 'text-dusk-grey hover:text-paper-cream hover:bg-white/5'}`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab('emails')}
                className={`rounded-lg px-6 py-2.5 font-display text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === 'emails' ? 'bg-[rgba(212,175,55,0.15)] text-route-yellow shadow-sm' : 'text-dusk-grey hover:text-paper-cream hover:bg-white/5'}`}
              >
                Email Mgmt
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`rounded-lg px-6 py-2.5 font-display text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === 'users' ? 'bg-[rgba(212,175,55,0.15)] text-route-yellow shadow-sm' : 'text-dusk-grey hover:text-paper-cream hover:bg-white/5'}`}
              >
                Users
              </button>
            </>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_400px]"
            >
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-route-yellow">Menu Items</h2>
                  <button onClick={fetchMenu} className="text-sm text-dusk-grey underline hover:text-paper-cream">Refresh</button>
                </div>

                {menuLoading ? <p className="text-dusk-grey">Loading items...</p> : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {menuItems.map(item => (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          key={item._id}
                          className="lux-card !p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-xl object-cover border border-[rgba(255,255,255,0.1)]" />
                            )}
                            <div>
                              <h4 className="font-display font-bold text-paper-cream">{item.name}</h4>
                              <p className="text-xs text-dusk-grey mt-1">
                                {stalls.find(s => s.id === item.stall)?.name || item.stall} • {categories.find(c => c.id === item.category)?.name || item.category}
                              </p>
                              <p className="text-xs text-paper-cream/60 mt-1">{item.price}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleMenuEdit(item)} className="rounded-lg bg-[rgba(212,175,55,0.1)] px-3 py-1.5 text-xs font-semibold text-route-yellow hover:bg-[rgba(212,175,55,0.2)]">Edit</button>
                            <button onClick={() => handleMenuDelete(item._id)} className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20">Delete</button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <aside className="lg:sticky lg:top-24 lg:self-start space-y-6" ref={menuFormRef}>
                <div className="lux-card">
                  <h3 className="mb-5 font-serif text-xl font-bold tracking-tight text-route-yellow">
                    {editingMenu ? 'Edit Item' : 'Add Menu Item'}
                  </h3>
                  {menuError && <div className="mb-4 rounded-xl bg-red-900/20 p-4 text-sm text-red-400 border border-red-500/20">{menuError}</div>}

                  <form onSubmit={handleMenuSubmit} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Name</label>
                      <input name="name" value={menuForm.name} onChange={handleMenuInputChange} required className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Description</label>
                      <textarea name="description" value={menuForm.description} onChange={handleMenuInputChange} rows={2} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Stall</label>
                        <select name="stall" value={menuForm.stall} onChange={handleMenuInputChange} className={inputClass}>
                          {stalls.filter(s => s.id !== 'all').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Category</label>
                        <select name="category" value={menuForm.category} onChange={handleMenuInputChange} className={inputClass}>
                          {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Price</label>
                      <input name="price" value={menuForm.price} onChange={handleMenuInputChange} className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Image (Optional)</label>
                      <input type="file" accept="image/*" onChange={(e) => setMenuForm(p => ({ ...p, file: e.target.files?.[0] || null }))} className="block w-full text-sm text-dusk-grey file:mr-4 file:rounded-xl file:border-0 file:bg-[rgba(212,175,55,0.15)] file:px-4 file:py-2.5 file:font-display file:text-xs file:font-semibold file:text-route-yellow hover:file:bg-[rgba(212,175,55,0.25)]" />
                    </div>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <label className="flex items-center gap-2 text-sm text-paper-cream cursor-pointer">
                        <input type="checkbox" name="veg" checked={menuForm.veg} onChange={handleMenuInputChange} className="accent-route-yellow w-4 h-4" /> Veg
                      </label>
                      <label className="flex items-center gap-2 text-sm text-paper-cream cursor-pointer">
                        <input type="checkbox" name="jain" checked={menuForm.jain} onChange={handleMenuInputChange} className="accent-route-yellow w-4 h-4" /> Jain
                      </label>
                      <label className="flex items-center gap-2 text-sm text-paper-cream cursor-pointer">
                        <input type="checkbox" name="bestseller" checked={menuForm.bestseller} onChange={handleMenuInputChange} className="accent-route-yellow w-4 h-4" /> Bestseller
                      </label>
                    </div>
                    <div className="pt-4 flex gap-3">
                      <button type="submit" className="btn-primary flex-1">{editingMenu ? 'Save' : 'Add'}</button>
                      {editingMenu && <button type="button" onClick={handleMenuCancelEdit} className="btn-ghost px-4">Cancel</button>}
                    </div>
                  </form>
                </div>

                <div className="lux-card">
                  <h3 className="mb-4 font-serif text-lg font-bold tracking-tight text-route-yellow">
                    Manage Stalls & Categories
                  </h3>

                  <div className="space-y-6">
                    {/* Stalls Section */}
                    <div>
                      <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey border-b border-white/10 pb-1">Stalls</label>
                      <ul ref={stallsScrollRef} className="mt-2 space-y-1 mb-3 max-h-60 overflow-y-auto overscroll-contain pr-2 custom-scrollbar">
                        {stalls.filter(s => s.id !== 'all').map(s => (
                          <li key={s.id} className="flex justify-between items-center text-xs text-paper-cream bg-white/5 px-2 py-1.5 rounded">
                            <span>{s.name}</span>
                            <button onClick={() => handleDeleteStall(s.id)} className="text-red-400 hover:text-red-300 font-bold ml-2">×</button>
                          </li>
                        ))}
                      </ul>
                      <form onSubmit={handleAddStall} className="flex gap-2">
                        <input value={newStallForm.name} onChange={e => setNewStallForm({ ...newStallForm, name: e.target.value })} required className={`${inputClass} !py-1.5 !text-xs !rounded-full`} placeholder="New Stall Name..." />
                        <button type="submit" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-route-yellow text-lg font-bold text-ink transition-transform hover:scale-105 active:scale-95">+</button>
                      </form>
                    </div>

                    {/* Categories Section */}
                    <div>
                      <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey border-b border-white/10 pb-1">Categories</label>
                      <ul ref={categoriesScrollRef} className="mt-2 space-y-1 mb-3 max-h-60 overflow-y-auto overscroll-contain pr-2 custom-scrollbar">
                        {categories.filter(c => c.id !== 'all').map(c => (
                          <li key={c.id} className="flex justify-between items-center text-xs text-paper-cream bg-white/5 px-2 py-1.5 rounded">
                            <span>{c.name}</span>
                            <button onClick={() => handleDeleteCategory(c.id)} className="text-red-400 hover:text-red-300 font-bold ml-2">×</button>
                          </li>
                        ))}
                      </ul>
                      <form onSubmit={handleAddCategory} className="flex gap-2">
                        <input value={newCategoryForm.name} onChange={e => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })} required className={`${inputClass} !py-1.5 !text-xs !rounded-full`} placeholder="New Category Name..." />
                        <button type="submit" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-route-yellow text-lg font-bold text-ink transition-transform hover:scale-105 active:scale-95">+</button>
                      </form>
                    </div>
                  </div>
                </div>
              </aside>
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_400px]"
            >
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-route-yellow">Gallery Images</h2>
                  <button onClick={fetchGallery} className="text-sm text-dusk-grey underline hover:text-paper-cream">Refresh</button>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  {['All', ...galleryCategories.map(c => c.name)].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setGalleryFilter(c)}
                      className={`rounded-full px-3 py-1 font-display text-xs font-semibold transition-colors ${galleryFilter === c
                        ? 'bg-[rgba(212,175,55,0.2)] text-route-yellow'
                        : 'border border-[rgba(212,175,55,0.2)] text-dusk-grey hover:text-route-yellow'
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {galleryError && <div className="mb-4 rounded-xl bg-red-900/20 p-4 text-sm text-red-400 border border-red-500/20">{galleryError}</div>}
                {galleryLoading ? <p className="text-dusk-grey">Loading gallery...</p> : (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <AnimatePresence>
                      {filteredGalleryItems.map(item => (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          key={item._id}
                          className={`relative group overflow-hidden rounded-xl border ${item.homePosition ? 'border-route-yellow shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'border-[rgba(212,175,55,0.2)]'}`}
                        >
                          {item.media_type === 'video' ? (
                            <video src={item.src} className="aspect-video w-full object-cover" />
                          ) : (
                            <img src={item.src} alt={item.alt} className="aspect-video w-full object-cover" />
                          )}
                          {item.media_type === 'video' && (
                            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/20">VIDEO</div>
                          )}
                          {item.homePosition && (
                            <div className="absolute top-2 right-2 bg-route-yellow text-ink text-[10px] font-bold px-2 py-1 rounded">POS {item.homePosition}</div>
                          )}
                          <div className="absolute inset-0 bg-asphalt/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center p-3 text-center gap-2">
                            <span className="text-[10px] font-display text-route-yellow uppercase">Set Home Pos</span>
                            <div className="flex flex-wrap justify-center gap-1">
                              {[1, 2, 3, 4, 5, 6].map(num => (
                                <button
                                  key={num}
                                  onClick={() => handleGalleryPositionToggle(item._id, item.homePosition === num ? null : num)}
                                  className={`rounded w-6 h-6 flex items-center justify-center text-[10px] font-bold transition-colors ${item.homePosition === num ? 'bg-route-yellow text-ink' : 'bg-[rgba(212,175,55,0.2)] text-route-yellow hover:bg-[rgba(212,175,55,0.4)]'}`}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                            <button onClick={() => handleGalleryDelete(item._id)} className="mt-1 rounded-lg bg-red-500/20 px-3 py-1.5 text-[10px] font-semibold text-red-400 hover:bg-red-500/40">Delete</button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <aside className="lg:sticky lg:top-24 lg:self-start space-y-6" ref={galleryFormRef}>
                <div className="lux-card">
                  <h3 className="mb-5 font-serif text-xl font-bold tracking-tight text-route-yellow">
                    Upload Media
                  </h3>
                  <form onSubmit={handleGallerySubmit} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Media File</label>
                      <input
                        type="file"
                        accept="image/*,video/mp4,video/webm"
                        multiple
                        ref={fileInputRef}
                        onChange={e => setGalleryForm(p => ({ ...p, files: Array.from(e.target.files || []) }))}
                        required
                        className="block w-full text-sm text-dusk-grey file:mr-4 file:rounded-xl file:border-0 file:bg-[rgba(212,175,55,0.15)] file:px-4 file:py-2.5 file:font-display file:text-xs file:font-semibold file:text-route-yellow hover:file:bg-[rgba(212,175,55,0.25)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Description (Alt text)</label>
                      <input
                        value={galleryForm.alt}
                        onChange={e => setGalleryForm(p => ({ ...p, alt: e.target.value }))}
                        required
                        placeholder="E.g., Front entrance at night"
                        className={inputClass}
                      />
                    </div>
                    <div>
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
                    </div>
                    <div className="pt-4">
                      <button type="submit" className="btn-primary w-full relative overflow-hidden" disabled={galleryForm.files.length === 0 || galleryLoading}>
                        {galleryLoading ? `Uploading... ${uploadProgress}%` : 'Upload Media'}
                        {galleryLoading && (
                          <div className="absolute left-0 bottom-0 h-1 bg-black/30 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        )}
                      </button>
                    </div>
                  </form>
                </div>

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
                      <input value={newGalleryCategoryForm.name} onChange={e => setNewGalleryCategoryForm({ ...newGalleryCategoryForm, name: e.target.value })} required className={`${inputClass} !py-1.5 !text-xs !rounded-full`} placeholder="New Category Name..." />
                      <button type="submit" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-route-yellow text-lg font-bold text-ink transition-transform hover:scale-105 active:scale-95">+</button>
                    </form>
                  </div>
                </div>
              </aside>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_400px]"
            >
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-route-yellow">Reviews</h2>
                  <button onClick={() => fetchReviews(true)} className="text-sm text-dusk-grey underline hover:text-paper-cream">Refresh</button>
                </div>

                {reviewsError && <div className="mb-4 rounded-xl bg-red-900/20 p-4 text-sm text-red-400 border border-red-500/20">{reviewsError}</div>}
                {reviewsLoading ? <p className="text-dusk-grey">Loading reviews...</p> : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {reviews.map(item => (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          key={item._id}
                          className="lux-card !p-4 flex flex-col justify-between gap-4"
                        >
                          <div>
                            <p className="font-serif text-lg font-bold italic text-paper-cream/90">"{item.quote}"</p>
                            <p className="font-display font-bold text-route-yellow mt-2">{item.name}</p>
                            <p className="text-xs text-dusk-grey mt-1">{item.meta}</p>
                          </div>
                          <div className="flex gap-2 self-end">
                            <button onClick={() => handleReviewDelete(item._id)} className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20">Delete</button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'emails' && user?.role === 'super_admin' && (
            <EmailMgmtTab key="emails" adminPassword={password} token={token} />
          )}

          {activeTab === 'reservations' && (
            <ReservationsTab key="reservations" token={token} />
          )}

          {activeTab === 'users' && user?.role === 'super_admin' && (
            <UsersTab key="users" token={token} />
          )}
        </AnimatePresence>

        {/* Mobile Admin Bottom Nav */}
        {createPortal(
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="fixed bottom-4 left-2 right-2 z-50 lg:hidden"
          >
            <div className="mx-auto flex h-16 w-full max-w-[28rem] items-center justify-between gap-1 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-surface/90 px-2 backdrop-blur-xl shadow-lux">
              <button
                onClick={() => setActiveTab('reservations')}
                className={`relative flex flex-col items-center justify-center flex-1 h-[3.25rem] rounded-2xl transition-all duration-300 outline-none ${activeTab === 'reservations' ? 'bg-white/10 text-paper-cream shadow-inner' : 'text-dusk-grey hover:text-paper-cream hover:bg-white/5'}`}
              >
                <CalendarDays className={`mb-1 h-[1.125rem] w-[1.125rem] transition-transform duration-300 ${activeTab === 'reservations' ? 'scale-110' : ''}`} strokeWidth={activeTab === 'reservations' ? 2.5 : 2} />
                <span className="text-[7.5px] sm:text-[9px] font-bold tracking-widest uppercase">RSRV</span>
              </button>
              {user?.role === 'super_admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('menu')}
                    className={`relative flex flex-col items-center justify-center flex-1 h-[3.25rem] rounded-2xl transition-all duration-300 outline-none ${activeTab === 'menu' ? 'bg-white/10 text-paper-cream shadow-inner' : 'text-dusk-grey hover:text-paper-cream hover:bg-white/5'}`}
                  >
                    <Utensils className={`mb-1 h-[1.125rem] w-[1.125rem] transition-transform duration-300 ${activeTab === 'menu' ? 'scale-110' : ''}`} strokeWidth={activeTab === 'menu' ? 2.5 : 2} />
                    <span className="text-[7.5px] sm:text-[9px] font-bold tracking-widest uppercase">MENU</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`relative flex flex-col items-center justify-center flex-1 h-[3.25rem] rounded-2xl transition-all duration-300 outline-none ${activeTab === 'gallery' ? 'bg-white/10 text-paper-cream shadow-inner' : 'text-dusk-grey hover:text-paper-cream hover:bg-white/5'}`}
                  >
                    <ImageIcon className={`mb-1 h-[1.125rem] w-[1.125rem] transition-transform duration-300 ${activeTab === 'gallery' ? 'scale-110' : ''}`} strokeWidth={activeTab === 'gallery' ? 2.5 : 2} />
                    <span className="text-[7.5px] sm:text-[9px] font-bold tracking-widest uppercase">GLRY</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`relative flex flex-col items-center justify-center flex-1 h-[3.25rem] rounded-2xl transition-all duration-300 outline-none ${activeTab === 'reviews' ? 'bg-white/10 text-paper-cream shadow-inner' : 'text-dusk-grey hover:text-paper-cream hover:bg-white/5'}`}
                  >
                    <Star className={`mb-1 h-[1.125rem] w-[1.125rem] transition-transform duration-300 ${activeTab === 'reviews' ? 'scale-110' : ''}`} strokeWidth={activeTab === 'reviews' ? 2.5 : 2} />
                    <span className="text-[7.5px] sm:text-[9px] font-bold tracking-widest uppercase">RVWS</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('emails')}
                    className={`relative flex flex-col items-center justify-center flex-1 h-[3.25rem] rounded-2xl transition-all duration-300 outline-none ${activeTab === 'emails' ? 'bg-white/10 text-paper-cream shadow-inner' : 'text-dusk-grey hover:text-paper-cream hover:bg-white/5'}`}
                  >
                    <Mail className={`mb-1 h-[1.125rem] w-[1.125rem] transition-transform duration-300 ${activeTab === 'emails' ? 'scale-110' : ''}`} strokeWidth={activeTab === 'emails' ? 2.5 : 2} />
                    <span className="text-[7.5px] sm:text-[9px] font-bold tracking-widest uppercase">MAIL</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`relative flex flex-col items-center justify-center flex-1 h-[3.25rem] rounded-2xl transition-all duration-300 outline-none ${activeTab === 'users' ? 'bg-white/10 text-paper-cream shadow-inner' : 'text-dusk-grey hover:text-paper-cream hover:bg-white/5'}`}
                  >
                    <UsersIcon className={`mb-1 h-[1.125rem] w-[1.125rem] transition-transform duration-300 ${activeTab === 'users' ? 'scale-110' : ''}`} strokeWidth={activeTab === 'users' ? 2.5 : 2} />
                    <span className="text-[7.5px] sm:text-[9px] font-bold tracking-widest uppercase">USERS</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>,
          document.body
        )}

      </ExitSection>
    </>
  )
}
