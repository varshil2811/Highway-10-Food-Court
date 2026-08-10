import { Router } from 'express'
import { getStalls, createStall, updateStall, deleteStall } from '../controllers/stallController.js'
import { getOwnerSetting, updateOwnerSetting } from '../controllers/ownerSettingController.js'

const router = Router()

import { requireAuth, requireRole } from '../middleware/auth.js'

const requireAdmin = [requireAuth, requireRole('super_admin')]

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
