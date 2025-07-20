// src/components/SongList.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSongs } from '../store/songsSlice';

const SongList = () => {
  const dispatch = useDispatch();
  const { data: songs, loading, error } = useSelector(state => state.songs);

  useEffect(() => {
    dispatch(getSongs());
  }, [dispatch]);

  if (loading) return <p>Loading songs...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Song List</h2>
      <ul>
        {songs.map(song => (
          <li key={song.id}>
            <strong>{song.title}</strong> by {song.artist} ({song.year})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SongList;
