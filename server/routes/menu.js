import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import MenuItem from '../models/MenuItem.js'
import MenuMetadata from '../models/MenuMetadata.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only images are allowed'))
    }
  }
})

// Middleware to check admin password for mutating routes
const requireAdmin = (req, res, next) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'highway10admin'
  const providedPassword = req.headers['x-admin-password']

  if (providedPassword === adminPassword) {
    next()
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid admin password' })
  }
}

// Helper to get metadata document
async function getMenuMetadata() {
  let metadata = await MenuMetadata.findOne({ type: 'config' })
  if (!metadata) {
    // Read from menu.json to seed defaults if DB is completely empty
    let seedStalls = []
    let seedCategories = []
    let seedGalleryCategories = [
      { id: 'ambience', name: 'Ambience' },
      { id: 'food', name: 'Food' },
      { id: 'events-nights', name: 'Events/Nights' }
    ]
    
    try {
      const menuPath = path.join(__dirname, '../../client/src/data/menu.json')
      const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'))
      seedStalls = menuData.stalls || []
      seedCategories = menuData.categories || []
      if (menuData.galleryCategories && menuData.galleryCategories.length > 0) {
        seedGalleryCategories = menuData.galleryCategories
      }
    } catch (err) {
      console.warn('Could not read menu.json for seeding', err.message)
    }

    metadata = new MenuMetadata({
      type: 'config',
      stalls: seedStalls,
      categories: seedCategories,
      galleryCategories: seedGalleryCategories
    })
    await metadata.save()
  }
  return metadata
}

// GET metadata (stalls and categories)
router.get('/metadata', async (req, res) => {
  try {
    const metadata = await getMenuMetadata()
    res.json({ stalls: metadata.stalls, categories: metadata.categories, galleryCategories: metadata.galleryCategories || [] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST add a new stall
router.post('/metadata/stall', requireAdmin, async (req, res) => {
  try {
    const { id, name } = req.body
    if (!id || !name) return res.status(400).json({ error: 'id and name required' })

    const metadata = await getMenuMetadata()
    if (metadata.stalls.some(s => s.id === id)) {
      return res.status(400).json({ error: 'Stall already exists' })
    }
    metadata.stalls.push({ id, name })
    await metadata.save()
    res.status(201).json(metadata.stalls)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// POST add a new category
router.post('/metadata/category', requireAdmin, async (req, res) => {
  try {
    const { id, name } = req.body
    if (!id || !name) return res.status(400).json({ error: 'id and name required' })

    const metadata = await getMenuMetadata()
    if (metadata.categories.some(c => c.id === id)) {
      return res.status(400).json({ error: 'Category already exists' })
    }
    metadata.categories.push({ id, name })
    await metadata.save()
    res.status(201).json(metadata.categories)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE a stall
router.delete('/metadata/stall/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    if (id === 'all') return res.status(400).json({ error: 'Cannot delete the "all" stall' })

    const metadata = await getMenuMetadata()
    metadata.stalls = metadata.stalls.filter(s => s.id !== id)
    await metadata.save()
    res.json(metadata.stalls)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE a category
router.delete('/metadata/category/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    if (id === 'all') return res.status(400).json({ error: 'Cannot delete the "all" category' })

    const metadata = await getMenuMetadata()
    metadata.categories = metadata.categories.filter(c => c.id !== id)
    await metadata.save()
    res.json(metadata.categories)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST add a new gallery category
router.post('/metadata/galleryCategory', requireAdmin, async (req, res) => {
  try {
    const { id, name } = req.body
    if (!id || !name) return res.status(400).json({ error: 'id and name required' })

    const metadata = await getMenuMetadata()
    if (!metadata.galleryCategories) metadata.galleryCategories = []
    if (metadata.galleryCategories.some(c => c.id === id)) {
      return res.status(400).json({ error: 'Gallery category already exists' })
    }
    metadata.galleryCategories.push({ id, name })
    await metadata.save()
    res.status(201).json(metadata.galleryCategories)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE a gallery category
router.delete('/metadata/galleryCategory/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    if (id === 'all') return res.status(400).json({ error: 'Cannot delete the "all" category' })

    const metadata = await getMenuMetadata()
    if (metadata.galleryCategories) {
      metadata.galleryCategories = metadata.galleryCategories.filter(c => c.id !== id)
      await metadata.save()
    }
    res.json(metadata.galleryCategories || [])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET all menu items
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 })
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST new menu item
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body }
    // Convert string booleans to actual booleans
    if (data.veg !== undefined) data.veg = data.veg === 'true'
    if (data.jain !== undefined) data.jain = data.jain === 'true'
    if (data.bestseller !== undefined) data.bestseller = data.bestseller === 'true'

    if (req.file) {
      data.image = `/uploads/${req.file.filename}`
    }

    const newItem = new MenuItem(data)
    await newItem.save()
    res.status(201).json(newItem)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT update menu item
router.put('/:id', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body }
    if (data.veg !== undefined) data.veg = data.veg === 'true'
    if (data.jain !== undefined) data.jain = data.jain === 'true'
    if (data.bestseller !== undefined) data.bestseller = data.bestseller === 'true'

    if (req.file) {
      data.image = `/uploads/${req.file.filename}`
    }

    const updated = await MenuItem.findByIdAndUpdate(req.params.id, data, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE menu item
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id)
    if (!deletedItem) return res.status(404).json({ error: 'Item not found' })
    res.json({ message: 'Item deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
