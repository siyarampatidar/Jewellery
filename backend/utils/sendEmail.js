import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for others
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"JEWELLERY" <noreply@JEWELLERY.com>',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`\x1b[36m%s\x1b[0m`, `✉ Email sent successfully to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`\x1b[31m%s\x1b[0m`, `✖ Email dispatch failed: ${error.message}`);
    // Do not throw the error globally to allow user registration in development even if email config is missing.
    // Instead, return false so the calling controller can log it or act accordingly.
    return false;
  }
};

export default sendEmail;
