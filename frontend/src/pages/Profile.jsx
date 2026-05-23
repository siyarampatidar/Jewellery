// import { useState, useRef } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { updateProfile, uploadAvatar, removeAvatar } from '../redux/authSlice';
// import axiosInstance from '../api/axiosInstance';
// import { API_ENDPOINTS } from '../api/apis';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FiUser, FiPhone, FiLock, FiCamera, FiTrash2, FiCalendar, FiMail } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const Profile = () => {
//   const dispatch = useDispatch();
//   const { user, isActionLoading } = useSelector((state) => state.auth);

//   // File Input Ref
//   const fileInputRef = useRef(null);

//   // Form states
//   const [profileData, setProfileData] = useState({
//     name: user?.name || '',
//     mobile: user?.mobile || '',
//   });

//   const [passwordData, setPasswordData] = useState({
//     oldPassword: '',
//     newPassword: '',
//     confirmPassword: '',
//   });

//   const [activeTab, setActiveTab] = useState('details'); // 'details' or 'security'
//   const [isPasswordChanging, setIsPasswordChanging] = useState(false);

//   const { name, mobile } = profileData;
//   const { oldPassword, newPassword, confirmPassword } = passwordData;

//   const handleProfileChange = (e) => {
//     setProfileData({ ...profileData, [e.target.name]: e.target.value });
//   };

//   const handlePasswordChange = (e) => {
//     setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
//   };

//   // Submit Profile details (name, mobile)
//   const handleProfileSubmit = (e) => {
//     e.preventDefault();

//     if (!name.trim() || !mobile.trim()) {
//       return toast.error('Please enter all requested details.');
//     }

//     dispatch(updateProfile(profileData))
//       .unwrap()
//       .then((data) => {
//         toast.success(data.message || 'Profile information saved.');
//       })
//       .catch((err) => {
//         toast.error(err || 'Failed to update profile.');
//       });
//   };

//   // Submit Password update
//   const handlePasswordSubmit = async (e) => {
//     e.preventDefault();

//     if (!oldPassword || !newPassword || !confirmPassword) {
//       return toast.error('Please fill out all password fields.');
//     }

//     if (newPassword.length < 6) {
//       return toast.error('Secret password must contain at least 6 characters.');
//     }

//     if (newPassword !== confirmPassword) {
//       return toast.error('Passwords do not match.');
//     }

//     try {
//       setIsPasswordChanging(true);
//       const response = await axiosInstance.put(API_ENDPOINTS.CHANGE_PASSWORD, passwordData);
//       toast.success(response.data.message || 'Credentials updated successfully!');
//       setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to alter password.');
//     } finally {
//       setIsPasswordChanging(false);
//     }
//   };

//   // Handle Photo selection & upload
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       return toast.error('Only image assets are supported!');
//     }

//     if (file.size > 2 * 1024 * 1024) {
//       return toast.error('Asset exceeds 2MB limit!');
//     }

//     const formData = new FormData();
//     formData.append('image', file);

//     toast.promise(
//       dispatch(uploadAvatar(formData)).unwrap(),
//       {
//         loading: 'Uploading and optimizing luxury portrait...',
//         success: 'Boutique portrait saved!',
//         error: (err) => err || 'Failed to upload photo.',
//       }
//     );
//   };

//   // Handle Photo deletion
//   const handleDeletePhoto = () => {
//     if (!user?.profileImage?.url) return;

//     if (window.confirm('Are you sure you wish to delete your boutique avatar?')) {
//       toast.promise(
//         dispatch(removeAvatar()).unwrap(),
//         {
//           loading: 'Deleting avatar...',
//           success: 'Boutique avatar removed.',
//           error: (err) => err || 'Failed to delete photo.',
//         }
//       );
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12 relative">
//       {/* Background elegant blobs */}
//       <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/3 blur-3xl pointer-events-none" />
      
//       {/* Header Profile Dashboard Overview */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ type: 'spring', duration: 0.8 }}
//         className="luxury-card rounded-[28px] p-6 sm:p-10 relative overflow-hidden mb-10"
//       >
//         <div className="absolute top-0 left-0 right-0 h-[2px] gold-gradient" />

