import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Review from '../models/Review.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

import { requireAuth, requireRole } from '../middleware/auth.js'

const requireAdmin = [requireAuth, requireRole('super_admin')]

// GET all reviews (Public)
router.get('/', async (req, res) => {
  try {
    let reviews = await Review.find().sort({ createdAt: -1 })

    // Seed logic: if no reviews exist in DB AT ALL, pull from testimonials.json
    if (reviews.length === 0) {
      try {
        const testimonialsPath = path.join(__dirname, '../../client/src/data/testimonials.json')
        if (fs.existsSync(testimonialsPath)) {
          const testimonialsData = JSON.parse(fs.readFileSync(testimonialsPath, 'utf-8'))
          
          if (Array.isArray(testimonialsData) && testimonialsData.length > 0) {
            // Seed to DB
            const docs = testimonialsData.map(t => ({
              name: t.name,
              quote: t.quote,
              meta: t.meta
            }))
            await Review.insertMany(docs)
            reviews = await Review.find().sort({ createdAt: -1 })
          }
        }
      } catch (err) {
        console.warn('Could not read testimonials.json for seeding', err.message)
      }
    }

    res.json(reviews)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create a review (Public)
router.post('/', async (req, res) => {
  try {
    const { name, quote, meta } = req.body
    if (!name || !quote) {
      return res.status(400).json({ error: 'Name and quote are required' })
    }

    const newReview = new Review({ name, quote, meta })
    const saved = await newReview.save()
    res.status(201).json(saved)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE a review (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Review not found' })
    res.json({ message: 'Review deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
