import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiX, 
  FiTrash2, 
  FiEdit2, 
  FiSearch, 
  FiLoader, 
  FiImage, 
  FiUploadCloud, 
  FiLayers, 
  FiTag, 
  FiDollarSign, 
  FiInfo, 
  FiCheckCircle, 
  FiXCircle 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../redux/categorySlice';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../../redux/productSlice';

const AdminItemView = () => {
  const dispatch = useDispatch();
  const { products, loading, isActionLoading } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals Visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // --- Add Product Form State ---
  const [addName, setAddName] = useState('');
  const [addBrand, setAddBrand] = useState('');
  const [addSku, setAddSku] = useState('');
  const [addCategory, setAddCategory] = useState('');
  const [addSubcategory, setAddSubcategory] = useState('');
  const [addShortDesc, setAddShortDesc] = useState('');
  const [addFullDesc, setAddFullDesc] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addDiscountPrice, setAddDiscountPrice] = useState('');
  const [addStockQuantity, setAddStockQuantity] = useState('');
  const [addStatus, setAddStatus] = useState('active');
  const [addIsFeatured, setAddIsFeatured] = useState(false);
  const [addIsTrending, setAddIsTrending] = useState(false);
  
  // Images (Stored as array of { file, previewUrl })
  const [addImageFiles, setAddImageFiles] = useState([]);
  
  // Dynamic Attributes (Stored as array of { key, value })
  const [addAttributes, setAddAttributes] = useState([]);
  const [addSizes, setAddSizes] = useState('');

  // --- Edit Product Form State ---
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubcategory, setEditSubcategory] = useState('');
  const [editShortDesc, setEditShortDesc] = useState('');
  const [editFullDesc, setEditFullDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDiscountPrice, setEditDiscountPrice] = useState('');
  const [editStockQuantity, setEditStockQuantity] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editIsTrending, setEditIsTrending] = useState(false);
  
  // Image states for editing
  const [retainedImages, setRetainedImages] = useState([]); // Already in Cloudinary
  const [editImageFiles, setEditImageFiles] = useState([]); // New ones to upload
  
  // Dynamic Attributes for editing
  const [editAttributes, setEditAttributes] = useState([]);
  const [editSizes, setEditSizes] = useState('');

  // Load products and categories on mount
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Reset Add Form
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setAddName('');
    setAddBrand('');
    setAddSku('');
    setAddCategory('');
    setAddSubcategory('');
    setAddShortDesc('');
    setAddFullDesc('');
    setAddPrice('');
    setAddDiscountPrice('');
    setAddStockQuantity('');
    setAddStatus('active');
    setAddIsFeatured(false);
    setAddIsTrending(false);
    setAddImageFiles([]);
    setAddAttributes([]);
    setAddSizes('');
  };

  // Reset Edit Form
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditId('');
    setEditName('');
    setEditBrand('');
    setEditSku('');
    setEditCategory('');
    setEditSubcategory('');
    setEditShortDesc('');
    setEditFullDesc('');
    setEditPrice('');
    setEditDiscountPrice('');
    setEditStockQuantity('');
    setEditStatus('active');
    setEditIsFeatured(false);
    setEditIsTrending(false);
    setRetainedImages([]);
    setEditImageFiles([]);
    setEditAttributes([]);
    setEditSizes('');
  };

  // --- Dynamic Attributes Helper Logic ---
  const handleAddAttributeRow = () => {
    setAddAttributes([...addAttributes, { key: '', value: '' }]);
  };

  const handleRemoveAddAttributeRow = (idx) => {
    setAddAttributes(addAttributes.filter((_, i) => i !== idx));
  };

  const handleAddAttributeChange = (idx, field, val) => {
    const updated = addAttributes.map((attr, i) => {
      if (i === idx) {
        return { ...attr, [field]: val };
      }
      return attr;
    });
    setAddAttributes(updated);
  };

  const handleEditAttributeRow = () => {
    setEditAttributes([...editAttributes, { key: '', value: '' }]);
  };

  const handleRemoveEditAttributeRow = (idx) => {
    setEditAttributes(editAttributes.filter((_, i) => i !== idx));
  };

  const handleEditAttributeChange = (idx, field, val) => {
    const updated = editAttributes.map((attr, i) => {
      if (i === idx) {
        return { ...attr, [field]: val };
      }
      return attr;
    });
    setEditAttributes(updated);
  };

  // --- Image Handling Helper Logic ---
  const handleAddImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];
    
    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        continue;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 2MB limit.`);
        continue;
      }
      newFiles.push({
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }

    if (addImageFiles.length + newFiles.length > 3) {
      toast.error('You can upload a maximum of 3 images.');
      return;
    }

    setAddImageFiles([...addImageFiles, ...newFiles]);
  };

  const handleRemoveAddImage = (idx) => {
    const target = addImageFiles[idx];
    if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
    setAddImageFiles(addImageFiles.filter((_, i) => i !== idx));
  };

  const handleEditImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];
    
    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        continue;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 2MB limit.`);
        continue;
      }
      newFiles.push({
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }

    if (retainedImages.length + editImageFiles.length + newFiles.length > 3) {
      toast.error('You can upload a maximum of 3 images in total.');
      return;
    }

    setEditImageFiles([...editImageFiles, ...newFiles]);
  };

  const handleRemoveRetainedImage = (idx) => {
    setRetainedImages(retainedImages.filter((_, i) => i !== idx));
  };

  const handleRemoveEditImage = (idx) => {
    const target = editImageFiles[idx];
    if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
    setEditImageFiles(editImageFiles.filter((_, i) => i !== idx));
  };

  // --- SUBMIT OPERATIONS ---

  // Create Product
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();

    if (!addName.trim()) return toast.error('Product Name is required.');
    if (!addCategory) return toast.error('Category is required.');
    if (!addSubcategory) return toast.error('Subcategory is required.');
    if (!addShortDesc.trim()) return toast.error('Short Description is required.');
    if (!addFullDesc.trim()) return toast.error('Full Description is required.');
    if (!addPrice) return toast.error('Price is required.');
    if (!addStockQuantity) return toast.error('Stock Quantity is required.');
    
    if (addImageFiles.length < 1) {
      return toast.error('At least one product image is required.');
    }

    // Validate attributes: must have non-empty keys and values
    const filteredAttributes = addAttributes.filter(attr => attr.key.trim() && attr.value.trim());

    try {
      const formData = new FormData();
      formData.append('productName', addName.trim());
      formData.append('brand', addBrand.trim());
      formData.append('sku', addSku.trim());
      formData.append('category', addCategory);
      formData.append('subcategory', addSubcategory);
      formData.append('shortDescription', addShortDesc.trim());
      formData.append('fullDescription', addFullDesc.trim());
      formData.append('price', addPrice);
      if (addDiscountPrice) formData.append('discountPrice', addDiscountPrice);
      formData.append('stockQuantity', addStockQuantity);
      formData.append('status', addStatus);
      formData.append('isFeatured', addIsFeatured);
      formData.append('isTrending', addIsTrending);
      formData.append('attributes', JSON.stringify(filteredAttributes));

      const parsedSizes = addSizes.split(',').map(s => s.trim()).filter(Boolean);
      formData.append('sizes', JSON.stringify(parsedSizes));

      // Append files
      addImageFiles.forEach((img) => {
        formData.append('images', img.file);
      });

      await dispatch(createProduct(formData)).unwrap();
      toast.success(`Product "${addName.trim()}" created successfully!`);
      closeAddModal();
      dispatch(fetchProducts());
    } catch (err) {
      toast.error(err || 'Failed to create product.');
    }
  };

  // Open Edit Modal with Prepopulated data
  const openEditModal = (product) => {
    setEditId(product._id);
    setEditName(product.productName);
    setEditBrand(product.brand || '');
    setEditSku(product.sku || '');
    setEditCategory(product.category?._id || product.category || '');
    setEditSubcategory(product.subcategory || '');
    setEditShortDesc(product.shortDescription || '');
    setEditFullDesc(product.fullDescription || '');
    setEditPrice(product.price || '');
    setEditDiscountPrice(product.discountPrice || '');
    setEditStockQuantity(product.stockQuantity || '');
    setEditStatus(product.status || 'active');
    setEditIsFeatured(product.isFeatured || false);
    setEditIsTrending(product.isTrending || false);
    
    setRetainedImages(product.images || []);
    setEditImageFiles([]);
    setEditAttributes(product.attributes || []);
    setEditSizes(product.sizes ? product.sizes.join(', ') : '');
    
    setIsEditModalOpen(true);
  };

  // Edit Product Submission
  const handleEditProductSubmit = async (e) => {
    e.preventDefault();

    if (!editName.trim()) return toast.error('Product Name is required.');
    if (!editCategory) return toast.error('Category is required.');
    if (!editSubcategory) return toast.error('Subcategory is required.');
    if (!editShortDesc.trim()) return toast.error('Short Description is required.');
    if (!editFullDesc.trim()) return toast.error('Full Description is required.');
    if (editPrice === '') return toast.error('Price is required.');
    if (editStockQuantity === '') return toast.error('Stock Quantity is required.');

    const totalImages = retainedImages.length + editImageFiles.length;
    if (totalImages < 1) {
      return toast.error('At least one product image is required.');
    }
    if (totalImages > 3) {
      return toast.error('Maximum 3 images are allowed.');
    }

    const filteredAttributes = editAttributes.filter(attr => attr.key.trim() && attr.value.trim());

    try {
      const formData = new FormData();
      formData.append('productName', editName.trim());
      formData.append('brand', editBrand.trim());
      formData.append('sku', editSku.trim());
      formData.append('category', editCategory);
      formData.append('subcategory', editSubcategory);
      formData.append('shortDescription', editShortDesc.trim());
      formData.append('fullDescription', editFullDesc.trim());
      formData.append('price', editPrice);
      formData.append('discountPrice', editDiscountPrice);
      formData.append('stockQuantity', editStockQuantity);
      formData.append('status', editStatus);
      formData.append('isFeatured', editIsFeatured);
      formData.append('isTrending', editIsTrending);
      formData.append('attributes', JSON.stringify(filteredAttributes));
      formData.append('keptImages', JSON.stringify(retainedImages));

      const parsedSizes = editSizes.split(',').map(s => s.trim()).filter(Boolean);
      formData.append('sizes', JSON.stringify(parsedSizes));

      // Append new files
      editImageFiles.forEach((img) => {
        formData.append('images', img.file);
      });

      await dispatch(updateProduct({ id: editId, formData })).unwrap();
      toast.success('Product updated successfully!');
      closeEditModal();
      dispatch(fetchProducts());
    } catch (err) {
      toast.error(err || 'Failed to update product.');
    }
  };

  // Toggle Status Directly from list
  const handleToggleStatus = async (product) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      const formData = new FormData();
      formData.append('status', nextStatus);
      await dispatch(updateProduct({ id: product._id, formData })).unwrap();
      toast.success(`Product status updated to ${nextStatus}.`);
      dispatch(fetchProducts());
    } catch (err) {
      toast.error(err || 'Failed to update status.');
    }
  };

  // Execute Delete Product
  const handleDeleteExecute = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteProduct(deleteTarget._id)).unwrap();
      toast.success(`Product "${deleteTarget.productName}" removed successfully.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err || 'Failed to delete product.');
    }
  };

  // --- Dynamic Options Filtering ---
  const getSubcategoryOptions = (catId) => {
    const currentCategoryObj = categories.find(cat => cat._id === catId);
    return currentCategoryObj ? currentCategoryObj.subcategories || [] : [];
  };

  // --- Filters & Search logic ---
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.productName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const prodCatId = prod.category?._id || prod.category;
    const matchesCategory = categoryFilter ? prodCatId === categoryFilter : true;
    const matchesStatus = statusFilter ? prod.status === statusFilter : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#c5a059] uppercase block mb-1">
            BOUTIQUE SUITE
          </span>
          <h2 className="text-3xl font-light text-zinc-950 font-display">Products</h2>
          <p className="text-xs text-luxury-gray mt-1">
            Supervise jewellery catalog, manage prices, stock levels, and customize attributes.
          </p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-3 bg-zinc-950 hover:bg-[#c5a059] text-white text-[10px] font-bold uppercase tracking-widest rounded-full transition duration-300 shadow-sm cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white border border-[#ece9df] p-4 sm:p-5 rounded-2xl shadow-xs space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4 justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, brand, SKU..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#faf9f6] border border-[#ece9df] rounded-xl focus:outline-none focus:border-[#c5a059] transition-all placeholder:text-zinc-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#faf9f6] border border-[#ece9df] rounded-xl px-3 py-2 text-xs text-zinc-700 outline-none focus:border-[#c5a059]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#faf9f6] border border-[#ece9df] rounded-xl px-3 py-2 text-xs text-zinc-700 outline-none focus:border-[#c5a059]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="text-[10px] text-luxury-gray font-mono font-bold uppercase tracking-wider pl-2 border-l border-zinc-200">
            {filteredProducts.length} Items
          </div>
        </div>
      </div>

      {/* Main Grid View of Product Cards (Grid layout fits the premium styling better) */}
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
            <p className="text-xs text-luxury-gray font-mono">Loading product showroom catalog...</p>
          </motion.div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State Section */
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border border-[#ece9df] rounded-2xl p-12 text-center shadow-xs"
          >
            <div className="w-16 h-16 bg-[#faf9f6] border border-[#ece9df] text-[#c5a059]/80 rounded-full flex items-center justify-center mx-auto mb-5">
              <FiLayers className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-light text-zinc-950 font-display mb-2">Showroom Catalog Empty</h3>
            <p className="text-xs text-luxury-gray max-w-sm mx-auto mb-6">
              {searchQuery || categoryFilter || statusFilter 
                ? "No products match your current search/filter settings. Try resetting filters."
                : "No products exist inside your database registry. Click Add Product to design your first jewellery piece."}
            </p>
            {!searchQuery && !categoryFilter && !statusFilter && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 bg-zinc-950 hover:bg-[#c5a059] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Create First Product
              </button>
            )}
          </motion.div>
        ) : (
          /* Product Grid */
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((prod) => (
              <motion.div
                key={prod._id}
                layout
                className="group bg-white border border-[#ece9df] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#c5a059]/30 transition-all duration-300 flex flex-col h-full"
              >
                {/* Images Carousel-style / First image Display */}
                <div className="w-full h-56 overflow-hidden relative bg-[#faf9f6] border-b border-[#ece9df]">
                  {prod.images && prod.images.length > 0 ? (
                    <img
                      src={prod.images[0].url}
                      alt={prod.productName}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                      <FiImage className="w-8 h-8 mb-2" />
                      <span className="text-[10px]">No Canvas Media</span>
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {prod.isFeatured && (
                      <span className="bg-[#f4eee1] text-[#b48f48] border border-[#c5a059]/20 text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                    {prod.isTrending && (
                      <span className="bg-zinc-950 text-white text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full">
                        Trending
                      </span>
                    )}
                  </div>

                  {/* Status Overlay */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggleStatus(prod)}
                      className={`text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border transition duration-300 cursor-pointer ${
                        prod.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                      }`}
                      title="Click to toggle status"
                    >
                      {prod.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                {/* Card Content details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold text-[#c5a059] tracking-widest uppercase">
                        {prod.brand || 'Bespoke Atelier'}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-mono">
                        {prod.sku || 'No SKU'}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-light text-zinc-950 font-display line-clamp-1">
                      {prod.productName}
                    </h4>

                    {/* Category Label */}
                    <div className="text-[10px] text-luxury-gray flex items-center gap-1">
                      <span className="font-semibold text-zinc-700">{prod.category?.categoryName || 'General'}</span>
                      <span>&bull;</span>
                      <span>{prod.subcategory}</span>
                    </div>

                    {/* Stock Detail */}
                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <span className="text-zinc-500 font-mono">Stock Quantity:</span>
                      <span className={`font-bold font-mono ${
                        prod.stockQuantity <= 0 
                          ? 'text-rose-600' 
                          : prod.stockQuantity <= 5 
                            ? 'text-amber-600' 
                            : 'text-zinc-800'
                      }`}>
                        {prod.stockQuantity} pcs
                      </span>
                    </div>

                    {/* Attributes chips list */}
                    {prod.attributes && prod.attributes.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5 border-t border-zinc-100">
                        {prod.attributes.slice(0, 3).map((attr, aIdx) => (
                          <span
                            key={aIdx}
                            className="text-[8px] bg-[#faf9f6] text-zinc-600 border border-[#ece9df] px-1.5 py-0.5 rounded-sm"
                            title={`${attr.key}: ${attr.value}`}
                          >
                            {attr.key}:{attr.value}
                          </span>
                        ))}
                        {prod.attributes.length > 3 && (
                          <span className="text-[8px] text-[#c5a059] px-1 py-0.5">+{prod.attributes.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-semibold text-zinc-500">₹</span>
                        <span className="text-lg font-bold text-zinc-900 font-mono">
                          {prod.discountPrice ? prod.discountPrice : prod.price}
                        </span>
                        {prod.discountPrice && (
                          <span className="text-[10px] text-zinc-400 line-through font-mono">
                            ₹{prod.price}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-2 text-zinc-500 hover:text-[#c5a059] hover:bg-[#faf9f6] rounded-xl transition cursor-pointer"
                        title="Edit Product"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(prod)}
                        className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="Delete Product"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE PRODUCT MODAL */}
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
              className="relative z-10 w-full max-w-2xl p-6 sm:p-8 bg-white border border-[#ece9df] rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#c5a059]" />
              <button
                onClick={closeAddModal}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-light text-zinc-950 font-display mb-1">Add Product</h3>
              <p className="text-xs text-luxury-gray mb-6">
                Register new jewellery piece to the store, configure pricing, upload image cards, and specify variables.
              </p>

              <form onSubmit={handleAddProductSubmit} className="space-y-6">
                
                {/* Section 1: Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#c5a059] uppercase border-b border-zinc-100 pb-1.5">
                    1. Basic Product Info
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="floating-input-group">
                      <input
                        type="text"
                        value={addName}
                        onChange={(e) => setAddName(e.target.value)}
                        placeholder=" "
                        required
                        className="floating-input"
                      />
                      <label className="floating-label">Product Name *</label>
                    </div>

                    <div className="floating-input-group">
                      <input
                        type="text"
                        value={addBrand}
                        onChange={(e) => setAddBrand(e.target.value)}
                        placeholder=" "
                        className="floating-input"
                      />
                      <label className="floating-label">Brand Name (Optional)</label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="floating-input-group sm:col-span-1">
                      <input
                        type="text"
                        value={addSku}
                        onChange={(e) => setAddSku(e.target.value)}
                        placeholder=" "
                        className="floating-input"
                      />
                      <label className="floating-label">SKU Code (Optional)</label>
                    </div>

                    <div className="sm:col-span-1">
                      <select
                        value={addCategory}
                        onChange={(e) => {
                          setAddCategory(e.target.value);
                          setAddSubcategory(''); // reset sub
                        }}
                        required
                        className="w-full bg-[#faf9f6] border border-[#ece9df] rounded-xl px-3 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#c5a059]"
                      >
                        <option value="">Select Category *</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-1">
                      <select
                        value={addSubcategory}
                        onChange={(e) => setAddSubcategory(e.target.value)}
                        required
                        disabled={!addCategory}
                        className="w-full bg-[#faf9f6] border border-[#ece9df] rounded-xl px-3 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#c5a059] disabled:opacity-50"
                      >
                        <option value="">Select Subcategory *</option>
                        {getSubcategoryOptions(addCategory).map((sub, sIdx) => (
                          <option key={sub._id || sIdx} value={sub.subcategoryName}>
                            {sub.subcategoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={addShortDesc}
                        onChange={(e) => setAddShortDesc(e.target.value)}
                        placeholder="Short summary of the jewellery piece (maximum 150 chars)..."
                        required
                        rows="2"
                        className="w-full p-4 text-xs bg-[#faf9f6] border border-[#ece9df] rounded-xl outline-none focus:border-[#c5a059] transition placeholder:text-zinc-400"
                      />
                    </div>
                    
                    <div className="relative">
                      <textarea
                        value={addFullDesc}
                        onChange={(e) => setAddFullDesc(e.target.value)}
                        placeholder="Comprehensive details, materials, weight, diamond/gold specifications, shipping guidelines..."
                        required
                        rows="4"
                        className="w-full p-4 text-xs bg-[#faf9f6] border border-[#ece9df] rounded-xl outline-none focus:border-[#c5a059] transition placeholder:text-zinc-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Pricing & Stock */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#c5a059] uppercase border-b border-zinc-100 pb-1.5">
                    2. Pricing & Stock levels
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="floating-input-group">
                      <input
                        type="number"
                        value={addPrice}
                        onChange={(e) => setAddPrice(e.target.value)}
                        placeholder=" "
                        required
                        min="0"
                        className="floating-input"
                      />
                      <label className="floating-label">Retail Price (₹) *</label>
                    </div>

                    <div className="floating-input-group">
                      <input
                        type="number"
                        value={addDiscountPrice}
                        onChange={(e) => setAddDiscountPrice(e.target.value)}
                        placeholder=" "
                        min="0"
                        className="floating-input"
                      />
                      <label className="floating-label">Discount Price (₹) (Optional)</label>
                    </div>

                    <div className="floating-input-group">
                      <input
                        type="number"
                        value={addStockQuantity}
                        onChange={(e) => setAddStockQuantity(e.target.value)}
                        placeholder=" "
                        required
                        min="0"
                        className="floating-input"
                      />
                      <label className="floating-label">Warehouse Stock Level *</label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="floating-input-group">
                      <input
                        type="text"
                        value={addSizes}
                        onChange={(e) => setAddSizes(e.target.value)}
                        placeholder=" "
                        className="floating-input"
                      />
                      <label className="floating-label">Available Sizes (comma-separated, e.g. 12, 14, 16 or Standard, Adjustable)</label>
                    </div>
                  </div>

                  {/* Featured and Trending Toggles */}
                  <div className="flex flex-wrap items-center gap-6 bg-[#faf9f6] p-4 rounded-xl border border-[#ece9df]/60 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addIsFeatured}
                        onChange={(e) => setAddIsFeatured(e.target.checked)}
                        className="w-4 h-4 accent-[#c5a059] rounded cursor-pointer"
                      />
                      <span className="font-semibold text-zinc-700 select-none">Featured Product (promoted inside cards)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addIsTrending}
                        onChange={(e) => setAddIsTrending(e.target.checked)}
                        className="w-4 h-4 accent-[#c5a059] rounded cursor-pointer"
                      />
                      <span className="font-semibold text-zinc-700 select-none">Trending Product (Hot items banner)</span>
                    </label>
                  </div>
                </div>

                {/* Section 3: Product Images (Supports 1-3 images upload with Previews) */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#c5a059] uppercase border-b border-zinc-100 pb-1.5">
                    3. Product Media Canvas * (1 to 3 images)
                  </h4>

                  {/* Previews Grid */}
                  {addImageFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {addImageFiles.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#ece9df] bg-[#faf9f6]">
                          <img
                            src={img.previewUrl}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAddImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition duration-200 cursor-pointer"
                          >
                            <FiX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Dropzone */}
                  {addImageFiles.length < 3 && (
                    <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-[#ece9df] hover:border-[#c5a059]/40 bg-[#faf9f6]/40 hover:bg-[#faf9f6] rounded-xl cursor-pointer transition duration-300">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiUploadCloud className="w-7 h-7 text-[#c5a059]/60 mb-2" />
                        <p className="text-[10px] text-zinc-800 font-semibold mb-1">
                          Click to upload image cards ({3 - addImageFiles.length} spots remaining)
                        </p>
                        <p className="text-[8px] text-luxury-gray">
                          PNG, JPG, WEBP formats up to 2MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAddImagesChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Section 4: Dynamic Attributes (Specification Lists) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                    <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#c5a059] uppercase">
                      4. Custom specifications (Dynamic Attributes)
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddAttributeRow}
                      className="flex items-center gap-1 px-3 py-1 bg-[#f4eee1] text-[#b48f48] border border-[#c5a059]/15 text-[9px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#c5a059] hover:text-white transition duration-300 cursor-pointer"
                    >
                      <FiPlus className="w-3 h-3" /> Add Specification
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {addAttributes.length === 0 ? (
                      <p className="text-[10px] text-luxury-gray italic">No specifications added yet. Add attributes like Fabric, Fit, Wash care, Occasion, etc.</p>
                    ) : (
                      <div className="space-y-3">
                        {addAttributes.map((attr, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3"
                          >
                            <input
                              type="text"
                              value={attr.key}
                              onChange={(e) => handleAddAttributeChange(idx, 'key', e.target.value)}
                              placeholder="Spec Title (e.g. Fabric)"
                              required
                              className="flex-1 px-3.5 py-2 text-xs bg-[#faf9f6] border border-[#ece9df] rounded-xl outline-none focus:border-[#c5a059]"
                            />
                            <input
                              type="text"
                              value={attr.value}
                              onChange={(e) => handleAddAttributeChange(idx, 'value', e.target.value)}
                              placeholder="Spec Value (e.g. Organic Cotton)"
                              required
                              className="flex-1 px-3.5 py-2 text-xs bg-[#faf9f6] border border-[#ece9df] rounded-xl outline-none focus:border-[#c5a059]"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveAddAttributeRow(idx)}
                              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition duration-200 cursor-pointer"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Section 5: Status Option */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#c5a059] uppercase border-b border-zinc-100 pb-1.5">
                    5. Product Visibility
                  </h4>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="addStatus"
                        value="active"
                        checked={addStatus === 'active'}
                        onChange={() => setAddStatus('active')}
                        className="w-4 h-4 accent-[#c5a059]"
                      />
                      <span className="font-semibold text-zinc-700">Active (Publicly visible in shop showroom)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="addStatus"
                        value="inactive"
                        checked={addStatus === 'inactive'}
                        onChange={() => setAddStatus('inactive')}
                        className="w-4 h-4 accent-[#c5a059]"
                      />
                      <span className="font-semibold text-zinc-700">Inactive (Saved to warehouse draft mode)</span>
                    </label>
                  </div>
                </div>

                {/* Submit Controls */}
                <div className="flex gap-3 justify-end pt-5 border-t border-zinc-100">
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
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-950 text-white hover:bg-[#c5a059] disabled:bg-zinc-800 disabled:cursor-not-allowed rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    {isActionLoading ? (
                      <>
                        <FiLoader className="w-3.5 h-3.5 animate-spin" /> Adding...
                      </>
                    ) : (
                      'Save Product'
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PRODUCT MODAL */}
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
              className="relative z-10 w-full max-w-2xl p-6 sm:p-8 bg-white border border-[#ece9df] rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#c5a059]" />
              <button
                onClick={closeEditModal}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-light text-zinc-950 font-display mb-1">Edit Product</h3>
              <p className="text-xs text-luxury-gray mb-6">
                Update the selected product specifications, media assets, pricing structure, or toggle catalog visibility.
              </p>

              <form onSubmit={handleEditProductSubmit} className="space-y-6">
                
                {/* Section 1: Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#c5a059] uppercase border-b border-zinc-100 pb-1.5">
                    1. Basic Product Info
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="floating-input-group">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder=" "
                        required
                        className="floating-input"
                      />
                      <label className="floating-label">Product Name *</label>
                    </div>

                    <div className="floating-input-group">
                      <input
                        type="text"
                        value={editBrand}
                        onChange={(e) => setEditBrand(e.target.value)}
                        placeholder=" "
                        className="floating-input"
                      />
                      <label className="floating-label">Brand Name (Optional)</label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="floating-input-group sm:col-span-1">
                      <input
                        type="text"
                        value={editSku}
                        onChange={(e) => setEditSku(e.target.value)}
                        placeholder=" "
                        className="floating-input"
                      />
                      <label className="floating-label">SKU Code (Optional)</label>
                    </div>

                    <div className="sm:col-span-1">
                      <select
                        value={editCategory}
                        onChange={(e) => {
                          setEditCategory(e.target.value);
                          setEditSubcategory(''); // reset sub
                        }}
                        required
                        className="w-full bg-[#faf9f6] border border-[#ece9df] rounded-xl px-3 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#c5a059]"
                      >
                        <option value="">Select Category *</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-1">
                      <select
                        value={editSubcategory}
                        onChange={(e) => setEditSubcategory(e.target.value)}
                        required
                        disabled={!editCategory}
                        className="w-full bg-[#faf9f6] border border-[#ece9df] rounded-xl px-3 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#c5a059] disabled:opacity-50"
                      >
                        <option value="">Select Subcategory *</option>
                        {getSubcategoryOptions(editCategory).map((sub, sIdx) => (
                          <option key={sub._id || sIdx} value={sub.subcategoryName}>
                            {sub.subcategoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={editShortDesc}
                        onChange={(e) => setEditShortDesc(e.target.value)}
                        placeholder="Short summary of the jewellery piece (maximum 150 chars)..."
                        required
                        rows="2"
                        className="w-full p-4 text-xs bg-[#faf9f6] border border-[#ece9df] rounded-xl outline-none focus:border-[#c5a059] transition placeholder:text-zinc-400"
                      />
                    </div>
                    
                    <div className="relative">
                      <textarea
                        value={editFullDesc}
                        onChange={(e) => setEditFullDesc(e.target.value)}
                        placeholder="Comprehensive details, materials, weight, diamond/gold specifications, shipping guidelines..."
                        required
                        rows="4"
                        className="w-full p-4 text-xs bg-[#faf9f6] border border-[#ece9df] rounded-xl outline-none focus:border-[#c5a059] transition placeholder:text-zinc-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Pricing & Stock */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#c5a059] uppercase border-b border-zinc-100 pb-1.5">
                    2. Pricing & Stock levels
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="floating-input-group">
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder=" "
                        required
                        min="0"
                        className="floating-input"
                      />
                      <label className="floating-label">Retail Price (₹) *</label>
                    </div>

                    <div className="floating-input-group">
                      <input
                        type="number"
                        value={editDiscountPrice}
                        onChange={(e) => setEditDiscountPrice(e.target.value)}
                        placeholder=" "
                        min="0"
                        className="floating-input"
                      />
                      <label className="floating-label">Discount Price (₹) (Optional)</label>
                    </div>

                    <div className="floating-input-group">
                      <input
                        type="number"
                        value={editStockQuantity}
                        onChange={(e) => setEditStockQuantity(e.target.value)}
                        placeholder=" "
                        required
                        min="0"
                        className="floating-input"
                      />
                      <label className="floating-label">Warehouse Stock Level *</label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="floating-input-group">
                      <input
                        type="text"
                        value={editSizes}
                        onChange={(e) => setEditSizes(e.target.value)}
                        placeholder=" "
                        className="floating-input"
                      />
                      <label className="floating-label">Available Sizes (comma-separated, e.g. 12, 14, 16 or Standard, Adjustable)</label>
                    </div>
                  </div>

                  {/* Featured and Trending Toggles */}
                  <div className="flex flex-wrap items-center gap-6 bg-[#faf9f6] p-4 rounded-xl border border-[#ece9df]/60 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsFeatured}
                        onChange={(e) => setEditIsFeatured(e.target.checked)}
                        className="w-4 h-4 accent-[#c5a059] rounded cursor-pointer"
                      />
                      <span className="font-semibold text-zinc-700 select-none">Featured Product (promoted inside cards)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsTrending}
                        onChange={(e) => setEditIsTrending(e.target.checked)}
                        className="w-4 h-4 accent-[#c5a059] rounded cursor-pointer"
                      />
                      <span className="font-semibold text-zinc-700 select-none">Trending Product (Hot items banner)</span>
                    </label>
                  </div>
                </div>

                {/* Section 3: Product Images (Supports 1-3 images upload with Previews) */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#c5a059] uppercase border-b border-zinc-100 pb-1.5">
                    3. Product Media Canvas * (1 to 3 images total)
                  </h4>

                  {/* Previews Grid: Displays both Retained and Newly selected images */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Retained from Cloudinary */}
                    {retainedImages.map((img, idx) => (
                      <div key={`retained-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-[#ece9df] bg-[#faf9f6]">
                        <img
                          src={img.url}
                          alt={`Retained ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveRetainedImage(idx)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition duration-200 cursor-pointer"
                          title="Remove cover"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-2 left-2 bg-zinc-900/60 text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                          Cloudinary
                        </span>
                      </div>
                    ))}

                    {/* New Upload Previews */}
                    {editImageFiles.map((img, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-[#ece9df] bg-[#faf9f6]">
                        <img
                          src={img.previewUrl}
                          alt={`New ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditImage(idx)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition duration-200 cursor-pointer"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-2 left-2 bg-[#c5a059]/80 text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                          Queue
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Upload Dropzone */}
                  {retainedImages.length + editImageFiles.length < 3 && (
                    <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-[#ece9df] hover:border-[#c5a059]/40 bg-[#faf9f6]/40 hover:bg-[#faf9f6] rounded-xl cursor-pointer transition duration-300">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiUploadCloud className="w-7 h-7 text-[#c5a059]/60 mb-2" />
                        <p className="text-[10px] text-zinc-800 font-semibold mb-1">
                          Click to upload more image cards ({3 - (retainedImages.length + editImageFiles.length)} remaining)
                        </p>
                        <p className="text-[8px] text-luxury-gray">
                          PNG, JPG, WEBP formats up to 2MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleEditImagesChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Section 4: Dynamic Attributes (Specification Lists) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                    <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#c5a059] uppercase">
                      4. Custom specifications (Dynamic Attributes)
                    </h4>
                    <button
                      type="button"
                      onClick={handleEditAttributeRow}
                      className="flex items-center gap-1 px-3 py-1 bg-[#f4eee1] text-[#b48f48] border border-[#c5a059]/15 text-[9px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#c5a059] hover:text-white transition duration-300 cursor-pointer"
                    >
                      <FiPlus className="w-3 h-3" /> Add Specification
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {editAttributes.length === 0 ? (
                      <p className="text-[10px] text-luxury-gray italic">No specifications added yet. Add attributes like Fabric, Fit, Wash care, Occasion, etc.</p>
                    ) : (
                      <div className="space-y-3">
                        {editAttributes.map((attr, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3"
                          >
                            <input
                              type="text"
                              value={attr.key}
                              onChange={(e) => handleEditAttributeChange(idx, 'key', e.target.value)}
                              placeholder="Spec Title (e.g. Fabric)"
                              required
                              className="flex-1 px-3.5 py-2 text-xs bg-[#faf9f6] border border-[#ece9df] rounded-xl outline-none focus:border-[#c5a059]"
                            />
                            <input
                              type="text"
                              value={attr.value}
                              onChange={(e) => handleEditAttributeChange(idx, 'value', e.target.value)}
                              placeholder="Spec Value (e.g. Organic Cotton)"
                              required
                              className="flex-1 px-3.5 py-2 text-xs bg-[#faf9f6] border border-[#ece9df] rounded-xl outline-none focus:border-[#c5a059]"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveEditAttributeRow(idx)}
                              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition duration-200 cursor-pointer"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Section 5: Status Option */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#c5a059] uppercase border-b border-zinc-100 pb-1.5">
                    5. Product Visibility
                  </h4>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="editStatus"
                        value="active"
                        checked={editStatus === 'active'}
                        onChange={() => setEditStatus('active')}
                        className="w-4 h-4 accent-[#c5a059]"
                      />
                      <span className="font-semibold text-zinc-700">Active (Publicly visible in shop showroom)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="editStatus"
                        value="inactive"
                        checked={editStatus === 'inactive'}
                        onChange={() => setEditStatus('inactive')}
                        className="w-4 h-4 accent-[#c5a059]"
                      />
                      <span className="font-semibold text-zinc-700">Inactive (Saved to warehouse draft mode)</span>
                    </label>
                  </div>
                </div>

                {/* Submit Controls */}
                <div className="flex gap-3 justify-end pt-5 border-t border-zinc-100">
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
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-950 text-white hover:bg-[#c5a059] disabled:bg-zinc-800 disabled:cursor-not-allowed rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
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
              <h3 className="text-lg font-light text-zinc-950 font-display mb-2">Delete Product?</h3>
              <p className="text-xs text-luxury-gray mb-6">
                Are you certain you wish to delete <strong className="text-zinc-900">"{deleteTarget.productName}"</strong>? This will permanently remove the item and all associated media from database storage and Cloudinary.
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
                    'Delete Product'
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

export default AdminItemView;
