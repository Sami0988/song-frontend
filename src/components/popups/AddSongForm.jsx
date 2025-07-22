import React, { memo } from "react";
import { FaPlus } from "react-icons/fa";
import Loader from "../../utils/Loader";
import { motion } from "framer-motion";

function AddSongForm({
  isUploading,
  handleAddSong,
  newSong,
  setNewSong,
  handleImageChange,
  imagePreview,
  addTrack,
  handleTrackChange,
  removeTrack,
  setShowAddForm,
}) {
  return (
    <motion.div
      className="popup-form"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      {isUploading && <Loader loadingText="Uploading your song..." />}
      <form className="add-song-form glass-card" onSubmit={handleAddSong}>
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
              onChange={(e) => setNewSong({ ...newSong, year: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Type</label>
          <select
            value={newSong.type}
            onChange={(e) => setNewSong({ ...newSong, type: e.target.value })}
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
                    handleTrackChange(index, "description", e.target.value)
                  }
                />
                <button type="button" onClick={() => removeTrack(index)}>
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
            <label htmlFor="image-upload" className="image-upload-label">
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
  );
}

export default memo(AddSongForm);
