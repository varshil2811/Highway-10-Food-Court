import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
    req.user = await User.findById(decoded.userId).select('-password')
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' })
    }
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' })
  }
}

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Not logged in' })
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' })
    }
    next()
  }
}
