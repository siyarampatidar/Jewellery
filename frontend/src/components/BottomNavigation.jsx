import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FiHome,
  FiHeart,
  FiShoppingBag,
  FiUser,
  FiGrid,
  FiX,
  FiArrowRight,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { fetchCategories } from "../redux/categorySlice";
import { fetchProducts } from "../redux/productSlice";

// SUBCATEGORY_IMAGES mapping for a highly premium presentation matching the branding
const SUBCATEGORY_IMAGES = {
  ring: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=250&q=80",
  rings: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=250&q=80",
  earring: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=250&q=80",
  earrings: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=250&q=80",
  earings: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=250&q=80",
  earing: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=250&q=80",
  necklace: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=250&q=80",
  necklaces: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=250&q=80",
  choker: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=250&q=80",
  chokers: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=250&q=80",
  bracelet: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=250&q=80",
  bracelets: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=250&q=80",
  bangle: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=250&q=80",
  bangles: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=250&q=80",
  kada: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=250&q=80",
  pendant: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=250&q=80",
  pendants: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=250&q=80",
  chain: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=250&q=80",
  chains: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=250&q=80",
  rakhi: "https://images.unsplash.com/photo-1624314138470-5a2f24623f10?auto=format&fit=crop&w=250&q=80",
  rakhis: "https://images.unsplash.com/photo-1624314138470-5a2f24623f10?auto=format&fit=crop&w=250&q=80",
  "matha patti": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=250&q=80",
  mathapatti: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=250&q=80",
  tikka: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=250&q=80",
  maangtikka: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=250&q=80",
  "nose ring": "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=250&q=80",
  nosering: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=250&q=80",
  nath: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=250&q=80",
  anklet: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=250&q=80",
  anklets: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=250&q=80",
  payal: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=250&q=80",
};

const getSubcategoryImage = (subName) => {
  const normalized = subName.toLowerCase().trim();
  if (SUBCATEGORY_IMAGES[normalized]) {
    return SUBCATEGORY_IMAGES[normalized];
  }
  // Try partial word match
  for (const key in SUBCATEGORY_IMAGES) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return SUBCATEGORY_IMAGES[key];
    }
  }
  // Generic fallback premium jewellery item photo
  return "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=250&q=80";
};

