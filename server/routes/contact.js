import { Router } from 'express'
import ContactMessage from '../models/ContactMessage.js'
import { sendNotification } from '../utils/notify.js'

const router = Router()

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

    const saved = await ContactMessage.create(payload)

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

// GET all contact messages (admin only)
router.get('/', async (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'highway10admin'
  const providedPassword = req.headers['x-admin-password']

  if (providedPassword !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 })
    res.json(messages)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
