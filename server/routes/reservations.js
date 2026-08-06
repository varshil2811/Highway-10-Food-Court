import { Router } from 'express'
import Reservation from '../models/Reservation.js'
import { sendNotification } from '../utils/notify.js'

const router = Router()
const memoryStore = []

router.post('/', async (req, res) => {
  try {
    const { name, phone, partySize, date, time, notes = '' } = req.body

    if (!name || !phone || !partySize || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const payload = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      partySize: Number(partySize),
      date: String(date),
      time: String(time),
      notes: String(notes || ''),
    }

    let saved
    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      saved = await Reservation.create(payload)
    } else {
      saved = { ...payload, _id: `mem-${Date.now()}`, createdAt: new Date() }
      memoryStore.push(saved)
    }

    await sendNotification({
      subject: `Highway 10 reservation — ${payload.name}`,
      text: [
        `Name: ${payload.name}`,
        `Phone: ${payload.phone}`,
        `Party size: ${payload.partySize}`,
        `Date: ${payload.date}`,
        `Time: ${payload.time}`,
        `Notes: ${payload.notes || '—'}`,
      ].join('\n'),
    })

    res.status(201).json({
      ok: true,
      message: "We'll call to confirm your table.",
      id: saved._id,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not save reservation' })
  }
})

export default router
