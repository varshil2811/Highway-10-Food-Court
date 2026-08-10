import { useState, useEffect, type FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [stalls, setStalls] = useState<{id: string, name: string}[]>([])

  useEffect(() => {
    fetch('/api/menu/metadata')
      .then(res => res.json())
      .then(data => setStalls(data.stalls || []))
      .catch(console.error)
  }, [])

  const { register, handleSubmit, watch, resetField, reset } = useForm({
    defaultValues: {
      reservationType: 'Table Reservation',
      name: '', phone: '', email: '',
      partySize: 2, date: '', time: '',
      preferredStall: 'Any', seatingPreference: 'No Preference',
      preferredArea: '', decorationRequired: 'No', foodPackageRequired: 'No', duration: '', specialRequirements: '',
      eventName: '', eventCategory: '', stageSoundRequired: 'No',
      stallCategory: '', businessName: '', foodCategory: '', contactPerson: '', businessDescription: '', preferredStallSize: '', bookingDuration: '', requiredFacilities: '',
      subject: '', description: ''
    }
  })

  const type = watch('reservationType')

  // Reset hidden fields when type changes
  useEffect(() => {
    const fieldsToReset = [
      'partySize', 'date', 'time', 'preferredStall', 'seatingPreference',
      'preferredArea', 'decorationRequired', 'foodPackageRequired', 'duration', 'specialRequirements',
      'eventName', 'eventCategory', 'stageSoundRequired',
      'stallCategory', 'businessName', 'foodCategory', 'contactPerson', 'businessDescription', 'preferredStallSize', 'bookingDuration', 'requiredFacilities',
      'subject', 'description'
    ]
    fieldsToReset.forEach(field => resetField(field as any))
  }, [type, resetField])

  const submitReservation = async (data: any) => {
    setResStatus('loading')
    setResError('')

    let finalPartySize = 1;
    let finalDate = new Date().toISOString().split('T')[0];
    let finalTime = '12:00';
    let compiledNotes = '';

    const isEvent = ['Birthday Party', 'Anniversary Celebration', 'Family Gathering', 'Kitty Party', 'Corporate Meeting', 'Private Dining'].includes(type)

    if (type === 'Table Reservation') {
      finalPartySize = data.partySize || 1;
      finalDate = data.date || finalDate;
      finalTime = data.time || finalTime;
      compiledNotes = `[Type: Table Reservation]\nEmail: ${data.email || 'N/A'}\nPreferred Stall: ${data.preferredStall}\nSeating: ${data.seatingPreference}`;
    } else if (isEvent) {
      finalPartySize = data.partySize || 1;
      finalDate = data.date || finalDate;
      finalTime = data.time || finalTime;
      compiledNotes = `[Type: ${type}]\nEmail: ${data.email || 'N/A'}\nArea: ${data.preferredArea}\nDeco: ${data.decorationRequired}\nFood: ${data.foodPackageRequired}\nDuration: ${data.duration}\nSpecial: ${data.specialRequirements}`;
    } else if (type === 'Event Booking') {
      finalPartySize = data.partySize || 1;
      finalDate = data.date || finalDate;
      finalTime = data.time || finalTime;
      compiledNotes = `[Type: Event Booking]\nEmail: ${data.email || 'N/A'}\nEvent Name: ${data.eventName}\nCategory: ${data.eventCategory}\nDuration: ${data.duration}\nStage/Sound: ${data.stageSoundRequired}\nRequirements: ${data.specialRequirements}`;
    } else if (type === 'Stall Booking') {
      compiledNotes = `[Type: Stall Booking]\nEmail: ${data.email || 'N/A'}\nCategory: ${data.stallCategory}\nBusiness: ${data.businessName}\nFood: ${data.foodCategory}\nContact: ${data.contactPerson}\nDesc: ${data.businessDescription}\nSize: ${data.preferredStallSize}\nDuration: ${data.bookingDuration}\nFacilities: ${data.requiredFacilities}`;
    } else if (type === 'Other') {
      compiledNotes = `[Type: Other]\nEmail: ${data.email || 'N/A'}\nSubject: ${data.subject}\nDescription: ${data.description}`;
    }

    const body = {
      name: data.name,
      phone: data.phone,
      partySize: finalPartySize,
      date: finalDate,
      time: finalTime,
      notes: compiledNotes,
      reservationType: type,
      preferredStall: data.preferredStall,
      customerEmail: data.email,
    }

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const resData = await res.json()
      if (!res.ok) throw new Error(resData.error || 'Failed')
      setResStatus('success')
      reset()
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
      <ExitSection exit={3} title="Reserve / Contact" tone="light" className="!pt-28 md:!pt-36">
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
              
              <form className="mt-6 space-y-4" onSubmit={handleSubmit(submitReservation)}>
                <div>
                  <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Reservation Type</label>
                  <select {...register('reservationType')} className={inputClass} required>
                    <option value="Table Reservation">Table Reservation</option>
                    <option value="Birthday Party">Birthday Party</option>
                    <option value="Family Gathering">Family Gathering</option>
                    <option value="Corporate Meeting">Corporate Meeting</option>
                    <option value="Kitty Party">Kitty Party</option>
                    <option value="Anniversary Celebration">Anniversary Celebration</option>
                    <option value="Stall Booking">Stall Booking</option>
                    <option value="Event Booking">Event Booking</option>
                    <option value="Private Dining">Private Dining</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Full Name</label>
                    <input {...register('name')} required className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Mobile Number</label>
                    <input {...register('phone')} type="tel" required className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Email (Optional)</label>
                  <input {...register('email')} type="email" className={inputClass} />
                </div>

                <AnimatePresence mode="popLayout">
                  {type === 'Table Reservation' && (
                    <motion.div
                      key="table"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Guests</label>
                          <input {...register('partySize')} type="number" min={1} required className={inputClass} />
                        </div>
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Date</label>
                          <input {...register('date')} type="date" required className={inputClass} />
                        </div>
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Time</label>
                          <input {...register('time')} type="time" required className={inputClass} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Preferred Stall</label>
                          <select {...register('preferredStall')} className={inputClass}>
                            <option value="Any">Any Stall</option>
                            {stalls.filter(s => s.id !== 'all').map(s => (
                              <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Seating Preference</label>
                          <select {...register('seatingPreference')} className={inputClass}>
                            <option value="No Preference">No Preference</option>
                            <option value="Indoor">Indoor</option>
                            <option value="Outdoor">Outdoor</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {['Birthday Party', 'Anniversary Celebration', 'Family Gathering', 'Kitty Party', 'Corporate Meeting', 'Private Dining'].includes(type) && (
                    <motion.div
                      key="event"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Guests</label>
                          <input {...register('partySize')} type="number" min={1} required className={inputClass} />
                        </div>
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Date</label>
                          <input {...register('date')} type="date" required className={inputClass} />
                        </div>
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Time</label>
                          <input {...register('time')} type="time" required className={inputClass} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Preferred Area</label>
                          <input {...register('preferredArea')} className={inputClass} placeholder="e.g. Main Hall, Outdoor" />
                        </div>
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Duration (Hours)</label>
                          <input {...register('duration')} type="number" className={inputClass} placeholder="e.g. 3" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Decoration Required?</label>
                          <select {...register('decorationRequired')} className={inputClass}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Food Package?</label>
                          <select {...register('foodPackageRequired')} className={inputClass}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Special Requirements</label>
                        <textarea {...register('specialRequirements')} rows={2} className={inputClass} />
                      </div>
                    </motion.div>
                  )}

                  {type === 'Event Booking' && (
                    <motion.div
                      key="eventBooking"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Event Name</label>
                          <input {...register('eventName')} required className={inputClass} />
                        </div>
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Event Category</label>
                          <input {...register('eventCategory')} className={inputClass} placeholder="Music, Cultural, etc." />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Expected Guests</label>
                          <input {...register('partySize')} type="number" min={1} required className={inputClass} />
                        </div>
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Date</label>
                          <input {...register('date')} type="date" required className={inputClass} />
                        </div>
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Time</label>
                          <input {...register('time')} type="time" required className={inputClass} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Duration (Hours)</label>
                          <input {...register('duration')} type="number" className={inputClass} />
                        </div>
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Stage/Sound Required?</label>
                          <select {...register('stageSoundRequired')} className={inputClass}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Additional Requirements</label>
                        <textarea {...register('specialRequirements')} rows={2} className={inputClass} />
                      </div>
                    </motion.div>
                  )}

                  {type === 'Stall Booking' && (
                    <motion.div
                      key="stallBooking"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Business Name</label>
                          <input {...register('businessName')} required className={inputClass} />
                        </div>
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Contact Person</label>
                          <input {...register('contactPerson')} required className={inputClass} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Stall Category</label>
                          <input {...register('stallCategory')} className={inputClass} placeholder="Retail, Food, etc." />
                        </div>
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Food Category (if applicable)</label>
                          <input {...register('foodCategory')} className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Business Description</label>
                        <textarea {...register('businessDescription')} rows={2} className={inputClass} />
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Preferred Size</label>
                          <input {...register('preferredStallSize')} className={inputClass} placeholder="e.g. 10x10" />
                        </div>
                        <div>
                          <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Booking Duration</label>
                          <input {...register('bookingDuration')} className={inputClass} placeholder="e.g. 1 month" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Required Facilities (Electricity, Water, etc.)</label>
                        <textarea {...register('requiredFacilities')} rows={2} className={inputClass} />
                      </div>
                    </motion.div>
                  )}

                  {type === 'Other' && (
                    <motion.div
                      key="otherBooking"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div>
                        <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Subject</label>
                        <input {...register('subject')} required className={inputClass} />
                      </div>
                      <div>
                        <label className="mb-1.5 block font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-grey">Description</label>
                        <textarea {...register('description')} rows={4} required className={inputClass} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {resStatus === 'error' && (
                  <p className="text-sm text-route-yellow">{resError}</p>
                )}
                <button type="submit" disabled={resStatus === 'loading'} className="btn-primary">
                  {resStatus === 'loading' ? 'Sending…' : 'Submit Request'}
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
