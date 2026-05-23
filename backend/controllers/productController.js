import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * @desc    Create a new Product
 * @route   POST /api/products/create-product
 * @access  Private/Admin
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      productName,
      category,
      subcategory,
      brand,
      shortDescription,
      fullDescription,
      price,
      discountPrice,
      stockQuantity,
      sku,
      status,
      isFeatured,
      isTrending,
    } = req.body;

    // Validate required text fields
    if (!productName || !productName.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required.' });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }
    if (!subcategory || !subcategory.trim()) {
      return res.status(400).json({ success: false, message: 'Subcategory is required.' });
    }
    if (!shortDescription || !shortDescription.trim()) {
      return res.status(400).json({ success: false, message: 'Short description is required.' });
    }
    if (!fullDescription || !fullDescription.trim()) {
      return res.status(400).json({ success: false, message: 'Full description is required.' });
    }
    if (price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json({ success: false, message: 'Valid price is required.' });
    }
    if (stockQuantity === undefined || stockQuantity === null || isNaN(Number(stockQuantity))) {
      return res.status(400).json({ success: false, message: 'Valid stock quantity is required.' });
    }

    // Validate Category existence
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Selected Category does not exist.' });
    }

    // Validate Subcategory existence in the Category
    const subcategoryExists = categoryExists.subcategories.some(
      (sub) => sub.subcategoryName.toLowerCase() === subcategory.trim().toLowerCase()
    );
    if (!subcategoryExists) {
      return res.status(400).json({
        success: false,
        message: `Subcategory "${subcategory}" does not exist in category "${categoryExists.categoryName}".`,
      });
    }

    // Check duplicate product name (case-insensitive)
    const duplicateProduct = await Product.findOne({
      productName: { $regex: new RegExp(`^${productName.trim()}$`, 'i') },
    });
    if (duplicateProduct) {
      return res.status(400).json({
        success: false,
        message: 'A product with this name already exists.',
      });
    }

    // Parse dynamic attributes
    let parsedAttributes = [];
    if (req.body.attributes) {
      try {
        if (typeof req.body.attributes === 'string') {
          parsedAttributes = JSON.parse(req.body.attributes);
        } else if (Array.isArray(req.body.attributes)) {
          parsedAttributes = req.body.attributes;
        }
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Failed to parse attributes format.' });
      }
    }
    // Parse sizes
    let parsedSizes = [];
    if (req.body.sizes) {
      try {
        if (typeof req.body.sizes === 'string') {
          parsedSizes = JSON.parse(req.body.sizes);
        } else if (Array.isArray(req.body.sizes)) {
          parsedSizes = req.body.sizes;
        }
      } catch (err) {
        parsedSizes = req.body.sizes.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    // Image Upload Constraints: min 1, max 3
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one product image is required.' });
    }
    if (req.files.length > 3) {
      return res.status(400).json({ success: false, message: 'Maximum 3 images are allowed.' });
    }

    console.log(`Uploading ${req.files.length} images to Cloudinary for product: ${productName}`);
    // Upload files concurrently
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, 'cjp_products', [
        { width: 800, height: 1000, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'webp' },
      ])
    );
    const uploadResults = await Promise.all(uploadPromises);
    const images = uploadResults.map((result) => ({
      url: result.secure_url,
      public_id: result.public_id,
    }));

    // Build model
    const newProduct = new Product({
      productName: productName.trim(),
      category,
      subcategory: subcategory.trim(),
      brand: brand ? brand.trim() : '',
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stockQuantity: Number(stockQuantity),
      sku: sku ? sku.trim() : '',
      status: status || 'active',
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isTrending: isTrending === 'true' || isTrending === true,
      sizes: parsedSizes,
      attributes: parsedAttributes,
      images,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: savedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all Products
 * @route   GET /api/products/get-products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('category', 'categoryName slug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single Product by ID
 * @route   GET /api/products/get-product/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('category', 'categoryName slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing Product
 * @route   PUT /api/products/update-product/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      productName,
      category,
      subcategory,
      brand,
      shortDescription,
      fullDescription,
      price,
      discountPrice,
      stockQuantity,
      sku,
      status,
      isFeatured,
      isTrending,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Validate fields if provided
    if (productName && productName.trim() !== product.productName) {
      // Check duplicate name
      const duplicateProduct = await Product.findOne({
        _id: { $ne: id },
        productName: { $regex: new RegExp(`^${productName.trim()}$`, 'i') },
      });
      if (duplicateProduct) {
        return res.status(400).json({
          success: false,
          message: 'Another product with this name already exists.',
        });
      }
      product.productName = productName.trim();
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: 'Selected Category does not exist.' });
      }
      product.category = category;

      // Validate subcategory within Category
      const targetSub = subcategory ? subcategory.trim() : product.subcategory;
      const subExists = categoryExists.subcategories.some(
        (sub) => sub.subcategoryName.toLowerCase() === targetSub.toLowerCase()
      );
      if (!subExists) {
        return res.status(400).json({
          success: false,
          message: `Subcategory "${targetSub}" does not exist in category "${categoryExists.categoryName}".`,
        });
      }
      product.subcategory = targetSub;
    } else if (subcategory) {
      // Check subcategory validity within existing Category
      const currentCategory = await Category.findById(product.category);
      if (currentCategory) {
        const subExists = currentCategory.subcategories.some(
          (sub) => sub.subcategoryName.toLowerCase() === subcategory.trim().toLowerCase()
        );
        if (!subExists) {
          return res.status(400).json({
            success: false,
            message: `Subcategory "${subcategory}" does not exist in category "${currentCategory.categoryName}".`,
          });
        }
      }
      product.subcategory = subcategory.trim();
    }

    // Handle parsed properties
    if (brand !== undefined) product.brand = brand.trim();
    if (shortDescription !== undefined) product.shortDescription = shortDescription.trim();
    if (fullDescription !== undefined) product.fullDescription = fullDescription.trim();
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) {
      product.discountPrice = discountPrice ? Number(discountPrice) : undefined;
    }
    if (stockQuantity !== undefined) product.stockQuantity = Number(stockQuantity);
    if (sku !== undefined) product.sku = sku.trim();
    if (status !== undefined) product.status = status;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isTrending !== undefined) product.isTrending = isTrending === 'true' || isTrending === true;

    // Parse dynamic attributes
    if (req.body.attributes !== undefined) {
      try {
        if (typeof req.body.attributes === 'string') {
          product.attributes = JSON.parse(req.body.attributes);
        } else if (Array.isArray(req.body.attributes)) {
          product.attributes = req.body.attributes;
        }
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Failed to parse attributes format.' });
      }
    }

    // Parse sizes
    if (req.body.sizes !== undefined) {
      try {
        if (typeof req.body.sizes === 'string') {
          product.sizes = JSON.parse(req.body.sizes);
        } else if (Array.isArray(req.body.sizes)) {
          product.sizes = req.body.sizes;
        }
      } catch (err) {
        product.sizes = req.body.sizes.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    // Parse kept/retained images sent from client
    let keptImages = [];
    if (req.body.keptImages) {
      try {
        if (typeof req.body.keptImages === 'string') {
          keptImages = JSON.parse(req.body.keptImages);
        } else if (Array.isArray(req.body.keptImages)) {
          keptImages = req.body.keptImages;
        }
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Failed to parse kept images.' });
      }
    } else {
      // If keptImages is not sent, assume we retain all original images
      keptImages = product.images || [];
    }

    const newFilesCount = req.files ? req.files.length : 0;
    const totalImagesCount = keptImages.length + newFilesCount;

    if (totalImagesCount < 1 || totalImagesCount > 3) {
      return res.status(400).json({
        success: false,
        message: `Product image count must be between 1 and 3. Retained: ${keptImages.length}, New: ${newFilesCount}`,
      });
    }

    // Process new file uploads if any
    let newImages = [];
    if (newFilesCount > 0) {
      console.log(`Uploading ${newFilesCount} new images to Cloudinary for product update: ${product.productName}`);
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, 'cjp_products', [
          { width: 800, height: 1000, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'webp' },
        ])
      );
      const uploadResults = await Promise.all(uploadPromises);
      newImages = uploadResults.map((result) => ({
        url: result.secure_url,
        public_id: result.public_id,
      }));
    }

    // Reconcile and calculate deleted images to purge from Cloudinary
    const originalImages = product.images || [];
    const keptPublicIds = new Set(keptImages.map((img) => img.public_id));
    const imagesToDelete = originalImages.filter((img) => !keptPublicIds.has(img.public_id));

    // Async delete removed images from Cloudinary
    imagesToDelete.forEach((img) => {
      deleteFromCloudinary(img.public_id).catch((err) =>
        console.error('Failed to delete image from Cloudinary:', err)
      );
    });

    // Update the image list on the product
    product.images = [...keptImages, ...newImages];

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a Product
 * @route   DELETE /api/products/delete-product/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const imagesToDelete = product.images || [];

    // Delete from DB
    await Product.findByIdAndDelete(id);

    // Delete images from Cloudinary asynchronously
    imagesToDelete.forEach((img) => {
      deleteFromCloudinary(img.public_id).catch((err) =>
        console.error(`Failed to delete product image ${img.public_id} from Cloudinary:`, err)
      );
    });

    res.status(200).json({
      success: true,
      message: 'Product and all associated images deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
