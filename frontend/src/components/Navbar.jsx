import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import { fetchCategories } from "../redux/categorySlice";
import Modal from "./Modal";
import {
  FiUser,
  FiLogOut,
  FiX,
  FiShield,
  FiHeart,
  FiSearch,
  FiShoppingBag,
  FiHome,
  FiGrid,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { categories } = useSelector((state) => state.categories);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const cartItems = useSelector((state) => state.cart.items);
  console.log("Navbar cartItems:", cartItems.length, cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync search input with URL search parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search");
    setSearchQuery(q || "");
  }, [location.search]);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  const handleLogoutConfirm = () => {
    setIsLogoutOpen(false);
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        toast.success("Patron session ended successfully.");
        navigate("/login");
      })
      .catch((err) => {
        toast.error(err || "Failed to logout.");
      });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collection?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  // Desktop nav items
  const desktopNavItems = [
    { label: "Home", path: "/home", icon: FiHome },
    { label: "Collection", path: "/collection", icon: FiGrid },
    { label: "Wishlist", path: "/wishlist", icon: FiHeart },
    { label: "Cart", path: "/cart", icon: FiShoppingBag },
    { label: "Account", path: "/account", icon: FiUser },
  ];

  const isActive = (path) =>
    location.pathname === path ||
    (path === "/home" && location.pathname === "/");

  return (
    <>
      <nav className="sticky top-0 z-40 bg-ivory/80 backdrop-blur-lg border-b border-primary/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-14">
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.div
                  key="search-bar-active"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex items-center justify-between gap-4 h-full"
                >
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex-1 flex items-center relative"
                  >
                    <FiSearch className="absolute left-1 text-zinc-400 w-4.5 h-4.5" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search jewellery, rings, necklaces..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold tracking-wide text-zinc-900 pl-9 pr-8 py-2 border-b border-zinc-300 focus:border-zinc-950 transition duration-300 outline-none rounded-none placeholder-zinc-400"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-1 text-zinc-400 hover:text-zinc-900 transition cursor-pointer"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </form>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="nav-links-active"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="w-full flex justify-between items-center"
                >
                  {/* LEFT: JEWELLERY luxury brand logo */}
                  <div className="flex items-center">
                    <Link
                      to="/home"
                      className="flex flex-col items-start group select-none gap-0.5"
                    >
                      <span className="brand-logo text-zinc-950 transition duration-300 group-hover:text-primary">
                        JEWELLERY
                      </span>
                    </Link>
                  </div>

                  {/* CENTER: Desktop nav links — lg+ only */}
                  <div className="hidden lg:flex items-center gap-0.5">
                    {desktopNavItems.map((item) => {
                      const active = isActive(item.path);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          to={item.path}
                          className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-200 ${
                            active
                              ? "text-primary bg-primary-light"
                              : "text-zinc-600 hover:text-zinc-950 hover:bg-stone-100"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {item.label}
                          {/* Wishlist badge */}
                          {item.label === "Wishlist" && wishlistItems.length > 0 && (
                            <span className="ml-0.5 bg-red-500 text-white font-sans text-[7px] font-bold min-w-[14px] h-3.5 px-1 rounded-full flex items-center justify-center">
                              {wishlistItems.length}
                            </span>
                          )}
                          {/* Cart badge */}
                          {item.label === "Cart" && cartItems.length > 0 && (
                            <span className="ml-0.5 bg-primary text-white font-sans text-[7px] font-bold min-w-[14px] h-3.5 px-1 rounded-full flex items-center justify-center">
                              {cartItems.length}
                            </span>
                          )}
                          {/* Active indicator */}
                          {active && (
                            <motion.div
                              layoutId="desktopNavPip"
                              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-primary rounded-full"
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* RIGHT: Search + compact actions */}
                  <div className="flex items-center gap-1.5 sm:gap-3">
                    {/* Search */}
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(true)}
                      className="p-2.5 rounded-full text-zinc-800 hover:text-primary hover:bg-primary-light transition cursor-pointer"
                      title="Search Products"
                    >
                      <FiSearch className="w-5 h-5" />
                    </button>

                    {/* Wishlist icon — sm only (lg uses center nav) */}
                    <Link
                      to="/wishlist"
                      className="hidden sm:inline-flex lg:hidden p-2.5 rounded-full text-zinc-800 hover:text-primary hover:bg-primary-light transition relative"
                      title="Wishlist"
                    >
                      <FiHeart className="w-5 h-5" />
                      {wishlistItems.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white font-sans text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-xs">
                          {wishlistItems.length}
                        </span>
                      )}
                    </Link>

                    {/* Cart icon — sm only (lg uses center nav) */}
                    <Link
                      to="/cart"
                      className="hidden sm:inline-flex lg:hidden p-2.5 rounded-full text-zinc-800 hover:text-primary hover:bg-primary-light transition relative"
                      title="Shopping Bag"
                    >
                      <FiShoppingBag className="w-5 h-5" />
                      {cartItems.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-primary text-white font-sans text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-xs">
                          {cartItems.length}
                        </span>
                      )}
                    </Link>

                    {/* User session — sm only (lg uses center nav Account link) */}
                    <div className="hidden sm:inline-block lg:hidden relative">
                      {isAuthenticated ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-white/90 border border-primary/10 transition duration-300 cursor-pointer text-xs font-bold uppercase tracking-wider text-zinc-800"
                          >
                            {user?.profileImage?.url ? (
                              <img
                                src={user.profileImage.url}
                                alt={user.name}
                                className="w-5 h-5 rounded-full object-cover border border-primary/20"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px] uppercase">
                                {user?.name?.charAt(0)}
                              </div>
                            )}
                            <span>{user?.name?.split(" ")[0]}</span>
                          </button>

                          <AnimatePresence>
                            {isDropdownOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setIsDropdownOpen(false)}
                                />
                                <motion.div
                                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                  className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md border border-primary/15 rounded-2xl shadow-xl z-20 py-2 overflow-hidden"
                                >
                                  <Link
                                    to="/account"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-700 hover:bg-primary-light hover:text-primary transition duration-200"
                                  >
                                    <FiUser className="w-4 h-4 text-zinc-400" />
                                    My Account
                                  </Link>
                                  {user?.role === "admin" && (
                                    <Link
                                      to="/admin"
                                      onClick={() => setIsDropdownOpen(false)}
                                      className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-700 hover:bg-primary-light hover:text-primary transition duration-200"
                                    >
                                      <FiShield className="w-4 h-4 text-primary" />
                                      Admin Console
                                    </Link>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsDropdownOpen(false);
                                      setIsLogoutOpen(true);
                                    }}
                                    className="flex items-center gap-3 w-full text-left px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50/50 transition duration-200 cursor-pointer"
                                  >
                                    <FiLogOut className="w-4 h-4" />
                                    Logout
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          to="/account"
                          className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-700 hover:text-primary hover:bg-primary-light rounded-full transition"
                        >
                          Club Access
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Global logout modal */}
      <Modal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Close Session"
        message="Are you certain you wish to end your Patron session with JEWELLERY Jewellery?"
        confirmText="Confirm Logout"
        cancelText="Cancel"
      />
    </>
  );
};

export default Navbar;
