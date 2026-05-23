import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight, FiShield, FiLock } from 'react-icons/fi';
import { removeFromCartDB, updateCartItemDB } from '../redux/cartSlice';
import toast from 'react-hot-toast';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleQuantity = (id, size, color, currentQuantity, type) => {
    const newQty = type === 'inc' ? currentQuantity + 1 : currentQuantity - 1;
    if (newQty < 1) return;
    dispatch(updateCartItemDB({ productId: id, size, color, quantity: newQty }));
  };

  const handleRemove = (id, size, color, name) => {
    dispatch(removeFromCartDB({ productId: id, size, color }));
    toast.success(`${name} removed from your Boutique Bag.`, {
      style: { background: '#111', color: '#faf9f6', borderRadius: '12px' }
    });
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed to checkout.', {
        style: { background: '#111', color: '#faf9f6', borderRadius: '12px' }
      });
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  // Subtotal Calculation
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="pb-40 sm:pb-28 pt-10 bg-ivory min-h-[90vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Dynamic transition */}
        <AnimatePresence mode="wait">
          {cartItems.length > 0 ? (
            <motion.div
              key="cart-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start"
            >
              {/* Left Column: Items List */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase block mb-1">YOUR SELECTION</span>
                  <h1 className="text-3xl sm:text-4xl font-light text-zinc-950 font-display tracking-tight">
                    Boutique Bag <span className="text-sm font-sans font-semibold text-luxury-gray ml-2">({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                  </h1>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <motion.div
                        key={`${item.id}-${item.size}-${item.color}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="luxury-card rounded-2xl p-5 flex gap-4 sm:gap-6 items-center border border-primary/10 hover:border-primary/20 transition-all duration-300 bg-white/70"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-28 sm:w-28 sm:h-36 bg-stone-100 rounded-xl overflow-hidden border border-stone-200/60 flex-shrink-0 relative group">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1 h-full min-h-[110px]">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="text-base sm:text-lg font-light text-zinc-900 truncate tracking-tight font-display">
                                {item.name}
                              </h3>
                              <button
                                onClick={() => handleRemove(item.id, item.size, item.color, item.name)}
                                className="text-zinc-400 hover:text-red-600 p-2 transition rounded-full hover:bg-red-50 cursor-pointer flex-shrink-0"
                                title="Remove Item"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="text-[9px] font-bold tracking-widest text-primary uppercase mt-0.5 block">{item.category}</span>
                            
                            {/* Attribute indicators */}
                            <div className="flex flex-wrap gap-2 mt-3 text-[10px] text-luxury-gray font-semibold uppercase tracking-wider">
                              <span className="bg-stone-50 border border-stone-200/50 px-2 py-0.5 rounded-sm">Size: <strong className="text-zinc-900">{item.size}</strong></span>
                            </div>
                          </div>

                          {/* Action panel: Quantity controls and Price */}
                          <div className="flex justify-between items-center mt-6">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200/60 rounded-full p-1 shadow-sm">
                              <button
                                onClick={() => handleQuantity(item.id, item.size, item.color, item.quantity, 'dec')}
                                disabled={item.quantity <= 1}
                                className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-900 disabled:opacity-30 disabled:hover:text-zinc-500 transition rounded-full cursor-pointer"
                                title="Decrease"
                              >
                                <FiMinus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-semibold text-zinc-900 select-none">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantity(item.id, item.size, item.color, item.quantity, 'inc')}
                                className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition rounded-full cursor-pointer"
                                title="Increase"
                              >
                                <FiPlus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <span className="text-base sm:text-lg font-light text-zinc-900 tracking-tight font-sans">
                                ₹{item.price * item.quantity}
                              </span>
                              {item.quantity > 1 && (
                                <span className="text-[10px] text-luxury-gray block tracking-wider mt-0.5">(₹{item.price} each)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Column: Checkout Summary Details */}
              <div className="space-y-8 lg:sticky lg:top-24">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase block mb-1">SUMMARY</span>
                  <h2 className="text-2xl font-light text-zinc-950 font-display tracking-tight">Order Details</h2>
                </div>

                <div className="luxury-card rounded-3xl p-6 sm:p-8 space-y-6 bg-white border border-primary/10">
                  {/* Pricing Breakdown */}
                  <div className="space-y-4 pb-6 border-b border-stone-200/60">
                    <div className="flex justify-between text-xs font-medium uppercase tracking-widest text-luxury-gray">
                      <span>Bag Subtotal</span>
                      <span className="text-zinc-900 font-semibold font-sans">₹{subtotal}</span>
                    </div>
                  </div>

                  {/* Total calculation */}
                  <div>
                    <div className="flex justify-between items-baseline mb-8">
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-900">Total Valuation</span>
                      <span className="text-2xl sm:text-3xl font-light text-zinc-950">₹{subtotal}</span>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="gold-shimmer-btn w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-xl active:scale-95 transition cursor-pointer"
                    >
                      Secure Checkout <FiArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Trust Bar items */}
                  <div className="pt-2 space-y-3 text-[10px] text-luxury-gray tracking-wider uppercase font-semibold">
                    <div className="flex items-center gap-2.5">
                      <FiShield className="text-primary text-sm flex-shrink-0" />
                      <span>Complimentary returns within 14 days</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <FiLock className="text-primary text-sm flex-shrink-0" />
                      <span>Encrypted SSL Secure Checkout</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Empty State Container */
            <motion.div
              key="empty-cart"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto py-24 text-center space-y-8"
            >
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-primary border border-stone-200/40">
                <FiShoppingBag className="w-8 h-8 font-light" />
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase block">JEWELLERY ATELIER</span>
                <h1 className="text-3xl font-light font-display text-zinc-900 tracking-tight">Your Bag is Empty</h1>
                <p className="text-xs sm:text-sm text-luxury-gray leading-relaxed max-w-sm mx-auto font-medium">
                  We invite you to discover our latest Atelier linen collections and seasonal runway essentials to refine your look.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  to="/collection"
                  className="gold-shimmer-btn px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 hover:shadow-lg active:scale-95 transition cursor-pointer"
                >
                  Explore Collections <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Cart;
