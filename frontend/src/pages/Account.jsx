import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  updateProfile,
  uploadAvatar,
  removeAvatar,
  logoutUser,
} from "../redux/authSlice";
import { fetchAddresses } from "../redux/addressSlice";
import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/apis";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiPhone,
  FiLock,
  FiCamera,
  FiTrash2,
  FiCalendar,
  FiMail,
  FiLogOut,
  FiShield,
  FiMapPin,
  FiPlus,
  FiX,
  FiEdit,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import AddressCard from "../components/AddressCard";
import AddressFormModal from "../components/AddressFormModal";

const Account = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated, user, isActionLoading } = useSelector(
    (state) => state.auth,
  );
  const { addresses, loading: addressesLoading } = useSelector(
    (state) => state.addresses
  );

  // File Input Ref
  const fileInputRef = useRef(null);

  // Modal Open/Close States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // Address Modal States
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);

  // Edit Profile Form States
  const [profileForm, setProfileForm] = useState({
    name: "",
    mobile: "",
  });

  // Change Password Form States
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);

  // Fetch saved destinations on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAddresses());
    }
  }, [dispatch, isAuthenticated]);

  // Open Edit Profile Modal
  const openEditProfile = () => {
    setProfileForm({
      name: user?.name || "",
      mobile: user?.mobile || "",
    });
    setIsEditProfileOpen(true);
  };

  // Open Change Password Modal
  const openChangePassword = () => {
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsChangePasswordOpen(true);
  };

  // Handle Profile detail updates
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.mobile.trim()) {
      return toast.error("Please enter all requested details.");
    }

    dispatch(updateProfile(profileForm))
      .unwrap()
      .then((data) => {
        toast.success(data.message || "Profile information updated.");
        setIsEditProfileOpen(false);
      })
      .catch((err) => {
        toast.error(err || "Failed to update profile.");
      });
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error("Please fill out all password fields.");
    }
    if (newPassword.length < 6) {
      return toast.error("Secret password must contain at least 6 characters.");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    try {
      setIsPasswordChanging(true);
      const response = await axiosInstance.put(
        API_ENDPOINTS.CHANGE_PASSWORD,
        passwordForm,
      );
      toast.success(
        response.data.message || "Credentials updated successfully!",
      );
      setIsChangePasswordOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to alter password.");
    } finally {
      setIsPasswordChanging(false);
    }
  };

  // Upload avatar
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Only image assets are supported!");
    }

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Asset exceeds 2MB limit!");
    }

    const formData = new FormData();
    formData.append("image", file);

    toast.promise(dispatch(uploadAvatar(formData)).unwrap(), {
      loading: "Uploading and optimizing luxury portrait...",
      success: "Boutique portrait saved!",
      error: (err) => err || "Failed to upload photo.",
    });
  };

  // Delete avatar
  const handleDeletePhoto = () => {
    if (!user?.profileImage?.url) return;

    if (
      window.confirm("Are you sure you wish to delete your boutique avatar?")
    ) {
      toast.promise(dispatch(removeAvatar()).unwrap(), {
        loading: "Deleting avatar...",
        success: "Boutique avatar removed.",
        error: (err) => err || "Failed to delete photo.",
      });
    }
  };

  // Confirm logout
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

  const handleEditAddress = (addr) => {
    setAddressToEdit(addr);
    setIsAddressModalOpen(true);
  };

  const handleAddNewAddress = () => {
    setAddressToEdit(null);
    setIsAddressModalOpen(true);
  };

  return (
    <div className="pb-28 pt-8 bg-ivory min-h-[90vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        <div className="absolute top-[-10%] left-[-15%] w-[400px] h-[400px] rounded-full bg-primary/3 blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            /* =============================================
               GUEST ENTRANCE CARD
               ============================================= */
            <motion.div
              key="guest-state"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto py-12 text-center"
            >
              <div className="luxury-card rounded-[32px] p-8 sm:p-12 space-y-8 bg-white/80 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
                  <FiUser className="w-8 h-8" />
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase block">
                    JEWELLERY MEMBERS CLUB
                  </span>
                  <h1 className="text-3xl font-light font-display text-zinc-950">
                    Exclusive Entrance
                  </h1>
                  <p className="text-xs text-luxury-gray leading-relaxed max-w-xs mx-auto font-medium">
                    Sign in to customize private tailoring collections, check ongoing shipments, and edit delivery destinations.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Link
                    to="/login"
                    className="gold-shimmer-btn px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-lg transition text-center select-none"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-8 py-3.5 border border-stone-250 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-800 hover:bg-white transition text-center select-none"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            /* =============================================
               AUTHENTICATED ACCOUNT DASHBOARD
               ============================================= */
            <motion.div
              key="auth-dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Profile Card Header */}
              <div className="luxury-card rounded-[28px] p-6 sm:p-8 relative overflow-hidden bg-white">
                <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-primary/30 via-primary to-primary/30" />

                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left justify-between">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* User Avatar */}
                    <div className="relative flex-shrink-0 select-none">
                      {user?.profileImage?.url ? (
                        <img
                          src={user.profileImage.url}
                          alt={user.name}
                          className="w-24 h-24 sm:w-26 sm:h-26 rounded-full object-cover border-2 border-primary/20 shadow-inner"
                        />
                      ) : (
                        <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-full bg-primary-light border border-primary/10 shadow-inner text-primary flex items-center justify-center font-bold text-3xl uppercase font-display">
                          {user?.name?.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Summary text info */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2.5">
                        <h2 className="text-2xl font-light text-zinc-950 font-display tracking-tight leading-tight">
                          {user?.name}
                        </h2>
                        <span
                          className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            user?.role === "admin"
                              ? "bg-yellow-50 text-yellow-800 border border-yellow-250"
                              : "bg-stone-50 text-stone-500 border border-stone-200"
                          }`}
                        >
                          {user?.role}
                        </span>
                      </div>

                      <p className="text-luxury-gray text-xs font-semibold uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5 truncate max-w-[280px]">
                        <FiMail className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                        {user?.email}
                      </p>

                      <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 text-[9px] font-bold text-luxury-gray uppercase tracking-widest">
                        <span className="bg-stone-50 border border-stone-150 px-3 py-1 rounded-full flex items-center gap-1">
                          <FiPhone className="text-primary/70" />
                          {user?.mobile || "No Mobile Set"}
                        </span>
                        {user?.createdAt && (
                          <span className="bg-stone-50 border border-stone-150 px-3 py-1 rounded-full flex items-center gap-1">
                            <FiCalendar className="text-primary/70" />
                            Joined{" "}
                            {new Date(user?.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "short", year: "numeric" },
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => setIsLogoutOpen(true)}
                    className="px-5 py-3 border border-red-200 hover:border-red-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50/20 transition cursor-pointer select-none"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Action Settings Panels */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase block">
                  ACCOUNT CONFIGURATIONS
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Edit User Details Action Card */}
                  <div
                    onClick={openEditProfile}
                    className="luxury-card rounded-2xl p-5 border border-stone-200/60 hover:border-primary transition duration-300 cursor-pointer flex gap-4 items-center bg-white"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary flex-shrink-0 border border-primary/10">
                      <FiUser className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-950">
                        Update Profile
                      </h4>
                      <p className="text-[11px] font-medium text-luxury-gray leading-tight mt-0.5">
                        Revise name, phone number, and upload avatar.
                      </p>
                    </div>
                  </div>

                  {/* Change Password Action Card */}
                  <div
                    onClick={openChangePassword}
                    className="luxury-card rounded-2xl p-5 border border-stone-200/60 hover:border-primary transition duration-300 cursor-pointer flex gap-4 items-center bg-white"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary flex-shrink-0 border border-primary/10">
                      <FiLock className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-950">
                        Change Password
                      </h4>
                      <p className="text-[11px] font-medium text-luxury-gray leading-tight mt-0.5">
                        Secure credentials and change secret password.
                      </p>
                    </div>
                  </div>
                </div>

                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="luxury-card rounded-2xl p-4 border border-yellow-200/40 hover:border-yellow-500 bg-yellow-50/10 text-yellow-800 transition flex items-center justify-between text-xs font-bold uppercase tracking-widest"
                  >
                    <span className="flex items-center gap-2">
                      <FiShield className="w-4.5 h-4.5" />
                      Atelier Admin Console
                    </span>
                    <FiPlus className="w-4 h-4 rotate-45" />
                  </Link>
                )}
              </div>

              {/* Delivery Addresses Section */}
              <div className="space-y-6 pt-4">
                <div className="flex justify-between items-center border-b border-stone-200/60 pb-3">
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase block">
                      BOUTIQUE DESTINATIONS
                    </span>
                    <h2 className="text-xl font-light text-zinc-950 font-display">
                      My saved addresses
                    </h2>
                  </div>
                  <button
                    onClick={handleAddNewAddress}
                    className="px-5 py-3 border border-zinc-950 hover:bg-luxury-black hover:text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition flex items-center gap-1.5 cursor-pointer select-none bg-white shadow-sm"
                  >
                    <FiPlus className="w-4 h-4" /> Add Address
                  </button>
                </div>

                {addressesLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-bold text-luxury-gray uppercase tracking-widest">
                      Retrieving addresses...
                    </span>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-stone-250 bg-white rounded-[24px] space-y-4">
                    <p className="text-xs font-semibold text-luxury-gray">
                      No delivery destinations saved yet.
                    </p>
                    <button
                      onClick={handleAddNewAddress}
                      className="gold-shimmer-btn px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:shadow-md transition cursor-pointer select-none inline-flex items-center gap-1.5"
                    >
                      <FiPlus className="w-3.5 h-3.5" /> Add Delivery Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <AddressCard
                        key={address._id}
                        address={address}
                        onEdit={handleEditAddress}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =============================================
         EDIT PROFILE DETAILS MODAL
         ============================================= */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditProfileOpen(false)}
              className="absolute inset-0 bg-luxury-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-ivory">
                <div>
                  <span className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase block">JEWELLERY ATELIER</span>
                  <h3 className="text-lg font-light font-display text-zinc-950">Update Profile</h3>
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(false)}
                  className="w-8 h-8 rounded-full border border-stone-200/60 bg-white flex items-center justify-center text-luxury-gray hover:text-zinc-950 transition cursor-pointer"
                >
                  <FiX className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="px-6 py-6 overflow-y-auto space-y-6">
                {/* Avatar upload */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group select-none flex-shrink-0">
                    {user?.profileImage?.url ? (
                      <img
                        src={user.profileImage.url}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover border-2 border-primary/20 shadow-inner group-hover:brightness-90 transition duration-300"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/15 shadow-inner text-primary flex items-center justify-center font-bold text-3xl uppercase font-display">
                        {user?.name?.charAt(0)}
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Upload actions overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/45 rounded-full">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload Photo"
                        className="p-2 bg-white/95 rounded-full text-zinc-800 hover:bg-white hover:scale-105 transition cursor-pointer"
                      >
                        <FiCamera className="w-4.5 h-4.5" />
                      </button>
                      {user?.profileImage?.url && (
                        <button
                          type="button"
                          onClick={handleDeletePhoto}
                          title="Remove Photo"
                          className="p-2 bg-red-600/90 rounded-full text-white hover:bg-red-600 hover:scale-105 transition cursor-pointer"
                        >
                          <FiTrash2 className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-luxury-gray uppercase tracking-widest">
                    Boutique Profile Photo
                  </span>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      Mobile Number *
                    </label>
                    <input
                      type="text"
                      value={profileForm.mobile}
                      onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                      required
                      placeholder="10-digit phone number"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setIsEditProfileOpen(false)}
                      className="px-5 py-3 border border-stone-200 rounded-2xl text-xs font-bold uppercase tracking-widest text-luxury-gray hover:bg-stone-50 transition cursor-pointer select-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isActionLoading}
                      className="gold-shimmer-btn px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center min-w-[120px] hover:shadow-md cursor-pointer select-none"
                    >
                      {isActionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Save Details"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =============================================
         CHANGE PASSWORD MODAL
         ============================================= */}
      <AnimatePresence>
        {isChangePasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChangePasswordOpen(false)}
              className="absolute inset-0 bg-luxury-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-ivory">
                <div>
                  <span className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase block">JEWELLERY ATELIER</span>
                  <h3 className="text-lg font-light font-display text-zinc-950">Change Password</h3>
                </div>
                <button
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="w-8 h-8 rounded-full border border-stone-200/60 bg-white flex items-center justify-center text-luxury-gray hover:text-zinc-950 transition cursor-pointer"
                >
                  <FiX className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="px-6 py-6 overflow-y-auto">
                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  {/* Current Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>

                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      New Password *
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setIsChangePasswordOpen(false)}
                      className="px-5 py-3 border border-stone-200 rounded-2xl text-xs font-bold uppercase tracking-widest text-luxury-gray hover:bg-stone-50 transition cursor-pointer select-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPasswordChanging}
                      className="gold-shimmer-btn px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center min-w-[140px] hover:shadow-md cursor-pointer select-none"
                    >
                      {isPasswordChanging ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Change Password"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Close Session"
        message="Are you certain you wish to end your Patron session with JEWELLERY Boutique?"
        confirmText="Confirm Logout"
        cancelText="Cancel"
      />

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addressToEdit={addressToEdit}
      />
    </div>
  );
};

export default Account;
