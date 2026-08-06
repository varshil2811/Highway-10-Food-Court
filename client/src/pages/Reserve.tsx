import { useState, type FormEvent } from 'react'
import Seo from '../components/Seo'
import ExitSection from '../components/ExitSection'
import MapEmbed from '../components/MapEmbed'
import site from '../data/site.json'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function Reserve() {
  const [resStatus, setResStatus] = useState<Status>('idle')
  const [contactStatus, setContactStatus] = useState<Status>('idle')
  const [resError, setResError] = useState('')
  const [contactError, setContactError] = useState('')

  async function submitReservation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResStatus('loading')
    setResError('')
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name'),
      phone: fd.get('phone'),
      partySize: fd.get('partySize'),
      date: fd.get('date'),
      time: fd.get('time'),
      notes: fd.get('notes'),
    }
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResStatus('success')
      e.currentTarget.reset()
    } catch (err) {
      setResStatus('error')
      setResError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  async function submitContact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setContactStatus('loading')
    setContactError('')
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name'),
      phone: fd.get('phone'),
      email: fd.get('email'),
      message: fd.get('message'),
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setContactStatus('success')
      e.currentTarget.reset()
    } catch (err) {
      setContactStatus('error')
      setContactError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const inputClass = 'lux-input'

  return (
    <>
      <Seo
        title="Reserve & Contact"
        description="Reserve a table or send a message to Highway 10 Food Court, Jamnagar. We'll call to confirm."
        path="/reserve"
      />
      <ExitSection exit={3} title="Reserve / Contact" tone="light" className="!pt-8 md:!pt-12">
        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-dusk-grey">
          Food court seating — we&apos;ll call to confirm your preferred time. For same-day large
          groups, WhatsApp or call works fastest.
        </p>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="lux-card">
            <h3 className="font-serif text-xl font-bold tracking-tight text-route-yellow">
              Reserve a Table
            </h3>
            {resStatus === 'success' ? (
              <div className="mt-6 rounded-2xl border border-[rgba(212,175,55,0.35)] bg-asphalt/60 p-5">
                <p className="font-serif text-lg font-bold text-route-yellow">Request received</p>
                <p className="mt-2 text-sm text-dusk-grey">
                  We&apos;ll call to confirm your table. See you on SH-25.
                </p>
                <button
                  type="button"
                  className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-paper-cream underline"
                  onClick={() => setResStatus('idle')}
                >
                  Book another
                </button>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={submitReservation}>
                <div>
                  <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">
                    Name
                  </label>
                  <input name="name" required className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">
                    Phone
                  </label>
                  <input name="phone" type="tel" required className={inputClass} />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">
                      Party
                    </label>
                    <input
                      name="partySize"
                      type="number"
                      min={1}
                      max={40}
                      defaultValue={2}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">
                      Date
                    </label>
                    <input name="date" type="date" required className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">
                      Time
                    </label>
                    <input name="time" type="time" required className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className={inputClass}
                    placeholder="Occasion, preferences…"
                  />
                </div>
                {resStatus === 'error' && (
                  <p className="text-sm text-route-yellow">{resError}</p>
                )}
                <button type="submit" disabled={resStatus === 'loading'} className="btn-primary">
                  {resStatus === 'loading' ? 'Sending…' : 'Request Table'}
                </button>
              </form>
            )}
          </div>

          <div className="lux-card">
            <h3 className="font-serif text-xl font-bold tracking-tight text-route-yellow">
              Contact & Feedback
            </h3>
            <div className="mt-4 space-y-2 text-sm text-dusk-grey">
              <p>
                <a
                  href={`tel:${site.phoneRaw}`}
                  className="font-body text-paper-cream transition-colors hover:text-route-yellow"
                >
                  {site.phone}
                </a>
              </p>
              <p>
                <a
                  href={`https://wa.me/${site.phoneRaw}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-route-yellow transition-opacity hover:opacity-80"
                >
                  WhatsApp chat →
                </a>
              </p>
              <p className="text-xs leading-relaxed">{site.address}</p>
              <p className="font-body text-xs">{site.hours}</p>
            </div>

            {contactStatus === 'success' ? (
              <div className="mt-6 rounded-2xl border border-[rgba(212,175,55,0.35)] bg-asphalt/60 p-5">
                <p className="font-serif text-lg font-bold text-route-yellow">Message sent</p>
                <p className="mt-2 text-sm text-dusk-grey">
                  Thanks — we&apos;ll get back to you soon.
                </p>
                <button
                  type="button"
                  className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-paper-cream underline"
                  onClick={() => setContactStatus('idle')}
                >
                  Send another
                </button>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={submitContact}>
                <div>
                  <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">
                    Name
                  </label>
                  <input name="name" required className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">
                    Phone
                  </label>
                  <input name="phone" type="tel" required className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">
                    Email (optional)
                  </label>
                  <input name="email" type="email" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">
                    Message
                  </label>
                  <textarea name="message" rows={4} required className={inputClass} />
                </div>
                {contactStatus === 'error' && (
                  <p className="text-sm text-route-yellow">{contactError}</p>
                )}
                <button type="submit" disabled={contactStatus === 'loading'} className="btn-ghost">
                  {contactStatus === 'loading' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-14">
          <h3 className="mb-5 font-serif text-xl font-bold tracking-tight">Location</h3>
          <MapEmbed height="h-80" />
        </div>
      </ExitSection>
    </>
  )
}
