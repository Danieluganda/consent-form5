import formidable from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Form parsing error:", err);
      return res.status(500).send("Form parsing failed");
    }

    const file = files.pdf;
    if (!file) {
      return res.status(400).send("No PDF file uploaded");
    }

    const driveForm = new FormData();
    driveForm.append('file', fs.createReadStream(file.filepath));
    driveForm.append('filename', file.originalFilename || 'ConsentForm.pdf');

    try {
      const driveRes = await fetch('https://script.google.com/macros/s/AKfycbzaXScfliiZSZxh0h_co_i4fCjYW7rmvTBdfYYygFz0F2KL8QXCEJC6GKak_vSpWte1bA/exec', {
        method: 'POST',
        body: driveForm,
      });

      const text = await driveRes.text();
      console.log("✅ Drive response:", text);
      return res.status(200).send("✅ Consent form sent to Drive.");
    } catch (err) {
      console.error("❌ Error uploading to Drive:", err);
      return res.status(500).send("Drive upload failed.");
    }
  });
}
