import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FiHeart, FiShoppingBag, FiShare2 } from "react-icons/fi";
import { toggleWishlistDB } from "../redux/wishlistSlice";
import { addToCartDB } from "../redux/cartSlice";
import toast from "react-hot-toast";

const ProductCard = ({ product, onOpenDetail }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((item) => item._id === product._id);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=500&q=80",
          },
        ];

  const parsedSizes =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : ["Standard", "Adjustable"];

  // Parse color from attributes
  const colorAttr = product.attributes?.find((attr) =>
    attr.key.toLowerCase().includes("color"),
  );
  const parsedColors = colorAttr
    ? colorAttr.value
        .split(/[,\s/]+/)
        .map((c) => c.trim())
        .filter(Boolean)
    : ["Champagne Gold"];

  const discountPercent = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      )
    : 0;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please login to add designs to your Wishlist.", {
        style: { background: "#111", color: "#faf9f6", borderRadius: "12px" },
      });
      return;
    }
    dispatch(toggleWishlistDB(product._id));
    // if (isWishlisted) {
    //   toast.success(`${product.productName} removed from Wishlist.`, {
    //     style: { background: "#111", color: "#faf9f6", borderRadius: "12px" },
    //   });
    // } else {
    //   toast.success(`${product.productName} added to Wishlist!`, {
    //     style: {
    //       background: "#111",
    //       color: "#faf9f6",
    //       borderRadius: "12px",
    //       border: "1px solid rgba(197,160,89,0.3)",
    //     },
    //     iconTheme: { primary: "#c5a059", secondary: "#111" },
    //   });
    // }
  };

  const handleQuickAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please login to add designs to your Boutique Bag.", {
        style: { background: "#111", color: "#faf9f6", borderRadius: "12px" },
      });
      return;
    }

    if (product.stockQuantity === 0) {
      toast.error("This design is currently sold out.", {
        style: { background: "#111", color: "#faf9f6", borderRadius: "12px" },
      });
      return;
    }

    const defaultSize = parsedSizes[0] || "Standard";
    const defaultColor = parsedColors[0] || "Champagne Gold";

    dispatch(
      addToCartDB({
        productId: product._id,
        name: product.productName,
        category: product.category?.categoryName || "Boutique",
        price: product.discountPrice || product.price,
        originalPrice: product.price,
        size: defaultSize,
        color: defaultColor,
        quantity: 1,
        image: product.images?.[0]?.url || "",
        stockQuantity: product.stockQuantity,
      }),
    );

    toast.success(`${product.productName} (${defaultSize}) added to Bag!`, {
      style: {
        background: "#111",
        color: "#faf9f6",
        borderRadius: "12px",
        border: "1px solid rgba(197,160,89,0.3)",
      },
      iconTheme: { primary: "#c5a059", secondary: "#111" },
    });
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: product.productName,
      text:
        product.shortDescription || `Curated Couture: ${product.productName}`,
      url: `${window.location.origin}/home?product=${product._id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          copyToClipboard(shareData.url);
        }
      }
    } else {
      copyToClipboard(shareData.url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Boutique link copied to clipboard!", {
      style: { background: "#111", color: "#faf9f6", borderRadius: "12px" },
    });
  };

  const handleScroll = (e) => {
    const container = e.currentTarget;
    const { scrollLeft, clientWidth } = container;
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / clientWidth);
      if (idx !== currentIndex) {
        setCurrentIndex(idx);
      }
    }
  };

  const scrollToImage = (e, idx) => {
    e.stopPropagation();
    e.preventDefault();
    if (scrollContainerRef.current) {
      const clientWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: idx * clientWidth,
        behavior: "smooth",
      });
      setCurrentIndex(idx);
    }
  };

  return (
    <motion.div
      layout
      onClick={onOpenDetail}
      className="group relative flex flex-col bg-white rounded-[24px] border border-primary/5 hover:border-primary/20 transition-all duration-500 hover:shadow-[0_15px_40px_rgba(15,15,15,0.06)] overflow-hidden cursor-pointer"
    >
      {/* 1. Image Slider Viewport */}
      <div className="relative aspect-square overflow-hidden bg-zinc-50 select-none">
        {/* Discount Badge */}
        {product.discountPrice && (
          <span className="absolute top-3 left-3 z-10 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 bg-white/95 backdrop-blur-md text-red-600 rounded-md border border-red-100 shadow-xs">
            -{discountPercent}% OFF
          </span>
        )}

        {/* Action Bar (Top Right) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          {/* Wishlist Heart */}
          <motion.button
            type="button"
            whileTap={{ scale: 1.3 }}
            onClick={handleWishlist}
            className={`p-2 rounded-full backdrop-blur-md border border-primary/10 shadow-xs cursor-pointer transition-all duration-300 ${
              isWishlisted
                ? "bg-red-50 text-red-500 border-red-100"
                : "bg-white/90 text-zinc-700 hover:text-red-500"
            }`}
          >
            <FiHeart
              className={`w-3.5 h-3.5 ${isWishlisted ? "fill-current" : ""}`}
            />
          </motion.button>

          {/* Quick Add to Cart */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={handleQuickAddToCart}
            className="p-2 rounded-full bg-white/90 backdrop-blur-md text-zinc-700 hover:text-primary border border-primary/10 shadow-xs cursor-pointer transition-all duration-300"
            title="Add to Bag"
          >
            <FiShoppingBag className="w-3.5 h-3.5" />
          </motion.button>

          {/* Share Button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="p-2 rounded-full bg-white/90 backdrop-blur-md text-zinc-700 hover:text-primary border border-primary/10 shadow-xs cursor-pointer transition-all duration-300"
            title="Share Collection Item"
          >
            <FiShare2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Sliding Tracks with native scroll-snap */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none"
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              className="w-full h-full flex-shrink-0 snap-start snap-always"
            >
              <img
                src={img.url}
                alt={`${product.productName} view ${idx + 1}`}
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          ))}
        </div>

        {/* Slider Indicator Dots (Click to scroll) */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-black/10 backdrop-blur-xs px-2.5 py-1 rounded-full">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => scrollToImage(e, idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Text Details Section */}
      <div className="pt-4 pb-5 px-4 text-center flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[9px] font-bold tracking-[0.2em] text-primary uppercase">
            {product.brand ||
              product.category?.categoryName ||
              "JEWELLERY ATELIER"}
          </span>
          <h3 className="text-sm font-semibold text-zinc-950 hover:text-primary transition duration-300 line-clamp-1 mt-0.5 font-sans">
            {product.productName}
          </h3>
        </div>

        <div className="mt-2.5 flex flex-col items-center">
          {/* Price Layout */}
          <div className="flex justify-center items-center gap-2">
            {product.discountPrice ? (
              <>
                <span className="text-sm font-extrabold text-red-600 font-sans">
                  ₹{product.discountPrice}
                </span>
                <span className="text-xs text-zinc-400 line-through font-sans">
                  ₹{product.price}
                </span>
              </>
            ) : (
              <span className="text-sm font-extrabold text-zinc-900 font-sans">
                ₹{product.price}
              </span>
            )}
          </div>

          {/* Stock Warning */}
          {product.stockQuantity === 0 && (
            <span className="text-[9px] text-red-600 font-extrabold uppercase tracking-wider mt-1">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
