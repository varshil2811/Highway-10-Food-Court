import './loadEnv.js'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import reservationsRouter from './routes/reservations.js'
import contactRouter from './routes/contact.js'
import menuRouter from './routes/menu.js'
import galleryRouter from './routes/gallery.js'
import reviewsRouter from './routes/reviews.js'
import adminEmailsRouter from './routes/adminEmails.js'
import authRouter from './routes/auth.js'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcrypt'
import User from './models/User.js'

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
app.use('/api/auth', authRouter)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  })
}
async function ensureSuperAdmin() {
  const adminEmail = process.env.SMTP_USER || 'admin@highway10.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'highway10admin'
  
  const existingAdmin = await User.findOne({ role: 'super_admin' })
  if (!existingAdmin) {
    console.log('No super admin found. Creating default super admin...')
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    await User.create({
      name: 'Super Admin',
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: 'super_admin'
    })
    console.log(`Default super admin created with email: ${adminEmail}`)
  }
}

async function start() {
  const uri = process.env.MONGODB_URI
  if (uri) {
    try {
      await mongoose.connect(uri)
      globalThis.__dbReady = true
      console.log('MongoDB connected')
      await ensureSuperAdmin()
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
