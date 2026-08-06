import mongoose from 'mongoose'

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '' },
    message: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.model('ContactMessage', contactMessageSchema)
