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
    media_type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    },
    publicId: {
      type: String,
      default: null
    },
    fileFormat: {
      type: String,
      default: null
    },
    fileSize: {
      type: Number,
      default: null
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
