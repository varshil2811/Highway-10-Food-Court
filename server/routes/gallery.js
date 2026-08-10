import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import GalleryItem from '../models/GalleryItem.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only images are allowed'))
    }
  }
})

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

// GET all gallery items
router.get('/', async (req, res) => {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 })
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST upload new gallery image
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' })
    }

    const { alt, category } = req.body

    // The client will request this image from /uploads/...
    const src = `/uploads/${req.file.filename}`

    const newItem = new GalleryItem({ src, alt, category })
    await newItem.save()
    res.status(201).json(newItem)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE gallery item
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const itemToDelete = await GalleryItem.findById(req.params.id)
    if (!itemToDelete) return res.status(404).json({ error: 'Item not found' })

    await GalleryItem.findByIdAndDelete(req.params.id)

    // Try to delete the file if it's in the uploads folder
    if (itemToDelete.src.startsWith('/uploads/')) {
      const filename = path.basename(itemToDelete.src)
      const filepath = path.join(uploadDir, filename)
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
    }

    res.json({ message: 'Gallery item deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update gallery item (e.g. assign homePosition)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { homePosition } = req.body

    const item = await GalleryItem.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Item not found' })

    if (homePosition !== undefined) {
      if (homePosition !== null) {
        // Unset this position from any other item
        await GalleryItem.updateMany({ homePosition }, { $set: { homePosition: null } })
      }
      item.homePosition = homePosition
    }

    await item.save()
    res.json(item)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
