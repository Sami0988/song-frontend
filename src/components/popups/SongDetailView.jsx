// SongDetailView.jsx
import React, { memo } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaPlay, FaPause, FaEdit, FaTrash } from "react-icons/fa";

function SongDetailView({
  selectedItem,
  setSelectedItem,
  isPlaying,
  setIsPlaying,
  currentTrackId,
  setCurrentTrackId,
  currentTime,
  setCurrentTime,
  duration,
  audioRef,
  formatTime,
  handleSeek,
  togglePlay,
  toggleAlbumPlay,
  isAlbumPlaying,
  handleEdit,
  handleDeleteInit,
  setPlayingAlbumTracks,
  playAlbumTrack,
  handlePlayPause,
}) {
  return (
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

        {selectedItem.type === "album" && selectedItem.tracks?.length > 0 && (
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
                  {track.duration ? formatTime(track.duration) : "--:--"}
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
  );
}

export default memo(SongDetailView);
