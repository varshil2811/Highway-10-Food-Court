import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Stall from '../models/Stall.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    )

    const responseUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }

    if (user.role === 'stall_owner') {
      const stall = await Stall.findOne({ owner_id: user._id })
      if (stall) {
        responseUser.stallId = stall._id
      }
    }

    res.json({
      token,
      user: responseUser
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create Stall Owner (Super Admin only)
router.post('/users', requireAuth, requireRole('super_admin'), async (req, res) => {
  try {
    const { name, email, password, role, stallName } = req.body
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'stall_owner'
    })
    
    await newUser.save()

    if (stallName && newUser.role === 'stall_owner') {
      let stall = await Stall.findOne({ stallName })
      if (stall) {
        stall.owner_id = newUser._id
        await stall.save()
      } else {
        await Stall.create({
          stallName,
          email: newUser.email, // Use the stall owner's email as the default stall email
          owner_id: newUser._id
        })
      }
    }

    res.status(201).json({ message: 'User created successfully', user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get all users (Super Admin only)
router.get('/users', requireAuth, requireRole('super_admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
