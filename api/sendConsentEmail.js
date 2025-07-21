import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default async function handler(req, res) {
  console.log("📩 API HIT: /api/sendConsentEmail");

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
    witnessDate
  } = req.body;

  console.log("📝 Received Form Data:", {
    userName,
    userAddress,
    userDate,
    witnessName,
    witnessAddress,
    witnessDate
  });

  try {
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

    console.log("📄 PDF created successfully");

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=ConsentForm.pdf');
    return res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    return res.status(500).send('Failed to generate PDF');
  }
}
