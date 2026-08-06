import mongoose from 'mongoose'

const metadataItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true }
  },
  { _id: false }
)

const menuMetadataSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'config' },
    stalls: [metadataItemSchema],
    categories: [metadataItemSchema],
    galleryCategories: [metadataItemSchema]
  },
  { timestamps: true }
)

export default mongoose.model('MenuMetadata', menuMetadataSchema)
