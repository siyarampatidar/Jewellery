import Category from '../models/Category.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * @desc    Create a new Category
 * @route   POST /api/categories/create-category
 * @access  Private/Admin
 */
export const createCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    // Check if category name already exists (case-insensitive)
    const existingCategory = await Category.findOne({
      categoryName: { $regex: new RegExp(`^${categoryName.trim()}$`, 'i') },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists.',
      });
    }

    let categoryImage = { url: '', public_id: '' };

    // Upload to Cloudinary if image is uploaded
    if (req.file) {
      console.log(`Uploading category image to Cloudinary for: ${categoryName}`);
      const cloudinaryResult = await uploadToCloudinary(
        req.file.buffer,
        'cjp_categories',
        [
          { width: 600, height: 600, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'webp' }
        ]
      );
      categoryImage = {
        url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
      };
    }

    let parsedSubcategories = [];
    if (req.body.subcategories) {
      try {
        if (typeof req.body.subcategories === 'string') {
          const parsed = JSON.parse(req.body.subcategories);
          if (Array.isArray(parsed)) {
            parsedSubcategories = parsed
              .map((sub) => ({
                subcategoryName: typeof sub === 'string' ? sub.trim() : (sub.subcategoryName || '').trim(),
              }))
              .filter((sub) => sub.subcategoryName !== '');
          }
        } else if (Array.isArray(req.body.subcategories)) {
          parsedSubcategories = req.body.subcategories
            .map((sub) => ({
              subcategoryName: typeof sub === 'string' ? sub.trim() : (sub.subcategoryName || '').trim(),
            }))
            .filter((sub) => sub.subcategoryName !== '');
        }
      } catch (e) {
        console.error('Error parsing subcategories:', e);
      }
    }

    const newCategory = new Category({
      categoryName: categoryName.trim(),
      categoryImage,
      subcategories: parsedSubcategories,
    });

    const savedCategory = await newCategory.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: savedCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all categories
 * @route   GET /api/categories/get-categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single category by ID
 * @route   GET /api/categories/get-category/:id
 * @access  Public
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing Category
 * @route   PUT /api/categories/update-category/:id
 * @access  Private/Admin
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categoryName } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    // If updating category name, validate it
    if (categoryName && categoryName.trim() !== category.categoryName) {
      // Check for duplicate name (case-insensitive) excluding current category ID
      const duplicateCategory = await Category.findOne({
        _id: { $ne: id },
        categoryName: { $regex: new RegExp(`^${categoryName.trim()}$`, 'i') },
      });

      if (duplicateCategory) {
        return res.status(400).json({
          success: false,
          message: 'Another category with this name already exists.',
        });
      }

      category.categoryName = categoryName.trim();
    }

    // Handle Image upload & replacement
    if (req.file) {
      const oldPublicId = category.categoryImage?.public_id;

      console.log(`Uploading updated category image to Cloudinary for: ${category.categoryName}`);
      const cloudinaryResult = await uploadToCloudinary(
        req.file.buffer,
        'cjp_categories',
        [
          { width: 600, height: 600, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'webp' }
        ]
      );

      category.categoryImage = {
        url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
      };

      // Clean up the old image from Cloudinary asynchronously
      if (oldPublicId) {
        deleteFromCloudinary(oldPublicId).catch((err) =>
          console.error('Failed to delete old category image from Cloudinary:', err)
        );
      }
    }

    // Handle Subcategories Update
    if (req.body.subcategories !== undefined) {
      try {
        let parsedSubcategories = [];
        if (typeof req.body.subcategories === 'string') {
          const parsed = JSON.parse(req.body.subcategories);
          if (Array.isArray(parsed)) {
            parsedSubcategories = parsed
              .map((sub) => ({
                subcategoryName: typeof sub === 'string' ? sub.trim() : (sub.subcategoryName || '').trim(),
              }))
              .filter((sub) => sub.subcategoryName !== '');
          }
        } else if (Array.isArray(req.body.subcategories)) {
          parsedSubcategories = req.body.subcategories
            .map((sub) => ({
              subcategoryName: typeof sub === 'string' ? sub.trim() : (sub.subcategoryName || '').trim(),
            }))
            .filter((sub) => sub.subcategoryName !== '');
        }
        category.subcategories = parsedSubcategories;
      } catch (e) {
        console.error('Error parsing subcategories in update:', e);
      }
    }

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      category: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a Category
 * @route   DELETE /api/categories/delete-category/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    const publicId = category.categoryImage?.public_id;

    // Delete category from database
    await Category.findByIdAndDelete(id);

    // Delete image from Cloudinary if it exists
    if (publicId) {
      deleteFromCloudinary(publicId).catch((err) =>
        console.error('Failed to delete category image from Cloudinary:', err)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
