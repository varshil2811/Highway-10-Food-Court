import 'dotenv/config'
import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import MenuItem from './models/MenuItem.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('No MONGODB_URI in .env')
    process.exit(1)
  }

  try {
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')

    // Read menu.json
    const menuPath = path.join(__dirname, '../client/src/data/menu.json')
    const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'))
    const items = menuData.items

    // Clear existing
    await MenuItem.deleteMany({})
    console.log('Cleared existing menu items')

    // Insert
    await MenuItem.insertMany(items.map(item => ({
      name: item.name,
      description: item.description,
      stall: item.stall,
      category: item.category,
      veg: item.veg || false,
      jain: item.jain || false,
      bestseller: item.bestseller || false,
      price: item.price || '₹ —'
    })))
    
    console.log(`Successfully seeded ${items.length} menu items`)
    process.exit(0)
  } catch (err) {
    console.error('Error seeding:', err)
    process.exit(1)
  }
}

seed()
