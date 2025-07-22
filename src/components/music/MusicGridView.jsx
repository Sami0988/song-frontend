import React from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaPlus,
  FaMusic,
  FaPause,
  FaPlay,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const MusicGridView = ({
  showAddForm,
  selectedItem,
  setShowAddForm,
  setSelectedItem,
  searchQuery,
  setSearchQuery,
  filteredItems,
  handleItemClick,
  togglePlay,
  isPlaying,
  currentTrackId,
  currentPage,
  itemsPerPage,
  total,
  goToPrevPage,
  goToNextPage,
  goToPage,
  handleItemsPerPageChange,
}) => {
  return (
    <>
      {(showAddForm || selectedItem) && (
        <div
          className="popup-overlay"
          onClick={() => {
            setShowAddForm(false);
            setSelectedItem(null);
          }}
        />
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
    </>
  );
};

export default React.memo(MusicGridView);
