import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/apis';

const initialState = {
  addresses: [],
  loading: false,
  isActionLoading: false,
  error: null,
};

// --- Async Thunks ---

// Fetch Addresses
export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAddresses',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_ADDRESSES);
      return response.data.addresses || [];
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch addresses.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create Address
export const createAddress = createAsyncThunk(
  'addresses/createAddress',
  async (addressData, thunkAPI) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.ADD_ADDRESS, addressData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add address.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update Address
export const editAddress = createAsyncThunk(
  'addresses/editAddress',
  async ({ id, addressData }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.UPDATE_ADDRESS(id), addressData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update address.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete Address
export const removeAddress = createAsyncThunk(
  'addresses/removeAddress',
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.DELETE_ADDRESS(id));
      return { id, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete address.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Set Default Address
export const setDefaultAddressAction = createAsyncThunk(
  'addresses/setDefaultAddress',
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.SET_DEFAULT_ADDRESS(id));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to set default address.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const addressSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    clearAddressError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Address
      .addCase(createAddress.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const newAddress = action.payload.address;
        if (newAddress.isDefault) {
          state.addresses = state.addresses.map(addr => ({ ...addr, isDefault: false }));
        }
        state.addresses.unshift(newAddress);
        state.addresses.sort((a, b) => b.isDefault - a.isDefault);
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })
      
      // Edit Address
      .addCase(editAddress.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(editAddress.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const updated = action.payload.address;
        if (updated.isDefault) {
          state.addresses = state.addresses.map(addr => 
            addr._id === updated._id ? updated : { ...addr, isDefault: false }
          );
        } else {
          state.addresses = state.addresses.map(addr => 
            addr._id === updated._id ? updated : addr
          );
        }
        state.addresses.sort((a, b) => b.isDefault - a.isDefault);
      })
      .addCase(editAddress.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })
      
      // Delete Address
      .addCase(removeAddress.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(removeAddress.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const { id } = action.payload;
        
        const deletedAddress = state.addresses.find(addr => addr._id === id);
        const wasDefault = deletedAddress ? deletedAddress.isDefault : false;
        
        state.addresses = state.addresses.filter(addr => addr._id !== id);
        
        if (wasDefault && state.addresses.length > 0) {
          state.addresses[0] = { ...state.addresses[0], isDefault: true };
        }
        state.addresses.sort((a, b) => b.isDefault - a.isDefault);
      })
      .addCase(removeAddress.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })
      
      // Set Default Address
      .addCase(setDefaultAddressAction.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(setDefaultAddressAction.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const updated = action.payload.address;
        state.addresses = state.addresses.map(addr => 
          addr._id === updated._id ? updated : { ...addr, isDefault: false }
        );
        state.addresses.sort((a, b) => b.isDefault - a.isDefault);
      })
      .addCase(setDefaultAddressAction.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAddressError } = addressSlice.actions;
export default addressSlice.reducer;
