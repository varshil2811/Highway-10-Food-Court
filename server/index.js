import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import reservationsRouter from './routes/reservations.js'
import contactRouter from './routes/contact.js'
import menuRouter from './routes/menu.js'
import galleryRouter from './routes/gallery.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

globalThis.__dbReady = false

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  })
)
app.use(express.json())

app.use('/api/health', (_req, res) => {
  res.json({ ok: true, db: globalThis.__dbReady })
})

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

app.use('/api/reservations', reservationsRouter)
app.use('/api/contact', contactRouter)
app.use('/api/menu', menuRouter)
app.use('/api/gallery', galleryRouter)

async function start() {
  const uri = process.env.MONGODB_URI
  if (uri) {
    try {
      await mongoose.connect(uri)
      globalThis.__dbReady = true
      console.log('MongoDB connected')
    } catch (err) {
      console.warn('MongoDB unavailable — using in-memory store:', err.message)
    }
  } else {
    console.warn('No MONGODB_URI — using in-memory store')
  }

  app.listen(PORT, () => {
    console.log(`Highway 10 API on http://localhost:${PORT}`)
  })
}

start()
