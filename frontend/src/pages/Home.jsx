import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHeart,
  FiShoppingBag,
  FiArrowRight,
  FiSliders,
  FiTrendingUp,
  FiGift,
  FiShield,
  FiRotateCcw,
  FiX,
  FiCheck,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchCategories } from "../redux/categorySlice";
import { fetchProducts } from "../redux/productSlice";
import ProductCard from "../components/ProductCard";
import ProductDetailModal from "../components/ProductDetailModal";

// Highly aesthetic Unsplash model photography matching modern minimal luxury brands
const HERO_BANNERS = [
  {
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80",
    subtitle: "JEWELLERY HERITAGE JEWELLERY 2026",
    title: "THE ART OF LUXURY GOLD",
    desc: "Handcrafted solid 22K yellow gold and Polki bridal neckpieces designed for timeless grace.",
    cta: "Explore Jewellery",
  },
  {
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1600&q=80",
    subtitle: "JEWELLERY SOLITAIRES",
    title: "GLOW WITH ELEGANCE",
    desc: "Exquisite diamond engagement bands and daily-wear gemstone rings, forged in premium white and rose gold.",
    cta: "Shop Solitaires",
  },
];

const CRAFT_HOTSPOTS = [
  {
    id: 1,
    title: "PURE 22K GOLD",
    desc: "Forged from hallmarked 22-karat pure gold of ultimate brilliance.",
    x: "25%",
    y: "35%",
  },
  {
    id: 2,
    title: "CONFLICT-FREE DIAMONDS",
    desc: "Certified ethically-sourced diamonds of premium clarity and cut.",
    x: "65%",
    y: "50%",
  },
  {
    id: 3,
    title: "ARTISAN ENGRAVING",
    desc: "Handcrafted filigree engravings meticulously detailed by heritage designers.",
    x: "45%",
    y: "80%",
  },
];

