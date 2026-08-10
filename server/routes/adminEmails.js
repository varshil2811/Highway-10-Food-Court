import { Router } from 'express'
import { getStalls, createStall, updateStall, deleteStall } from '../controllers/stallController.js'
import { getOwnerSetting, updateOwnerSetting } from '../controllers/ownerSettingController.js'

const router = Router()

// Middleware to check admin password
const requireAdmin = (req, res, next) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'highway10admin'
  const providedPassword = req.headers['x-admin-password']

  if (providedPassword === adminPassword) {
    next()
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid admin password' })
  }
}

// Apply admin middleware to all routes in this file
router.use(requireAdmin)

// Stall Routes
router.get('/stalls', getStalls)
router.post('/stalls', createStall)
router.put('/stalls/:id', updateStall)
router.delete('/stalls/:id', deleteStall)

// Owner Setting Routes
router.get('/owner', getOwnerSetting)
router.put('/owner', updateOwnerSetting)

export default router
