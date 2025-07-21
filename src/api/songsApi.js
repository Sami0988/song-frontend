
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/songs';

// Fetch paginated list of songs
export const fetchSongs = ({ page = 1, limit = 8 }) =>
  axios.get(`${API_URL}?page=${page}&limit=${limit}`).then(res => res.data);
// Fetch a single song by ID
export const fetchSongById = (id) =>
  axios.get(`${API_URL}/${id}`).then(res => res.data);

// Create a new song
export const createSong = (songData) =>
  axios.post(API_URL, songData).then(res => res.data);

// Update an existing song by ID
export const updateSong = (id, updatedData) =>
  axios.put(`${API_URL}/${id}`, updatedData).then(res => res.data);

// Delete a song by ID
export const deleteSong = (id) =>
  axios.delete(`${API_URL}/${id}`).then(res => res.data);
