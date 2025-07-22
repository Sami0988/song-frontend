import React, { useState, useEffect, useRef } from "react";
import "./SongList.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchSongsRequest, addSongRequest } from "../store/songsSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaPause,
  FaSpinner,
  FaTimes,
  FaMusic,
  FaSearch,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { uploadToCloudinary } from "../utils/cloudinary";
import {
  createSong,
  deleteSong,
  updateSong,
} from "../api/songsApi";
import Loader from "../utils/Loader";
import { toast } from "react-toastify";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
    itemName: "",
  });
  const [currentAlbumId, setCurrentAlbumId] = useState(null);
  const [playingAlbumTracks, setPlayingAlbumTracks] = useState([]);

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

  // Updates the currentTime state with the current playback time of the audio
  const updateTime = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  // Updates the duration state with the total length of the audio track
  const updateDuration = () => {
    setDuration(audioRef.current.duration || 0);
  };

  // Formats a time value in seconds into a mm:ss string (e.g., 3:05)
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";

    const sec = Math.floor(Number(seconds));
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;

    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  // Handles the end of audio playback by resetting playback state
  const handleAudioEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = (audioUrl, trackId = null) => {
    if (!audioUrl) return;

    // If the same track is clicked again
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
    // If a different track is clicked
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

    setCurrentAlbumId(null);
  };

  // Helper function to check if album is playing
  const isAlbumPlaying = (album) => {
    return isPlaying && currentAlbumId === album._id;
  };

  // Plays a specific track from an album
  const playAlbumTrack = (albumId, track) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();

      audioRef.current
        .play()
        .then(() => {
          setCurrentTrackId(track._id);
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Error playing track:", err);
        });
    }
  };

  // Toggles album playback (play first track or pause entire album)
  const toggleAlbumPlay = (album) => {
    if (!album.tracks || album.tracks.length === 0) return;

    if (isPlaying && currentAlbumId === album._id) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentAlbumId(null);
      setCurrentTrackId(null);
      setPlayingAlbumTracks([]);
    } else {
      setPlayingAlbumTracks(album.tracks); // ✅ Save track list
      playAlbumTrack(album._id, album.tracks[0]); // ✅ USE helper to start playing
    }
  };

  // Handles auto-playing the next track when the current one ends (album context)
  useEffect(() => {
    const handleEnded = () => {
      if (!currentAlbumId || !currentTrackId || playingAlbumTracks.length === 0)
        return;

      const currentIndex = playingAlbumTracks.findIndex(
        (track) => track._id === currentTrackId
      );

      if (currentIndex < playingAlbumTracks.length - 1) {
        const nextTrack = playingAlbumTracks[currentIndex + 1];
        playAlbumTrack(currentAlbumId, nextTrack);
      } else {
        // End of album
        setIsPlaying(false);
        setCurrentTrackId(null);
        setCurrentAlbumId(null);
        setPlayingAlbumTracks([]);
      }
    };

    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => audio.removeEventListener("ended", handleEnded);
    }
  }, [currentTrackId, currentAlbumId, playingAlbumTracks]);

  // Handles seeking in the track using a progress slider
  const handleSeek = (e) => {
    const seekPercent = e.target.value;
    const seekTime = (seekPercent / 100) * duration;

    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);

      // Ensure audio continues playing after seeking
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((err) => console.error("Playback failed after seek:", err));
      }
    }
  };

  // Play/pause logic when clicking a track from the album list
  const handlePlayPause = async (track) => {
    try {
      if (currentTrackId === track._id) {
        // Same track: toggle play/pause
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          await audioRef.current.play(); // wait for it to play
          setIsPlaying(true);
        }
      } else {
        // New track: switch
        setPlayingAlbumTracks(selectedItem.tracks);
        playAlbumTrack(selectedItem._id, track); // this will internally call play()
      }
    } catch (err) {
      console.error("Playback error:", err);
    }
  };

  // Hook to auto-play the next track when the current track finishes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      playNextTrack(); // move to next track
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [playingAlbumTracks, currentTrackId]);

  // Handles playing the next track manually when called (e.g., via 'ended' or 'Next' button)
  const playNextTrack = () => {
    if (!playingAlbumTracks || playingAlbumTracks.length === 0) return;

    const currentIndex = playingAlbumTracks.findIndex(
      (t) => t._id === currentTrackId
    );

    const nextIndex = currentIndex + 1;

    if (nextIndex < playingAlbumTracks.length) {
      const nextTrack = playingAlbumTracks[nextIndex];
      playAlbumTrack(selectedItem._id, nextTrack); // switch to next track
    } else {
      // No more tracks
      setIsPlaying(false);
      setCurrentTrackId(null);
    }
  };

  // Keeps track of the current playback time using requestAnimationFrame
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

  // Moves to the next page of the pagination if not already on the last page
  const goToNextPage = () => {
    if (currentPage < Math.ceil(total / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Moves to the previous page of the pagination if not already on the first page
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Updates how many items to display per page and resets to the first page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Resets the new song form state to initial empty values
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

  // Updates a specific field of a track at a given index in the tracks array
  const handleTrackChange = (index, field, value) => {
    const updatedTracks = [...newSong.tracks];
    updatedTracks[index][field] = value;
    setNewSong({ ...newSong, tracks: updatedTracks });
  };

  // Adds a new empty track to the tracks array for the album form
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

  // Removes a track from the tracks array by its index
  const removeTrack = (index) => {
    const updatedTracks = [...newSong.tracks];
    updatedTracks.splice(index, 1);
    setNewSong({ ...newSong, tracks: updatedTracks });
  };

  // Handles clicking an item (song or album) to set it as the selected item
  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  // Handles selection of an image file for the song cover,
  // reads it as a data URL, and sets the preview image state
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

  // Handles the submission of the new song form,
  // uploads image and audio files to Cloudinary,
  // prepares payload based on type (single or album),
  // calls API to create the song, and manages loading and error states
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
          if (track.audioFile && track.audioFile.type.startsWith("audio/")) {
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
          tracks: newSong.tracks.map(({ title, audioUrl, duration }) => ({
            title,
            audioUrl,
            duration,
          })),
        }),
      };

      await createSong(payload);
      setShowAddForm(false);
      resetForm();
      dispatch(fetchSongsRequest({ page: currentPage, limit: itemsPerPage }));
      toast.success("Song uploaded successfully!");
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Upload failed.";
      setUploadError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  // Opens the edit form modal and pre-fills the form with the selected song or album data
  const handleEdit = (item) => {
    // Reset any previous errors
    setUploadError(null);

    setEditFormData({
      _id: item._id,
      title: item.title,
      artist: item.artist,
      album: item.album || "",
      year: item.year || "",
      description: item.description || "",
      type: item.type,
      imageUrl: item.imageUrl || "",
      ...(item.type === "single" && {
        audioUrl: item.audioUrl,
        duration: item.duration,
      }),
      ...(item.type === "album" && {
        tracks:
          item.tracks?.map((track) => ({
            ...track,
            audioFile: null, // Will hold new audio files if replaced
          })) || [],
      }),
      imageFile: null,
      audioFile: null,
    });

    setIsEditing(true);
  };

  // Handles saving the edited song or album data on form submission
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setUploadError(null);
    setIsUploading(true);

    try {
      // Validate required fields
      if (!editFormData.title?.trim()) {
        throw new Error("Title is required");
      }
      if (!editFormData.artist?.trim()) {
        throw new Error("Artist is required");
      }

      // Upload new image if provided
      let imageUrl = editFormData.imageUrl;
      if (editFormData.imageFile) {
        if (!editFormData.imageFile.type.startsWith("image/")) {
          throw new Error("Cover must be an image file (JPEG, PNG, etc.)");
        }
        if (editFormData.imageFile.size > 5 * 1024 * 1024) {
          throw new Error("Image file size must be less than 5MB");
        }
        const imageResult = await uploadToCloudinary(editFormData.imageFile);
        imageUrl = imageResult.url;
      }

      // Handle single track updates
      let audioUrl = editFormData.audioUrl;
      let duration = editFormData.duration;
      if (editFormData.type === "single" && editFormData.audioFile) {
        if (!editFormData.audioFile.type.startsWith("audio/")) {
          throw new Error("Please upload a valid audio file");
        }
        if (editFormData.audioFile.size > 20 * 1024 * 1024) {
          throw new Error("Audio file size must be less than 20MB");
        }
        const audioResult = await uploadToCloudinary(editFormData.audioFile);
        audioUrl = audioResult.url;
        duration = Math.round(audioResult.duration || 0);
      }

      // Handle album track updates
      let updatedTracks = editFormData.tracks;
      if (editFormData.type === "album" && editFormData.tracks?.length > 0) {
        updatedTracks = await Promise.all(
          editFormData.tracks.map(async (track) => {
            if (!track.title?.trim()) {
              throw new Error(
                `Track ${track._id || track.tempId} is missing a title`
              );
            }
            if (track.audioFile) {
              if (!track.audioFile.type.startsWith("audio/")) {
                throw new Error(`Invalid audio file in track: ${track.title}`);
              }
              if (track.audioFile.size > 20 * 1024 * 1024) {
                throw new Error(
                  `Audio file for "${track.title}" is too large (max 20MB)`
                );
              }
              const audioResult = await uploadToCloudinary(track.audioFile);
              return {
                ...track,
                audioUrl: audioResult.url,
                duration: Math.round(audioResult.duration || 0),
              };
            }
            return track;
          })
        );
      }

      // Prepare update payload
      const payload = {
        title: editFormData.title.trim(),
        artist: editFormData.artist.trim(),
        type: editFormData.type,
        ...(editFormData.album && { album: editFormData.album.trim() }),
        ...(editFormData.year && { year: Number(editFormData.year) }),
        ...(editFormData.description && {
          description: editFormData.description.trim(),
        }),
        ...(imageUrl && { imageUrl }),
        ...(editFormData.type === "single" && {
          audioUrl,
          duration,
        }),
        ...(editFormData.type === "album" && {
          tracks: updatedTracks.map((track) => ({
            _id: track._id,
            title: track.title.trim(),
            audioUrl: track.audioUrl,
            duration: track.duration,
          })),
        }),
      };

      // Call API to update
      await updateSong(editFormData._id, payload);

      // Refresh data
      dispatch(fetchSongsRequest({ page: currentPage, limit: itemsPerPage }));

      // Update player state if needed
      if (currentTrackId === editFormData._id) {
        setSelectedItem({ ...editFormData, ...payload });
      } else if (
        editFormData.type === "album" &&
        editFormData.tracks.some((t) => t._id === currentTrackId)
      ) {
        const updatedAlbum = { ...editFormData, ...payload };
        setSelectedItem(updatedAlbum);
      }

      // Close edit modal
      setIsEditing(false);
    } catch (error) {
      console.error("Edit error:", error);
      setUploadError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Initiates the delete confirmation modal by setting the state with the item to delete
  const handleDeleteInit = (id, itemName) => {
    setDeleteConfirm({
      show: true,
      id,
      itemName,
    });
  };

  // Confirms deletion of the selected item, performs API call, updates UI and shows toast notifications
  const handleDeleteConfirm = async () => {
    const { id, itemName } = deleteConfirm;
    try {
      // Show loading state
      const toastId = toast.loading(`Deleting ${itemName}...`);

      await deleteSong(id);

      // Close the detail view and confirmation modal
      setSelectedItem(null);
      setDeleteConfirm({ show: false, id: null, itemName: "" });

      dispatch(fetchSongsRequest({ page: currentPage, limit: itemsPerPage }));

      // Update toast to show success
      toast.update(toastId, {
        render: `${itemName} deleted successfully`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        `Failed to delete: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Cancels the delete operation and hides the confirmation modal
  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, id: null, itemName: "" });
  };

  // Filter songs based on the search query matching title, artist, or album (case-insensitive)

  const filteredItems = songs.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.artist.toLowerCase().includes(query) ||
      (item.album && item.album.toLowerCase().includes(query))
    );
  });

  // Show a loading screen with spinner while songs are being fetched
  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your music...</p>
      </div>
    );

  // Show error screen with retry button if there was an error loading songs
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
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current.currentTime = 0;
                    }
                    setCurrentTime(0);
                    setIsPlaying(false);
                    setSelectedItem(null);
                    setCurrentTrackId(null);
                  }}
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
                          onClick={() => {
                            if (isAlbumPlaying(selectedItem)) {
                              togglePlay(
                                selectedItem.tracks[0].audioUrl,
                                currentTrackId,
                                selectedItem._id
                              );
                            } else {
                              toggleAlbumPlay(selectedItem);
                            }
                          }}
                        >
                          {isAlbumPlaying(selectedItem) ? (
                            <>
                              <FaPause /> Pause All
                            </>
                          ) : (
                            <>
                              <FaPlay /> Play All
                            </>
                          )}
                        </button>
                      )}

                      <button
                        className="edit-button"
                        onClick={() => handleEdit(selectedItem)}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDeleteInit(selectedItem._id, selectedItem.title)
                        }
                      >
                        <FaTrash /> Delete
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
                            onClick={() => {
                              setPlayingAlbumTracks(selectedItem.tracks); 
                              playAlbumTrack(selectedItem._id, track);
                              handlePlayPause(track);
                            }}
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
      {isEditing && (
        <motion.div
          className="edit-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="edit-form glass-card">
            <h3>Edit {editFormData.type === "album" ? "Album" : "Track"}</h3>

            <form onSubmit={handleSaveEdit}>
              {/* Basic Info */}
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Title*</label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Artist*</label>
                    <input
                      type="text"
                      value={editFormData.artist}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          artist: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                {editFormData.type === "single" && (
                  <div className="form-group">
                    <label>Album (optional)</label>
                    <input
                      type="text"
                      value={editFormData.album}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          album: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Year</label>
                    <input
                      type="text"
                      value={editFormData.year}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          year: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="form-section">
                <h4>Cover Image</h4>
                <div className="file-upload-group">
                  {editFormData.imageUrl && (
                    <img
                      src={editFormData.imageUrl}
                      alt="Current cover"
                      className="current-cover"
                    />
                  )}
                  <label className="file-upload-label">
                    {editFormData.imageFile
                      ? editFormData.imageFile.name
                      : "Change Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          imageFile: e.target.files[0],
                        })
                      }
                      hidden
                    />
                  </label>
                  {editFormData.imageFile && (
                    <button
                      type="button"
                      className="remove-file"
                      onClick={() =>
                        setEditFormData({
                          ...editFormData,
                          imageFile: null,
                        })
                      }
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              {/* Audio File (for single track) */}
              {editFormData.type === "single" && (
                <div className="form-section">
                  <h4>Audio File</h4>
                  <div className="file-upload-group">
                    <p className="current-audio">
                      Current:{" "}
                      {editFormData.audioUrl?.split("/").pop() || "No file"}
                      {editFormData.duration &&
                        ` (${formatTime(editFormData.duration)})`}
                    </p>
                    <label className="file-upload-label">
                      {editFormData.audioFile
                        ? editFormData.audioFile.name
                        : "Replace Audio"}
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            audioFile: e.target.files[0],
                          })
                        }
                        hidden
                      />
                    </label>
                    {editFormData.audioFile && (
                      <button
                        type="button"
                        className="remove-file"
                        onClick={() =>
                          setEditFormData({
                            ...editFormData,
                            audioFile: null,
                          })
                        }
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tracks (for album) */}
              {editFormData.type === "album" && (
                <div className="form-section">
                  <h4>Tracks</h4>
                  <div className="track-edit-list">
                    {editFormData.tracks.map((track, index) => (
                      <div key={track._id || index} className="track-edit-item">
                        <div className="track-info">
                          <span className="track-number">{index + 1}.</span>
                          <input
                            type="text"
                            value={track.title}
                            onChange={(e) => {
                              const updatedTracks = [...editFormData.tracks];
                              updatedTracks[index].title = e.target.value;
                              setEditFormData({
                                ...editFormData,
                                tracks: updatedTracks,
                              });
                            }}
                            className="track-title-input"
                          />
                        </div>
                        <div className="track-audio">
                          <p className="current-audio">
                            {track.audioUrl?.split("/").pop() || "No file"}
                            {track.duration &&
                              ` (${formatTime(track.duration)})`}
                          </p>
                          <label className="file-upload-label small">
                            {track.audioFile ? track.audioFile.name : "Replace"}
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => {
                                const updatedTracks = [...editFormData.tracks];
                                updatedTracks[index].audioFile =
                                  e.target.files[0];
                                setEditFormData({
                                  ...editFormData,
                                  tracks: updatedTracks,
                                });
                              }}
                              hidden
                            />
                          </label>
                          {track.audioFile && (
                            <button
                              type="button"
                              className="remove-file small"
                              onClick={() => {
                                const updatedTracks = [...editFormData.tracks];
                                updatedTracks[index].audioFile = null;
                                setEditFormData({
                                  ...editFormData,
                                  tracks: updatedTracks,
                                });
                              }}
                            >
                              <FaTimes />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsEditing(false)}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-button"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <FaSpinner className="spinner" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {deleteConfirm.show && (
        <motion.div
          className="delete-confirm-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="delete-confirm-content glass-card">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete "{deleteConfirm.itemName}"? This
              action cannot be undone.
            </p>

            <div className="delete-confirm-buttons">
              <button className="cancel-button" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button className="delete-button" onClick={handleDeleteConfirm}>
                Delete Permanently
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SongList;
