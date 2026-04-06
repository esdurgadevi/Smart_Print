import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
  },
});

export const sendOrderCompletedEmail = async (email, orderId, shopName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Order Completed - ${shopName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-w-md mx-auto; p-6 text-gray-800">
          <h2 style="color: #ea580c;">Great News!</h2>
          <p>Your print order <strong>#${orderId.toString().padStart(4, '0')}</strong> from <strong>${shopName}</strong> has been successfully printed and marked as completed.</p>
          <p>You can now pick up your documents from the shop.</p>
          <br/>
          <p>We'd love to hear about your experience! Please log into the platform to leave a quick 5-star review for ${shopName}.</p>
          <br/>
          <p style="color: #6b7280; font-size: 12px;">Thank you for using PrintHub.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order completed email sent to ${email}`);
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
  }
};
