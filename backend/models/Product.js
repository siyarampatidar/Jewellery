import mongoose from 'mongoose';

const attributeSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Attribute key is required'],
    trim: true,
  },
  value: {
    type: String,
    required: [true, 'Attribute value is required'],
    trim: true,
  }
}, { _id: false });

const productImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  public_id: {
    type: String,
    required: [true, 'Image public_id is required'],
  }
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product Name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
    },
    subcategory: {
      type: String,
      required: [true, 'Subcategory is required'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
    },
    fullDescription: {
      type: String,
      required: [true, 'Full description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price must be a positive number'],
      validate: {
        validator: function (value) {
          // 'this' refers to the document in validation context
          if (value === undefined || value === null) return true;
          return value < this.price;
        },
        message: 'Discount price must be less than regular price',
      },
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
    },
    sku: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    sizes: {
      type: [String],
      default: [],
    },
    attributes: [attributeSchema],
    images: {
      type: [productImageSchema],
      validate: {
        validator: function (val) {
          return val && val.length >= 1 && val.length <= 3;
        },
        message: 'A product must have between 1 and 3 images.',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('productName')) {
    this.slug = this.productName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes
  }
  next();
});

// findOneAndUpdate hook to generate slug
productSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.productName) {
    update.slug = update.productName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
