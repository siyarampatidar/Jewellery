import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/apis';

// --- Async Thunks ---

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_WISHLIST);
    return response.data.items;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist.');
  }
});

export const toggleWishlistDB = createAsyncThunk('wishlist/toggle', async (productId, thunkAPI) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.TOGGLE_WISHLIST, { productId });
    return response.data.items;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update wishlist.');
  }
});

export const removeFromWishlistDB = createAsyncThunk('wishlist/remove', async (productId, thunkAPI) => {
  try {
    const response = await axiosInstance.delete(API_ENDPOINTS.REMOVE_FROM_WISHLIST, {
      data: { productId },
    });
    return response.data.items;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist.');
  }
});

// --- Slice ---
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    // Clear wishlist locally on logout
    clearWishlistLocal: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    const setItems = (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
    };

    builder
      .addCase(fetchWishlist.pending, (state) => { state.isLoading = true; })
      .addCase(fetchWishlist.fulfilled, setItems)
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(toggleWishlistDB.pending, (state) => { state.isLoading = true; })
      .addCase(toggleWishlistDB.fulfilled, setItems)
      .addCase(toggleWishlistDB.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(removeFromWishlistDB.pending, (state) => { state.isLoading = true; })
      .addCase(removeFromWishlistDB.fulfilled, setItems)
      .addCase(removeFromWishlistDB.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWishlistLocal } = wishlistSlice.actions;
export default wishlistSlice.reducer;
