export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: '/auth/register',
  VERIFY_OTP: '/auth/verify-otp',
  RESEND_OTP: '/auth/resend-otp',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: (token) => `/auth/reset-password/${token}`,

  // User / Profile endpoints
  CHANGE_PASSWORD: '/users/change-password',
  PROFILE_UPDATE: '/users/profile',
  UPLOAD_AVATAR: '/users/profile-image',
  REMOVE_AVATAR: '/users/profile-image',

  // Category endpoints
  GET_CATEGORIES: '/categories/get-categories',
  CREATE_CATEGORY: '/categories/create-category',
  UPDATE_CATEGORY: (id) => `/categories/update-category/${id}`,
  DELETE_CATEGORY: (id) => `/categories/delete-category/${id}`,

  // Product endpoints
  GET_PRODUCTS: '/products/get-products',
  GET_PRODUCT: (id) => `/products/get-product/${id}`,
  CREATE_PRODUCT: '/products/create-product',
  UPDATE_PRODUCT: (id) => `/products/update-product/${id}`,
  DELETE_PRODUCT: (id) => `/products/delete-product/${id}`,

  // Address endpoints
  GET_ADDRESSES: '/users/addresses',
  ADD_ADDRESS: '/users/addresses',
  UPDATE_ADDRESS: (id) => `/users/addresses/${id}`,
  DELETE_ADDRESS: (id) => `/users/addresses/${id}`,
  SET_DEFAULT_ADDRESS: (id) => `/users/addresses/${id}/default`,

  // Cart endpoints
  GET_CART: '/cart',
  ADD_TO_CART: '/cart/add',
  UPDATE_CART_ITEM: '/cart/update',
  REMOVE_FROM_CART: '/cart/remove',
  CLEAR_CART: '/cart/clear',

  // Wishlist endpoints
  GET_WISHLIST: '/wishlist',
  TOGGLE_WISHLIST: '/wishlist/toggle',
  REMOVE_FROM_WISHLIST: '/wishlist/remove',

  // Admin User Management endpoints
  ADMIN_GET_USERS: '/users/admin',
  ADMIN_GET_USER: (id) => `/users/admin/${id}`,
  ADMIN_UPDATE_USER: (id) => `/users/admin/${id}`,
  ADMIN_TOGGLE_STATUS: (id) => `/users/admin/${id}/status`,
  ADMIN_DELETE_USER: (id) => `/users/admin/${id}`,
};

