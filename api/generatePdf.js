import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const {
      userName,
      userAddress,
      userDate,
      witnessName,
      witnessAddress,
      witnessDate
    } = req.body;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();
    const fontSize = 12;

    const lines = [
      `Consent Form Submission`,
      ``,
      `User Name: ${userName}`,
      `User Address: ${userAddress}`,
      `User Date: ${userDate}`,
      ``,
      `Witness Name: ${witnessName}`,
      `Witness Address: ${witnessAddress}`,
      `Witness Date: ${witnessDate}`,
    ];

    let y = height - 50;
    lines.forEach((line) => {
      page.drawText(line, {
        x: 50,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 20;
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=consent-form.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('PDF generation failed:', err);
    res.status(500).send('Failed to generate PDF');
  }
}
