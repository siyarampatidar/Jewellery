/**
 * Elegant Gold & White Email Template Wrapper
 */
const emailWrapper = (title, content) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #fcfcfc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border: 1px solid #f0f0f0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          }
          .header {
            background-color: #1a1a1a;
            padding: 40px 20px;
            text-align: center;
            border-bottom: 3px solid #eab308; /* Yellow/Gold Accent */
          }
          .logo {
            font-size: 26px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: 2px;
            margin: 0;
            text-transform: uppercase;
          }
          .logo span {
            color: #eab308;
          }
          .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
          }
          h1 {
            font-size: 22px;
            font-weight: 600;
            color: #111111;
            margin-top: 0;
            margin-bottom: 20px;
          }
          p {
            font-size: 15px;
            margin-bottom: 24px;
            color: #555555;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 30px;
            background-color: #eab308;
            color: #000000 !important;
            font-weight: 600;
            text-decoration: none;
            border-radius: 6px;
            font-size: 15px;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 10px rgba(234, 179, 8, 0.2);
            transition: all 0.2s ease;
          }
          .otp-box {
            background-color: #fafafa;
            border: 1px dashed #eab308;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px auto;
            max-width: 250px;
          }
          .otp-code {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #111111;
            margin: 0;
          }
          .footer {
            background-color: #fafafa;
            padding: 25px 20px;
            text-align: center;
            border-top: 1px solid #eeeeee;
            font-size: 12px;
            color: #777777;
          }
          .footer-logo {
            font-weight: 600;
            color: #444444;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 class="logo">JEWELLERY</h2>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <div class="footer-logo">JEWELLERY Ltd.</div>
            <p style="font-size: 12px; margin: 0; color: #999999;">
              This is an automated security transmission. If you did not initiate this request, please ignore this email or secure your account.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const getOtpTemplate = (name, otpCode) => {
  const content = `
    <h1>Verify Your Account</h1>
    <p>Dear ${name},</p>
    <p>Thank you for creating an account with JEWELLERY. To finalize your registration and secure your profile, please verify your email address using the one-time passcode (OTP) below. This OTP is valid for 15 minutes.</p>
    
    <div class="otp-box">
      <h3 class="otp-code">${otpCode}</h3>
    </div>
    
    <p>Once verified, you will have complete access to view our curated collection and manage your profile details.</p>
  `;
  return emailWrapper('Verify Your Email - JEWELLERY', content);
};

export const getResetTemplate = (name, resetUrl) => {
  const content = `
    <h1>Reset Password Request</h1>
    <p>Dear ${name},</p>
    <p>You are receiving this email because a request was submitted to reset the password for your account on JEWELLERY. Please click the button below to complete the process. This link is valid for 15 minutes.</p>
    
    <div class="button-container">
      <a href="${resetUrl}" target="_blank" class="button">Reset Password</a>
    </div>
    
    <p>If you cannot click the button above, copy and paste the following URL into your browser:</p>
    <p style="word-break: break-all; font-size: 13px; color: #888888;">${resetUrl}</p>
    
    <p>If you did not request this, your password will remain unchanged.</p>
  `;
  return emailWrapper('Reset Password - JEWELLERY', content);
};
