import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiGrid, 
  FiPlus, 
  FiTrash2, 
  FiX, 
  FiSearch, 
  FiEdit2, 
  FiImage, 
  FiLoader, 
  FiUploadCloud 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../redux/categorySlice';

const AdminCategoryView = () => {
  const dispatch = useDispatch();
  const { categories, loading, isActionLoading } = useSelector((state) => state.categories);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals visibility state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Add Category form state
  const [addName, setAddName] = useState('');
  const [addImageFile, setAddImageFile] = useState(null);
  const [addImagePreview, setAddImagePreview] = useState('');
  const [addSubcategories, setAddSubcategories] = useState([]);
  const [addSubInput, setAddSubInput] = useState('');

  // Edit Category form state
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [editSubcategories, setEditSubcategories] = useState([]);
  const [editSubInput, setEditSubInput] = useState('');

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setAddName('');
    setAddImageFile(null);
    setAddImagePreview('');
    setAddSubcategories([]);
    setAddSubInput('');
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditName('');
    setEditImageFile(null);
    setEditImagePreview('');
    setEditSubcategories([]);
    setEditSubInput('');
  };

  // Add Subcategory logic for Creation Form
  const handleAddSubcategory = () => {
    const trimmed = addSubInput.trim();
    if (!trimmed) return;
    if (addSubcategories.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      return toast.error('Subcategory already added to this list.');
    }
    setAddSubcategories([...addSubcategories, trimmed]);
    setAddSubInput('');
  };

  const handleRemoveSubcategory = (indexToRemove) => {
    setAddSubcategories(addSubcategories.filter((_, idx) => idx !== indexToRemove));
  };

  // Add Subcategory logic for Edition Form
  const handleEditSubcategory = () => {
    const trimmed = editSubInput.trim();
    if (!trimmed) return;
    const exists = editSubcategories.some(
      (sub) => (typeof sub === 'string' ? sub.toLowerCase() : sub.subcategoryName.toLowerCase()) === trimmed.toLowerCase()
    );
    if (exists) {
      return toast.error('Subcategory already exists.');
    }
    setEditSubcategories([...editSubcategories, trimmed]);
    setEditSubInput('');
  };

  const handleRemoveEditSubcategory = (indexToRemove) => {
    setEditSubcategories(editSubcategories.filter((_, idx) => idx !== indexToRemove));
  };

  // Fetch Categories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle Add Category Image input
  const handleAddImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        return toast.error('Only image files (JPEG, PNG, WEBP) are allowed.');
      }
      setAddImageFile(file);
      setAddImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle Edit Category Image input
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        return toast.error('Only image files (JPEG, PNG, WEBP) are allowed.');
      }
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit Add Category
  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!addName.trim()) {
      return toast.error('Category name is required.');
    }

    try {
      const formData = new FormData();
      formData.append('categoryName', addName.trim());
      if (addImageFile) {
        formData.append('image', addImageFile);
      }
      formData.append('subcategories', JSON.stringify(addSubcategories));

      await dispatch(createCategory(formData)).unwrap();
      toast.success(`Category "${addName.trim()}" created successfully!`);
      closeAddModal();
      dispatch(fetchCategories());
    } catch (error) {
      toast.error(error || 'Failed to create category.');
    }
  };

  // Open Edit Modal and prepopulate fields
  const openEditModal = (cat) => {
    setEditId(cat._id);
    setEditName(cat.categoryName);
    setCurrentImageUrl(cat.categoryImage?.url || '');
    setEditImageFile(null);
    setEditImagePreview('');
    setEditSubcategories(cat.subcategories || []);
    setEditSubInput('');
    setIsEditModalOpen(true);
  };

  // Submit Edit Category
  const handleEditCategorySubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      return toast.error('Category name is required.');
    }

    try {
      const formData = new FormData();
      formData.append('categoryName', editName.trim());
      if (editImageFile) {
        formData.append('image', editImageFile);
      }
      const subsToSend = editSubcategories.map(sub => 
        typeof sub === 'string' ? sub : (sub.subcategoryName || '')
      );
      formData.append('subcategories', JSON.stringify(subsToSend));

      await dispatch(updateCategory({ id: editId, formData })).unwrap();
      toast.success('Category updated successfully!');
      closeEditModal();
      dispatch(fetchCategories());
    } catch (error) {
      toast.error(error || 'Failed to update category.');
    }
  };

  // Confirm and Execute Delete Category
  const handleDeleteExecute = async () => {
    if (!deleteTarget) return;

    try {
      await dispatch(deleteCategory(deleteTarget._id)).unwrap();
      toast.success(`Category "${deleteTarget.categoryName}" removed successfully.`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error || 'Failed to delete category.');
    }
  };

  // Filter Categories by search query
  const filteredCategories = categories.filter((cat) =>
    cat.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#c5a059] uppercase block mb-1">
            DIGITAL ATELIER
          </span>
          <h2 className="text-3xl font-light text-zinc-950 font-display">Categories</h2>
          <p className="text-xs text-luxury-gray mt-1">
            Manage your boutique collections and auto-generate clean slugs for your items.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-3 bg-zinc-950 hover:bg-[#c5a059] text-white text-[10px] font-bold uppercase tracking-widest rounded-full transition duration-300 shadow-sm cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> Create Category
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-[#ece9df] p-4 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#faf9f6] border border-[#ece9df] rounded-xl focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-all placeholder:text-zinc-400"
          />
        </div>
        <div className="text-[10px] text-luxury-gray font-mono">
          Showing {filteredCategories.length} of {categories.length} Categories
        </div>
      </div>

      {/* Main Content Pane */}
      <AnimatePresence mode="wait">
        {loading ? (
          /* Loading State */
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <FiLoader className="w-8 h-8 text-[#c5a059] animate-spin mb-4" />
            <p className="text-xs text-luxury-gray font-mono">Synchronizing collections...</p>
          </motion.div>
        ) : filteredCategories.length === 0 ? (
          /* Empty State Section */
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border border-[#ece9df] rounded-2xl p-12 text-center shadow-xs"
          >
            <div className="w-16 h-16 bg-[#faf9f6] border border-[#ece9df] text-[#c5a059]/80 rounded-full flex items-center justify-center mx-auto mb-5">
              <FiGrid className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-light text-zinc-950 font-display mb-2">
              {searchQuery ? 'No Matches Found' : 'Atelier Categories Empty'}
            </h3>
            <p className="text-xs text-luxury-gray max-w-sm mx-auto mb-6">
              {searchQuery
                ? `We couldn't find any category matching "${searchQuery}". Please check spelling or create a new collection.`
                : 'No product categories have been configured in your database boutique. Create a luxury category to begin.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 bg-zinc-950 hover:bg-[#c5a059] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Create First Category
              </button>
            )}
          </motion.div>
        ) : (
          /* Categories Grid Layout */
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredCategories.map((cat) => (
              <motion.div
                key={cat._id}
                layout
                className="group bg-white border border-[#ece9df] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#c5a059]/30 transition-all duration-300 flex flex-col h-full"
              >
                {/* Image Section / Premium Placeholder */}
                {cat.categoryImage?.url ? (
                  <div className="w-full h-48 overflow-hidden relative bg-zinc-50 border-b border-[#ece9df]">
                    <img
                      src={cat.categoryImage.url}
                      alt={cat.categoryName}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-[#faf9f6] border-b border-[#ece9df] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group-hover:bg-[#faf9f6]/60 transition duration-300">
                    <div className="absolute inset-4 border border-dashed border-[#ece9df]/60 opacity-60 rounded-lg" />
                    <FiImage className="w-6 h-6 text-[#c5a059]/40 mb-3" />
                    <span className="text-[9px] font-bold tracking-[0.25em] text-[#c5a059] uppercase block mb-1">
                      NO CANVAS
                    </span>
                    <span className="text-xl font-light font-display text-zinc-400 tracking-wider">
                      {cat.categoryName.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-light text-zinc-950 font-display line-clamp-1">
                      {cat.categoryName}
                    </h4>
                    <div className="mt-2 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-luxury-gray font-mono">
                        <span className="bg-[#faf9f6] border border-[#ece9df] text-zinc-600 px-2 py-0.5 rounded">
                          slug: {cat.slug}
                        </span>
                      </div>
                      
                      {/* Subcategories list */}
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {cat.subcategories.map((sub, sIdx) => (
                            <span
                              key={sub._id || sIdx}
                              className="text-[9px] font-medium bg-[#faf9f6] border border-[#ece9df] text-zinc-700 px-1.5 py-0.5 rounded-sm"
                            >
                              {sub.subcategoryName}
                            </span>
                          ))}
                        </div>
                      )}

                      <span className="text-[9px] text-zinc-400 font-mono mt-1">
                        Created: {new Date(cat.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-zinc-100">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-2 text-zinc-500 hover:text-[#c5a059] hover:bg-[#faf9f6] rounded-xl transition cursor-pointer"
                      title="Edit Category"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Delete Category"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE CATEGORY MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAddModal}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-md p-6 bg-white border border-[#ece9df] rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#c5a059]" />
              <button
                onClick={closeAddModal}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-light text-zinc-950 font-display mb-1">Create Category</h3>
              <p className="text-[11px] text-luxury-gray mb-6">
                Create a new digital collection. Uploading an image is completely optional.
              </p>

              <form onSubmit={handleAddCategorySubmit} className="space-y-5">
                {/* Category Name Input */}
                <div className="floating-input-group">
                  <input
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder=" "
                    required
                    className="floating-input"
                  />
                  <label className="floating-label">Category Name</label>
                </div>

                {/* Subcategories Input & Chips */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-bold tracking-widest text-[#c5a059] uppercase mb-1">
                    Subcategories
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={addSubInput}
                      onChange={(e) => setAddSubInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubcategory();
                        }
                      }}
                      placeholder="Add subcategory (e.g. Shirts, Pants)"
                      className="flex-1 px-4 py-2.5 text-xs bg-[#faf9f6] border border-[#ece9df] rounded-xl focus:outline-none focus:border-[#c5a059] placeholder:text-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubcategory}
                      className="px-4 py-2 bg-zinc-950 hover:bg-[#c5a059] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  {addSubcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {addSubcategories.map((sub, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1.5 bg-[#f4eee1] text-[#b48f48] border border-[#c5a059]/15 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider"
                        >
                          {sub}
                          <button
                            type="button"
                            onClick={() => handleRemoveSubcategory(idx)}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer font-bold text-xs"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Optional Image Upload Box */}
                <div>
                  <label className="block text-[9px] font-bold tracking-widest text-[#c5a059] uppercase mb-2">
                    Collection Cover (Optional)
                  </label>
                  
                  {addImagePreview ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#ece9df] bg-[#faf9f6]">
                      <img
                        src={addImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAddImageFile(null);
                          setAddImagePreview('');
                        }}
                        className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition text-[10px] font-mono cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-[#ece9df] hover:border-[#c5a059]/40 bg-[#faf9f6]/40 hover:bg-[#faf9f6] rounded-xl cursor-pointer transition duration-300">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiUploadCloud className="w-7 h-7 text-[#c5a059]/60 mb-2" />
                        <p className="text-[10px] text-zinc-800 font-semibold mb-1">
                          Click to upload canvas
                        </p>
                        <p className="text-[8px] text-luxury-gray">
                          PNG, JPG, WEBP up to 2MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAddImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={closeAddModal}
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
                        <FiLoader className="w-3.5 h-3.5 animate-spin" /> Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT CATEGORY MODAL */}
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
              className="relative z-10 w-full max-w-md p-6 bg-white border border-[#ece9df] rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#c5a059]" />
              <button
                onClick={closeEditModal}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-light text-zinc-950 font-display mb-1">Edit Collection</h3>
              <p className="text-[11px] text-luxury-gray mb-6">
                Update the name or upload a new optional cover art for this collection.
              </p>

              <form onSubmit={handleEditCategorySubmit} className="space-y-5">
                {/* Category Name Input */}
                <div className="floating-input-group">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder=" "
                    required
                    className="floating-input"
                  />
                  <label className="floating-label">Category Name</label>
                </div>

                {/* Subcategories Input & Chips */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-bold tracking-widest text-[#c5a059] uppercase mb-1">
                    Subcategories
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editSubInput}
                      onChange={(e) => setEditSubInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleEditSubcategory();
                        }
                      }}
                      placeholder="Add subcategory (e.g. Shirts, Pants)"
                      className="flex-1 px-4 py-2.5 text-xs bg-[#faf9f6] border border-[#ece9df] rounded-xl focus:outline-none focus:border-[#c5a059] placeholder:text-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={handleEditSubcategory}
                      className="px-4 py-2 bg-zinc-950 hover:bg-[#c5a059] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  {editSubcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {editSubcategories.map((sub, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1.5 bg-[#f4eee1] text-[#b48f48] border border-[#c5a059]/15 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider"
                        >
                          {typeof sub === 'string' ? sub : sub.subcategoryName}
                          <button
                            type="button"
                            onClick={() => handleRemoveEditSubcategory(idx)}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer font-bold text-xs"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Optional Image Upload Box */}
                <div>
                  <label className="block text-[9px] font-bold tracking-widest text-[#c5a059] uppercase mb-2">
                    Collection Cover (Optional)
                  </label>

                  {editImagePreview ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#ece9df] bg-[#faf9f6]">
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditImageFile(null);
                          setEditImagePreview('');
                        }}
                        className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition text-[10px] font-mono cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : currentImageUrl ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#ece9df] bg-[#faf9f6]">
                      <img
                        src={currentImageUrl}
                        alt="Current Cover"
                        className="w-full h-full object-cover"
                      />
                      <label className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer text-white text-[10px] font-bold uppercase tracking-wider">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-[#ece9df] hover:border-[#c5a059]/40 bg-[#faf9f6]/40 hover:bg-[#faf9f6] rounded-xl cursor-pointer transition duration-300">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiUploadCloud className="w-7 h-7 text-[#c5a059]/60 mb-2" />
                        <p className="text-[10px] text-zinc-800 font-semibold mb-1">
                          Click to upload canvas
                        </p>
                        <p className="text-[8px] text-luxury-gray">
                          PNG, JPG, WEBP up to 2MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
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
              <h3 className="text-lg font-light text-zinc-950 font-display mb-2">Delete Collection?</h3>
              <p className="text-xs text-luxury-gray mb-6">
                Are you sure you want to delete category <strong className="text-zinc-900">"{deleteTarget.categoryName}"</strong>? This will permanently remove it from the digital collections database.
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
                    'Delete Collection'
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

export default AdminCategoryView;
