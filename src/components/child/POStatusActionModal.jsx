import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

/**
 * Modal component for capturing comments/reasons during PO status actions
 * Used for: Approve, Reject, Cancel, Complete, ReferBack, CompleteLineItem
 */
const POStatusActionModal = ({
  show,
  onClose,
  onConfirm,
  actionType, // 'approve' | 'reject' | 'cancel' | 'complete' | 'referback' | 'completeLineItem'
  loading = false,
  poNumber = "",
  lineItemName = "", // Optional: for line item specific actions
}) => {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (show) {
      setComment("");
      setError("");
    }
  }, [show]);

  // Configuration for each action type
  const actionConfig = {
    approve: {
      title: "Approve Purchase Order",
      icon: "mdi:check-circle-outline",
      iconColor: "text-success-600",
      buttonText: "Approve",
      buttonClass: "btn-success",
      placeholder: "Enter approval comments...",
      minChars: 10, // Always require at least some comment
      required: true,
      description: "Please provide comments for approving this purchase order.",
    },
    reject: {
      title: "Reject Purchase Order",
      icon: "mdi:close-octagon",
      iconColor: "text-danger-600",
      buttonText: "Reject",
      buttonClass: "btn-danger",
      placeholder: "Enter rejection reason (minimum 50 characters required)...",
      minChars: 50,
      required: true,
      description: "Please provide a detailed reason for rejecting this purchase order.",
    },
    cancel: {
      title: "Cancel Purchase Order",
      icon: "mdi:cancel",
      iconColor: "text-warning-600",
      buttonText: "Cancel PO",
      buttonClass: "btn-warning",
      placeholder: "Enter cancellation reason (minimum 50 characters required)...",
      minChars: 50,
      required: true,
      description: "Please provide a reason for cancelling this purchase order.",
    },
    complete: {
      title: "Complete Purchase Order",
      icon: "mdi:check-all",
      iconColor: "text-success-600",
      buttonText: "Mark as Complete",
      buttonClass: "btn-success",
      placeholder: "Enter completion notes...",
      minChars: 10, // Always require at least some comment
      required: true,
      description: "Please provide notes for completing this purchase order.",
    },
    referback: {
      title: "Refer Back Purchase Order",
      icon: "mdi:undo-variant",
      iconColor: "text-info-600",
      buttonText: "Refer Back",
      buttonClass: "btn-info",
      placeholder: "Enter reason for referring back (minimum 50 characters required)...",
      minChars: 50,
      required: true,
      description: "Please provide a reason for referring back this purchase order (e.g., items unavailable from supplier).",
    },
    completeLineItem: {
      title: "Complete Line Item",
      icon: "mdi:check-circle",
      iconColor: "text-success-600",
      buttonText: "Mark Complete",
      buttonClass: "btn-success",
      placeholder: "Enter completion notes for this line item...",
      minChars: 10, // Always require at least some comment
      required: true,
      description: "Please provide notes for marking this line item as complete.",
    },
  };

  const config = actionConfig[actionType] || actionConfig.approve;

  const handleSubmit = () => {
    // Validate minimum characters if required
    if (config.required && comment.trim().length < config.minChars) {
      setError(`Please enter at least ${config.minChars} characters.`);
      return;
    }
    setError("");
    onConfirm(comment.trim());
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setComment(value);
    
    // Clear error when user starts typing enough characters
    if (error && value.trim().length >= config.minChars) {
      setError("");
    }
  };

  const remainingChars = config.minChars - comment.trim().length;
  const showCharCount = config.minChars > 0;

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1070,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="modal-dialog"
        style={{ maxWidth: "500px", width: "90%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content radius-12 overflow-hidden">
          {/* Header */}
          <div className="modal-header py-12 px-20 bg-base border-bottom">
            <div className="d-flex align-items-center gap-3">
              <div
                className={`w-40-px h-40-px rounded-circle d-flex align-items-center justify-content-center ${
                  actionType === "reject" || actionType === "cancel"
                    ? "bg-danger-100"
                    : actionType === "referback"
                    ? "bg-info-100"
                    : "bg-success-100"
                }`}
              >
                <Icon
                  icon={config.icon}
                  className={config.iconColor}
                  width="24"
                  height="24"
                />
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-semibold">{config.title}</h5>
                {lineItemName && (
                  <span className="text-secondary-light text-sm d-block">{lineItemName}</span>
                )}
                {poNumber && (
                  <span className="text-secondary-light text-sm">{poNumber}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
            />
          </div>

          {/* Body */}
          <div className="modal-body p-20">
            <p className="text-secondary-light mb-16">{config.description}</p>
            
            <div className="mb-12">
              <label className="form-label fw-medium mb-8">
                {config.required ? (
                  <>
                    Reason / Comments <span className="text-danger">*</span>
                  </>
                ) : (
                  "Comments"
                )}
              </label>
              <textarea
                className={`form-control ${error ? "is-invalid" : ""}`}
                rows="4"
                placeholder={config.placeholder}
                value={comment}
                onChange={handleCommentChange}
                disabled={loading}
                autoFocus
              />
              {error && <div className="invalid-feedback">{error}</div>}
              
              {showCharCount && (
                <div className="d-flex justify-content-end mt-8">
                  <span
                    className={`text-xs ${
                      remainingChars > 0 ? "text-danger" : "text-success-600"
                    }`}
                  >
                    {remainingChars > 0
                      ? `${remainingChars} more characters required`
                      : `✓ Minimum characters met (${comment.trim().length} characters)`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer p-16 border-top">
            <button
              type="button"
              className="btn btn-outline-secondary px-20 py-8 radius-8"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`btn ${config.buttonClass} px-20 py-8 radius-8 d-flex align-items-center`}
              onClick={handleSubmit}
              disabled={loading || (config.required && comment.trim().length < config.minChars)}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Processing...
                </>
              ) : (
                <>
                  <Icon icon={config.icon} className="me-2" />
                  {config.buttonText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POStatusActionModal;
