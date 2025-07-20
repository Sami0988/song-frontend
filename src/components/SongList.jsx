import React, { useState, useEffect, useRef } from "react";
import "./SongList.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchSongsRequest, addSongRequest } from "../store/songsSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaPause,
  FaHeart,
  FaTimes,
  FaMusic,
  FaSearch,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { uploadToCloudinary } from "../utils/cloudinary";
import { createSong, fetchSongs } from "../api/songsApi";
import Loader from "../utils/Loader";

const SongList = () => {
  const dispatch = useDispatch();
  const {
    data: songs,
    loading,
    error,
    total,
  } = useSelector((state) => state.songs);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackId, setCurrentTrackId] = useState(null);

  const [newSong, setNewSong] = useState({
    title: "",
    artist: "",
    album: "",
    year: "",
    type: "single",
    audioFile: null,
    audioUrl: "",
    imageFile: null,
    description: "",
    tracks: [],
  });

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleAudioEnd);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleAudioEnd);
      audio.pause();
    };
  }, []);

  // Fetch songs with pagination
  useEffect(() => {
    dispatch(fetchSongsRequest({ page: currentPage, limit: itemsPerPage }));
  }, [dispatch, currentPage, itemsPerPage]);

  const updateTime = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const updateDuration = () => {
    setDuration(audioRef.current.duration || 0);
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds) => {
    // Handle undefined/null/NaN cases
    if (isNaN(seconds)) return "0:00";
    
    const sec = Math.floor(Number(seconds));
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  const togglePlay = (audioUrl, trackId = null) => {
    if (!audioUrl) return;

    // If clicking the same track
    if (audioRef.current.src === audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setCurrentTrackId(trackId);
          })
          .catch((err) => console.error("Playback failed:", err));
      }
    }
    // If clicking a different track
    else {
      audioRef.current.pause();
      audioRef.current.src = audioUrl;
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setCurrentTrackId(trackId);

      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => console.error("Playback failed:", err));
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  useEffect(() => {
    let animationFrameId;

    const update = () => {
      setCurrentTime(audioRef.current.currentTime);
      animationFrameId = requestAnimationFrame(update);
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(update);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  // Pagination controls
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < Math.ceil(total / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const resetForm = () => {
    setNewSong({
      title: "",
      artist: "",
      album: "",
      year: "",
      type: "single",
      audioFile: null,
      audioUrl: "",
      imageFile: null,
      description: "",
      tracks: [],
    });
    setImagePreview(null);
  };

  const handleTrackChange = (index, field, value) => {
    const updatedTracks = [...newSong.tracks];
    updatedTracks[index][field] = value;
    setNewSong({ ...newSong, tracks: updatedTracks });
  };

  const addTrack = () => {
    setNewSong({
      ...newSong,
      tracks: [
        ...newSong.tracks,
        {
          title: "",
          audioFile: null,
          audioUrl: "",
          description: "",
        },
      ],
    });
  };

  const removeTrack = (index) => {
    const updatedTracks = [...newSong.tracks];
    updatedTracks.splice(index, 1);
    setNewSong({ ...newSong, tracks: updatedTracks });
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewSong({ ...newSong, imageFile: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSong = async (e) => {
    e.preventDefault();
    setUploadError(null);
    setIsUploading(true);

    try {
      if (!newSong.title || !newSong.artist) {
        throw new Error("Title and artist are required");
      }

      let imageUrl = newSong.imageUrl || "";
      if (newSong.imageFile) {
        if (!newSong.imageFile.type.startsWith("image/")) {
          throw new Error("Cover must be an image file (JPEG, PNG, etc.)");
        }
        const imageResult = await uploadToCloudinary(newSong.imageFile);
        imageUrl = imageResult.url;
      }

      if (newSong.type === "single" && newSong.audioFile) {
        if (!newSong.audioFile.type.startsWith("audio/")) {
          throw new Error("Please upload a valid audio file");
        }
        const audioResult = await uploadToCloudinary(newSong.audioFile);
        newSong.audioUrl = audioResult.url;
        newSong.duration = Math.round(audioResult.duration || 0);
      }

      if (newSong.type === "album" && newSong.tracks.length > 0) {
        const audioUploadPromises = newSong.tracks.map(async (track) => {
          if (track.audioFile) {
            if (!track.audioFile.type.startsWith("audio/")) {
              throw new Error(`Invalid audio file in track: ${track.title}`);
            }
            const audioResult = await uploadToCloudinary(track.audioFile);
            return {
              ...track,
              audioUrl: audioResult.url,
              duration: Math.round(audioResult.duration || 0),
            };
          }
          return track;
        });

        newSong.tracks = await Promise.all(audioUploadPromises);
      }

      const payload = {
        title: newSong.title,
        artist: newSong.artist,
        type: newSong.type,
        ...(newSong.album && { album: newSong.album }),
        ...(newSong.year && { year: Number(newSong.year) }),
        ...(newSong.description && { description: newSong.description }),
        ...(imageUrl && { imageUrl }),
        ...(newSong.type === "single" && {
          audioUrl: newSong.audioUrl,
          duration: newSong.duration,
        }),
        ...(newSong.type === "album" && {
          tracks: newSong.tracks.map((track) => ({
            title: track.title,
            audioUrl: track.audioUrl,
            duration: track.duration,
          })),
        }),
      };

      await createSong(payload);
      setShowAddForm(false);
      resetForm();
      dispatch(fetchSongsRequest({ page: currentPage, limit: itemsPerPage }));
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload song. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const filteredItems = songs.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.artist.toLowerCase().includes(query) ||
      (item.album && item.album.toLowerCase().includes(query))
    );
  });

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your music...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-screen">
        <p>Error loading songs</p>
        <button
          onClick={() =>
            dispatch(
              fetchSongsRequest({ page: currentPage, limit: itemsPerPage })
            )
          }
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="music-app">
      <div className="background-overlay"></div>

      {(showAddForm || selectedItem) && (
        <div
          className="popup-overlay"
          onClick={() => {
            setShowAddForm(false);
            setSelectedItem(null);
          }}
        ></div>
      )}

      <div className="content-container">
        <motion.div
          className="music-grid-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="search-container">
            <h2 className="section-title">Ethiopian Music Collection</h2>
            <div className="controls">
              <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search songs, albums, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                className="add-button"
                onClick={() => setShowAddForm(true)}
              >
                <FaPlus /> Add Song
              </button>
            </div>
            <div className="stats">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, total)} of {total} items
            </div>
          </div>

          <div className="music-grid">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <motion.div
                  key={item._id}
                  className={`music-card glass-card ${item.type}`}
                  onClick={() => handleItemClick(item)}
                  whileHover={{ scale: 1.03 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="music-card-image">
                    <img
                      src={
                        item.imageUrl ||
                        `https://source.unsplash.com/random/300x300/?music,${item.type},${item._id}`
                      }
                      alt={item.title}
                      loading="lazy"
                    />
                    {item.type === "single" && (
                      <button
                        className="play-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay(item.audioUrl, item._id);
                        }}
                      >
                        {isPlaying && currentTrackId === item._id ? (
                          <FaPause />
                        ) : (
                          <FaPlay />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="music-card-info">
                    <h3>{item.title}</h3>
                    <p>{item.artist}</p>
                    {item.type === "single" && item.album && (
                      <p className="album-name">From: {item.album}</p>
                    )}
                    <div className="music-type-badge">
                      {item.type === "album" ? "Album" : "Single"}
                    </div>
                    <p className="year">{item.year}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="no-results glass-card">
                <FaMusic size={50} />
                <p>No items found matching "{searchQuery}"</p>
              </div>
            )}
          </div>

          {total > itemsPerPage && (
            <div className="pagination-container">
              <div className="pagination-controls">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  <FaChevronLeft />
                </button>

                {Array.from(
                  { length: Math.min(5, Math.ceil(total / itemsPerPage)) },
                  (_, i) => {
                    const pageNum =
                      Math.max(
                        1,
                        Math.min(
                          Math.ceil(total / itemsPerPage) - 4,
                          currentPage - 2
                        )
                      ) + i;

                    if (pageNum > Math.ceil(total / itemsPerPage)) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`pagination-button ${
                          currentPage === pageNum ? "active" : ""
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === Math.ceil(total / itemsPerPage)}
                  className="pagination-button"
                >
                  <FaChevronRight />
                </button>
              </div>
              <div className="items-per-page-selector">
                <label>Show: </label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="items-per-page-dropdown"
                >
                  <option value={4}>4</option>
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <>
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              className="popup-form"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {isUploading && <Loader loadingText="Uploading your song..." />}
              <form
                className="add-song-form glass-card"
                onSubmit={handleAddSong}
              >
                <h3>Add New Music</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={newSong.title}
                      onChange={(e) =>
                        setNewSong({ ...newSong, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Artist</label>
                    <input
                      type="text"
                      value={newSong.artist}
                      onChange={(e) =>
                        setNewSong({ ...newSong, artist: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Album</label>
                    <input
                      type="text"
                      value={newSong.album}
                      onChange={(e) =>
                        setNewSong({ ...newSong, album: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Year</label>
                    <input
                      type="text"
                      value={newSong.year}
                      onChange={(e) =>
                        setNewSong({ ...newSong, year: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={newSong.type}
                    onChange={(e) =>
                      setNewSong({ ...newSong, type: e.target.value })
                    }
                  >
                    <option value="single">Single</option>
                    <option value="album">Album</option>
                  </select>
                </div>

                {newSong.type === "single" ? (
                  <div className="form-group">
                    <label>Upload Audio File</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const audioUrl = URL.createObjectURL(file);
                          setNewSong({ ...newSong, audioFile: file, audioUrl });
                        }
                      }}
                      required
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Tracks</label>
                    {newSong.tracks.map((track, index) => (
                      <div key={index} className="track-group">
                        <input
                          type="text"
                          placeholder="Track Title"
                          value={track.title}
                          onChange={(e) =>
                            handleTrackChange(index, "title", e.target.value)
                          }
                          required
                        />
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const audioUrl = URL.createObjectURL(file);
                              handleTrackChange(index, "audioFile", file);
                              handleTrackChange(index, "audioUrl", audioUrl);
                            }
                          }}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Description"
                          value={track.description}
                          onChange={(e) =>
                            handleTrackChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeTrack(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addTrack}>
                      Add Track
                    </button>
                  </div>
                )}

                <div className="form-group">
                  <label>Cover Image</label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="image-upload-input"
                    />
                    <label
                      htmlFor="image-upload"
                      className="image-upload-label"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="image-preview"
                        />
                      ) : (
                        <div className="upload-placeholder">
                          <FaPlus className="upload-icon" />
                          <span>Choose an image</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newSong.description}
                    onChange={(e) =>
                      setNewSong({ ...newSong, description: e.target.value })
                    }
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-button">
                    {isUploading ? "Uploading..." : "Add Music"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              className="popup-form"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="music-detail-view glass-card">
                <button
                  className="back-button"
                  onClick={() => setSelectedItem(null)}
                >
                  <FaTimes />
                </button>

                <div className="music-header">
                  <div className="music-cover">
                    <img
                      src={
                        selectedItem.imageUrl ||
                        `https://source.unsplash.com/random/400x400/?music,${selectedItem.type},${selectedItem._id}`
                      }
                      alt={selectedItem.title}
                    />
                  </div>

                  <div className="music-info">
                    <h2>{selectedItem.title}</h2>
                    <p className="artist">{selectedItem.artist}</p>
                    {selectedItem.album && (
                      <p className="album-name">
                        {selectedItem.type === "album" ? "Album" : "From"}:{" "}
                        {selectedItem.album}
                      </p>
                    )}
                    <p className="year">{selectedItem.year}</p>
                    {selectedItem.description && (
                      <p className="description">{selectedItem.description}</p>
                    )}

                    <div className="music-actions">
                      {selectedItem.type === "single" ? (
                        <button
                          className="play-button"
                          onClick={() =>
                            togglePlay(selectedItem.audioUrl, selectedItem._id)
                          }
                        >
                          {isPlaying && currentTrackId === selectedItem._id ? (
                            <FaPause />
                          ) : (
                            <FaPlay />
                          )}
                          {isPlaying && currentTrackId === selectedItem._id
                            ? "Pause"
                            : "Play"}
                        </button>
                      ) : (
                        <button
                          className="play-button"
                          onClick={() =>
                            selectedItem.tracks &&
                            selectedItem.tracks.length > 0 &&
                            togglePlay(
                              selectedItem.tracks[0].audioUrl,
                              selectedItem.tracks[0]._id
                            )
                          }
                        >
                          <FaPlay /> Play Album
                        </button>
                      )}
                      <button className="secondary-button">
                        <FaHeart /> Like
                      </button>
                    </div>
                  </div>
                </div>

                <div className="music-player-controls">
                  <div className="time-display">
                    <span>{formatTime(currentTime)}</span>
                    <span> / </span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={duration ? (currentTime / duration) * 100 : 0}
                    onChange={handleSeek}
                    className="progress-bar"
                  />
                </div>
                {selectedItem.type === "album" &&
                  selectedItem.tracks &&
                  selectedItem.tracks.length > 0 && (
                    <div className="track-list">
                      <h3>Album Tracks</h3>
                      <div className="track-list-header">
                        <span>#</span>
                        <span>Title</span>
                        <span>Duration</span>
                        <span>Action</span>
                      </div>

                      {selectedItem.tracks.map((track, index) => (
                        <div key={track._id || index} className="track-item">
                          <span className="track-number">{index + 1}</span>
                          <span className="track-title">{track.title}</span>
                          <span className="track-duration">
                            {track.duration
                              ? formatTime(track.duration)
                              : "--:--"}
                          </span>
                          <button
                            className="track-play"
                            onClick={() =>
                              togglePlay(track.audioUrl, track._id)
                            }
                          >
                            {isPlaying && currentTrackId === track._id ? (
                              <FaPause />
                            ) : (
                              <FaPlay />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </div>
  );
};

export default SongList;
