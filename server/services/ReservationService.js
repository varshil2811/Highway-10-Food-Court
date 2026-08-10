import Stall from '../models/Stall.js'
import OwnerSetting from '../models/OwnerSetting.js'
import { sendReservationEmail, sendCustomerPendingEmail, sendCustomerStatusEmail } from './EmailService.js'

export const processNewReservation = async (reservationData) => {
  try {
    const { reservationType, preferredStall } = reservationData
    let targetEmail = null

    if (reservationType === 'Table Reservation' && preferredStall && preferredStall !== 'Any') {
      // Find the stall email
      const stall = await Stall.findOne({ stallName: preferredStall, status: 'Active' })
      if (stall && stall.email) {
        targetEmail = stall.email
        console.log(`[ReservationService] Routing to stall email: ${targetEmail}`)
      } else {
        console.warn(`[ReservationService] Stall '${preferredStall}' not found, inactive, or missing email. Falling back to owner.`)
      }
    }

    if (!targetEmail) {
      // Fallback to Owner Email
      const owner = await OwnerSetting.findOne({ status: 'Active' })
      if (owner && owner.email) {
        targetEmail = owner.email
        console.log(`[ReservationService] Routing to owner email: ${targetEmail}`)
      } else {
        console.error(`[ReservationService] CRITICAL: No active owner email configured to receive reservations.`)
      }
    }

    // Send the admin notification email
    if (targetEmail) {
      await sendReservationEmail(targetEmail, reservationData)
    }

    // Send the customer pending email
    if (reservationData.customerEmail) {
      await sendCustomerPendingEmail(reservationData)
    }

  } catch (error) {
    console.error('[ReservationService] Error processing new reservation email:', error)
  }
}

export const sendStatusUpdateEmail = async (reservationData) => {
  try {
    await sendCustomerStatusEmail(reservationData)
  } catch (error) {
    console.error('[ReservationService] Error sending status update email:', error)
  }
}
