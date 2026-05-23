import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/apis';
import { clearCartLocal } from './cartSlice';
import { clearWishlistLocal } from './wishlistSlice';

// Retrieve token from localStorage if fallback needed
const initialToken = localStorage.getItem('token') || null;

const initialState = {
  user: null,
  token: initialToken,
  isAuthenticated: false,
  isLoading: true, // Start true to fetch current user session on load
  isActionLoading: false, // For submit buttons loading states
  error: null,
  otpEmail: localStorage.getItem('otpEmail') || null,
};

// --- Async Thunks ---

// Register Thunk
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.REGISTER, userData);
      // Save otpEmail to remember who is verifying
      localStorage.setItem('otpEmail', userData.email);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Verify OTP Thunk
export const verifyOtpCode = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, thunkAPI) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.VERIFY_OTP, { email, otp });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      localStorage.removeItem('otpEmail');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Resend OTP Thunk
export const resendOtpCode = createAsyncThunk(
  'auth/resendOtp',
  async (email, thunkAPI) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.RESEND_OTP, { email });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login Thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ identifier, password, rememberMe }, thunkAPI) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, { identifier, password, rememberMe });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed.';
      // Support redirecting to verification screen if user is unverified
      if (error.response?.data?.unverified) {
        localStorage.setItem('otpEmail', error.response.data.email);
        return thunkAPI.rejectWithValue({
          message: error.response.data.message,
          unverified: true,
          email: error.response.data.email,
        });
      }
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

// Logout Thunk
export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await axiosInstance.post(API_ENDPOINTS.LOGOUT);
    localStorage.removeItem('token');
    localStorage.removeItem('otpEmail');
    // Remove legacy localStorage keys (if any from before DB migration)
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    // Clear cart and wishlist from Redux state on logout
    thunkAPI.dispatch(clearCartLocal());
    thunkAPI.dispatch(clearWishlistLocal());
    return null;
  } catch (error) {
    const message = error.response?.data?.message || 'Logout failed.';
    return thunkAPI.rejectWithValue(message);
  }
});

// Check Current User Thunk (Session Restorer)
export const checkCurrentUser = createAsyncThunk(
  'auth/checkCurrentUser',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ME);
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      const message = error.response?.data?.message || 'Session expired.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update Profile Details Thunk
export const updateProfile = createAsyncThunk(
  'users/updateProfile',
  async (profileData, thunkAPI) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.PROFILE_UPDATE, profileData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile details.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Upload Avatar Thunk
export const uploadAvatar = createAsyncThunk(
  'users/uploadAvatar',
  async (formData, thunkAPI) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.UPLOAD_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload profile image.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove Avatar Thunk
export const removeAvatar = createAsyncThunk(
  'users/removeAvatar',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.REMOVE_AVATAR);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove profile image.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- Redux Auth Slice ---
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setOtpEmail: (state, action) => {
      state.otpEmail = action.payload;
      localStorage.setItem('otpEmail', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.otpEmail = action.payload.email;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // Verify OTP
      .addCase(verifyOtpCode.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(verifyOtpCode.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.otpEmail = null;
      })
      .addCase(verifyOtpCode.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.otpEmail = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isActionLoading = false;
        // Check if unverified payload format
        if (action.payload?.unverified) {
          state.otpEmail = action.payload.email;
          state.error = action.payload.message;
        } else {
          state.error = action.payload?.message || action.payload;
        }
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.otpEmail = null;
        state.isLoading = false;
      })

      // Check Auth
      .addCase(checkCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(checkCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })

      // Update Profile Details
      .addCase(updateProfile.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // Upload Avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isActionLoading = false;
        if (state.user) {
          state.user.profileImage = action.payload.profileImage;
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // Remove Avatar
      .addCase(removeAvatar.fulfilled, (state) => {
        if (state.user) {
          state.user.profileImage = { url: '', public_id: '' };
        }
      });
  },
});

export const { clearError, setOtpEmail } = authSlice.actions;
export default authSlice.reducer;
