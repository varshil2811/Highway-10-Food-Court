import mongoose from 'mongoose'

const reservationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    partySize: { type: Number, required: true, min: 1, max: 40 },
    date: { type: String, required: true },
    time: { type: String, required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Reservation', reservationSchema)
