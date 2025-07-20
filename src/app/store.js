import { configureStore } from '@reduxjs/toolkit';
import songsReducer from '../store/songsSlice';

const store = configureStore({
  reducer: {
    songs: songsReducer
  }
});

export default store;
