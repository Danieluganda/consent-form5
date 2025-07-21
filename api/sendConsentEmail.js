import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  console.log("📩 API HIT: /api/sendConsentEmail");

  // 1. Ensure only POST requests
  if (req.method !== 'POST') {
    console.warn("⚠️ Method Not Allowed:", req.method);
    return res.status(405).send('Method Not Allowed');
  }

  const {
    userName,
    userAddress,
    userDate,
    witnessName,
    witnessAddress,
    witnessDate,
    userSignature,
    witnessSignature
  } = req.body;

  // 2. Check required fields
  if (
    !userName || !userAddress || !userDate ||
    !witnessName || !witnessAddress || !witnessDate
  ) {
    console.warn("⚠️ Missing form fields:", req.body);
    return res.status(400).send('Missing required form data.');
  }

  console.log("📝 Form Data Received:", {
    userName,
    userAddress,
    userDate,
    witnessName,
    witnessAddress,
    witnessDate
  });

  try {
    // 3. Create PDF
    console.log("📄 Generating PDF...");
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 700]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(`Consent Form Submission`, {
      x: 50,
      y: 650,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });

    const lines = [
      `Name: ${userName}`,
      `Address: ${userAddress}`,
      `Date: ${userDate}`,
      `Witness Name: ${witnessName}`,
      `Witness Address: ${witnessAddress}`,
      `Witness Date: ${witnessDate}`
    ];

    lines.forEach((text, idx) => {
      page.drawText(text, {
        x: 50,
        y: 620 - idx * 30,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
    });

    const pdfBytes = await pdfDoc.save();
    console.log("✅ PDF created successfully");

    // 4. Email configuration
    console.log("📬 Configuring email...");
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Consent Forms" <${process.env.EMAIL_USER}>`,
      to: 'destination-email@example.com', // TODO: Replace or receive from form
      subject: `Consent Form Submission - ${userName}`,
      text: 'Please find attached the consent form PDF.',
      attachments: [
        {
          filename: 'ConsentForm.pdf',
          content: Buffer.from(pdfBytes),
          contentType: 'application/pdf'
        }
      ]
    };

    // 5. Send email
    console.log("📤 Sending email to:", mailOptions.to);
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully");

    return res.status(200).send('Email with PDF sent!');
  } catch (error) {
    console.error("❌ Error in handler:", error);
    return res.status(500).send('Internal Server Error: Failed to send email with PDF.');
  }
}
