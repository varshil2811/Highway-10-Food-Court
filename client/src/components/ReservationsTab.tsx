import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type ReservationItem = {
  _id: string
  name: string
  customerEmail: string
  phone: string
  partySize: number
  date: string
  time: string
  notes: string
  reservationType: string
  preferredStall: string
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled'
  stall_id: string | null
}

export default function ReservationsTab({ token, role }: { token: string, role: string }) {
  const [reservations, setReservations] = useState<ReservationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled'>('All')

  async function fetchReservations() {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/reservations', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch reservations')
      setReservations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching reservations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  async function updateStatus(id: string, newStatus: string) {
    if (!window.confirm(`Are you sure you want to mark this as ${newStatus}?`)) return
    try {
      const res = await fetch(`/api/reservations/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }
      fetchReservations()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating status')
    }
  }

  const filtered = filter === 'All' ? reservations : reservations.filter(r => r.status === filter)
  
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'Pending').length,
    accepted: reservations.filter(r => r.status === 'Accepted').length,
    rejected: reservations.filter(r => r.status === 'Rejected').length,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-route-yellow">Reservations</h2>
        <button onClick={fetchReservations} className="text-sm text-dusk-grey underline hover:text-paper-cream self-start sm:self-auto">Refresh</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="lux-card !p-4 flex flex-col items-center justify-center">
          <span className="text-3xl font-serif text-paper-cream">{stats.total}</span>
          <span className="text-xs font-display text-dusk-grey uppercase tracking-wider mt-1">Total</span>
        </div>
        <div className="lux-card !p-4 flex flex-col items-center justify-center border border-route-yellow/30 bg-route-yellow/5">
          <span className="text-3xl font-serif text-route-yellow">{stats.pending}</span>
          <span className="text-xs font-display text-route-yellow uppercase tracking-wider mt-1">Pending</span>
        </div>
        <div className="lux-card !p-4 flex flex-col items-center justify-center border border-green-500/30 bg-green-500/5">
          <span className="text-3xl font-serif text-green-400">{stats.accepted}</span>
          <span className="text-xs font-display text-green-400 uppercase tracking-wider mt-1">Accepted</span>
        </div>
        <div className="lux-card !p-4 flex flex-col items-center justify-center border border-red-500/30 bg-red-500/5">
          <span className="text-3xl font-serif text-red-400">{stats.rejected}</span>
          <span className="text-xs font-display text-red-400 uppercase tracking-wider mt-1">Rejected</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['All', 'Pending', 'Accepted', 'Rejected', 'Cancelled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`rounded-full px-4 py-1.5 font-display text-xs font-semibold transition-colors ${filter === f
              ? 'bg-[rgba(212,175,55,0.2)] text-route-yellow border border-route-yellow/50'
              : 'border border-[rgba(212,175,55,0.2)] text-dusk-grey hover:text-route-yellow'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <div className="rounded-xl bg-red-900/20 p-4 text-sm text-red-400 border border-red-500/20">{error}</div>}
      
      {loading ? (
        <p className="text-dusk-grey">Loading reservations...</p>
      ) : filtered.length === 0 ? (
        <div className="lux-card py-12 text-center text-dusk-grey">
          No reservations found for this filter.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map(res => (
              <motion.div
                key={res._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="lux-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-display font-bold text-paper-cream text-lg leading-tight">{res.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      res.status === 'Pending' ? 'bg-route-yellow/20 text-route-yellow' :
                      res.status === 'Accepted' ? 'bg-green-500/20 text-green-400' :
                      res.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {res.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 text-sm text-paper-cream/80 mb-4">
                    <p><span className="text-dusk-grey">Type:</span> {res.reservationType}</p>
                    {res.reservationType === 'Table Reservation' && (
                       <p><span className="text-dusk-grey">Stall:</span> {res.preferredStall}</p>
                    )}
                    <p><span className="text-dusk-grey">Date/Time:</span> {res.date} at {res.time}</p>
                    <p><span className="text-dusk-grey">Guests:</span> {res.partySize}</p>
                    <p><span className="text-dusk-grey">Email:</span> {res.customerEmail}</p>
                    <p><span className="text-dusk-grey">Phone:</span> {res.phone}</p>
                    {res.notes && <p className="mt-2 text-xs italic bg-white/5 p-2 rounded">"{res.notes}"</p>}
                  </div>
                </div>

                {res.status === 'Pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                    <button onClick={() => updateStatus(res._id, 'Accepted')} className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 py-2 rounded-lg text-xs font-bold transition-colors">Accept</button>
                    <button onClick={() => updateStatus(res._id, 'Rejected')} className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 py-2 rounded-lg text-xs font-bold transition-colors">Reject</button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