//         <div className="flex flex-col sm:flex-row items-center gap-8">
//           {/* Avatar Container Area */}
//           <div className="relative group select-none">
//             {user?.profileImage?.url ? (
//               <img
//                 src={user.profileImage.url}
//                 alt={user.name}
//                 className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-[3px] border-primary/20 shadow-inner group-hover:brightness-90 transition duration-300"
//               />
//             ) : (
//               <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-primary/10 border-[3px] border-primary/15 shadow-inner text-primary flex items-center justify-center font-bold text-4xl uppercase select-none font-display">
//                 {user?.name?.charAt(0)}
//               </div>
//             )}

//             {/* Hidden Input */}
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               accept="image/*"
//               className="hidden"
//             />

//             {/* Upload/delete overlay actions */}
//             <div className="absolute inset-0 flex items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/45 rounded-full">
//               <button
//                 type="button"
//                 onClick={() => fileInputRef.current?.click()}
//                 title="Change Avatar"
//                 className="p-2 bg-white/95 rounded-full text-zinc-800 hover:bg-white hover:scale-105 active:scale-95 transition cursor-pointer"
//               >
//                 <FiCamera className="w-4 h-4" />
//               </button>
//               {user?.profileImage?.url && (
//                 <button
//                   type="button"
//                   onClick={handleDeletePhoto}
//                   title="Remove Avatar"
//                   className="p-2 bg-red-600/90 rounded-full text-white hover:bg-red-600 hover:scale-105 active:scale-95 transition cursor-pointer"
//                 >
//                   <FiTrash2 className="w-4 h-4" />
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Profile Core info */}
//           <div className="text-center sm:text-left flex-1 space-y-2">
//             <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3.5">
//               <h1 className="text-3xl font-normal text-zinc-950 font-display">
//                 {user?.name}
//               </h1>
//               <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
//                 user?.role === 'admin'
//                   ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
//                   : 'bg-zinc-150 text-zinc-600 border border-zinc-200'
//               }`}>
//                 {user?.role}
//               </span>
//             </div>

//             <p className="text-luxury-gray text-xs font-semibold uppercase tracking-wider flex items-center justify-center sm:justify-start gap-2 select-all">
//               <FiMail className="w-4 h-4 text-primary/60" />
//               {user?.email}
//             </p>

//             <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-[10px] font-semibold text-luxury-gray uppercase tracking-widest">
//               <span className="flex items-center gap-1.5 bg-white/50 border border-primary/5 px-3 py-1 rounded-full">
//                 <FiPhone className="w-3.5 h-3.5 text-primary/60" />
//                 {user?.mobile}
//               </span>
//               <span className="flex items-center gap-1.5 bg-white/50 border border-primary/5 px-3 py-1 rounded-full">
//                 <FiCalendar className="w-3.5 h-3.5 text-primary/60" />
//                 Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
//               </span>
//             </div>
//           </div>
//         </div>
//       </motion.div>

//       {/* Tabs and Form Cards Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//         {/* Navigation Selector */}
//         <div className="lg:col-span-1 space-y-2.5">
//           <button
//             onClick={() => setActiveTab('details')}
//             className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition duration-300 flex items-center gap-3 cursor-pointer ${
//               activeTab === 'details'
//                 ? 'bg-luxury-black text-white shadow-md'
//                 : 'text-luxury-gray hover:bg-white/80 hover:text-zinc-950 border border-transparent hover:border-primary/10'
//             }`}
//           >
//             <FiUser className="w-4 h-4" />
//             Boutique Details
//           </button>
          
//           <button
//             onClick={() => setActiveTab('security')}
//             className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition duration-300 flex items-center gap-3 cursor-pointer ${
//               activeTab === 'security'
//                 ? 'bg-luxury-black text-white shadow-md'
//                 : 'text-luxury-gray hover:bg-white/80 hover:text-zinc-950 border border-transparent hover:border-primary/10'
//             }`}
//           >
//             <FiLock className="w-4 h-4" />
//             Secret Password
//           </button>
//         </div>

