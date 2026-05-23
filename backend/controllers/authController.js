import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import {
  getOtpTemplate,
  getResetTemplate,
} from "../templates/emailTemplates.js";
import {
  validateRegisterInput,
  validateLoginInput,
  validateResetPasswordInput,
} from "../validators/authValidator.js";

// Send token utility to set HTTP-only cookie
const sendTokenResponse = (user, statusCode, res, rememberMe = false) => {
  const token = generateToken(user._id, rememberMe);

  // Set cookie option
  const cookieOptions = {
    expires: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000), // 30 days or 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  // Convert mongoose object and strip security fields
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    isVerified: user.isVerified,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
  };

  res.status(statusCode).cookie("token", token, cookieOptions).json({
    success: true,
    token,
    user: userResponse,
  });
};

/**
 * @desc    Register new user & dispatch email verification OTP
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const errorMsg = validateRegisterInput(req.body);
    if (errorMsg) {
      return res.status(400).json({ success: false, message: errorMsg });
    }

    const { name, email, mobile, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { mobile }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "An account with this email or mobile number already exists.",
      });
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // Create new unverified user
    const user = await User.create({
      name,
      email,
      mobile,
      password, // hashed automatically via user schema pre-save hook
      otpCode,
      otpExpires,
      isVerified: false,
    });

    // Send verification OTP email
    const emailHtml = getOtpTemplate(name, otpCode);
    const emailSent = await sendEmail({
      to: email,
      subject: "Verify Your Email Address - JEWELLERY",
      html: emailHtml,
    });

    res.status(201).json({
      success: true,
      message:
        "Registration initiated. A 6-digit verification code was sent to your email.",
      email,
      emailSent: !!emailSent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify registration OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP code are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification request." });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Account is already verified. Please log in.",
        });
    }

    // Check if OTP matches and is not expired
    if (user.otpCode !== otp || new Date() > user.otpExpires) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or expired verification OTP.",
        });
    }

    // Mark as verified and clear OTP columns
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    // Log user in automatically after verifying
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend registration verification OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No account found with this email." });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account is already verified." });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send email
    const emailHtml = getOtpTemplate(user.name, otpCode);
    const emailSent = await sendEmail({
      to: email,
      subject: "New Verification Code - JEWELLERY",
      html: emailHtml,
    });

    res.status(200).json({
      success: true,
      message:
        "A fresh 6-digit verification code has been dispatched to your email.",
      emailSent: !!emailSent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate User/Admin and issue token cookie
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const errorMsg = validateLoginInput(req.body);
    if (errorMsg) {
      return res.status(400).json({ success: false, message: errorMsg });
    }

    const { identifier, password, rememberMe } = req.body;

    // Search by email or mobile number
    const user = await User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }],
    }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    // Verify account verification status
    if (!user.isVerified) {
      // Generate OTP and send so they can complete verification
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpCode = otpCode;
      user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      // Dispatch verification email
      const emailHtml = getOtpTemplate(user.name, otpCode);
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email Address - JEWELLERY",
        html: emailHtml,
      });

      return res.status(403).json({
        success: false,
        message:
          "Your account is unverified. A verification OTP was sent to your email.",
        unverified: true,
        email: user.email,
      });
    }

    // Check if account is deactivated by admin
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
        deactivated: true,
      });
    }

    sendTokenResponse(user, 200, res, rememberMe);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out current user & clear token cookies
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = async (req, res, next) => {
  try {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request password reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide a valid email address.",
        });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't confirm if user exists, but we can return success with general message
      return res.status(200).json({
        success: true,
        message:
          "If that email address exists in our records, a reset password link has been dispatched.",
      });
    }

    // Generate random reset token using crypto
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token and set inside DB
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    // Send reset email
    const emailHtml = getResetTemplate(user.name, resetUrl);
    const emailSent = await sendEmail({
      to: user.email,
      subject: "Password Reset Request - JEWELLERY",
      html: emailHtml,
    });

    res.status(200).json({
      success: true,
      message:
        "If that email address exists in our records, a reset password link has been dispatched.",
      emailSent: !!emailSent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using reset token
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const errorMsg = validateResetPasswordInput(req.body);
    if (errorMsg) {
      return res.status(400).json({ success: false, message: errorMsg });
    }

    const { password } = req.body;

    // Encrypt parameter token to match database record
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "The reset link is invalid or has expired.",
      });
    }

    // Set new password (will be hashed automatically via user schema hook)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password updated successfully. You can now log in with your new credentials.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get details of currently authenticated user session
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    // req.user has already been fetched by the 'protect' middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
