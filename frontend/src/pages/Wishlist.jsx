import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiArrowRight } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';

const Wishlist = () => {
  const location = useLocation();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  // Product detail modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Sync with product query parameter (for direct links and sharing)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get('product');
    if (productId && wishlistItems.length > 0) {
      const found = wishlistItems.find(p => p._id === productId);
      if (found) {
        setSelectedProduct(found);
        setIsDetailOpen(true);
      }
    }
  }, [location.search, wishlistItems]);

  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
    // Push state without reloading to set product query param
    window.history.pushState(null, '', `?product=${product._id}`);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    // Remove query param from URL
    window.history.replaceState(null, '', window.location.pathname);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="relative pb-24 sm:pb-12 pt-16 bg-gradient-to-br from-ivory via-white to-[#FAF8F5] min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Luxury Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-gold/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
        
        <div className="max-w-xl mx-auto px-6 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            className="luxury-card rounded-[32px] p-8 sm:p-14 space-y-8 bg-white/70 backdrop-blur-md border border-primary/10 shadow-[0_20px_50px_rgba(197,160,89,0.05)] relative overflow-hidden"
          >
            {/* Elegant Top Gold Accent Line */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            {/* Animated Heart Icon container */}
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                scale: [1, 1.03, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative mx-auto w-24 h-24 bg-gradient-to-b from-primary/15 to-primary/5 rounded-full flex items-center justify-center text-primary border border-primary/20 shadow-inner"
            >
              <FiHeart className="w-9 h-9 text-primary fill-primary/10" />
              {/* Dynamic absolute micro-sparkles */}
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary/40 rounded-full animate-ping" />
              <span className="absolute bottom-5 left-3 w-1.5 h-1.5 bg-primary/30 rounded-full animate-ping" />
            </motion.div>

            <div className="space-y-4">
              <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase block">WEEKLY ATMOSPHERE</span>
              <h1 className="text-3xl font-light font-display text-zinc-900 tracking-wide">Your Wishlist is Empty</h1>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto font-sans font-medium">
                Curate your personal runway capsule. Mark products you desire with the heart icon to watch them in your private collection.
              </p>
            </div>

            <div className="pt-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
              >
                <Link
                  to="/collection"
                  className="gold-shimmer-btn px-10 py-4.5 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-3 hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  Explore Runway 
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <FiArrowRight />
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <div className="relative pb-24 sm:pb-16 pt-12 bg-gradient-to-br from-ivory via-white to-[#FAF8F5] min-h-[85vh] overflow-hidden">
      {/* Subtle backdrop decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-stone-100 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <header className="mb-8 flex items-center justify-between border-b border-zinc-200/50 pb-4">
          {/* Left side: My Wishlist */}
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-lg font-medium text-zinc-900 tracking-wider uppercase">
              My Wishlist
            </h1>
            <span className="text-[9px] font-mono text-zinc-400">
              ({wishlistItems.length})
            </span>
          </div>

          {/* Right side: View More Items link */}
          <div>
            <Link
              to="/collection"
              className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-primary hover:text-zinc-950 transition duration-300 border-b border-primary/20 hover:border-zinc-950 pb-0.5 flex items-center gap-1"
            >
              View More <FiArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
        </header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {wishlistItems.map((item) => (
              <motion.div
                key={item._id}
                layout
                variants={itemVariants}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard
                  product={item}
                  onOpenDetail={() => handleOpenDetail(item)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

export default Wishlist;
