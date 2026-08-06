import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import MenuItem from '../models/MenuItem.js'
import MenuMetadata from '../models/MenuMetadata.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

// Initialize in-memory store from JSON
let memoryStore = []
let memoryMetadata = { stalls: [], categories: [], galleryCategories: [] }
try {
  const menuPath = path.join(__dirname, '../../client/src/data/menu.json')
  const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'))
  memoryMetadata.stalls = menuData.stalls || []
  memoryMetadata.categories = menuData.categories || []
  memoryMetadata.galleryCategories = (menuData.galleryCategories && menuData.galleryCategories.length > 0) ? menuData.galleryCategories : [
    { id: 'ambience', name: 'Ambience' },
    { id: 'food', name: 'Food' },
    { id: 'events-nights', name: 'Events/Nights' }
  ]
  memoryStore = menuData.items.map(item => ({
    ...item,
    _id: item.id || `mem-${Date.now()}-${Math.random()}`
  }))
} catch (err) {
  console.warn('Could not load initial memory store from menu.json', err.message)
}

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
  if (process.env.MONGODB_URI && globalThis.__dbReady) {
    let metadata = await MenuMetadata.findOne({ type: 'config' })
    if (!metadata) {
      metadata = new MenuMetadata({
        type: 'config',
        stalls: memoryMetadata.stalls,
        categories: memoryMetadata.categories,
        galleryCategories: memoryMetadata.galleryCategories || []
      })
      await metadata.save()
    }
    return metadata
  }
  return memoryMetadata
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

    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      const metadata = await getMenuMetadata()
      if (metadata.stalls.some(s => s.id === id)) {
        return res.status(400).json({ error: 'Stall already exists' })
      }
      metadata.stalls.push({ id, name })
      await metadata.save()
      res.status(201).json(metadata.stalls)
    } else {
      if (memoryMetadata.stalls.some(s => s.id === id)) {
        return res.status(400).json({ error: 'Stall already exists' })
      }
      memoryMetadata.stalls.push({ id, name })
      res.status(201).json(memoryMetadata.stalls)
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// POST add a new category
router.post('/metadata/category', requireAdmin, async (req, res) => {
  try {
    const { id, name } = req.body
    if (!id || !name) return res.status(400).json({ error: 'id and name required' })

    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      const metadata = await getMenuMetadata()
      if (metadata.categories.some(c => c.id === id)) {
        return res.status(400).json({ error: 'Category already exists' })
      }
      metadata.categories.push({ id, name })
      await metadata.save()
      res.status(201).json(metadata.categories)
    } else {
      if (memoryMetadata.categories.some(c => c.id === id)) {
        return res.status(400).json({ error: 'Category already exists' })
      }
      memoryMetadata.categories.push({ id, name })
      res.status(201).json(memoryMetadata.categories)
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE a stall
router.delete('/metadata/stall/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    if (id === 'all') return res.status(400).json({ error: 'Cannot delete the "all" stall' })

    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      const metadata = await getMenuMetadata()
      metadata.stalls = metadata.stalls.filter(s => s.id !== id)
      await metadata.save()
      res.json(metadata.stalls)
    } else {
      memoryMetadata.stalls = memoryMetadata.stalls.filter(s => s.id !== id)
      res.json(memoryMetadata.stalls)
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE a category
router.delete('/metadata/category/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    if (id === 'all') return res.status(400).json({ error: 'Cannot delete the "all" category' })

    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      const metadata = await getMenuMetadata()
      metadata.categories = metadata.categories.filter(c => c.id !== id)
      await metadata.save()
      res.json(metadata.categories)
    } else {
      memoryMetadata.categories = memoryMetadata.categories.filter(c => c.id !== id)
      res.json(memoryMetadata.categories)
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST add a new gallery category
router.post('/metadata/galleryCategory', requireAdmin, async (req, res) => {
  try {
    const { id, name } = req.body
    if (!id || !name) return res.status(400).json({ error: 'id and name required' })

    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      const metadata = await getMenuMetadata()
      if (!metadata.galleryCategories) metadata.galleryCategories = []
      if (metadata.galleryCategories.some(c => c.id === id)) {
        return res.status(400).json({ error: 'Gallery category already exists' })
      }
      metadata.galleryCategories.push({ id, name })
      await metadata.save()
      res.status(201).json(metadata.galleryCategories)
    } else {
      if (!memoryMetadata.galleryCategories) memoryMetadata.galleryCategories = []
      if (memoryMetadata.galleryCategories.some(c => c.id === id)) {
        return res.status(400).json({ error: 'Gallery category already exists' })
      }
      memoryMetadata.galleryCategories.push({ id, name })
      res.status(201).json(memoryMetadata.galleryCategories)
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE a gallery category
router.delete('/metadata/galleryCategory/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    if (id === 'all') return res.status(400).json({ error: 'Cannot delete the "all" category' })

    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      const metadata = await getMenuMetadata()
      if (metadata.galleryCategories) {
        metadata.galleryCategories = metadata.galleryCategories.filter(c => c.id !== id)
        await metadata.save()
      }
      res.json(metadata.galleryCategories || [])
    } else {
      if (memoryMetadata.galleryCategories) {
        memoryMetadata.galleryCategories = memoryMetadata.galleryCategories.filter(c => c.id !== id)
      }
      res.json(memoryMetadata.galleryCategories || [])
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET all menu items
router.get('/', async (req, res) => {
  try {
    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      const items = await MenuItem.find().sort({ createdAt: -1 })
      res.json(items)
    } else {
      res.json(memoryStore)
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST new menu item
router.post('/', requireAdmin, async (req, res) => {
  try {
    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      const newItem = new MenuItem(req.body)
      await newItem.save()
      res.status(201).json(newItem)
    } else {
      const newItem = { ...req.body, _id: `mem-${Date.now()}` }
      memoryStore.unshift(newItem)
      res.status(201).json(newItem)
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT update menu item
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      const updatedItem = await MenuItem.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      )
      if (!updatedItem) return res.status(404).json({ error: 'Item not found' })
      res.json(updatedItem)
    } else {
      const idx = memoryStore.findIndex(i => i._id === req.params.id || i.id === req.params.id)
      if (idx === -1) return res.status(404).json({ error: 'Item not found' })
      memoryStore[idx] = { ...memoryStore[idx], ...req.body }
      res.json(memoryStore[idx])
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE menu item
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    if (process.env.MONGODB_URI && globalThis.__dbReady) {
      const deletedItem = await MenuItem.findByIdAndDelete(req.params.id)
      if (!deletedItem) return res.status(404).json({ error: 'Item not found' })
      res.json({ message: 'Item deleted successfully' })
    } else {
      const initialLength = memoryStore.length
      memoryStore = memoryStore.filter(i => i._id !== req.params.id && i.id !== req.params.id)
      if (memoryStore.length === initialLength) return res.status(404).json({ error: 'Item not found' })
      res.json({ message: 'Item deleted successfully' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
