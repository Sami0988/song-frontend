import React, { useState, useEffect } from 'react';
import './SongList.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSongsRequest } from '../store/songsSlice';

import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaHeart, FaEllipsisH, FaTimes, FaMusic, FaSearch } from 'react-icons/fa';

const SongList = () => {
  const dispatch = useDispatch();
  const { data: songs, loading, error } = useSelector(state => state.songs);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchSongsRequest());
  }, [dispatch]);

  const handleAlbumClick = (album) => {
    // Generate mock tracks for the album
    const tracks = Array.from({ length: 12 }, (_, i) => ({
      id: `${album.id}-track-${i+1}`,
      title: `Track ${i+1}`,
      duration: `${Math.floor(Math.random() * 3) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      isPlaying: false
    }));
    setSelectedAlbum({ ...album, tracks });
    // Scroll to the album details section
    setTimeout(() => {
      document.getElementById('album-details-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const togglePlay = (trackId = null) => {
    if (trackId) {
      // Toggle specific track
      setSelectedAlbum(prev => ({
        ...prev,
        tracks: prev.tracks.map(track => 
          track.id === trackId 
            ? { ...track, isPlaying: !track.isPlaying } 
            : { ...track, isPlaying: false }
        )
      }));
      setIsPlaying(!isPlaying);
    } else {
      // Toggle album play
      setIsPlaying(!isPlaying);
    }
  };

  // Filter albums based on search query
  const filteredAlbums = songs.filter(album => {
    const query = searchQuery.toLowerCase();
    return (
      album.title.toLowerCase().includes(query) ||
      album.artist.toLowerCase().includes(query)
    );
  });

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading your music...</p>
    </div>
  );

  if (error) return (
    <div className="error-screen">
      <p>Error loading songs</p>
      <button onClick={() => dispatch(getSongs())}>Retry</button>
    </div>
  );

  return (
    <div className="music-app">
      {/* Background with overlay */}
      <div className="background-overlay"></div>
      
      {/* Main content */}
      <div className="content-container">
        {/* Always show the album grid view */}
        <motion.div 
          className="album-grid-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="search-container">
            <h2 className="section-title">Browse Albums</h2>
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search albums or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="album-grid">
            {filteredAlbums.length > 0 ? (
              filteredAlbums.map(album => (
                <motion.div 
                  key={album.id}
                  className="album-card"
                  onClick={() => handleAlbumClick(album)}
                  whileHover={{ scale: 1.03 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="album-card-image">
                    <img 
                      src={album.coverImage || `https://source.unsplash.com/random/300x300/?music,album,${album.id}`} 
                      alt={album.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="album-card-info">
                    <h3>{album.title}</h3>
                    <p>{album.artist}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="no-results">
                <FaMusic size={50} />
                <p>No albums found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Album detail view - appears below the grid */}
        <div id="album-details-section">
          <AnimatePresence>
            {selectedAlbum && (
              <motion.div 
                className="album-detail-view"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.3 }}
              >
                <button 
                  className="back-button"
                  onClick={() => setSelectedAlbum(null)}
                >
                  <FaTimes />
                </button>
                
                <div className="album-header">
                  <div className="album-cover">
                    <img 
                      src={selectedAlbum.coverImage || `https://source.unsplash.com/random/400x400/?music,album,${selectedAlbum.id}`} 
                      alt={selectedAlbum.title}
                    />
                  </div>
                  
                  <div className="album-info">
                    <h2>{selectedAlbum.title}</h2>
                    <p className="artist">{selectedAlbum.artist}</p>
                    <p className="year">{selectedAlbum.year || '2023'}</p>
                    <p className="description">
                      {selectedAlbum.description || 
                        "This album represents the rich musical heritage of Ethiopia. Each track tells a unique story through traditional instruments and modern production."}
                    </p>
                    
                    <div className="album-actions">
                      <button 
                        className="play-button"
                        onClick={() => togglePlay()}
                      >
                        {isPlaying ? <FaPause /> : <FaPlay />}
                        {isPlaying ? 'Pause' : 'Play Album'}
                      </button>
                      <button className="secondary-button">
                        <FaHeart /> Like
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="track-list">
                  <h3>Tracks</h3>
                  <div className="track-list-header">
                    <span>#</span>
                    <span>Title</span>
                    <span>Duration</span>
                    <span>Action</span>
                  </div>
                  
                  {selectedAlbum.tracks.map((track, index) => (
                    <div key={track.id} className="track-item">
                      <span className="track-number">{index + 1}</span>
                      <span className="track-title">{track.title}</span>
                      <span className="track-duration">{track.duration}</span>
                      <button 
                        className="track-play"
                        onClick={() => togglePlay(track.id)}
                      >
                        {track.isPlaying ? <FaPause /> : <FaPlay />}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SongList;