import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/authSlice';
import categoryReducer from '../redux/categorySlice';
import productReducer from '../redux/productSlice';
import wishlistReducer from '../redux/wishlistSlice';
import cartReducer from '../redux/cartSlice';
import addressReducer from '../redux/addressSlice';
import adminUserReducer from '../redux/adminUserSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    products: productReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
    addresses: addressReducer,
    adminUsers: adminUserReducer,
  },
});

export default store;

