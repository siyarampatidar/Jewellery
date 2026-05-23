import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/apis';

const initialState = {
  categories: [],
  loading: false,
  isActionLoading: false,
  error: null,
};

// --- Async Thunks ---

// Fetch All Categories
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_CATEGORIES);
      return response.data.categories || [];
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch categories.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create Category (supports optional Cloudinary cover image)
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (formData, thunkAPI) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CREATE_CATEGORY, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create category.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update Category (supports optional image update)
export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, formData }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.UPDATE_CATEGORY(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update category.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete Category
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.DELETE_CATEGORY(id));
      return { id, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete category.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- Redux Category Slice ---
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.isActionLoading = false;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.isActionLoading = false;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.categories = state.categories.filter((cat) => cat._id !== action.payload.id);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
