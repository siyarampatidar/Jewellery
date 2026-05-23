import Cart from '../models/Cart.js';

// GET /api/cart - Get user's cart
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.status(200).json({ success: true, items: cart.items });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/add - Add or update item in cart
export const addToCart = async (req, res, next) => {
  try {
    const { productId, name, category, price, originalPrice, size, color, quantity, image, stockQuantity } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemSize = size || 'Standard';
    const itemColor = color || 'Standard';

    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === itemSize &&
        item.color === itemColor
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity || 1;
    } else {
      cart.items.push({
        productId,
        name,
        category: category || 'Boutique',
        price,
        originalPrice,
        size: itemSize,
        color: itemColor,
        quantity: quantity || 1,
        image: image || '',
        stockQuantity: stockQuantity || 0,
      });
    }

    await cart.save();
    res.status(200).json({ success: true, items: cart.items });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/update - Update quantity of a cart item
export const updateCartItem = async (req, res, next) => {
  try {
    const { productId, size, color, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const item = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.size === (size || 'Standard') &&
        item.color === (color || 'Standard')
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart.' });
    }

    item.quantity = Math.max(1, quantity);
    await cart.save();

    res.status(200).json({ success: true, items: cart.items });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/remove - Remove a specific item from cart
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId, size, color } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          item.size === (size || 'Standard') &&
          (!color || item.color === color)
        )
    );

    await cart.save();
    res.status(200).json({ success: true, items: cart.items });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/clear - Clear entire cart
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, items: [] });
  } catch (error) {
    next(error);
  }
};
