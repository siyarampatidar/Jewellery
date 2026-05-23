import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/get-products', getProducts);
router.get('/get-product/:id', getProductById);

// Admin protected routes (Multer accepts up to 3 files on field name 'images')
router.post(
  '/create-product',
  protect,
  authorize('admin'),
  upload.array('images', 3),
  createProduct
);

router.put(
  '/update-product/:id',
  protect,
  authorize('admin'),
  upload.array('images', 3),
  updateProduct
);

router.delete(
  '/delete-product/:id',
  protect,
  authorize('admin'),
  deleteProduct
);

export default router;
