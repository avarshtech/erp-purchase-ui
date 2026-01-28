/**
 * Global Toast Utility
 * Provides a way to show toast messages from anywhere in the app,
 * including non-React code like axios interceptors.
 */

// Toast container element ID
const TOAST_CONTAINER_ID = 'global-toast-container';

// Create toast container if it doesn't exist
const getOrCreateContainer = () => {
  let container = document.getElementById(TOAST_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = TOAST_CONTAINER_ID;
    container.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 90vw;
      width: 500px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  return container;
};

// Create toast element
const createToastElement = (message, type = 'error', duration = 5000) => {
  const toast = document.createElement('div');
  toast.className = `global-toast global-toast-${type}`;
  toast.style.cssText = `
    padding: 14px 18px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    font-weight: 500;
    pointer-events: auto;
    animation: slideInDown 0.3s ease-out;
    word-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;
    max-width: 100%;
    box-sizing: border-box;
  `;
  
  // Apply type-specific styles
  if (type === 'error') {
    toast.style.backgroundColor = 'var(--toast-error-bg, #fef2f2)';
    toast.style.color = 'var(--toast-error-color, #dc2626)';
    toast.style.border = '1px solid var(--toast-error-border, #fecaca)';
  } else if (type === 'success') {
    toast.style.backgroundColor = 'var(--toast-success-bg, #f0fdf4)';
    toast.style.color = 'var(--toast-success-color, #16a34a)';
    toast.style.border = '1px solid var(--toast-success-border, #bbf7d0)';
  } else if (type === 'warning') {
    toast.style.backgroundColor = 'var(--toast-warning-bg, #fffbeb)';
    toast.style.color = 'var(--toast-warning-color, #d97706)';
    toast.style.border = '1px solid var(--toast-warning-border, #fde68a)';
  } else {
    toast.style.backgroundColor = 'var(--toast-info-bg, #eff6ff)';
    toast.style.color = 'var(--toast-info-color, #2563eb)';
    toast.style.border = '1px solid var(--toast-info-border, #bfdbfe)';
  }
  
  // Message container
  const messageSpan = document.createElement('span');
  messageSpan.style.cssText = `
    flex: 1;
    line-height: 1.5;
    text-align: center;
    padding-right: 40px; /* reserve space for close button so text doesn't overlap */
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: anywhere;
  `;
  messageSpan.textContent = message;
  
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: inherit;
    padding: 0;
    margin: 0;
    line-height: 1;
    opacity: 0.7;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
  `;
  closeBtn.onmouseover = () => { closeBtn.style.opacity = '1'; };
  closeBtn.onmouseout = () => { closeBtn.style.opacity = '0.7'; };
  closeBtn.onclick = () => removeToast(toast);
  
  toast.appendChild(messageSpan);
  toast.appendChild(closeBtn);
  
  return toast;
};

// Remove toast with animation
const removeToast = (toast) => {
  toast.style.animation = 'slideOutUp 0.3s ease-in forwards';
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
};

// Add animation styles if not already added
const ensureAnimationStyles = () => {
  const styleId = 'global-toast-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes slideInDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slideOutUp {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-20px);
        }
      }
      
      /* Dark mode support */
      [data-theme="dark"] .global-toast-error {
        background-color: #7f1d1d !important;
        color: #fef2f2 !important;
        border-color: #dc2626 !important;
      }
      [data-theme="dark"] .global-toast-success {
        background-color: #14532d !important;
        color: #86efac !important;
        border-color: #166534 !important;
      }
      [data-theme="dark"] .global-toast-warning {
        background-color: #78350f !important;
        color: #fde68a !important;
        border-color: #d97706 !important;
      }
      [data-theme="dark"] .global-toast-info {
        background-color: #1e3a8a !important;
        color: #bfdbfe !important;
        border-color: #2563eb !important;
      }
    `;
    document.head.appendChild(style);
  }
};

/**
 * Show a global toast message
 * @param {string} message - The message to display
 * @param {('error'|'success'|'warning'|'info')} type - Toast type
 * @param {number} duration - Duration in ms before auto-dismiss (default: 5000, 0 = no auto-dismiss)
 */
export const showGlobalToast = (message, type = 'error', duration = 5000) => {
  ensureAnimationStyles();
  const container = getOrCreateContainer();
  const toast = createToastElement(message, type, duration);
  
  container.appendChild(toast);
  
  // Auto-dismiss after duration (if duration > 0)
  if (duration > 0) {
    setTimeout(() => removeToast(toast), duration);
  }
};

/**
 * Show error toast
 * @param {string} message - Error message
 * @param {number} duration - Duration in ms
 */
export const showErrorToast = (message, duration = 5000) => {
  showGlobalToast(message, 'error', duration);
};

/**
 * Show success toast
 * @param {string} message - Success message
 * @param {number} duration - Duration in ms
 */
export const showSuccessToast = (message, duration = 3000) => {
  showGlobalToast(message, 'success', duration);
};

/**
 * Show warning toast
 * @param {string} message - Warning message
 * @param {number} duration - Duration in ms
 */
export const showWarningToast = (message, duration = 4000) => {
  showGlobalToast(message, 'warning', duration);
};

/**
 * Show info toast
 * @param {string} message - Info message
 * @param {number} duration - Duration in ms
 */
export const showInfoToast = (message, duration = 4000) => {
  showGlobalToast(message, 'info', duration);
};

/**
 * Clear all active toasts
 */
export const clearAllToasts = () => {
  const container = document.getElementById(TOAST_CONTAINER_ID);
  if (container) {
    container.innerHTML = '';
  }
};

const GlobalToast = {
  show: showGlobalToast,
  error: showErrorToast,
  success: showSuccessToast,
  warning: showWarningToast,
  info: showInfoToast,
  clear: clearAllToasts,
};

export default GlobalToast;
