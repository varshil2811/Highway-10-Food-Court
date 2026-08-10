import { Router } from 'express'
import Reservation from '../models/Reservation.js'
import Stall from '../models/Stall.js'
import { processNewReservation, sendStatusUpdateEmail } from '../services/ReservationService.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// POST create a reservation
router.post('/', async (req, res) => {
  try {
    const reservationData = { ...req.body }
    
    // Map preferredStall string to stall_id
    if (reservationData.reservationType === 'Table Reservation' && reservationData.preferredStall && reservationData.preferredStall !== 'Any') {
      const stall = await Stall.findOne({ stallName: reservationData.preferredStall })
      if (stall) {
        reservationData.stall_id = stall._id
      }
    }

    const newReservation = new Reservation(reservationData)
    const saved = await newReservation.save()
    
    // Background tasks: email stall owner/admin AND email customer (pending)
    processNewReservation(saved).catch(err => console.error('[Reservations] Background email error:', err))
    
    res.status(201).json(saved)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// GET all reservations (role-based)
router.get('/', requireAuth, async (req, res) => {
  try {
    let query = {}
    
    if (req.user.role === 'stall_owner') {
      // Find the stall owned by this user
      const stall = await Stall.findOne({ owner_id: req.user._id })
      if (!stall) {
        // Owner has no stall assigned, return empty array
        return res.json([])
      }
      query.stall_id = stall._id
    }

    const reservations = await Reservation.find(query).sort({ createdAt: -1 })
    res.json(reservations)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update reservation status
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body
    if (!['Pending', 'Accepted', 'Rejected', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const reservation = await Reservation.findById(req.params.id)
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' })
    }

    // Role-based authorization
    if (req.user.role === 'stall_owner') {
      const stall = await Stall.findOne({ owner_id: req.user._id })
      if (!stall || reservation.stall_id?.toString() !== stall._id.toString()) {
        return res.status(403).json({ error: 'Forbidden: You do not have access to this reservation' })
      }
    }

    reservation.status = status
    await reservation.save()

    // Send status update email to customer
    if (reservation.customerEmail && (status === 'Accepted' || status === 'Rejected')) {
      sendStatusUpdateEmail(reservation).catch(err => console.error('[Reservations] Background status email error:', err))
    }

    res.json(reservation)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
