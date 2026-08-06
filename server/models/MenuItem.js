import mongoose from 'mongoose'

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    stall: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    veg: {
      type: Boolean,
      default: false,
    },
    jain: {
      type: Boolean,
      default: false,
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    price: {
      type: String,
      default: '₹ —',
      trim: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model('MenuItem', menuItemSchema)
