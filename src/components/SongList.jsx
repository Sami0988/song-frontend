import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
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
import { createSong, deleteSong, updateSong } from "../api/songsApi";
import { toast } from "react-toastify";

const AddSongForm = lazy(() => import("./popups/AddSongForm"));
const SongDetailView = lazy(() => import("./popups/SongDetailView"));
const EditSongForm = lazy(() => import("./popups/EditSongForm"));
const DeleteConfirmModal = lazy(() => import("./popups/DeleteConfirmModal"));
const MusicGridView = lazy(() => import("./music/MusicGridView"));

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
    if (isUploading) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const isAudio = (file) => file?.type?.startsWith("audio/");
      const isImage = (file) => file?.type?.startsWith("image/");
      const fileTooLarge = (file, sizeMB) => file?.size > sizeMB * 1024 * 1024;

      const { title, artist, type, album, year, description } = editFormData;

      if (!title?.trim()) throw new Error("Title is required");
      if (!artist?.trim()) throw new Error("Artist is required");

      // Upload image
      let imageUrl = editFormData.imageUrl;
      if (editFormData.imageFile) {
        if (!isImage(editFormData.imageFile))
          throw new Error("Cover must be an image file (JPEG, PNG, etc.)");
        if (fileTooLarge(editFormData.imageFile, 5))
          throw new Error("Image file size must be less than 5MB");
        const { url } = await uploadToCloudinary(editFormData.imageFile);
        imageUrl = url;
      }

      // Upload audio (for singles)
      let audioUrl = editFormData.audioUrl;
      let duration = editFormData.duration;
      if (type === "single" && editFormData.audioFile) {
        if (!isAudio(editFormData.audioFile))
          throw new Error("Please upload a valid audio file");
        if (fileTooLarge(editFormData.audioFile, 20))
          throw new Error("Audio file size must be less than 20MB");
        const audioRes = await uploadToCloudinary(editFormData.audioFile);
        audioUrl = audioRes.url;
        duration = Math.round(audioRes.duration || 0);
      }

      // Upload album tracks
      let updatedTracks = editFormData.tracks;
      if (type === "album" && updatedTracks?.length > 0) {
        updatedTracks = await Promise.all(
          updatedTracks.map(async (track) => {
            if (!track.title?.trim())
              throw new Error(
                `Track ${track._id || track.tempId} is missing a title`
              );

            if (track.audioFile) {
              if (!isAudio(track.audioFile))
                throw new Error(`Invalid audio file in track: ${track.title}`);
              if (fileTooLarge(track.audioFile, 20))
                throw new Error(
                  `Audio file for "${track.title}" is too large (max 20MB)`
                );
              const result = await uploadToCloudinary(track.audioFile);
              return {
                ...track,
                audioUrl: result.url,
                duration: Math.round(result.duration || 0),
              };
            }
            return track;
          })
        );
      }

      // Construct payload
      const payload = {
        title: title.trim(),
        artist: artist.trim(),
        type,
        ...(album && { album: album.trim() }),
        ...(year && { year: Number(year) }),
        ...(description && { description: description.trim() }),
        ...(imageUrl && { imageUrl }),
        ...(type === "single" && { audioUrl, duration }),
        ...(type === "album" && {
          tracks: updatedTracks.map(({ _id, title, audioUrl, duration }) => ({
            _id,
            title: title.trim(),
            audioUrl,
            duration,
          })),
        }),
      };

      // Update
      await updateSong(editFormData._id, payload);
      dispatch(fetchSongsRequest({ page: currentPage, limit: itemsPerPage }));

      // Update player state
      const isSameTrack = currentTrackId === editFormData._id;
      const isAlbumTrackPlaying =
        type === "album" &&
        editFormData.tracks?.some((t) => t._id === currentTrackId);

      if (isSameTrack || isAlbumTrackPlaying) {
        setSelectedItem({ ...editFormData, ...payload });
      }

      toast.success("Updated successfully!!");
      setIsEditing(false);
    } catch (error) {
      console.error("Edit error:", error);
      setUploadError(
        error?.response?.data?.message ||
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

      <MusicGridView
        showAddForm={showAddForm}
        selectedItem={selectedItem}
        setShowAddForm={setShowAddForm}
        setSelectedItem={setSelectedItem}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredItems={filteredItems}
        handleItemClick={handleItemClick}
        togglePlay={togglePlay}
        isPlaying={isPlaying}
        currentTrackId={currentTrackId}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        total={total}
        goToPrevPage={goToPrevPage}
        goToNextPage={goToNextPage}
        goToPage={goToPage}
        handleItemsPerPageChange={handleItemsPerPageChange}
      />
      <>
        <AnimatePresence>
          {showAddForm && (
            <AddSongForm
              isUploading={isUploading}
              handleAddSong={handleAddSong}
              newSong={newSong}
              setNewSong={setNewSong}
              handleImageChange={handleImageChange}
              imagePreview={imagePreview}
              addTrack={addTrack}
              handleTrackChange={handleTrackChange}
              removeTrack={removeTrack}
              setShowAddForm={setShowAddForm}
              key="add-song-form" // helps AnimatePresence track component
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedItem && (
            <SongDetailView
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              currentTrackId={currentTrackId}
              setCurrentTrackId={setCurrentTrackId}
              currentTime={currentTime}
              setCurrentTime={setCurrentTime}
              duration={duration}
              audioRef={audioRef}
              formatTime={formatTime}
              handleSeek={handleSeek}
              togglePlay={togglePlay}
              toggleAlbumPlay={toggleAlbumPlay}
              isAlbumPlaying={isAlbumPlaying}
              handleEdit={handleEdit}
              handleDeleteInit={handleDeleteInit}
              setPlayingAlbumTracks={setPlayingAlbumTracks}
              playAlbumTrack={playAlbumTrack}
              handlePlayPause={handlePlayPause}
              key="song-detail"
            />
          )}
        </AnimatePresence>
      </>
      <AnimatePresence>
        {isEditing && (
          <EditSongForm
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            editFormData={editFormData}
            setEditFormData={setEditFormData}
            isUploading={isUploading}
            formatTime={formatTime}
            handleSaveEdit={handleSaveEdit}
          />
        )}
      </AnimatePresence>

      {deleteConfirm.show && (
        <DeleteConfirmModal
          itemName={deleteConfirm.itemName}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default SongList;
