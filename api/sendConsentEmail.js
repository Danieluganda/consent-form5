import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
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

  try {
    // Create PDF
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

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Consent Forms" <${process.env.EMAIL_USER}>`,
      to: 'destination-email@example.com',
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

    await transporter.sendMail(mailOptions);
    res.status(200).send('Email with PDF sent!');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Failed to send email with PDF.');
  }
}
