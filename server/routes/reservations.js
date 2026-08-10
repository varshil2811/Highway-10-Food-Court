import { Router } from 'express'
import Reservation from '../models/Reservation.js'
import { processNewReservation } from '../services/ReservationService.js'

const router = Router()

// POST create a reservation
router.post('/', async (req, res) => {
  try {
    const newReservation = new Reservation(req.body)
    const saved = await newReservation.save()
    
    // Call the email service asynchronously so it doesn't block the API response
    processNewReservation(saved).catch(err => console.error('[Reservations Router] Background email error:', err))
    
    res.status(201).json(saved)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// GET all reservations (admin only)
router.get('/', async (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'highway10admin'
  const providedPassword = req.headers['x-admin-password']

  if (providedPassword !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 })
    res.json(reservations)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
