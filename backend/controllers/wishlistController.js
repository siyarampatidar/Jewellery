import Wishlist from '../models/Wishlist.js';

// GET /api/wishlist - Get user's wishlist (populated with product details)
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }
    res.status(200).json({ success: true, items: wishlist.items });
  } catch (error) {
    next(error);
  }
};

// POST /api/wishlist/toggle - Toggle product in wishlist (add or remove)
export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    const alreadyExists = wishlist.items.some((id) => id.toString() === productId);

    if (alreadyExists) {
      wishlist.items = wishlist.items.filter((id) => id.toString() !== productId);
    } else {
      wishlist.items.push(productId);
    }

    await wishlist.save();

    // Return populated wishlist
    const populated = await Wishlist.findOne({ user: req.user._id }).populate('items');
    res.status(200).json({ success: true, items: populated.items, added: !alreadyExists });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/wishlist/remove - Remove specific product from wishlist
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found.' });
    }

    wishlist.items = wishlist.items.filter((id) => id.toString() !== productId);
    await wishlist.save();

    const populated = await Wishlist.findOne({ user: req.user._id }).populate('items');
    res.status(200).json({ success: true, items: populated.items });
  } catch (error) {
    next(error);
  }
};