//         {/* Tab Display Area */}
//         <div className="lg:col-span-3">
//           <AnimatePresence mode="wait">
//             {activeTab === 'details' && (
//               <motion.div
//                 key="details"
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -20 }}
//                 className="luxury-card rounded-[28px] p-6 sm:p-10"
//               >
//                 <h2 className="text-2xl font-normal text-zinc-950 font-display mb-8">
//                   Update Account Details
//                 </h2>
                
//                 <form onSubmit={handleProfileSubmit} className="space-y-6">
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                     {/* Full Name */}
//                     <div className="floating-input-group">
//                       <input
//                         type="text"
//                         name="name"
//                         id="name"
//                         value={name}
//                         onChange={handleProfileChange}
//                         placeholder=" "
//                         required
//                         className="floating-input"
//                       />
//                       <label htmlFor="name" className="floating-label">
//                         Full Name
//                       </label>
//                     </div>

//                     {/* Mobile Number */}
//                     <div className="floating-input-group">
//                       <input
//                         type="text"
//                         name="mobile"
//                         id="mobile"
//                         value={mobile}
//                         onChange={handleProfileChange}
//                         placeholder=" "
//                         required
//                         className="floating-input"
//                       />
//                       <label htmlFor="mobile" className="floating-label">
//                         Mobile Number
//                       </label>
//                     </div>
//                   </div>

//                   <div className="flex justify-end pt-4">
//                     <motion.button
//                       type="submit"
//                       disabled={isActionLoading}
//                       whileTap={{ scale: 0.98 }}
//                       className="px-8 py-3.5 border-0 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] text-white bg-luxury-black hover:bg-primary transition-all duration-300 shadow-md cursor-pointer"
//                     >
//                       {isActionLoading ? (
//                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       ) : (
//                         'Save Details'
//                       )}
//                     </motion.button>
//                   </div>
//                 </form>
//               </motion.div>
//             )}

//             {activeTab === 'security' && (
//               <motion.div
//                 key="security"
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -20 }}
//                 className="luxury-card rounded-[28px] p-6 sm:p-10"
//               >
//                 <h2 className="text-2xl font-normal text-zinc-950 font-display mb-8">
//                   Change Boutique Password
//                 </h2>

//                 <form onSubmit={handlePasswordSubmit} className="space-y-6">
//                   {/* Current Password */}
//                   <div className="floating-input-group">
//                     <input
//                       type="password"
//                       name="oldPassword"
//                       id="oldPassword"
//                       value={oldPassword}
//                       onChange={handlePasswordChange}
//                       placeholder=" "
//                       required
//                       className="floating-input"
//                     />
//                     <label htmlFor="oldPassword" className="floating-label">
//                       Current Password
//                     </label>
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                     {/* New Password */}
//                     <div className="floating-input-group">
//                       <input
//                         type="password"
//                         name="newPassword"
//                         id="newPassword"
//                         value={newPassword}
//                         onChange={handlePasswordChange}
//                         placeholder=" "
//                         required
//                         className="floating-input"
//                       />
//                       <label htmlFor="newPassword" className="floating-label">
//                         New Password
//                       </label>
//                     </div>

//                     {/* Confirm Password */}
//                     <div className="floating-input-group">
//                       <input
//                         type="password"
//                         name="confirmPassword"
//                         id="confirmPassword"
//                         value={confirmPassword}
//                         onChange={handlePasswordChange}
//                         placeholder=" "
//                         required
//                         className="floating-input"
//                       />
//                       <label htmlFor="confirmPassword" className="floating-label">
//                         Confirm New Password
//                       </label>
//                     </div>
//                   </div>

//                   <div className="flex justify-end pt-4">
//                     <motion.button
//                       type="submit"
//                       disabled={isPasswordChanging}
//                       whileTap={{ scale: 0.98 }}
//                       className="px-8 py-3.5 border-0 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] text-white bg-luxury-black hover:bg-primary transition-all duration-300 shadow-md cursor-pointer"
//                     >
//                       {isPasswordChanging ? (
//                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       ) : (
//                         'Change Password'
//                       )}
//                     </motion.button>
//                   </div>
//                 </form>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;
