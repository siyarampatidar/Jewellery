import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHeart, FiShoppingBag, FiShare2, FiInfo, FiTruck, FiChevronRight, FiAlertTriangle } from 'react-icons/fi';
import { toggleWishlistDB } from '../redux/wishlistSlice';
import { addToCartDB } from '../redux/cartSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const allProducts = useSelector((state) => state.products.products);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  
  const isWishlisted = wishlistItems.some((item) => item._id === product?._id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [zoomOrigin, setZoomOrigin] = useState('center');

  // Reset local selections when modal opens/changes product
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedSize('');
      
      const colors = getColors();
      if (colors.length > 0) {
        setSelectedColor(colors[0]);
      }
      setDeliveryStatus(null);
      setPincode('');
    }
  }, [product]);

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [];

  const parsedSizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : ['12', '14', '16'];

  // Parse color attributes dynamically
  const getColors = () => {
    const colorAttr = product.attributes?.find(attr => attr.key.toLowerCase().includes('color'));
    return colorAttr
      ? colorAttr.value.split(/[,\s/]+/).map(c => c.trim()).filter(Boolean)
      : ['Champagne Gold', 'Rose Gold', 'White Gold', 'Platinum'];
  };

  const colors = getColors();

  // Find similar products in same category
  const similarProducts = allProducts
    .filter((item) => {
      const itemCat = item.category?._id || item.category;
      const prodCat = product.category?._id || product.category;
      return itemCat === prodCat && item._id !== product._id && item.status === 'active';
    })
    .slice(0, 5);

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Zoom effect on hover
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add designs to your Wishlist.', {
        style: { background: '#111', color: '#faf9f6', borderRadius: '12px' }
      });
      return;
    }
    dispatch(toggleWishlistDB(product._id));
    if (isWishlisted) {
      toast.success('Removed from Wishlist.', {
        style: { background: '#111', color: '#faf9f6', borderRadius: '12px' }
      });
    } else {
      toast.success('Added to Wishlist!', {
        style: { background: '#111', color: '#faf9f6', borderRadius: '12px' }
      });
    }
  };

  const handleAddToCartClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add designs to your Boutique Bag.', {
        style: { background: '#111', color: '#faf9f6', borderRadius: '12px' }
      });
      return;
    }
    if (!selectedSize) {
      toast.error('Please select a size first.', {
        style: { background: '#111', color: '#faf9f6' }
      });
      return;
    }
    
    dispatch(addToCartDB({
      productId: product._id,
      name: product.productName,
      category: product.category?.categoryName || 'Boutique',
      price: product.discountPrice || product.price,
      originalPrice: product.price,
      size: selectedSize,
      color: selectedColor || colors[0],
      quantity: 1,
      image: product.images?.[0]?.url || '',
      stockQuantity: product.stockQuantity,
    }));

    toast.success(`${product.productName} added to Bag!`, {
      style: { background: '#111', color: '#faf9f6', borderRadius: '12px' }
    });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed to checkout.', {
        style: { background: '#111', color: '#faf9f6', borderRadius: '12px' }
      });
      onClose();
      navigate('/login');
      return;
    }
    if (!selectedSize) {
      toast.error('Please select a size to buy now.', {
        style: { background: '#111', color: '#faf9f6' }
      });
      return;
    }

    dispatch(addToCartDB({
      productId: product._id,
      name: product.productName,
      category: product.category?.categoryName || 'Boutique',
      price: product.discountPrice || product.price,
      originalPrice: product.price,
      size: selectedSize,
      color: selectedColor || colors[0],
      quantity: 1,
      image: product.images?.[0]?.url || '',
      stockQuantity: product.stockQuantity,
    }));
    
    onClose();
    navigate('/cart');
  };

  const handleShare = async () => {
    const shareData = {
      title: product.productName,
      text: product.shortDescription,
      url: `${window.location.origin}/home?product=${product._id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyLink();
        }
      }
    } else {
      copyLink();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/home?product=${product._id}`);
    toast.success('Link copied to clipboard!', {
      style: { background: '#111', color: '#faf9f6', borderRadius: '12px' }
    });
  };

  const checkDelivery = (e) => {
    e.preventDefault();
    if (pincode.length < 5) {
      toast.error('Please enter a valid pincode.');
      return;
    }
    // Simple mock logic for delivery
    setDeliveryStatus('checking');
    setTimeout(() => {
      setDeliveryStatus({
        eta: '2-4 business days',
        complimentary: product.discountPrice ? product.discountPrice > 300 : product.price > 300
      });
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative z-10 w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-[32px] shadow-2xl border border-primary/5 overflow-hidden flex flex-col"
          >
            {/* Top Close Button (Floating on Mobile) */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-white/80 hover:bg-zinc-100 text-zinc-800 hover:text-black border border-primary/10 transition shadow-sm cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Main scrollable area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-8 p-4 sm:p-8">
                
                {/* LEFT: Image Gallery Column (5 cols) */}
                <div className="md:col-span-6 space-y-4">
                  
                  {/* Image Display Wrapper with Side Zoom Magnifier */}
                  <div className="relative group">
                    {/* Active Large Image Display */}
                    <div 
                      onMouseMove={handleMouseMove}
                      className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-zinc-50 border border-primary/5 md:cursor-zoom-in cursor-default"
                    >
                      {/* Floating Controls (Top-Left) */}
                      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 items-start">
                        {discountPercent > 0 && (
                          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 bg-red-600 text-white rounded-md shadow-md">
                            {discountPercent}% OFF
                          </span>
                        )}

                        {/* Wishlist Button */}
                        <motion.button
                          type="button"
                          whileTap={{ scale: 1.25 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWishlist();
                          }}
                          className={`p-2.5 rounded-full backdrop-blur-md border shadow-md cursor-pointer transition-all duration-300 ${
                            isWishlisted
                              ? 'bg-red-50 border-red-200 text-red-500'
                              : 'bg-white/90 border-primary/10 text-zinc-700 hover:text-red-500'
                          }`}
                          title={isWishlisted ? 'Remove Wishlist' : 'Add Wishlist'}
                        >
                          <FiHeart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                        </motion.button>

                        {/* Share Button */}
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare();
                          }}
                          className="p-2.5 rounded-full border bg-white/90 border-primary/10 text-zinc-700 hover:text-primary transition shadow-md flex items-center justify-center cursor-pointer"
                          title="Share Product"
                        >
                          <FiShare2 className="w-4 h-4" />
                        </motion.button>
                      </div>

                      {images.length > 0 ? (
                        <img
                          src={images[activeImageIndex]?.url}
                          alt={product.productName}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                          No Image Available
                        </div>
                      )}
                    </div>

                    {/* Side Zoom Preview Panel - Only active on large screens (md and above) during hover */}
                    {images.length > 0 && (
                      <div className="hidden group-hover:md:block absolute left-full top-0 w-full h-full pl-8 z-40 pointer-events-none">
                        <div className="w-full h-full bg-white border border-primary/15 shadow-2xl rounded-2xl overflow-hidden">
                          <img
                            src={images[activeImageIndex]?.url}
                            alt="Zoomed view"
                            style={{
                              transformOrigin: zoomOrigin,
                              transform: 'scale(2.5)'
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Horizontal Thumbnail Previews */}
                  {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto py-1 scrollbar-none">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition duration-300 cursor-pointer ${
                            activeImageIndex === idx ? 'border-primary scale-102' : 'border-zinc-200 hover:border-primary/50'
                          }`}
                        >
                          <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT: Detail Information (7 cols) */}
                <div className="md:col-span-6 space-y-6 pt-4 md:pt-0">
                  
                  {/* Brand & Title */}
                  <div className="space-y-1">
                    <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-primary uppercase block">
                      {product.brand || 'JEWELLERY ATELIER'}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-light text-zinc-950 font-display">
                      {product.productName}
                    </h1>
                    <p className="text-xs text-luxury-gray font-semibold tracking-wide">
                      SKU: {product.sku || 'JEWELLERY-2026-NFT'}
                    </p>
                  </div>

                  {/* Pricing Panel */}
                  <div className="p-4 bg-zinc-50 border border-primary/5 rounded-2xl flex items-center gap-4">
                    {product.discountPrice ? (
                      <>
                        <span className="text-xl sm:text-2xl font-extrabold text-red-600 font-sans">₹{product.discountPrice}</span>
                        <span className="text-sm text-zinc-400 line-through font-sans">₹{product.price}</span>
                        <span className="text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded">
                          Save ₹{product.price - product.discountPrice} ({discountPercent}% OFF)
                        </span>
                      </>
                    ) : (
                      <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 font-sans">₹{product.price}</span>
                    )}
                  </div>

                  {/* Size Selector */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Jewellery Size</span>
                      <button 
                        onClick={() => toast('Size chart: Standard Indian Ring and Jewellery sizes.', { icon: '📏' })}
                        className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-primary/20 hover:border-primary transition"
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="flex gap-2.5 flex-wrap items-center">
                      {parsedSizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`h-10 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border transition duration-300 cursor-pointer shrink-0 whitespace-nowrap ${
                            sz.toString().length <= 3 ? 'w-10' : 'px-4 min-w-[2.5rem]'
                          } ${
                            selectedSize === sz
                              ? 'bg-zinc-950 border-zinc-950 text-white scale-105 shadow-md'
                              : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-950'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons (Cart / Buy Now) */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleAddToCartClick}
                      disabled={product.stockQuantity === 0}
                      className={`py-4 px-6 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition duration-300 ${
                        product.stockQuantity === 0
                          ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border-transparent'
                          : 'bg-white border border-zinc-950 text-zinc-950 hover:bg-zinc-50 cursor-pointer'
                      }`}
                    >
                      <FiShoppingBag className="w-4 h-4" /> Add to Cart
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={product.stockQuantity === 0}
                      className={`py-4 px-6 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition duration-300 ${
                        product.stockQuantity === 0
                          ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                          : 'gold-shimmer-btn cursor-pointer'
                      }`}
                    >
                      Buy Now
                    </button>
                  </div>

                  {/* Delivery Pincode Checker */}
                  {/* <div className="p-4 bg-zinc-50 border border-primary/5 rounded-2xl space-y-3">
                    <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-1.5">
                      <FiTruck className="text-zinc-600" /> Delivery Check
                    </span>
                    <form onSubmit={checkDelivery} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter 6-digit Pincode"
                        maxLength="6"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-zinc-950 text-white hover:bg-primary border border-transparent rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition duration-300"
                      >
                        Check
                      </button>
                    </form>
                    
                    {deliveryStatus === 'checking' && (
                      <p className="text-[10px] text-zinc-400 italic">Querying logistic hubs...</p>
                    )}
                    {deliveryStatus && deliveryStatus !== 'checking' && (
                      <div className="text-xs text-green-700 font-semibold space-y-0.5">
                        <p>✓ Handled in {deliveryStatus.eta}</p>
                        {deliveryStatus.complimentary && (
                          <p className="text-[9px] text-primary uppercase font-bold tracking-widest">💡 Complimentary premium silk wrapping applied</p>
                        )}
                      </div>
                    )}
                  </div> */}

                  {/* Key Highlights / Attributes (Myntra style) */}
                  {product.attributes && product.attributes.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-zinc-100">
                      <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase block">Product Specifications</span>
                      <div className="grid grid-cols-2 gap-4">
                        {product.attributes.map((attr, index) => (
                          <div key={index} className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase block">{attr.key}</span>
                            <span className="text-xs font-semibold text-zinc-950">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description Box */}
                  <div className="space-y-2.5 pt-3 border-t border-zinc-100">
                    <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase block">Product Details</span>
                    <p className="text-xs text-luxury-gray leading-relaxed font-semibold">
                      {product.fullDescription}
                    </p>
                  </div>

                  {/* Similar Products (Discovery tray) */}
                  {similarProducts.length > 0 && (
                    <div className="space-y-3 pt-6 border-t border-zinc-100">
                      <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase block">Similar Pieces</span>
                      <div className="flex gap-4 overflow-x-auto py-2 scrollbar-none">
                        {similarProducts.map((simProd) => {
                          const simDisc = simProd.discountPrice
                            ? Math.round(((simProd.price - simProd.discountPrice) / simProd.price) * 100)
                            : 0;

                          return (
                            <div
                              key={simProd._id}
                              onClick={() => {
                                // Shift active product to similar one
                                navigate(`/home?product=${simProd._id}`);
                                setActiveImageIndex(0);
                                setSelectedSize('');
                                setDeliveryStatus(null);
                                setPincode('');
                              }}
                              className="w-28 flex-shrink-0 bg-white border border-primary/5 hover:border-primary/20 rounded-xl p-2 cursor-pointer transition text-center shadow-xs"
                            >
                              <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-zinc-50 mb-2">
                                <img
                                  src={simProd.images?.[0]?.url}
                                  alt={simProd.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-[9px] font-bold text-zinc-400 uppercase block truncate">{simProd.brand || 'JEWELLERY'}</span>
                              <h4 className="text-[10px] font-bold text-zinc-900 truncate">{simProd.productName}</h4>
                              <div className="flex justify-center items-center gap-1.5 mt-1">
                                {simProd.discountPrice ? (
                                  <>
                                    <span className="text-[10px] font-bold text-red-600">₹{simProd.discountPrice}</span>
                                    <span className="text-[9px] text-zinc-400 line-through">₹{simProd.price}</span>
                                  </>
                                ) : (
                                  <span className="text-[10px] font-bold text-zinc-950">₹{simProd.price}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailModal;
