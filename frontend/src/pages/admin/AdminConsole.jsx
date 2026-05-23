import { useState, useRef, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiGrid, 
  FiLayers, 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiTrash2, 
  FiCamera, 
  FiMail, 
  FiPhone, 
  FiCalendar,
  FiEye,
  FiEyeOff,
  FiUsers
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { updateProfile, uploadAvatar, removeAvatar, logoutUser } from '../../redux/authSlice';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/apis';

// Imported modular components
import AdminCategoryView from './AdminCategoryView';
import AdminItemView from './AdminItemView';
import AdminUserView from './AdminUserView';

// =========================================================================
// 2. ADMIN PROFILE PAGE SUB-COMPONENT
// =========================================================================
const AdminProfileView = ({ onOpenLogout }) => {
  const dispatch = useDispatch();
  const { user, isActionLoading } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  // Modal Open States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Form States
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        mobile: user.mobile || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileData.name.trim() || !profileData.mobile.trim()) {
      return toast.error('Please fill out all fields.');
    }

    dispatch(updateProfile(profileData))
      .unwrap()
      .then((data) => {
        toast.success(data.message || 'Profile updated successfully.');
        setIsEditModalOpen(false);
      })
      .catch((err) => {
        toast.error(err || 'Failed to update profile.');
      });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error('Please fill out all fields.');
    }

    if (newPassword.length < 6) {
      return toast.error('Password must contain at least 6 characters.');
    }

    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    try {
      setIsPasswordChanging(true);
      const response = await axiosInstance.put(API_ENDPOINTS.CHANGE_PASSWORD, passwordData);
      toast.success(response.data.message || 'Password updated successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Only image assets are supported!');
    }

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Asset exceeds 2MB limit!');
    }

    const formData = new FormData();
    formData.append('image', file);

    toast.promise(
      dispatch(uploadAvatar(formData)).unwrap(),
      {
        loading: 'Uploading luxury portrait...',
        success: 'Atelier portrait saved!',
        error: (err) => err || 'Failed to upload photo.',
      }
    );
  };

  const handleDeletePhoto = () => {
    if (!user?.profileImage?.url) return;

    if (window.confirm('Are you sure you wish to delete your atelier avatar?')) {
      toast.promise(
        dispatch(removeAvatar()).unwrap(),
        {
          loading: 'Deleting avatar...',
          success: 'Atelier avatar removed.',
          error: (err) => err || 'Failed to delete photo.',
        }
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <span className="text-[10px] font-bold tracking-[0.3em] text-[#c5a059] uppercase block mb-1">
          SECURITY & CONTROLS
        </span>
        <h2 className="text-3xl font-light text-zinc-950 font-display">Admin Profile</h2>
        <p className="text-xs text-luxury-gray mt-1">
          Manage your credentials, secure access keys, and digital visual identity.
        </p>
      </div>

      {/* Main Luxury Profile Card */}
      <div className="bg-white border border-[#ece9df] rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(230,224,208,0.2)] max-w-2xl relative overflow-hidden">
        {/* Decorative beige background highlight */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#faf9f6] rounded-full translate-x-12 -translate-y-12 blur-xl" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
          {/* Avatar Area */}
          <div className="relative group select-none flex-shrink-0">
            {user?.profileImage?.url ? (
              <img
                src={user.profileImage.url}
                alt={user.name}
                className="w-28 h-28 rounded-full object-cover border-2 border-[#c5a059]/20 shadow-sm group-hover:brightness-90 transition duration-300"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#f4eee1] border-2 border-[#c5a059]/15 shadow-inner text-[#c5a059] flex items-center justify-center font-bold text-4xl font-display">
                {user?.name?.charAt(0) || 'A'}
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 rounded-full">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white rounded-full text-zinc-800 hover:scale-105 active:scale-95 transition cursor-pointer"
                title="Change Portrait"
              >
                <FiCamera className="w-4 h-4" />
              </button>
              {user?.profileImage?.url && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="p-2 bg-rose-600 rounded-full text-white hover:scale-105 active:scale-95 transition cursor-pointer"
                  title="Remove Portrait"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Details Area */}
          <div className="text-center sm:text-left flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2.5">
                <h3 className="text-2xl font-light text-zinc-950 font-display">{user?.name}</h3>
                <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-[#f4eee1] text-[#b48f48] border border-[#c5a059]/15">
                  Atelier Admin
                </span>
              </div>
              <p className="text-xs text-luxury-gray mt-1 flex items-center justify-center sm:justify-start gap-2">
                <FiMail className="text-[#c5a059]/70" /> {user?.email}
              </p>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-[10px] font-semibold text-luxury-gray uppercase tracking-widest">
              <span className="bg-[#faf9f6] border border-[#ece9df]/60 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <FiPhone className="text-[#c5a059]/70" /> {user?.mobile || 'No mobile linked'}
              </span>
              <span className="bg-[#faf9f6] border border-[#ece9df]/60 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <FiCalendar className="text-[#c5a059]/70" />
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'May 2026'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-zinc-950 text-white rounded-xl hover:bg-[#c5a059] transition duration-300 shadow-xs cursor-pointer"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-[#faf9f6] border border-[#ece9df] text-zinc-800 rounded-xl hover:bg-[#f4eee1] hover:border-[#c5a059]/30 transition duration-300 cursor-pointer"
              >
                Change Password
              </button>
              <button
                onClick={onOpenLogout}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-rose-50 border border-rose-100 text-rose-600 rounded-xl hover:bg-rose-100 transition duration-300 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-md p-6 bg-white border border-[#ece9df] rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#c5a059]" />
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-light text-zinc-950 font-display mb-4">Edit Profile Settings</h3>
              
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="floating-input-group">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder=" "
                    required
                    className="floating-input"
                  />
                  <label htmlFor="name" className="floating-label">Full Name</label>
                </div>
                
                <div className="floating-input-group">
                  <input
                    type="text"
                    name="mobile"
                    id="mobile"
                    value={profileData.mobile}
                    onChange={handleProfileChange}
                    placeholder=" "
                    required
                    className="floating-input"
                  />
                  <label htmlFor="mobile" className="floating-label">Mobile Number</label>
                </div>
                
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isActionLoading}
                    className="px-5 py-2 bg-zinc-950 text-white hover:bg-[#c5a059] rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    {isActionLoading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHANGE PASSWORD MODAL */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPasswordModalOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-md p-6 bg-white border border-[#ece9df] rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#c5a059]" />
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-light text-zinc-950 font-display mb-4">Change Password</h3>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Old Password */}
                <div className="floating-input-group relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    name="oldPassword"
                    id="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder=" "
                    required
                    className="floating-input pr-10"
                  />
                  <label htmlFor="oldPassword" className="floating-label">Current Password</label>
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showOldPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>

                {/* New Password */}
                <div className="floating-input-group relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder=" "
                    required
                    className="floating-input pr-10"
                  />
                  <label htmlFor="newPassword" className="floating-label">New Password</label>
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showNewPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Confirm New Password */}
                <div className="floating-input-group relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder=" "
                    required
                    className="floating-input pr-10"
                  />
                  <label htmlFor="confirmPassword" className="floating-label">Confirm New Password</label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPasswordChanging}
                    className="px-5 py-2 bg-zinc-950 text-white hover:bg-[#c5a059] rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    {isPasswordChanging ? 'Modifying...' : 'Change Credentials'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


// =========================================================================
// 5. MAIN ADMIN PANEL LAYOUT COMPONENT
// =========================================================================
const AdminConsole = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Layout States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // Close mobile sidebar drawer on path change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogoutConfirm = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        toast.success('Session terminated safely.', { icon: '🔑' });
        navigate('/login');
      })
      .catch((err) => {
        toast.error(err || 'Failed to logout.');
      });
  };

  // Dedicated Sidebar Menu Links: profile, categories, items, users.
  const sidebarLinks = [
    { name: 'Profile', path: 'profile', icon: FiUser },
    { name: 'Categories', path: 'categories', icon: FiGrid },
    { name: 'Items', path: 'items', icon: FiLayers },
    { name: 'User Details', path: 'users', icon: FiUsers },
  ];

  const currentPathEnd = location.pathname.split('/').pop();

  return (
    <div className="flex min-h-screen bg-[#faf9f6] text-zinc-950 font-sans relative overflow-x-hidden">
      
      {/* 1. SIDEBAR (DESKTOP - FIXED & STICKY, MOBILE - SLIDING DRAWER) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#ece9df] flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-xs
        lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header Logo Area */}
        <div className="p-6 border-b border-[#ece9df] flex items-center justify-between">
          <Link to="/admin" className="flex flex-col select-none cursor-pointer">
            <span className="brand-logo text-primary tracking-[0.25em] text-2xl font-light italic">
              JEWELLERY
            </span>
          </Link>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-zinc-800 p-1.5 rounded-full hover:bg-[#faf9f6] transition cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Middle Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            // Check active status
            const isActive = currentPathEnd === link.path || (link.path === 'profile' && (currentPathEnd === 'admin' || currentPathEnd === ''));
            
            return (
              <Link
                key={link.path}
                to={`/admin/${link.path}`}
                className={`
                  flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer
                  ${isActive 
                    ? 'bg-[#f4eee1] text-[#b48f48] border-l-2 border-[#c5a059] shadow-xs' 
                    : 'text-zinc-600 hover:bg-[#faf9f6] hover:text-zinc-950'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#b48f48]' : 'text-zinc-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Bottom Footer Profile / Logout Toggle */}
        <div className="p-4 border-t border-[#ece9df] space-y-4">
          <div className="flex items-center gap-3.5 px-2 py-1 bg-[#faf9f6] rounded-xl border border-[#ece9df]/50">
            {user?.profileImage?.url ? (
              <img
                src={user.profileImage.url}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-[#c5a059]/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#f4eee1] border border-[#c5a059]/15 text-[#c5a059] flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-900 truncate">{user?.name || 'Admin'}</p>
              <p className="text-[9px] text-zinc-500 truncate uppercase tracking-wider font-semibold">Atelier Staff</p>
            </div>
          </div>

          <button
            onClick={() => setIsLogoutOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-rose-100 bg-rose-50/40 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-xl text-[10px] font-bold uppercase tracking-widest transition duration-300 cursor-pointer"
          >
            <FiLogOut className="w-3.5 h-3.5" /> Logout Session
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile viewport */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* 2. MAIN APP CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 min-h-screen">
        
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 bg-white border-b border-[#ece9df] px-4 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-zinc-600 hover:text-zinc-950 cursor-pointer"
            title="Open Sidebar"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          
          <span className="brand-logo text-primary text-xl font-light italic tracking-wider">JEWELLERY</span>
          
          {user?.profileImage?.url ? (
            <img
              src={user.profileImage.url}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-[#c5a059]/20"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#f4eee1] text-[#c5a059] flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0) || 'A'}
            </div>
          )}
        </header>

        {/* Dashboard Main Router Viewport */}
        <main className="flex-1 p-6 sm:p-8 lg:p-12 max-w-5xl w-full mx-auto space-y-8">
          <Routes>
            <Route path="/" element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<AdminProfileView onOpenLogout={() => setIsLogoutOpen(true)} />} />
            <Route path="categories" element={<AdminCategoryView />} />
            <Route path="items" element={<AdminItemView />} />
            <Route path="users" element={<AdminUserView />} />
            <Route path="*" element={<Navigate to="profile" replace />} />
          </Routes>
        </main>
      </div>

      {/* LOGOUT SESSION MODAL */}
      <AnimatePresence>
        {isLogoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-sm p-6 bg-white border border-[#ece9df] rounded-2xl shadow-xl overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-rose-500" />
              <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLogOut className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-light text-zinc-950 font-display mb-2">Logout Security Check</h3>
              <p className="text-xs text-luxury-gray mb-6">
                Are you certain you wish to log out of the JEWELLERY administrative console? Doing so will close your active dashboard session.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setIsLogoutOpen(false)}
                  className="px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogoutConfirm}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Logout Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminConsole;
