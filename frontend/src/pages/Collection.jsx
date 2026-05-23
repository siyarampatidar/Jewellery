import { useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSliders, FiArrowRight, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchCategories } from "../redux/categorySlice";
import { fetchProducts } from "../redux/productSlice";
import ProductCard from "../components/ProductCard";
import ProductDetailModal from "../components/ProductDetailModal";

const Collection = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.categories,
  );
  const { products, loading: productsLoading } = useSelector(
    (state) => state.products,
  );

  const selectedCategoryId = searchParams.get("category");
  const selectedSubcategoryName = searchParams.get("subcategory");
  const searchQuery = searchParams.get("search");
  const [sortBy, setSortBy] = useState("recommended"); // 'recommended', 'price-low', 'price-high'
  const [priceRange, setPriceRange] = useState("all");

  // Product detail modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Sync with product query parameter (for direct links and sharing)
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
    // Preserving current search params while adding product query param
    const newParams = new URLSearchParams(searchParams);
    newParams.set("product", product._id);
    setSearchParams(newParams);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    // Remove product query param but keep others
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("product");
    setSearchParams(newParams);
  };

  // Fetch initial data if not already loaded
  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
    if (products.length === 0) dispatch(fetchProducts());
  }, [dispatch, categories.length, products.length]);

  // Find active category object
  const activeCategoryObj = categories.find(
    (cat) => cat._id === selectedCategoryId,
  );

  // Filter and Sort products
  const filteredProducts = products.filter((prod) => {
    if (prod.status !== "active") return false;

    // Category filter
    if (selectedCategoryId) {
      const catId = prod.category?._id || prod.category;
      if (catId !== selectedCategoryId) return false;
    }

    // Subcategory filter
    if (selectedSubcategoryName) {
      if (
        !prod.subcategory ||
        prod.subcategory.toLowerCase() !== selectedSubcategoryName.toLowerCase()
      ) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.productName?.toLowerCase().includes(q);
      const matchBrand = prod.brand?.toLowerCase().includes(q);
      const matchDesc = (prod.shortDescription || prod.description || "")
        .toLowerCase()
        .includes(q);
      const matchCatName = prod.category?.categoryName
        ?.toLowerCase()
        .includes(q);
      const matchSubcat = prod.subcategory?.toLowerCase().includes(q);

      if (
        !matchName &&
        !matchBrand &&
        !matchDesc &&
        !matchCatName &&
        !matchSubcat
      ) {
        return false;
      }
    }

    // Price range filter
    if (priceRange !== "all") {
      const priceToCheck = prod.discountPrice || prod.price;
      if (priceRange === "0-100") {
        if (priceToCheck > 100) return false;
      } else if (priceRange === "100-500") {
        if (priceToCheck < 100 || priceToCheck > 500) return false;
      } else if (priceRange === "500-1500") {
        if (priceToCheck < 500 || priceToCheck > 1500) return false;
      } else if (priceRange === "1500-4000") {
        if (priceToCheck < 1500 || priceToCheck > 4000) return false;
      } else if (priceRange === "4000-above") {
        if (priceToCheck < 4000) return false;
      }
    }

    return true;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") {
      return a.price - b.price;
    }
    if (sortBy === "price-high") {
      return b.price - a.price;
    }
    // Recommended / Default (falls back to ID order or created date)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleCategorySelect = (categoryId) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId === selectedCategoryId) {
      // Toggle off if clicking the already active one
      newParams.delete("category");
      newParams.delete("subcategory");
    } else {
      newParams.set("category", categoryId);
      newParams.delete("subcategory"); // Reset subcategory when switching category
    }
    // Preserve sorting if set
    setSearchParams(newParams);
  };

  const handleSubcategorySelect = (subName) => {
    const newParams = new URLSearchParams(searchParams);
    if (subName === selectedSubcategoryName) {
      newParams.delete("subcategory");
    } else {
      newParams.set("subcategory", subName);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setSortBy("recommended");
  };

  const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=150&q=80",
  ];

  const categoryScrollRef = useRef(null);

  return (
    <div className="pb-28 pt- bg-ivory min-h-screen">
      {/* DESKTOP CATEGORY CIRCLE ROW — lg+ only */}
      <div className="hidden lg:block sticky top-14 z-30 bg-ivory/90 backdrop-blur-md border-b border-primary/10 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div
            ref={categoryScrollRef}
            className="flex items-start gap-5 overflow-x-auto scrollbar-none py-4 select-none"
          >
            {/* ALL pill */}
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer"
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                  !selectedCategoryId
                    ? "border-primary shadow-[0_0_0_3px_rgba(197,160,89,0.25)] bg-primary/5"
                    : "border-zinc-200 bg-white group-hover:border-primary/40"
                }`}
              >
                <span
                  className={`text-[11px] font-bold uppercase tracking-widest ${
                    !selectedCategoryId
                      ? "text-primary"
                      : "text-zinc-500 group-hover:text-zinc-800"
                  }`}
                >
                  All
                </span>
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider max-w-[60px] text-center leading-tight line-clamp-2 ${
                  !selectedCategoryId ? "text-primary" : "text-zinc-500"
                }`}
              >
                All
              </span>
            </button>

            {/* Category circles */}
            {categories.map((cat, idx) => {
              const img =
                cat.categoryImage?.url ||
                FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
              const active = selectedCategoryId === cat._id;
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => handleCategorySelect(cat._id)}
                  className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer"
                >
                  <div
                    className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-200 ${
                      active
                        ? "border-primary shadow-[0_0_0_3px_rgba(197,160,89,0.25)] scale-105"
                        : "border-zinc-200 group-hover:border-primary/50 group-hover:scale-105"
                    }`}
                  >
                    <img
                      src={img}
                      alt={cat.categoryName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider max-w-[60px] text-center leading-tight line-clamp-2 ${
                      active
                        ? "text-primary"
                        : "text-zinc-500 group-hover:text-zinc-800"
                    }`}
                  >
                    {cat.categoryName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* 3. Subcategories list (Only visible when a category is selected) */}
        {activeCategoryObj &&
          activeCategoryObj.subcategories &&
          activeCategoryObj.subcategories.length > 0 && (
            <div className="mb-6 animate-fade-in">
              <span className="text-[9px] font-bold tracking-[0.25em] text-zinc-400 uppercase block mb-3">
                REFINE STYLE
              </span>
              <div className="flex flex-wrap gap-2">
                {activeCategoryObj.subcategories.map((sub, sIdx) => {
                  const isSubActive =
                    selectedSubcategoryName?.toLowerCase() ===
                    sub.subcategoryName.toLowerCase();
                  return (
                    <button
                      key={sub._id || sIdx}
                      onClick={() =>
                        handleSubcategorySelect(sub.subcategoryName)
                      }
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition duration-300 cursor-pointer ${
                        isSubActive
                          ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                          : "bg-white text-zinc-700 border-zinc-200/85 hover:border-zinc-400 hover:bg-zinc-50"
                      }`}
                    >
                      {sub.subcategoryName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* 4. Filter Dashboard Footer: Active Filters & Sorting */}
        <div className="flex flex-row justify-between items-center py-3 border-b border-primary/10 mb-6 gap-2">
          {/* Left side: Icon + label at start of row */}
          <div className="flex items-center gap-1.5 text-zinc-500 flex-shrink-0">
            <FiSliders className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold tracking-widest uppercase">
              Filter
            </span>
          </div>

          {/* Right side: Select inputs side-by-side in a single row */}
          <div className="flex flex-1 items-center justify-end gap-2">
            {/* Price Range Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto max-w-[140px] sm:max-w-none">
              <span className="hidden sm:inline-block text-[9px] font-bold tracking-widest uppercase text-zinc-400 whitespace-nowrap">
                Price Range
              </span>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full bg-white/80 border border-primary/15 rounded-xl px-2.5 py-1.5 text-[10px] sm:text-xs font-semibold tracking-wider text-zinc-800 focus:outline-none focus:border-primary cursor-pointer select-none shadow-xs"
              >
                <option value="all">All Prices</option>
                <option value="0-100">₹0 - ₹100</option>
                <option value="100-500">₹100 - ₹500</option>
                <option value="500-1500">₹500 - ₹1500</option>
                <option value="1500-4000">₹1500 - ₹4000</option>
                <option value="4000-above">₹4000 & Above</option>
              </select>
            </div>

            {/* Sorting controls */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto max-w-[140px] sm:max-w-none">
              <span className="hidden sm:inline-block text-[9px] font-bold tracking-widest uppercase text-zinc-400 whitespace-nowrap">
                Sort By
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white/80 border border-primary/15 rounded-xl px-2.5 py-1.5 text-[10px] sm:text-xs font-semibold tracking-wider text-zinc-800 focus:outline-none focus:border-primary cursor-pointer select-none shadow-xs"
              >
                <option value="recommended">Curated / New</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. Product Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
            {[...Array(8)].map((_, idx) => (
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
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
            {sortedProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                onOpenDetail={() => handleOpenDetail(prod)}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
            <span className="text-4xl text-primary/30">✨</span>
            <h3 className="text-lg font-medium text-zinc-500 font-display">
              No Jewellery Found
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
              We don't have matching jewellery pieces under this specific filter
              choice. Try broadening your selection or view all pieces.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 border border-primary/20 text-primary hover:border-primary rounded-full text-[10px] font-bold uppercase tracking-widest transition cursor-pointer bg-white"
            >
              Clear All Filters
            </button>
          </div>
        )}
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

export default Collection;
