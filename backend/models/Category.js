import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  subcategoryName: {
    type: String,
    required: [true, 'Subcategory Name is required'],
    trim: true,
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true,
  }
});

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, 'Category Name is required'],
      unique: true,
      trim: true,
    },
    categoryImage: {
      url: {
        type: String,
        default: '',
      },
      public_id: {
        type: String,
        default: '',
      },
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subcategories: [subcategorySchema],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug
categorySchema.pre('save', function (next) {
  if (this.isModified('categoryName')) {
    this.slug = this.categoryName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes
  }

  // Slugify subcategories
  if (this.subcategories && this.subcategories.length > 0) {
    this.subcategories.forEach(sub => {
      if (sub.subcategoryName) {
        sub.slug = sub.subcategoryName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }
    });
  }
  next();
});

// For update operations, generate slug in hook or controller
categorySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.categoryName) {
    update.slug = update.categoryName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