const BottomNavigation = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.categories);
  const { products } = useSelector((state) => state.products);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const cartItems = useSelector((state) => state.cart.items);

  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [activeCatId, setActiveCatId] = useState(null);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
    if (products.length === 0) dispatch(fetchProducts());
  }, [dispatch, categories.length, products.length]);

  // Set default active category when categories loaded
  useEffect(() => {
    if (categories && categories.length > 0 && !activeCatId) {
      setActiveCatId("all");
    }
  }, [categories, activeCatId]);

  const activeCategory = activeCatId === "all"
    ? {
        _id: "all",
        categoryName: "All Collections",
        categoryImage: { url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80" },
        subcategories: categories.map(cat => ({
          _id: cat._id,
          subcategoryName: cat.categoryName,
          isCategoryDirect: true,
          categoryObj: cat
        }))
      }
    : (categories.find((cat) => cat._id === activeCatId) || categories[0]);

  const navItemsLeft = [
    { label: "Home", icon: FiHome, path: "/home" },
    { label: "Wishlist", icon: FiHeart, path: "/wishlist" },
  ];

  const navItemsRight = [
    { label: "Cart", icon: FiShoppingBag, path: "/cart" },
    { label: "Account", icon: FiUser, path: "/account" },
  ];

  // Helper to check active state
  const isActive = (path) => {
    if (path === "/home" && currentPath === "/") return true;
    return currentPath === path;
  };

  const handleCategoryClick = (categoryObj) => {
    setIsCategorySheetOpen(false);
    if (categoryObj._id === 'all') {
      navigate('/collection');
    } else {
      navigate(`/collection?category=${categoryObj._id}`);
    }
  };

  const handleSubcategoryClick = (categoryId, subcategoryName, isCategoryDirect = false, categoryObj = null) => {
    setIsCategorySheetOpen(false);
    if (isCategoryDirect && categoryObj) {
      navigate(`/collection?category=${categoryObj._id}`);
    } else {
      toast.success(`Browsing: ${subcategoryName} in JEWELLERY Atelier`);
      navigate(
        `/collection?category=${categoryId}&subcategory=${encodeURIComponent(subcategoryName)}`,
      );
    }
  };

  return (
    <>
      {/* 1. FLOATING BOTTOM NAVIGATION BAR — hidden on lg+ (desktop uses navbar) */}
      <div className="fixed bottom-0 left-0 right-0 w-full z-40 select-none lg:hidden">
        <div className="luxury-card bg-white/90 backdrop-blur-xl border-t border-primary/20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[28px] py-3 px-6 sm:px-12 flex justify-between items-center relative max-w-2xl mx-auto">
          {/* Left Side Actions */}
          <div className="flex flex-1 justify-around items-center">
            {navItemsLeft.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="relative flex flex-col items-center justify-center py-1 flex-1 group outline-hidden cursor-pointer"
                >
                  {active && (
                    <motion.div
                      layoutId="activeBottomTab"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                      className="absolute -top-3 w-8 h-[3px] bg-primary rounded-full"
                    />
                  )}
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-all duration-300 ${
                        active
                          ? "text-primary scale-110"
                          : "text-luxury-gray hover:text-luxury-black"
                      }`}
                    />
                    {item.label === "Wishlist" && wishlistItems.length > 0 && (
                      <span className="absolute -top-1 -right-1.5 bg-red-500 text-white font-sans text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-xs">
                        {wishlistItems.length}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider mt-1 transition-colors ${
                      active ? "text-primary" : "text-luxury-gray"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Center Category Button (Floating Highlighted FAB) */}
          <div className="relative -mt-6 z-10 px-2">
            <motion.button
              type="button"
              onClick={() => setIsCategorySheetOpen(!isCategorySheetOpen)}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.94 }}
              className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-[0_10px_35px_-5px_rgba(197,160,89,0.35)] border border-primary/30 transition-all cursor-pointer relative overflow-hidden select-none outline-hidden ${
                isCategorySheetOpen
                  ? "bg-primary text-white border-white/20 shadow-[0_10px_35px_-5px_rgba(197,160,89,0.5)]"
                  : "bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 text-white"
              }`}
            >
              <AnimatePresence mode="wait">
                {isCategorySheetOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiX className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <FiGrid className="w-5 h-5 text-primary-light" />
                    <span className="text-[8px] font-bold tracking-widest text-primary uppercase mt-0.5">
                      Shop
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Right Side Actions */}
          <div className="flex flex-1 justify-around items-center">
            {navItemsRight.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="relative flex flex-col items-center justify-center py-1 flex-1 group outline-hidden cursor-pointer"
                >
                  {active && (
                    <motion.div
                      layoutId="activeBottomTab"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                      className="absolute -top-3 w-8 h-[3px] bg-primary rounded-full"
                    />
                  )}
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-all duration-300 ${
                        active
                          ? "text-primary scale-110"
                          : "text-luxury-gray hover:text-luxury-black"
                      }`}
                    />
                    {item.label === "Cart" && cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1.5 bg-primary text-white font-sans text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-xs">
                        {cartItems.length}
                      </span>
                    )}

                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider mt-1 transition-colors ${
                      active ? "text-primary" : "text-luxury-gray"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. CATEGORIES OVERLAY MODAL (Sliding bottom sheet / dialog card) */}
      <AnimatePresence>
        {isCategorySheetOpen && (
          <>
            {/* Backdrop click closes sheet */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategorySheetOpen(false)}
              className="fixed inset-0 z-40 bg-black backdrop-blur-xs"
            />

            {/* Sliding Container (Full Screen Overlay Modal) */}
            <motion.div
              initial={{ y: "100%", opacity: 0.95 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.95 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-0 w-full h-[100dvh] bg-white z-50 overflow-hidden flex flex-col"
            >
              {/* Header details */}
              <div className="flex justify-between items-center px-6 pt-12 pb-4.5 border-b border-primary/10 bg-white/40 sm:pt-6">
                <div>
                  <span className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase block">
                    DESIGN HOUSE
                  </span>
                  <h3 className="text-xl font-normal text-zinc-950 font-display">
                    Featured Collections
                  </h3>
                </div>
                <button
                  onClick={() => setIsCategorySheetOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-600 transition cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Two Column Layout Container */}
              <div className="flex flex-1 overflow-hidden">
                {/* Left Column: Categories Sidebar (Category Names) */}
                <div className="w-[110px] sm:w-[145px] bg-zinc-50 border-r border-primary/10 overflow-y-auto flex-shrink-0 scrollbar-none flex flex-col pb-12">
                  {/* Virtual 'ALL' Category Option */}
                  <button
                    onClick={() => setActiveCatId("all")}
                    className={`w-full py-4 px-2 flex flex-col items-center gap-1.5 transition-all text-center border-b border-primary/5 cursor-pointer relative outline-hidden ${
                      activeCatId === "all"
                        ? "bg-white font-bold text-primary animate-pulse-subtle"
                        : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/50"
                    }`}
                  >
                    {activeCatId === "all" && (
                      <div className="absolute left-0 top-2 bottom-2 w-[4px] bg-primary rounded-r-full" />
                    )}
                    <div
                      className={`w-11 h-11 rounded-full overflow-hidden border transition duration-300 ${
                        activeCatId === "all"
                          ? "border-primary scale-105 shadow-xs"
                          : "border-zinc-200/80"
                      }`}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=150&q=80"
                        alt="All Pieces"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider line-clamp-2 px-1 ${
                        activeCatId === "all" ? "font-bold text-primary" : "font-semibold text-zinc-500"
                      }`}
                    >
                      All Pieces
                    </span>
                  </button>

                  {categories.map((cat, idx) => {
                    const isActive = activeCatId === cat._id;
                    const imageUrl =
                      cat.categoryImage?.url ||
                      [
                        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=150&q=80",
                        "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=150&q=80",
                        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80",
                        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=150&q=80",
                        "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=150&q=80",
                        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=150&q=80",
                      ][idx % 6];

                    return (
                      <button
                        key={cat._id || idx}
                        onClick={() => setActiveCatId(cat._id)}
                        className={`w-full py-4 px-2 flex flex-col items-center gap-1.5 transition-all text-center border-b border-primary/5 cursor-pointer relative outline-hidden ${
                          isActive
                            ? "bg-white font-bold text-primary animate-pulse-subtle"
                            : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/50"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-2 bottom-2 w-[4px] bg-primary rounded-r-full" />
                        )}
                        <div
                          className={`w-11 h-11 rounded-full overflow-hidden border transition duration-300 ${
                            isActive
                              ? "border-primary scale-105 shadow-xs"
                              : "border-zinc-200/80"
                          }`}
                        >
                          <img
                            src={imageUrl}
                            alt={cat.categoryName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span
                          className={`text-[10px] uppercase tracking-wider line-clamp-2 px-1 ${
                            isActive ? "font-bold" : "font-semibold"
                          }`}
                        >
                          {cat.categoryName}
                        </span>
                      </button>
                    );
                  })}
                  {categories.length === 0 && (
                    <p className="text-center text-[10px] text-zinc-400 italic py-8">
                      No silhouettes
                    </p>
                  )}
                </div>

                {/* Right Column: Subcategories Panel */}
                <div className="flex-1 overflow-y-auto p-5 pb-16 bg-white flex flex-col scrollbar-thin">
                  {activeCategory ? (
                    <>
                      {/* Active Silhouette Banner */}
                      <div
                        onClick={() => handleCategoryClick(activeCategory)}
                        className="mb-5 relative rounded-2xl overflow-hidden h-28 sm:h-32 bg-zinc-950 flex flex-col justify-end p-4 border border-primary/20 shadow-xs flex-shrink-0 cursor-pointer group active:scale-[0.98] transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/25 z-10 group-hover:via-black/60 transition duration-300" />
                        <img
                          src={
                            activeCategory.categoryImage?.url ||
                            "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=600&q=80"
                          }
                          alt={activeCategory.categoryName}
                          className="absolute inset-0 w-full h-full object-cover opacity-65 scale-105 group-hover:scale-110 transition duration-700"
                        />
                        
                        {/* Tap Indicator Badge */}
                        <div className="absolute top-3 right-3 z-20 bg-primary/25 border border-primary/45 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                          <span className="text-[7.5px] font-bold tracking-widest text-primary uppercase animate-pulse">
                            TAP TO VIEW ALL
                          </span>
                        </div>

                        <div className="relative z-20 w-full flex flex-col gap-2">
                          <div>
                            <span className="text-[8px] font-bold tracking-[0.25em] text-primary uppercase block">
                              COLLECTION SILHOUETTE
                            </span>
                            <h4 className="text-base font-normal text-white font-display mt-0.5">
                              {activeCategory.categoryName}
                            </h4>
                          </div>
                          
                          <div className="w-full py-2 bg-primary group-hover:bg-primary-hover text-zinc-950 font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl transition duration-300 shadow-md">
                            Browse All {activeCategory.categoryName === "All Collections" ? "Atelier Pieces" : activeCategory.categoryName} <FiArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>

                      {/* Subcategories list */}
                      <div className="flex justify-between items-center mb-3.5 px-1 flex-shrink-0">
                        <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                          CURATED STYLES
                        </span>
                        {activeCategory.subcategories &&
                          activeCategory.subcategories.length > 0 && (
                            <span className="text-[9px] font-bold text-luxury-gray">
                              {activeCategory.subcategories.length} Styles
                            </span>
                          )}
                      </div>

                      {activeCategory.subcategories &&
                      activeCategory.subcategories.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                          {/* Prepend a virtual "View All" card in the subcategories grid for instant, obvious browsing */}
                          {activeCategory._id !== "all" && (
                            <motion.div
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleCategoryClick(activeCategory)}
                              className="luxury-card rounded-xl p-2 flex flex-col items-center justify-center text-center cursor-pointer bg-gradient-to-b from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/25 border border-primary/30 shadow-xs group"
                            >
                              <div className="w-full aspect-square rounded-lg overflow-hidden border border-primary/20 bg-zinc-950 mb-2 relative flex items-center justify-center">
                                <img
                                  src={
                                    activeCategory.categoryImage?.url ||
                                    "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=600&q=80"
                                  }
                                  alt={`All ${activeCategory.categoryName}`}
                                  className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-110 transition duration-500"
                                />
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition duration-300" />
                                <div className="relative z-10 flex flex-col items-center gap-1">
                                  <span className="text-xl text-primary-light animate-bounce-subtle">✨</span>
                                  <span className="text-[8px] font-bold tracking-[0.18em] text-primary bg-zinc-950/85 px-2 py-0.5 rounded-full border border-primary/20">
                                    VIEW ALL
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-primary line-clamp-1 px-1 mt-0.5">
                                All {activeCategory.categoryName}
                              </span>
                            </motion.div>
                          )}

                          {activeCategory.subcategories.map((sub, sIdx) => {
                            const subImageUrl = sub.isCategoryDirect && sub.imageUrl
                              ? sub.imageUrl
                              : getSubcategoryImage(sub.subcategoryName);
                            return (
                              <motion.div
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                key={sub._id || sIdx}
                                onClick={() =>
                                  handleSubcategoryClick(
                                    activeCategory._id,
                                    sub.subcategoryName,
                                    sub.isCategoryDirect,
                                    sub.categoryObj
                                  )
                                }
                                className="luxury-card rounded-xl p-2 flex flex-col items-center text-center cursor-pointer bg-zinc-50/50 hover:bg-white hover:border-primary/40 transition duration-300 border border-primary/5 shadow-xs"
                              >
                                <div className="w-full aspect-square rounded-lg overflow-hidden border border-zinc-100 bg-zinc-100 mb-2">
                                  <img
                                    src={subImageUrl}
                                    alt={sub.subcategoryName}
                                    className="w-full h-full object-cover transition duration-500 hover:scale-105"
                                  />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-800 line-clamp-1 px-1 mt-0.5">
                                  {sub.subcategoryName}
                                </span>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3.5">
                          <span className="text-3xl text-primary/30">✨</span>
                          <p className="text-xs text-zinc-400 italic max-w-[220px] leading-relaxed">
                            No subcategories curated for this silhouette yet.
                          </p>
                          <button
                            onClick={() => handleCategoryClick(activeCategory)}
                            className="px-5 py-2.5 bg-luxury-black text-white hover:bg-primary rounded-xl text-[10px] font-bold uppercase tracking-widest transition cursor-pointer border border-primary/10 hover:border-transparent hover:shadow-md"
                          >
                            Explore Main Silhouette
                          </button>
                        </div>
                      )}

                      {/* Large Prominent Full-Width Gold Button at bottom to make browsing extremely easy */}
                      <div className="mt-6 flex-shrink-0">
                        <button
                          onClick={() => handleCategoryClick(activeCategory)}
                          className="w-full py-4 bg-primary hover:bg-zinc-950 text-zinc-950 hover:text-primary hover:border-primary border border-transparent rounded-xl text-[10px] font-bold uppercase tracking-widest transition duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-md animate-pulse-subtle"
                        >
                          Explore All {activeCategory.categoryName === "All Collections" ? "Atelier Pieces" : activeCategory.categoryName} <FiArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-xs text-zinc-400 italic">
                      Select a category to view styles.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomNavigation;
