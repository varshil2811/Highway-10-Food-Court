import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v2 as cloudinary } from 'cloudinary'
import GalleryItem from '../models/GalleryItem.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadDir = path.join(__dirname, '../public/uploads') // kept for legacy fallback

const router = Router()

// Configure Multer memory storage
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max for short videos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'video/mp4' || file.mimetype === 'video/webm') {
      cb(null, true)
    } else {
      cb(new Error('Only images and mp4/webm videos are allowed'))
    }
  }
})

// Middleware to check admin password
const requireAdmin = [requireAuth, requireRole('super_admin')]

// GET all gallery items
router.get('/', async (req, res) => {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 })
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST upload new gallery media
router.post('/', requireAdmin, upload.array('media', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Media files are required' })
    }

    const { alt, category } = req.body
    const uploadedItems = []

    for (const file of req.files) {
      // Wrap upload stream in a Promise
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto', folder: 'highway10' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });

      const media_type = uploadResult.resource_type === 'video' ? 'video' : 'image'
      
      const newItem = new GalleryItem({ 
        src: uploadResult.secure_url, 
        alt, 
        category, 
        media_type,
        publicId: uploadResult.public_id,
        fileFormat: uploadResult.format,
        fileSize: uploadResult.bytes
      })
      await newItem.save()
      uploadedItems.push(newItem)
    }

    res.status(201).json(uploadedItems)
  } catch (error) {
    console.error('Cloudinary Upload Error:', error)
    res.status(400).json({ error: error.message || 'Upload failed' })
  }
})

// DELETE gallery item
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const itemToDelete = await GalleryItem.findById(req.params.id)
    if (!itemToDelete) return res.status(404).json({ error: 'Item not found' })

    // Try deleting from Cloudinary if it's hosted there
    if (itemToDelete.publicId) {
      // resource_type must match 'image' or 'video' for Cloudinary destroy to work properly
      const resourceType = itemToDelete.media_type === 'video' ? 'video' : 'image'
      await cloudinary.uploader.destroy(itemToDelete.publicId, { resource_type: resourceType })
    } else if (itemToDelete.src.startsWith('/uploads/')) {
      // Legacy fallback for local files
      const filename = path.basename(itemToDelete.src)
      const filepath = path.join(uploadDir, filename)
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
    }

    await GalleryItem.findByIdAndDelete(req.params.id)

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
