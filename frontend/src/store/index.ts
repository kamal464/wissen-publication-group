import { configureStore } from '@reduxjs/toolkit';
import journalsReducer from './slices/journalsSlice';
import articlesReducer from './slices/articlesSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    journals: journalsReducer,
    articles: articlesReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;