const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

exports.sendOTP = async (email, otp, name) => {
  await transporter.sendMail({
    from: `"BioSecure Farm" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'BioSecure Farm - OTP Verification',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f8f9fa;padding:30px;border-radius:12px">
        <div style="background:linear-gradient(135deg,#0D6EFD,#28A745);padding:20px;border-radius:8px;text-align:center">
          <h1 style="color:white;margin:0">🐷🐔 BioSecure Farm</h1>
          <p style="color:rgba(255,255,255,0.9);margin:5px 0">AI & GIS Powered Livestock Health Management</p>
        </div>
        <div style="padding:30px;background:white;border-radius:8px;margin-top:15px">
          <h2 style="color:#333">Hello, ${name}!</h2>
          <p style="color:#666">Your OTP for verification is:</p>
          <div style="background:#0D6EFD;color:white;font-size:32px;font-weight:bold;text-align:center;padding:20px;border-radius:8px;letter-spacing:8px">${otp}</div>
          <p style="color:#999;font-size:12px;margin-top:15px">This OTP expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      </div>`
  });
};

exports.sendAlert = async (email, subject, message) => {
  await transporter.sendMail({
    from: `"BioSecure Farm Alerts" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `<div style="font-family:Arial,sans-serif;padding:20px"><h2 style="color:#dc3545">⚠️ ${subject}</h2><p>${message}</p></div>`
  });
};
