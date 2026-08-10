import { useState, useEffect, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type UserItem = {
  _id: string
  name: string
  email: string
  role: string
}

type StallItem = {
  id: string
  name: string
}

export default function UsersTab({ token }: { token: string }) {
  const [users, setUsers] = useState<UserItem[]>([])
  const [stalls, setStalls] = useState<StallItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'stall_owner', stallName: '' })

  async function fetchUsersAndStalls() {
    try {
      setLoading(true)
      const [usersRes, metadataRes] = await Promise.all([
        fetch('/api/auth/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/menu/metadata')
      ])
      
      const usersData = await usersRes.json()
      if (!usersRes.ok) throw new Error(usersData.error || 'Failed to fetch users')
      setUsers(usersData)

      if (metadataRes.ok) {
        const metadata = await metadataRes.json()
        const availableStalls = (metadata.stalls || []).filter((s: StallItem) => s.id !== 'all')
        setStalls(availableStalls)
        if (availableStalls.length > 0 && !form.stallName) {
          setForm(f => ({ ...f, stallName: availableStalls[0].name }))
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsersAndStalls()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create user')
      }
      setForm({ name: '', email: '', password: '', role: 'stall_owner', stallName: stalls.length > 0 ? stalls[0].name : '' })
      fetchUsersAndStalls()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating user')
    }
  }

  const inputClass = 'w-full rounded-xl border border-[rgba(212,175,55,0.2)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-sm text-paper-cream outline-none transition-all placeholder:text-dusk-grey focus:border-route-yellow focus:bg-[rgba(212,175,55,0.05)]'

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
          <h2 className="font-serif text-2xl font-bold tracking-tight text-route-yellow">User Management</h2>
          <button onClick={fetchUsersAndStalls} className="text-sm text-dusk-grey underline hover:text-paper-cream">Refresh</button>
        </div>

        {loading ? <p className="text-dusk-grey">Loading users...</p> : (
          <div className="space-y-4">
            <AnimatePresence>
              {users.map(u => (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="lux-card !p-4 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-display font-bold text-paper-cream text-lg">{u.name}</h4>
                    <p className="text-sm text-dusk-grey">{u.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${u.role === 'super_admin' ? 'bg-route-yellow text-ink' : 'bg-white/10 text-paper-cream'}`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="lux-card">
          <h3 className="mb-5 font-serif text-xl font-bold tracking-tight text-route-yellow">
            Add New User
          </h3>
          {error && <div className="mb-4 rounded-xl bg-red-900/20 p-4 text-sm text-red-400 border border-red-500/20">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className={inputClass}>
                <option value="stall_owner">Stall Owner</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            {form.role === 'stall_owner' && (
              <div>
                <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Assign Stall</label>
                <select value={form.stallName} onChange={e => setForm({...form, stallName: e.target.value})} className={inputClass}>
                  {stalls.length === 0 && <option value="">No stalls found</option>}
                  {stalls.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="pt-2">
              <button type="submit" className="btn-primary w-full">Create User</button>
            </div>
          </form>
        </div>
      </aside>
    </motion.div>
  )
}
