import mongoose from 'mongoose'

const galleryItemSchema = new mongoose.Schema(
  {
    src: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      trim: true,
      default: 'Highway 10 Gallery Image',
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    homePosition: {
      type: Number,
      default: null,
      min: 1,
      max: 6
    }
  },
  { timestamps: true }
)

export default mongoose.model('GalleryItem', galleryItemSchema)
