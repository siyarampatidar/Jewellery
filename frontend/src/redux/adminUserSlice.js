import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/apis';

const initialState = {
  users: [],
  loading: false,
  isActionLoading: false,
  error: null,
};

// --- Async Thunks ---

// Fetch All Registered Users
export const fetchAllUsers = createAsyncThunk(
  'adminUsers/fetchAllUsers',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN_GET_USERS);
      return response.data.users || [];
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to retrieve registered users.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin Update User Details (supports uploading profile image file via multipart)
export const adminUpdateUserDetails = createAsyncThunk(
  'adminUsers/adminUpdateUserDetails',
  async ({ id, formData }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.ADMIN_UPDATE_USER(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user details.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Toggle User Active/Deactivated Status
export const toggleUserActiveStatus = createAsyncThunk(
  'adminUsers/toggleUserActiveStatus',
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.ADMIN_TOGGLE_STATUS(id));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to alter user status.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete User Account Permanently
export const deleteUserAccount = createAsyncThunk(
  'adminUsers/deleteUserAccount',
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.ADMIN_DELETE_USER(id));
      return { id, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user account.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- Redux Admin Users Slice ---
const adminUserSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {
    clearAdminUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin Update User
      .addCase(adminUpdateUserDetails.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(adminUpdateUserDetails.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const index = state.users.findIndex((user) => user._id === action.payload.user._id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
      })
      .addCase(adminUpdateUserDetails.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // Toggle Status
      .addCase(toggleUserActiveStatus.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(toggleUserActiveStatus.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const index = state.users.findIndex((user) => user._id === action.payload.user._id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
      })
      .addCase(toggleUserActiveStatus.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(deleteUserAccount.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(deleteUserAccount.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.users = state.users.filter((user) => user._id !== action.payload.id);
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminUserError } = adminUserSlice.actions;
export default adminUserSlice.reducer;
