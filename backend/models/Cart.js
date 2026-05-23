import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    category: { type: String, default: 'Boutique' },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    size: { type: String, default: 'Standard' },
    color: { type: String, default: 'Standard' },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    image: { type: String, default: '' },
    stockQuantity: { type: Number, default: 0 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
