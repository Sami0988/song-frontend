import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSongs } from '../api/songsApi';

export const getSongs = createAsyncThunk('songs/getSongs', async (page = 1) => {
  const data = await fetchSongs(page);
  return data;
});

const songsSlice = createSlice({
  name: 'songs',
  initialState: {
    data: [],
    total: 0,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getSongs.pending, state => {
        state.loading = true;
      })
      .addCase(getSongs.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(getSongs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default songsSlice.reducer;
