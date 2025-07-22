import axios from "axios";

// Use environment variable or fallback to localhost
const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/songs";

// Fetch paginated list of songs
export const fetchSongs = ({ page = 1, limit = 8 }) =>
  axios.get(`${API_URL}?page=${page}&limit=${limit}`).then((res) => res.data);

export const fetchSongById = (id) =>
  axios.get(`${API_URL}/${id}`).then((res) => res.data);

export const createSong = (songData) =>
  axios.post(API_URL, songData).then((res) => res.data);

export const updateSong = (id, updatedData) =>
  axios.put(`${API_URL}/${id}`, updatedData).then((res) => res.data);

export const deleteSong = (id) =>
  axios.delete(`${API_URL}/${id}`).then((res) => res.data);
