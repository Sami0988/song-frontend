// src/store/songsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const songsSlice = createSlice({
  name: 'songs',
  initialState: {
    data: [],
    total: 0,
    loading: false,
    error: null
  },
  reducers: {
    fetchSongsRequest: () => {}, // Triggered by component
    addSongRequest: (state, action) => {}, // Triggered by component
    setSongs: (state, action) => {
      state.loading = false;
      state.data = action.payload.data;
      state.total = action.payload.total;
      state.error = null;
    },
    addSongSuccess: (state, action) => {
      state.loading = false;
      state.data = [action.payload, ...state.data];
      state.total += 1;
      state.error = null;
    },
    setSongsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSongsError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { 
  fetchSongsRequest, 
  addSongRequest,
  setSongs, 
  addSongSuccess,
  setSongsLoading, 
  setSongsError 
} = songsSlice.actions;

export default songsSlice.reducer;