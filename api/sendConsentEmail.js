import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
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
    witnessSignature,
  } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Consent Forms" <${process.env.EMAIL_USER}>`,
    to: process.env.DESTINATION_EMAIL,
    subject: `New Consent Form Submission by ${userName}`,
    html: `
      <h3>Consent Form Submission</h3>
      <p><b>Name:</b> ${userName}</p>
      <p><b>Address:</b> ${userAddress}</p>
      <p><b>Date:</b> ${userDate}</p>
      <p><b>Witness Name:</b> ${witnessName}</p>
      <p><b>Witness Address:</b> ${witnessAddress}</p>
      <p><b>Witness Date:</b> ${witnessDate}</p>
      <p><b>User Signature:</b><br><img src="${userSignature}" width="300" /></p>
      <p><b>Witness Signature:</b><br><img src="${witnessSignature}" width="300" /></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent!");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
}
