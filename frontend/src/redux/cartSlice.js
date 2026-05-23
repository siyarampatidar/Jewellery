import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/apis';

// --- Async Thunks ---

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_CART);
    return response.data.items;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch cart.');
  }
});

export const addToCartDB = createAsyncThunk('cart/addToCart', async (payload, thunkAPI) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.ADD_TO_CART, payload);
    return response.data.items;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to add to cart.');
  }
});

export const updateCartItemDB = createAsyncThunk('cart/updateCartItem', async (payload, thunkAPI) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.UPDATE_CART_ITEM, payload);
    return response.data.items;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update cart.');
  }
});

export const removeFromCartDB = createAsyncThunk('cart/removeFromCart', async (payload, thunkAPI) => {
  try {
    const response = await axiosInstance.delete(API_ENDPOINTS.REMOVE_FROM_CART, { data: payload });
    return response.data.items;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to remove from cart.');
  }
});

export const clearCartDB = createAsyncThunk('cart/clearCart', async (_, thunkAPI) => {
  try {
    await axiosInstance.delete(API_ENDPOINTS.CLEAR_CART);
    return [];
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to clear cart.');
  }
});

// --- Slice ---
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    // Clear cart locally (used on logout)
    clearCartLocal: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    const setItems = (state, action) => {
      state.isLoading = false;
      // Normalize: map productId -> id for frontend compatibility
      state.items = action.payload.map((item) => ({
        id: item.productId || item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        originalPrice: item.originalPrice,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        image: item.image,
        stockQuantity: item.stockQuantity,
      }));
    };

    builder
      .addCase(fetchCart.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCart.fulfilled, setItems)
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(addToCartDB.pending, (state) => { state.isLoading = true; })
      .addCase(addToCartDB.fulfilled, setItems)
      .addCase(addToCartDB.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateCartItemDB.pending, (state) => { state.isLoading = true; })
      .addCase(updateCartItemDB.fulfilled, setItems)
      .addCase(updateCartItemDB.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(removeFromCartDB.pending, (state) => { state.isLoading = true; })
      .addCase(removeFromCartDB.fulfilled, setItems)
      .addCase(removeFromCartDB.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(clearCartDB.pending, (state) => { state.isLoading = true; })
      .addCase(clearCartDB.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
      })
      .addCase(clearCartDB.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
