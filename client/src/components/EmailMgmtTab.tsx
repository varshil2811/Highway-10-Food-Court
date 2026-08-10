import { useState, useEffect, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type StallEmail = {
  _id: string
  stallName: string
  email: string
  phone: string
  status: string
}

type OwnerSetting = {
  _id: string
  ownerName: string
  email: string
  phone: string
  status: string
}

export default function EmailMgmtTab({ adminPassword, token }: { adminPassword?: string, token?: string }) {
  const [stalls, setStalls] = useState<StallEmail[]>([])
  const [, setOwner] = useState<OwnerSetting | null>(null)
  const [availableStalls, setAvailableStalls] = useState<{id: string, name: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form states
  const [newStall, setNewStall] = useState({ stallName: '', email: '', phone: '' })
  const [ownerForm, setOwnerForm] = useState({ ownerName: '', email: '', phone: '' })

  const fetchSettings = async () => {
    setLoading(true)
    setError('')
    try {
      const headers: Record<string, string> = { 'x-admin-password': adminPassword || '' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const [stallsRes, ownerRes, metadataRes] = await Promise.all([
        fetch('/api/admin/emails/stalls', { headers }),
        fetch('/api/admin/emails/owner', { headers }),
        fetch('/api/menu/metadata')
      ])
      
      if (!stallsRes.ok) throw new Error('Failed to fetch stalls')
      if (!ownerRes.ok) throw new Error('Failed to fetch owner setting')

      const stallsData = await stallsRes.json()
      const ownerData = await ownerRes.json()
      const metadata = await metadataRes.json()

      setStalls(stallsData)
      setOwner(ownerData)
      if (ownerData) {
        setOwnerForm({ ownerName: ownerData.ownerName, email: ownerData.email, phone: ownerData.phone || '' })
      }
      if (metadata && metadata.stalls) {
        const filtered = metadata.stalls.filter((s: any) => s.id !== 'all')
        setAvailableStalls(filtered)
        if (!newStall.stallName && filtered.length > 0) {
          setNewStall(prev => ({ ...prev, stallName: filtered[0].name }))
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching email settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleAddStall = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-admin-password': adminPassword || '' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/admin/emails/stalls', {
        method: 'POST',
        headers,
        body: JSON.stringify(newStall)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add stall')
      }
      setNewStall({ stallName: availableStalls[0]?.name || '', email: '', phone: '' })
      fetchSettings()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
    }
  }

  const handleDeleteStall = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this stall email configuration?')) return
    try {
      const headers: Record<string, string> = { 'x-admin-password': adminPassword || '' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/admin/emails/stalls/${id}`, {
        method: 'DELETE',
        headers
      })
      if (!res.ok) throw new Error('Failed to delete')
      fetchSettings()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting')
    }
  }

  const handleToggleStallStatus = async (stall: StallEmail) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-admin-password': adminPassword || '' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/admin/emails/stalls/${stall._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: stall.status === 'Active' ? 'Inactive' : 'Active' })
      })
      if (!res.ok) throw new Error('Failed to update status')
      fetchSettings()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating status')
    }
  }

  const handleUpdateOwner = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-admin-password': adminPassword || '' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/admin/emails/owner', {
        method: 'PUT',
        headers,
        body: JSON.stringify(ownerForm)
      })
      if (!res.ok) throw new Error('Failed to update owner settings')
      alert('Owner settings updated successfully')
      fetchSettings()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating')
    }
  }

  const inputClass = 'lux-input'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_400px]"
    >
      <div>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-route-yellow">Stall Email Configurations</h2>
          <button onClick={fetchSettings} className="text-sm text-dusk-grey underline hover:text-paper-cream">Refresh</button>
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-900/20 p-4 text-sm text-red-400 border border-red-500/20">{error}</div>}
        
        {loading ? <p className="text-dusk-grey">Loading stalls...</p> : (
          <div className="space-y-4">
            <AnimatePresence>
              {stalls.map(stall => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={stall._id}
                  className={`lux-card !p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${stall.status === 'Active' ? 'border-[rgba(212,175,55,0.2)]' : 'border-red-500/20 opacity-70'}`}
                >
                  <div>
                    <h4 className="font-display font-bold text-paper-cream">{stall.stallName}</h4>
                    <p className="text-xs text-route-yellow mt-1">{stall.email}</p>
                    <p className="text-xs text-dusk-grey mt-1">{stall.phone || 'No phone'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleToggleStallStatus(stall)} 
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${stall.status === 'Active' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                    >
                      {stall.status === 'Active' ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => handleDeleteStall(stall._id)} className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20">Delete</button>
                  </div>
                </motion.div>
              ))}
              {stalls.length === 0 && <p className="text-dusk-grey text-sm">No stalls configured. Table reservations will route to the owner email.</p>}
            </AnimatePresence>
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <div className="lux-card">
          <h3 className="mb-5 font-serif text-xl font-bold tracking-tight text-route-yellow">
            Add New Stall
          </h3>
          <form onSubmit={handleAddStall} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Stall Name (Matches Reservation Form)</label>
              <select 
                value={newStall.stallName} 
                onChange={e => setNewStall({ ...newStall, stallName: e.target.value })} 
                required 
                className={inputClass}
              >
                {availableStalls.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Email Address</label>
              <input type="email" value={newStall.email} onChange={e => setNewStall({ ...newStall, email: e.target.value })} required className={inputClass} placeholder="stall@example.com" />
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Phone (Optional)</label>
              <input value={newStall.phone} onChange={e => setNewStall({ ...newStall, phone: e.target.value })} className={inputClass} placeholder="Phone number" />
            </div>
            <button type="submit" className="btn-primary w-full">Add Stall</button>
          </form>
        </div>

        <div className="lux-card">
          <h3 className="mb-5 font-serif text-xl font-bold tracking-tight text-route-yellow">
            Owner Email Settings
          </h3>
          <p className="text-xs text-dusk-grey mb-4">Fallback for all events and unassigned stalls.</p>
          <form onSubmit={handleUpdateOwner} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Owner Name</label>
              <input value={ownerForm.ownerName} onChange={e => setOwnerForm({ ...ownerForm, ownerName: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Owner Email</label>
              <input type="email" value={ownerForm.email} onChange={e => setOwnerForm({ ...ownerForm, email: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Phone (Optional)</label>
              <input value={ownerForm.phone} onChange={e => setOwnerForm({ ...ownerForm, phone: e.target.value })} className={inputClass} />
            </div>
            <button type="submit" className="btn-primary w-full">Save Settings</button>
          </form>
        </div>
      </aside>
    </motion.div>
  )
}
