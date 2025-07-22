// components/DeleteConfirmModal.jsx
import React, { memo } from "react";
import { motion } from "framer-motion";

const DeleteConfirmModal = ({ itemName, onCancel, onConfirm }) => {
  return (
    <motion.div
      className="delete-confirm-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="delete-confirm-content glass-card">
        <h3>Confirm Deletion</h3>
        <p>
          Are you sure you want to delete "{itemName}"? This action cannot be
          undone.
        </p>

        <div className="delete-confirm-buttons">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="delete-button" onClick={onConfirm}>
            Delete Permanently
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(DeleteConfirmModal);
