import OwnerSetting from '../models/OwnerSetting.js'

export const getOwnerSetting = async (req, res) => {
  try {
    let setting = await OwnerSetting.findOne()
    if (!setting) {
      // Create a default one if it doesn't exist
      setting = new OwnerSetting({
        ownerName: 'Highway10 Owner',
        email: 'owner@highway10.com',
      })
      await setting.save()
    }
    res.json(setting)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateOwnerSetting = async (req, res) => {
  try {
    let setting = await OwnerSetting.findOne()
    if (!setting) {
      setting = new OwnerSetting(req.body)
      await setting.save()
      return res.json(setting)
    }

    const updated = await OwnerSetting.findByIdAndUpdate(setting._id, req.body, { new: true, runValidators: true })
    res.json(updated)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
