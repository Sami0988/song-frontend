// EditSongForm.jsx
import React,{memo} from "react";
import { motion } from "framer-motion";
import { FaTimes, FaSpinner } from "react-icons/fa";

 function EditSongForm({
  isEditing,
  setIsEditing,
  editFormData,
  setEditFormData,
  isUploading,
  formatTime,
  handleSaveEdit,
}) {
  if (!isEditing) return null;

  return (
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
                    setEditFormData({ ...editFormData, title: e.target.value })
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
                    setEditFormData({ ...editFormData, artist: e.target.value })
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
                    setEditFormData({ ...editFormData, album: e.target.value })
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
                    setEditFormData({ ...editFormData, year: e.target.value })
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
                    setEditFormData({ ...editFormData, imageFile: null })
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
                      setEditFormData({ ...editFormData, audioFile: null })
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
                        {track.duration && ` (${formatTime(track.duration)})`}
                      </p>
                      <label className="file-upload-label small">
                        {track.audioFile ? track.audioFile.name : "Replace"}
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const updatedTracks = [...editFormData.tracks];
                            updatedTracks[index].audioFile = e.target.files[0];
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
  );
}

export default memo(EditSongForm);