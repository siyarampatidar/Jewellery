import express from 'express';
import {
  updateProfile,
  changePassword,
  uploadProfileImage,
  removeProfileImage,
  getAllUsers,
  getSingleUser,
  adminUpdateUser,
  toggleUserStatus,
  adminDeleteUser,
} from '../controllers/userController.js';
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addressController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// All routes require login
router.use(protect);

router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/profile-image', upload.single('image'), uploadProfileImage);
router.delete('/profile-image', removeProfileImage);

// Address Subroutes
router.post('/addresses', addAddress);
router.get('/addresses', getAddresses);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.put('/addresses/:id/default', setDefaultAddress);

// Admin-only User Management routes
router.get('/admin', authorize('admin'), getAllUsers);
router.get('/admin/:id', authorize('admin'), getSingleUser);
router.put('/admin/:id', authorize('admin'), upload.single('image'), adminUpdateUser);
router.put('/admin/:id/status', authorize('admin'), toggleUserStatus);
router.delete('/admin/:id', authorize('admin'), adminDeleteUser);

export default router;

