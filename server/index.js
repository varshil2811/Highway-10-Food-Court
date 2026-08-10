import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import reservationsRouter from './routes/reservations.js'
import contactRouter from './routes/contact.js'
import menuRouter from './routes/menu.js'
import galleryRouter from './routes/gallery.js'
import reviewsRouter from './routes/reviews.js'
import adminEmailsRouter from './routes/adminEmails.js'
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
app.use('/api/reviews', reviewsRouter)
app.use('/api/admin/emails', adminEmailsRouter)

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Highway 10 API on http://localhost:${PORT}`)
  })
}

start()

// Trigger nodemon restart

// Trigger nodemon restart

// Restart nodemon again

// Nodemon reload

// Restart nodemon again

// nodemon reload 3

// nodemon reload 4

// Triggering restart again for new password
