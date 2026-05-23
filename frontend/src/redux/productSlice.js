import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/apis';

const initialState = {
  products: [],
  loading: false,
  isActionLoading: false,
  error: null,
};

// --- Async Thunks ---

// Fetch All Products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_PRODUCTS);
      return response.data.products || [];
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch products.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create Product (supports multipart/form-data with images & stringified sub-structures)
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (formData, thunkAPI) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CREATE_PRODUCT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create product.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update Product (supports multipart/form-data updates)
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, formData }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.UPDATE_PRODUCT(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update product.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete Product
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.DELETE_PRODUCT(id));
      return { id, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete product.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- Redux Product Slice ---
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.isActionLoading = false;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.isActionLoading = false;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.products = state.products.filter((p) => p._id !== action.payload.id);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;
