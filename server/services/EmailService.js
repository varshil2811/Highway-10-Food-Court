import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendReservationEmail = async (to, reservationData) => {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.warn('[EmailService] SMTP credentials missing or invalid in .env. Email will NOT be sent.')
    return
  }

  const { name, phone, customerEmail, partySize, date, time, notes, reservationType, preferredStall } = reservationData

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #D4AF37; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #0b0b0b;">Highway 10 Food Court</h1>
      </div>
      <div style="padding: 30px; background-color: #f9f9f9;">
        <h2 style="color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">New Reservation Request</h2>
        <p><strong>Customer Name:</strong> ${name}</p>
        <p><strong>Phone Number:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${customerEmail || 'Not provided'}</p>
        <p><strong>Reservation Type:</strong> ${reservationType}</p>
        ${reservationType === 'Table Reservation' ? `<p><strong>Selected Stall:</strong> ${preferredStall}</p>` : ''}
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Number of Guests:</strong> ${partySize}</p>
        <div style="margin-top: 20px; background-color: #fff; padding: 15px; border-left: 4px solid #D4AF37;">
          <h4 style="margin-top: 0; margin-bottom: 10px;">Details & Special Requests:</h4>
          <pre style="white-space: pre-wrap; font-family: inherit; margin: 0; color: #555;">${notes}</pre>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #888;">Submitted Time: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: `"Highway 10 Notifications" <${process.env.SMTP_USER}>`,
      to,
      subject: `New Reservation Request: ${reservationType}`,
      html: htmlContent,
    })
    console.log(`[EmailService] Admin Notification Email sent successfully to ${to}. Message ID: ${info.messageId}`)
    return info
  } catch (error) {
    console.error(`[EmailService] Failed to send admin email to ${to}:`, error)
    throw error
  }
}

export const sendCustomerPendingEmail = async (reservationData) => {
  const { customerEmail, name, reservationType, preferredStall } = reservationData
  if (!customerEmail || !process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') return

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #D4AF37; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #0b0b0b;">Highway 10 Food Court</h1>
      </div>
      <div style="padding: 30px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Reservation Request Received</h2>
        <p>Hello ${name},</p>
        <p>Your reservation request has been received and is currently <strong>pending confirmation</strong>.</p>
        <p><strong>Type:</strong> ${reservationType}</p>
        ${reservationType === 'Table Reservation' ? `<p><strong>Stall:</strong> ${preferredStall}</p>` : ''}
        <p>We will notify you once your reservation is confirmed.</p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"Highway 10" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: 'Reservation Request Received - Highway 10',
      html: htmlContent,
    })
  } catch (error) {
    console.error(`[EmailService] Failed to send pending email to ${customerEmail}:`, error)
  }
}

export const sendCustomerStatusEmail = async (reservationData) => {
  const { customerEmail, name, reservationType, preferredStall, status, date, time, partySize } = reservationData
  if (!customerEmail || !process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') return

  const isAccepted = status === 'Accepted'
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #D4AF37; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #0b0b0b;">Highway 10 Food Court</h1>
      </div>
      <div style="padding: 30px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Reservation ${isAccepted ? 'Confirmed' : 'Update'}</h2>
        <p>Hello ${name},</p>
        <p>${isAccepted ? 'Great news! Your reservation has been confirmed.' : 'Unfortunately, your reservation could not be confirmed at this time. Please try another time or contact us for further assistance.'}</p>
        
        ${isAccepted ? `
        <div style="margin-top: 20px; background-color: #fff; padding: 15px; border-left: 4px solid #D4AF37;">
          <p><strong>Type:</strong> ${reservationType}</p>
          ${reservationType === 'Table Reservation' ? `<p><strong>Stall:</strong> ${preferredStall}</p>` : ''}
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Guests:</strong> ${partySize}</p>
        </div>
        ` : ''}
        
        <p style="margin-top: 20px;">Thank you for choosing Highway 10!</p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"Highway 10" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Reservation ${isAccepted ? 'Confirmed' : 'Update'} - Highway 10`,
      html: htmlContent,
    })
  } catch (error) {
    console.error(`[EmailService] Failed to send status email to ${customerEmail}:`, error)
  }
}
