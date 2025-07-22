import formidable from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const logToFile = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  const logPath = path.join(process.cwd(), 'log.txt');
  fs.appendFileSync(logPath, logMessage);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    const msg = "❌ Method Not Allowed";
    logToFile(msg);
    return res.status(405).send(msg);
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      const msg = `❌ Form parsing error: ${err.message}`;
      console.error(msg);
      logToFile(msg);
      return res.status(500).send("Form parsing failed");
    }

    const file = files.pdf;
    if (!file) {
      const msg = "❌ No PDF file uploaded";
      logToFile(msg);
      return res.status(400).send(msg);
    }

    const driveForm = new FormData();
    driveForm.append('file', fs.createReadStream(file.filepath));
    driveForm.append('filename', file.originalFilename || 'ConsentForm.pdf');

    logToFile(`📄 File ready: ${file.originalFilename}, Path: ${file.filepath}`);

    try {
      const driveRes = await fetch('https://script.google.com/macros/s/AKfycbzaXScfliiZSZxh0h_co_i4fCjYW7rmvTBdfYYygFz0F2KL8QXCEJC6GKak_vSpWte1bA/exec', {
        method: 'POST',
        body: driveForm,
      });

      const text = await driveRes.text();
      logToFile(`✅ Drive response: ${text}`);
      console.log("✅ Drive response:", text);
      return res.status(200).send("✅ Consent form sent to Drive.");
    } catch (err) {
      const errorMsg = `❌ Error uploading to Drive: ${err.message}`;
      console.error(errorMsg);
      logToFile(errorMsg);
      return res.status(500).send("Drive upload failed.");
    }
  });
}
