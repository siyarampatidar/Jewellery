import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiLoader, 
  FiUploadCloud, 
  FiX, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiUserCheck, 
  FiUserX,
  FiUser
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllUsers,
  adminUpdateUserDetails,
  toggleUserActiveStatus,
  deleteUserAccount,
} from '../../redux/adminUserSlice';

const AdminUserView = () => {
  const dispatch = useDispatch();
  const { users, loading, isActionLoading } = useSelector((state) => state.adminUsers);
  const currentUser = useSelector((state) => state.auth.user);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'deactivated'

  // Modals Visibility
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Edit User Form State
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const fileInputRef = useRef(null);

  // Fetch users on component load
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Clean up edit form
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditId('');
    setEditName('');
    setEditEmail('');
    setEditMobile('');
    setEditImageFile(null);
    setEditImagePreview('');
    setCurrentImageUrl('');
  };

  // Prepopulate edit modal
  const openEditModal = (user) => {
    setEditId(user._id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditMobile(user.mobile || '');
    setCurrentImageUrl(user.profileImage?.url || '');
    setEditImagePreview('');
    setEditImageFile(null);
    setIsEditModalOpen(true);
  };

  // Image input change handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        return toast.error('Only image files (JPEG, PNG, WEBP) are supported.');
      }
      if (file.size > 2 * 1024 * 1024) {
        return toast.error('Image exceeds 2MB limit.');
      }
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  // Edit user submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      return toast.error('Name is required.');
    }
    if (!editEmail.trim()) {
      return toast.error('Email is required.');
    }
    if (!editMobile.trim()) {
      return toast.error('Mobile number is required.');
    }

    // Email format validation
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(editEmail)) {
      return toast.error('Please enter a valid email address.');
    }

    // Mobile number format validation
    if (!/^\+?[1-9]\d{1,14}$/.test(editMobile.replace(/\s+/g, ''))) {
      return toast.error('Invalid mobile number format.');
    }

    try {
      const formData = new FormData();
      formData.append('name', editName.trim());
      formData.append('email', editEmail.trim().toLowerCase());
      formData.append('mobile', editMobile.trim());
      if (editImageFile) {
        formData.append('image', editImageFile);
      }

      await dispatch(adminUpdateUserDetails({ id: editId, formData })).unwrap();
      toast.success('User credentials updated successfully!');
      closeEditModal();
    } catch (error) {
      toast.error(error || 'Failed to update user profile.');
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (user) => {
    if (currentUser?._id === user._id) {
      return toast.error('Security Lockout: You cannot deactivate your own account.');
    }

    try {
      const actionName = user.isActive !== false ? 'deactivate' : 'activate';
      await dispatch(toggleUserActiveStatus(user._id)).unwrap();
      toast.success(`User has been ${actionName}d successfully.`);
    } catch (error) {
      toast.error(error || 'Failed to modify account status.');
    }
  };

  // Permanent account delete
  const handleDeleteExecute = async () => {
    if (!deleteTarget) return;

    if (currentUser?._id === deleteTarget._id) {
      toast.error('Security Lockout: You cannot delete your own admin account.');
      setDeleteTarget(null);
      return;
    }

    try {
      await dispatch(deleteUserAccount(deleteTarget._id)).unwrap();
      toast.success('User account has been permanently removed.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error || 'Failed to delete user.');
    }
  };

  // Client side Search & Filters
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = user.name?.toLowerCase().includes(query);
    const emailMatch = user.email?.toLowerCase().includes(query);
    const mobileMatch = user.mobile?.toLowerCase().includes(query);
    const matchesSearch = nameMatch || emailMatch || mobileMatch;

    if (statusFilter === 'active') {
      return matchesSearch && user.isActive !== false;
    } else if (statusFilter === 'deactivated') {
      return matchesSearch && user.isActive === false;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#c5a059] uppercase block mb-1">
            MANAGEMENT INTERFACE
          </span>
          <h2 className="text-3xl font-light text-zinc-950 font-display">User Details</h2>
          <p className="text-xs text-luxury-gray mt-1">
            Review registered customers, search by profile credentials, toggle states, and control database records.
          </p>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white border border-[#ece9df] p-4 rounded-2xl shadow-xs">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or mobile..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#faf9f6] border border-[#ece9df] rounded-xl focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-all placeholder:text-zinc-400"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: 'All Users', value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Deactivated', value: 'deactivated' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-[#f4eee1] text-[#b48f48] border border-[#c5a059]/20 shadow-xs'
                  : 'bg-transparent text-zinc-600 border border-transparent hover:bg-[#faf9f6] hover:text-zinc-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-[10px] text-luxury-gray font-mono self-end md:self-auto">
          Showing {filteredUsers.length} of {users.length} registered
        </div>
      </div>

      {/* Main List Container */}
      <AnimatePresence mode="wait">
        {loading ? (
          /* Loading State spinner */
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <FiLoader className="w-8 h-8 text-[#c5a059] animate-spin mb-4" />
            <p className="text-xs text-luxury-gray font-mono">Synchronizing registered users...</p>
          </motion.div>
        ) : filteredUsers.length === 0 ? (
          /* Empty Search Result */
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border border-[#ece9df] rounded-2xl p-12 text-center shadow-xs"
          >
            <div className="w-16 h-16 bg-[#faf9f6] border border-[#ece9df] text-[#c5a059]/80 rounded-full flex items-center justify-center mx-auto mb-5">
              <FiUsers className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-light text-zinc-950 font-display mb-2">
              No Registered Users Found
            </h3>
            <p className="text-xs text-luxury-gray max-w-sm mx-auto">
              We couldn't find any users matching your query or filter criteria. Try adjusting your filters.
            </p>
          </motion.div>
        ) : (
          /* Responsive Layout Lists */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Desktop / Tablet Viewport Layout */}
            <div className="hidden md:block bg-white border border-[#ece9df] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#ece9df] bg-[#faf9f6]">
                      <th className="p-4.5 text-[9px] font-bold uppercase tracking-wider text-[#c5a059]">User Details</th>
                      <th className="p-4.5 text-[9px] font-bold uppercase tracking-wider text-[#c5a059]">Mobile</th>
                      <th className="p-4.5 text-[9px] font-bold uppercase tracking-wider text-[#c5a059]">Joined Date</th>
                      <th className="p-4.5 text-[9px] font-bold uppercase tracking-wider text-[#c5a059]">Account status</th>
                      <th className="p-4.5 text-[9px] font-bold uppercase tracking-wider text-[#c5a059] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ece9df]/60">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-[#faf9f6]/40 transition duration-200">
                        {/* Profile name and email */}
                        <td className="p-4.5">
                          <div className="flex items-center gap-3">
                            {user.profileImage?.url ? (
                              <img
                                src={user.profileImage.url}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border border-[#c5a059]/20"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#f4eee1] border border-[#c5a059]/15 text-[#c5a059] flex items-center justify-center font-bold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h4 className="text-xs font-semibold text-zinc-950 flex items-center gap-1.5">
                                {user.name}
                                {user.role === 'admin' && (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase bg-[#f4eee1] text-[#b48f48] border border-[#c5a059]/15">
                                    Admin
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10px] text-luxury-gray flex items-center gap-1 mt-0.5">
                                <FiMail className="w-3 h-3 text-[#c5a059]/70" /> {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Mobile number */}
                        <td className="p-4.5 text-xs text-zinc-700">
                          {user.mobile ? (
                            <span className="flex items-center gap-1.5">
                              <FiPhone className="w-3 h-3 text-[#c5a059]/70" /> {user.mobile}
                            </span>
                          ) : (
                            <span className="text-zinc-400 italic">No mobile</span>
                          )}
                        </td>

                        {/* Joined date */}
                        <td className="p-4.5 text-xs text-zinc-600 font-mono">
                          {user.createdAt ? (
                            <span className="flex items-center gap-1.5">
                              <FiCalendar className="w-3 h-3 text-[#c5a059]/70" />
                              {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          ) : (
                            <span>-</span>
                          )}
                        </td>

                        {/* Account status badge */}
                        <td className="p-4.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              user.isActive !== false
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/65'
                                : 'bg-rose-50 text-rose-600 border-rose-200/65'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {user.isActive !== false ? 'Active' : 'Deactivated'}
                          </span>
                        </td>

                        {/* Actions buttons */}
                        <td className="p-4.5 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 text-zinc-500 hover:text-[#c5a059] hover:bg-[#faf9f6] rounded-xl transition cursor-pointer"
                              title="Edit Credentials"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              disabled={currentUser?._id === user._id}
                              className={`p-2 rounded-xl transition cursor-pointer ${
                                user.isActive !== false
                                  ? 'text-amber-500 hover:bg-amber-50 hover:text-amber-600'
                                  : 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600'
                              } disabled:opacity-40 disabled:cursor-not-allowed`}
                              title={user.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
                            >
                              {user.isActive !== false ? <FiUserX className="w-3.5 h-3.5" /> : <FiUserCheck className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(user)}
                              disabled={currentUser?._id === user._id}
                              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Delete Account"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Viewport Card Layout */}
            <div className="grid grid-cols-1 gap-2.5 md:hidden">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user._id}
                  layout
                  className="bg-white border border-[#ece9df] p-3 rounded-xl shadow-xs flex items-center justify-between gap-3"
                >
                  {/* Left: profile image */}
                  <div className="flex-shrink-0">
                    {user.profileImage?.url ? (
                      <img
                        src={user.profileImage.url}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#c5a059]/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#f4eee1] border border-[#c5a059]/15 text-[#c5a059] flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Center: name and email details */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-zinc-950 truncate flex items-center gap-1.5">
                      {user.name}
                      {user.role === 'admin' && (
                        <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase bg-[#f4eee1] text-[#b48f48] border border-[#c5a059]/10">
                          Admin
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-luxury-gray truncate mt-0.5">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${
                          user.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}
                      >
                        {user.isActive !== false ? 'Active' : 'Deactivated'}
                      </span>
                      {user.mobile && (
                        <span className="text-[9px] text-zinc-500 truncate">{user.mobile}</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions icons */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-1.5 text-zinc-500 hover:bg-[#faf9f6] rounded-lg transition"
                      title="Edit Credentials"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      disabled={currentUser?._id === user._id}
                      className={`p-1.5 rounded-lg transition ${
                        user.isActive !== false ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'
                      } disabled:opacity-40`}
                      title={user.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
                    >
                      {user.isActive !== false ? <FiUserX className="w-3.5 h-3.5" /> : <FiUserCheck className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(user)}
                      disabled={currentUser?._id === user._id}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-40"
                      title="Delete Account"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT USER DETAILS MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEditModal}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-md p-6 bg-white border border-[#ece9df] rounded-2xl shadow-xl overflow-hidden max-h-[92vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#c5a059]" />
              <button
                onClick={closeEditModal}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-light text-zinc-950 font-display mb-1">Edit User Profile</h3>
              <p className="text-[11px] text-luxury-gray mb-6">
                Update account details, email addresses, and phone mappings. All changes are saved securely.
              </p>

              <form onSubmit={handleEditSubmit} className="space-y-5">
                {/* Photo Upload area */}
                <div className="flex flex-col items-center gap-3 pb-3 border-b border-[#ece9df]/60">
                  <div className="relative group">
                    {editImagePreview ? (
                      <img
                        src={editImagePreview}
                        alt="Preview avatar"
                        className="w-20 h-20 rounded-full object-cover border border-[#c5a059]/30"
                      />
                    ) : currentImageUrl ? (
                      <img
                        src={currentImageUrl}
                        alt="Current user avatar"
                        className="w-20 h-20 rounded-full object-cover border border-[#c5a059]/30"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-[#f4eee1] border border-[#c5a059]/15 text-[#c5a059] flex items-center justify-center font-bold text-2xl font-display">
                        {editName.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/45 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white cursor-pointer"
                      title="Upload Avatar"
                    >
                      <FiUploadCloud className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[9px] font-bold tracking-widest text-[#b48f48] uppercase hover:underline"
                  >
                    Change Picture
                  </button>
                </div>

                {/* Name Input */}
                <div className="floating-input-group">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder=" "
                    required
                    className="floating-input"
                  />
                  <label className="floating-label">Full Name</label>
                </div>

                {/* Email Input */}
                <div className="floating-input-group">
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder=" "
                    required
                    className="floating-input"
                  />
                  <label className="floating-label">Email Address</label>
                </div>

                {/* Mobile Input */}
                <div className="floating-input-group">
                  <input
                    type="text"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    placeholder=" "
                    required
                    className="floating-input"
                  />
                  <label className="floating-label">Mobile Number</label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isActionLoading}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-950 text-white hover:bg-[#c5a059] disabled:bg-zinc-800 disabled:cursor-not-allowed rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    {isActionLoading ? (
                      <>
                        <FiLoader className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-sm p-6 bg-white border border-[#ece9df] rounded-2xl shadow-xl overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-rose-500" />
              <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-light text-zinc-950 font-display mb-2">Delete User Account?</h3>
              <p className="text-xs text-luxury-gray mb-6">
                Are you sure you want to delete <strong className="text-zinc-900">"{deleteTarget.name}"</strong>? This will permanently erase their profile and files from the JEWELLERY Jewellery database. This action is irreversible.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isActionLoading}
                  className="px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteExecute}
                  disabled={isActionLoading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-800 disabled:cursor-not-allowed rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  {isActionLoading ? (
                    <>
                      <FiLoader className="w-3.5 h-3.5 animate-spin" /> Removing...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUserView;
