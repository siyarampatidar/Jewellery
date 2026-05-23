import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import bcrypt from 'bcryptjs';

/**
 * @desc    Update basic user profile details (Name, Mobile)
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, mobile } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Perform validation
    if (name && name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Full name must be at least 2 characters.' });
    }

    if (mobile && !/^\+?[1-9]\d{1,14}$/.test(mobile.replace(/\s+/g, ''))) {
      return res.status(400).json({ success: false, message: 'Invalid mobile number format.' });
    }

    // Check if mobile number already taken by another user
    if (mobile && mobile !== user.mobile) {
      const mobileExists = await User.findOne({ mobile });
      if (mobileExists) {
        return res.status(400).json({ success: false, message: 'This mobile number is already linked to another account.' });
      }
      user.mobile = mobile;
    }

    if (name) user.name = name;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile details updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Find user with password selected
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Validate old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'The current password you entered is incorrect.' });
    }

    // Update password
    user.password = newPassword; // hashed by schema pre-save hook
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload / Update profile image
 * @route   POST /api/users/profile-image
 * @access  Private
 */
export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please provide an image file to upload.' });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Save current image public_id for post-upload cleaning
    const oldPublicId = user.profileImage?.public_id;

    // Upload new buffer directly to Cloudinary
    console.log(`Uploading profile image to Cloudinary for user: ${user.email}`);
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

    // Save url and public_id to user model
    user.profileImage = {
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
    };

    const updatedUser = await user.save();

    // Clean up old image from Cloudinary asynchronously
    if (oldPublicId) {
      deleteFromCloudinary(oldPublicId).catch((err) =>
        console.error('Async deletion of old image failed:', err)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded and updated successfully.',
      profileImage: updatedUser.profileImage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove profile image
 * @route   DELETE /api/users/profile-image
 * @access  Private
 */
export const removeProfileImage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const publicId = user.profileImage?.public_id;

    if (!publicId) {
      return res.status(400).json({ success: false, message: 'No profile image found to delete.' });
    }

    // Delete image on Cloudinary
    await deleteFromCloudinary(publicId);

    // Clear db columns
    user.profileImage = { url: '', public_id: '' };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all registered users (Admin only)
 * @route   GET /api/users/admin
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get details of a single user (Admin only)
 * @route   GET /api/users/admin/:id
 * @access  Private/Admin
 */
export const getSingleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update any user's profile details (Admin only)
 * @route   PUT /api/users/admin/:id
 * @access  Private/Admin
 */
export const adminUpdateUser = async (req, res, next) => {
  try {
    const { name, email, mobile } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Validation checks
    if (name && name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Full name must be at least 2 characters.' });
    }

    if (email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (mobile && !/^\+?[1-9]\d{1,14}$/.test(mobile.replace(/\s+/g, ''))) {
      return res.status(400).json({ success: false, message: 'Invalid mobile number format.' });
    }

    // Check email availability
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'This email is already linked to another account.' });
      }
      user.email = email.toLowerCase();
    }

    // Check mobile availability
    if (mobile && mobile !== user.mobile) {
      const mobileExists = await User.findOne({ mobile });
      if (mobileExists) {
        return res.status(400).json({ success: false, message: 'This mobile number is already linked to another account.' });
      }
      user.mobile = mobile;
    }

    if (name) user.name = name.trim();

    // Check if new profile image is uploaded
    if (req.file) {
      const oldPublicId = user.profileImage?.public_id;

      // Upload buffer directly to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

      user.profileImage = {
        url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
      };

      // Delete old photo in background
      if (oldPublicId) {
        deleteFromCloudinary(oldPublicId).catch((err) =>
          console.error('Async deletion of old user photo failed:', err)
        );
      }
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'User details updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user status (Active/Deactivated) (Admin only)
 * @route   PUT /api/users/admin/:id/status
 * @access  Private/Admin
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Safety check: block deactivating own account
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Security Lockout Warning: You cannot deactivate your own administrative account.',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Toggle logic: if user is explicitly deactivated (false), activate them (true). Otherwise, deactivate them (false).
    user.isActive = user.isActive === false ? true : false;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been successfully ${user.isActive ? 'activated' : 'deactivated'}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user account (Admin only)
 * @route   DELETE /api/users/admin/:id
 * @access  Private/Admin
 */
export const adminDeleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Safety check: block deleting own account
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Security Lockout Warning: You cannot delete your own administrative account.',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Clean up photo on Cloudinary if present
    const publicId = user.profileImage?.public_id;
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User account has been permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};

