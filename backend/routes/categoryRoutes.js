import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/get-categories', getCategories);
router.get('/get-category/:id', getCategoryById);

// Admin-only protected routes
router.post(
  '/create-category',
  protect,
  authorize('admin'),
  upload.single('image'),
  createCategory
);

router.put(
  '/update-category/:id',
  protect,
  authorize('admin'),
  upload.single('image'),
  updateCategory
);

router.delete(
  '/delete-category/:id',
  protect,
  authorize('admin'),
  deleteCategory
);

export default router;
