import { Router } from 'express'
import ContactMessage from '../models/ContactMessage.js'
import { sendNotification } from '../utils/notify.js'

const router = Router()
const memoryStore = []

router.post('/', async (req, res) => {
  try {
    const { name, phone, email = '', message } = req.body

    if (!name || !phone || !message) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const payload = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: String(email || '').trim(),
      message: String(message).trim(),
    }

    let saved
    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      saved = await ContactMessage.create(payload)
    } else {
      saved = { ...payload, _id: `mem-${Date.now()}`, createdAt: new Date() }
      memoryStore.push(saved)
    }

    await sendNotification({
      subject: `Highway 10 contact — ${payload.name}`,
      text: [
        `Name: ${payload.name}`,
        `Phone: ${payload.phone}`,
        `Email: ${payload.email || '—'}`,
        `Message: ${payload.message}`,
      ].join('\n'),
    })

    res.status(201).json({
      ok: true,
      message: 'Thanks — we got your message and will reply soon.',
      id: saved._id,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not send message' })
  }
})

export default router
