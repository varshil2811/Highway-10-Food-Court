import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quote: {
      type: String,
      required: true,
      trim: true,
    },
    meta: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Review', reviewSchema)
