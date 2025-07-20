// src/api/songApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/songs';

export const fetchSongs = (page = 1) =>
  axios.get(`${API_URL}?page=${page}`).then(res => res.data);
