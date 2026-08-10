import Stall from '../models/Stall.js'

export const getStalls = async (req, res) => {
  try {
    const stalls = await Stall.find().sort({ stallName: 1 })
    res.json(stalls)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const createStall = async (req, res) => {
  try {
    const { stallName, email, phone, logo, status } = req.body
    
    // Check duplicate
    const existing = await Stall.findOne({ stallName: { $regex: new RegExp(`^${stallName}$`, 'i') } })
    if (existing) {
      return res.status(400).json({ error: 'A stall with this name already exists.' })
    }

    const newStall = new Stall({ stallName, email, phone, logo, status })
    const saved = await newStall.save()
    res.status(201).json(saved)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const updateStall = async (req, res) => {
  try {
    const { id } = req.params
    const updated = await Stall.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    if (!updated) return res.status(404).json({ error: 'Stall not found' })
    res.json(updated)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const deleteStall = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Stall.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ error: 'Stall not found' })
    res.json({ message: 'Stall deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