const Home = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.categories,
  );
  const { products, loading: productsLoading } = useSelector(
    (state) => state.products,
  );

  const [activeBanner, setActiveBanner] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubcategoryName, setSelectedSubcategoryName] = useState(null);
  const [activeHotspot, setActiveHotspot] = useState(null);

  // Product detail modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Auto rotate banners
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Sync with product query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get("product");
    if (productId && products.length > 0) {
      const found = products.find((p) => p._id === productId);
      if (found) {
        setSelectedProduct(found);
        setIsDetailOpen(true);
      }
    }
  }, [location.search, products]);

  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
    window.history.pushState(null, "", `?product=${product._id}`);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    window.history.replaceState(null, "", window.location.pathname);
  };

  const activeProducts = products.filter((prod) => {
    if (prod.status !== "active") return false;
    if (selectedCategoryId) {
      const catId = prod.category?._id || prod.category;
      if (catId !== selectedCategoryId) return false;
    }
    if (selectedSubcategoryName) {
      if (
        !prod.subcategory ||
        prod.subcategory.toLowerCase() !== selectedSubcategoryName.toLowerCase()
      ) {
        return false;
      }
    }
    return true;
  });

  // Load initial data
  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
    if (products.length === 0) dispatch(fetchProducts());
  }, [dispatch, categories.length, products.length]);

  // Sync state from location
  useEffect(() => {
    if (location.state) {
      if (location.state.selectedCategoryId !== undefined) {
        setSelectedCategoryId(location.state.selectedCategoryId);
      }
      if (location.state.selectedSubcategoryName !== undefined) {
        setSelectedSubcategoryName(location.state.selectedSubcategoryName);
      }

      if (
        location.state.selectedCategoryId ||
        location.state.selectedSubcategoryName
      ) {
        setTimeout(() => {
          const target = document.getElementById("products-section");
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  }, [location.state]);

  // Motion variants for stagger entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="pb-24 sm:pb-12 bg-ivory">
      {/* 1. Hero Banner Section with Ken Burns Transition */}
      <div className="relative h-[80vh] sm:h-[90vh] w-full overflow-hidden bg-zinc-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBanner}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* High Quality Fashion Image Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10 z-10" />
            <motion.img
              initial={{ scale: 1.12 }}
              animate={{ scale: 1.01 }}
              transition={{ duration: 6, ease: "easeOut" }}
              src={HERO_BANNERS[activeBanner].image}
              alt="Fashion Runway"
              className="h-full w-full object-cover object-center brightness-[0.85]"
            />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end px-6 sm:px-12 lg:px-20 pb-20 sm:pb-24 max-w-4xl">
          {/* Animated line progress */}
          <div className="w-16 h-[1.5px] bg-primary/35 mb-5 overflow-hidden relative">
            <motion.div
              key={activeBanner}
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 6, ease: "linear" }}
              className="absolute inset-0 bg-primary"
            />
          </div>

          <motion.span
            key={`sub-${activeBanner}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[10px] sm:text-xs font-bold tracking-[0.45em] text-primary uppercase mb-2.5 sm:mb-4 block"
          >
            {HERO_BANNERS[activeBanner].subtitle}
          </motion.span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light text-white leading-tight font-display mb-4 sm:mb-6 overflow-hidden">
            {HERO_BANNERS[activeBanner].title.split(" ").map((word, i) => (
              <span key={i} className="inline-block overflow-hidden mr-3">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.9,
                    delay: i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            key={`desc-${activeBanner}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed max-w-lg mb-8 sm:mb-10"
          >
            {HERO_BANNERS[activeBanner].desc}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={() => navigate("/collection")}
              className="gold-shimmer-btn px-8 py-4 sm:px-10 rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              {HERO_BANNERS[activeBanner].cta}
            </button>

            {/* Next/Prev Dots */}
            <div className="flex gap-2.5 ml-6">
              {HERO_BANNERS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBanner(idx)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                    activeBanner === idx
                      ? "w-8 bg-primary"
                      : "bg-white/40 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 2. Elevated Category Silhouette Carousel Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-20">
        <div className="flex justify-between items-end mb-8 sm:mb-12">
          <div>
            <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase block mb-1">
              DESIGN ATELIER
            </span>
            <h2 className="text-2xl sm:text-4xl font-light text-zinc-950 font-display">
              Shop by Curated Silhouette
            </h2>
          </div>
          {selectedCategoryId || selectedSubcategoryName ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] font-bold text-luxury-gray uppercase tracking-widest">
                Active:{" "}
                {categories.find((c) => c._id === selectedCategoryId)
                  ?.categoryName || "Silhouette"}
                {selectedSubcategoryName && ` > ${selectedSubcategoryName}`}
              </span>
              <button
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSelectedSubcategoryName(null);
                }}
                className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-primary hover:text-red-500 transition cursor-pointer border border-primary/20 hover:border-red-500/20 px-3 py-1 rounded-full bg-white shadow-2xs"
              >
                Clear All <FiX className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/collection")}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-hover transition cursor-pointer border-b border-primary/35 pb-1"
            >
              Browse Catalog <FiArrowRight />
            </button>
          )}
        </div>

        {categoriesLoading ? (
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-24 sm:w-28 text-center animate-pulse"
              >
                <div className="aspect-square w-full rounded-full bg-zinc-200 mb-2.5" />
                <div className="h-3 w-16 bg-zinc-200 mx-auto rounded" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory justify-start sm:justify-center w-full"
          >
            {categories.map((cat, idx) => {
              const imageUrl =
                cat.categoryImage?.url ||
                [
                  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=80",
                  "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=300&q=80",
                  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80",
                  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=300&q=80",
                  "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=300&q=80",
                ][idx % 5];

              return (
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  key={cat._id || idx}
                  onClick={() => {
                    navigate(`/collection?category=${cat._id}`);
                  }}
                  className="flex-shrink-0 w-24 sm:w-28 text-center snap-center cursor-pointer group"
                >
                  <div className="relative aspect-square w-full rounded-full overflow-hidden border border-primary/10 shadow-xs mb-2.5 transition duration-500 group-hover:shadow-md group-hover:border-primary/30">
                    <img
                      src={imageUrl}
                      alt={cat.categoryName}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/45 transition duration-500 z-10" />
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-800 group-hover:text-primary transition duration-300 leading-tight">
                    {cat.categoryName}
                  </p>
                </motion.div>
              );
            })}
            {categories.length === 0 && (
              <p className="col-span-6 text-center text-xs text-zinc-400 italic py-4">
                No categories created yet.
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* 3. Trending Runway Looks Grid */}
      <div
        id="products-section"
        className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-16 scroll-mt-24"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase block mb-1">
              WEEKLY CURATED
            </span>
            <h2 className="text-2xl sm:text-4xl font-light text-zinc-950 font-display">
              Trending Runway Looks
            </h2>
            <p className="text-xs text-luxury-gray mt-2 font-medium">
              Bespoke luxury pieces designed for effortless styling transitions.
            </p>
          </div>
          {selectedCategoryId && (
            <button
              onClick={() =>
                navigate(`/collection?category=${selectedCategoryId}`)
              }
              className="px-5 py-2.5 border border-primary/20 hover:border-primary text-primary rounded-full text-[9px] font-extrabold uppercase tracking-widest transition cursor-pointer bg-white/80 shadow-2xs"
            >
              Browse All in Category
            </button>
          )}
        </div>

        {/* Premium Products Responsive Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="flex flex-col space-y-4 animate-pulse">
                <div className="aspect-square w-full bg-zinc-100 rounded-3xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-100 rounded w-1/3" />
                  <div className="h-4 bg-zinc-100 rounded w-2/3" />
                  <div className="h-4 bg-zinc-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activeProducts.length > 0 ? (
          <div className="space-y-12">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8"
            >
              {activeProducts.slice(0, 12).map((prod) => (
                <motion.div variants={itemVariants} key={prod._id}>
                  <ProductCard
                    product={prod}
                    onOpenDetail={() => handleOpenDetail(prod)}
                  />
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center pt-4">
              <button
                onClick={() => navigate("/collection")}
                className="gold-shimmer-btn px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2.5 hover:shadow-xl active:scale-95 transition-all duration-300 cursor-pointer"
              >
                View All Collection <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 bg-white/40 border border-primary/5 rounded-[32px]">
            <span className="text-4xl text-primary/30">✨</span>
            <h3 className="text-lg font-medium text-zinc-500 font-display">
              Silhouette Not Available
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
              We are currently hand-curating new luxury designs for this
              category. Please check back soon or browse our other silhouettes.
            </p>
            {selectedCategoryId && (
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="px-6 py-2.5 border border-primary/20 text-primary hover:border-primary rounded-full text-[10px] font-bold uppercase tracking-widest transition cursor-pointer bg-white"
              >
                View All Silhouettes
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. Split-Screen Atelier Craftsmanship Story Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image & Hotspots Viewport */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="relative aspect-[4/5] rounded-[32px] overflow-hidden group shadow-md"
          >
            <img
              src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80"
              alt="High Jewellery Crafting"
              className="w-full h-full object-cover group-hover:scale-103 transition duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

            {/* Interactive Craft hotspots */}
            {CRAFT_HOTSPOTS.map((spot) => (
              <div
                key={spot.id}
                className="absolute z-20 cursor-pointer group/spot"
                style={{ left: spot.x, top: spot.y }}
                onMouseEnter={() => setActiveHotspot(spot.id)}
                onMouseLeave={() => setActiveHotspot(null)}
                onClick={() =>
                  setActiveHotspot(activeHotspot === spot.id ? null : spot.id)
                }
              >
                {/* Glowing Dot indicator */}
                <div className="w-5 h-5 rounded-full bg-primary/35 flex items-center justify-center relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-white relative z-10" />
                  <div className="absolute inset-0 rounded-full bg-white/70 animate-ping" />
                </div>

                {/* Popover */}
                <AnimatePresence>
                  {activeHotspot === spot.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-7 left-1/2 -translate-x-1/2 w-48 bg-white/95 backdrop-blur-md p-3 border border-primary/20 rounded-xl shadow-lg text-left"
                    >
                      <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-primary">
                        {spot.title}
                      </h4>
                      <p className="text-[8px] font-bold text-zinc-600 mt-1 leading-normal">
                        {spot.desc}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>

          {/* Typography Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase block">
                ETHICALLY SOURCED CRAFTSMANSHIP
              </span>
              <h3 className="text-3xl sm:text-5xl font-light font-display text-zinc-950 leading-tight">
                Adorned for Eternity,
                <br />
                Crafted with Care
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-luxury-gray leading-relaxed font-medium">
              Every piece in our Atelier collection is built utilizing 100%
              ethically sourced precious metals, conflict-free gemstones, and
              fully traceable gold. Enjoy pure elegance with a conscious heart.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-900 flex items-center gap-1.5">
                  <FiCheck className="text-primary w-4 h-4" /> 22K Gold
                </h4>
                <p className="text-[10px] text-luxury-gray">
                  Hallmarked 22-karat gold of ultimate purity.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-900 flex items-center gap-1.5">
                  <FiCheck className="text-primary w-4 h-4" /> Traceable Gems
                </h4>
                <p className="text-[10px] text-luxury-gray">
                  QR tracking verifying ethical mine-to-market source.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() =>
                  toast.success("Redirecting to Heritage Atelier...")
                }
                className="gold-shimmer-btn px-6 py-4 rounded-full text-[9px] font-bold uppercase tracking-widest hover:shadow-lg transition cursor-pointer"
              >
                Conscious Living
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 5. Aesthetic lookbook grid ("Seasonal Curation") */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-[10px] font-bold tracking-[0.38em] text-primary uppercase block mb-2">
            THE JEWELLERY JOURNAL
          </span>
          <h2 className="text-3xl sm:text-4xl font-light font-display text-zinc-950">
            Bespoke Bridal & Daily Adornments
          </h2>
          <p className="text-xs text-luxury-gray mt-1 font-medium">
            Curated designs outlining modern elegance and luxury.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <motion.div
            whileHover={{ y: -8 }}
            className="group relative h-[55vh] sm:h-[60vh] rounded-[32px] overflow-hidden shadow-sm cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80"
              alt="Handcrafted Gold Rings"
              className="w-full h-full object-cover group-hover:scale-104 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary">
                LOOK 01 — ETERNAL BANDS
              </span>
              <h3 className="text-xl text-white font-light font-display mt-1">
                Handcrafted Gold Rings
              </h3>
              <p className="text-[10px] text-zinc-300 mt-2 font-medium">
                Bespoke designs range from minimal bands to statement gemstone rings.
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            className="group relative h-[55vh] sm:h-[60vh] rounded-[32px] overflow-hidden shadow-sm cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
              alt="Royal Necklaces"
              className="w-full h-full object-cover group-hover:scale-104 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary">
                LOOK 02 — ROYAL CHOKERS
              </span>
              <h3 className="text-xl text-white font-light font-display mt-1">
                Royal Necklaces & Pendants
              </h3>
              <p className="text-[10px] text-zinc-300 mt-2 font-medium">
                Intricately designed bridal chokers and elegant daily wear chains.
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            className="group relative h-[55vh] sm:h-[60vh] rounded-[32px] overflow-hidden shadow-sm cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=600&q=80"
              alt="Earrings & Matha Pattis"
              className="w-full h-full object-cover group-hover:scale-104 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary">
                LOOK 03 — TRADITIONAL GLOW
              </span>
              <h3 className="text-xl text-white font-light font-display mt-1">
                Earrings & Matha Pattis
              </h3>
              <p className="text-[10px] text-zinc-300 mt-2 font-medium">
                Traditional jhumkas and contemporary ear studs, paired with classic matha pattis.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 6. Boutique Member Newsletter (Atelier Club Signup) */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-16">
        <div className="luxury-card rounded-[32px] p-8 sm:p-16 text-center max-w-4xl mx-auto relative overflow-hidden champagne-gradient border border-primary/20 gold-border-glow">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          <span className="text-[10px] font-extrabold tracking-[0.38em] text-primary uppercase block mb-3">
            ATELIER MEMBERS CLUB
          </span>
          <h2 className="text-3xl sm:text-4xl font-light font-display text-zinc-950 mb-4">
            Unlock Premium Curations
          </h2>
          <p className="text-xs sm:text-sm text-luxury-gray max-w-md mx-auto mb-8 leading-relaxed font-medium">
            Receive exclusive early access to runway drops, bespoke lookbook
            releases, and members-only boutique advantages.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(
                "Welcome to JEWELLERY Atelier Club! Check your inbox shortly.",
                {
                  style: {
                    background: "#111",
                    color: "#faf9f6",
                    borderRadius: "12px",
                    border: "1px solid rgba(197,160,89,0.3)",
                  },
                  iconTheme: { primary: "#c5a059", secondary: "#111" },
                },
              );
              e.target.reset();
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <div className="flex-1 relative">
              <input
                required
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-white/80 border border-primary/15 rounded-full px-5 py-3 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-primary transition shadow-2xs placeholder-zinc-400"
              />
            </div>
            <button
              type="submit"
              className="gold-shimmer-btn px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:shadow-lg active:scale-98 transition-all"
            >
              Request Access
            </button>
          </form>
        </div>
      </div>

      {/* 7. Brand Showcase Pillars Trust Badges */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-white border border-primary/5 rounded-3xl p-8 shadow-xs">
          <div className="flex flex-col items-center text-center p-2 space-y-2">
            <FiShield className="text-xl text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
              Premium Bespoke
            </h4>
            <p className="text-[10px] text-luxury-gray leading-relaxed font-medium">
              Artisan quality curated with utmost precision.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-2 space-y-2">
            <FiGift className="text-xl text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
              Luxury Velvet Casing
            </h4>
            <p className="text-[10px] text-luxury-gray leading-relaxed font-medium">
              Each order ships in our signature textured velvet and gold leaf casing.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-2 space-y-2">
            <FiRotateCcw className="text-xl text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
              14-Day Boutique Exchange
            </h4>
            <p className="text-[10px] text-luxury-gray leading-relaxed font-medium">
              Easy complimentary pick-ups and insured returns.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-2 space-y-2">
            <FiTrendingUp className="text-xl text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
              Insured & Secured
            </h4>
            <p className="text-[10px] text-luxury-gray leading-relaxed font-medium">
              100% transit-insured shipping and secure transactions.
            </p>
          </div>
        </div>
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

export default Home;
