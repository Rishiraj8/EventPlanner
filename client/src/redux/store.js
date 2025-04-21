import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventReducer from './slices/eventSlice'; 

const store = configureStore({
  reducer: {
    auth: authReducer,
    event: eventReducer, 
  },
});

export default store;
