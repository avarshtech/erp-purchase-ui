import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import '../assets/css/profile.css';

const Profile = () => {
  const [user] = useState({
    name: 'John Doe',
    password: '',
    email: 'john.doe@example.com',
    role: 'Administrator'
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'Weak',
    color: 'weak'
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  const [loading, setLoading] = useState(false);

  // Password requirements
  const passwordRequirements = [
    { text: 'At least 8 characters long', regex: /.{8,}/ },
    { text: 'Contains at least one uppercase letter', regex: /[A-Z]/ },
    { text: 'Contains at least one lowercase letter', regex: /[a-z]/ },
    { text: 'Contains at least one number', regex: /\d/ },
    { text: 'Contains at least one special character', regex: /[!@#$%^&*(),.?":{}|<>]/ }
  ];

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let score = 0;
    const checks = passwordRequirements.map(req => req.regex.test(password));

    score = checks.filter(Boolean).length;

    if (score <= 2) {
      return { score, label: 'Weak', color: 'weak' };
    } else if (score <= 4) {
      return { score, label: 'Medium', color: 'medium' };
    } else {
      return { score, label: 'Strong', color: 'strong' };
    }
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword) {
      setToastMessage('Current password is required.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (!passwordData.newPassword) {
      setToastMessage('New password is required.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToastMessage('New passwords do not match.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (passwordStrength.score < 3) {
      setToastMessage('Password is too weak. Please choose a stronger password.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    // Simulate API call
    setLoading(true);
    try {
      // Here you would make an API call to update the password
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

      setToastMessage('Password updated successfully!');
      setToastType('success');
      setShowToast(true);
      handleModalClose();
    } catch (error) {
      setToastMessage('Failed to update password. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Close toast
  const closeToast = () => {
    setShowToast(false);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showPasswordModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPasswordModal]);

  return (
    <>
      {/* Page Title */}
      <h6 className="profile-page-title">My Profile</h6>

        {/* Profile Card */}
        <div className="card profile-card">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              {getUserInitials(user.name)}
            </div>
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-role">{user.role}</p>
          </div>

          {/* Profile Body */}
          <div className="profile-body">
            {/* User Information */}
            <div className="info-section">
              <h6>User Information</h6>
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value readonly">{user.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value readonly">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role:</span>
                <span className="info-value readonly">{user.role}</span>
              </div>
            </div>

            {/* Security Information */}
            <div className="info-section">
              <h6>Security</h6>
              <div className="info-item">
                <span className="info-label">Password:</span>
                <span className="info-value">••••••••</span>
              </div>
            </div>

            {/* Actions */}
            <div className="profile-actions">
              <button
                className="btn btn-update-password"
                onClick={() => setShowPasswordModal(true)}
              >
                <Icon icon="mdi:lock-reset" className="me-2" style={{ fontSize: '1.45rem' }} />
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* Password Update Modal */}
        {showPasswordModal && (
          <>
            <div className="modal fade show d-block password-modal" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content" style={{ maxHeight: '90vh' }}>
                <div className="modal-header">
                  <h5 className="modal-title">Update Password</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleModalClose}
                    aria-label="Close"
                  >
                  </button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handlePasswordUpdate}>
                    <div className="form-group">
                      <label className="form-label">Current Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">New Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        required
                      />

                      {/* Password Strength Indicator */}
                      {passwordData.newPassword && (
                        <div className="password-strength">
                          <div className="strength-bar">
                            <div className={`strength-fill ${passwordStrength.color}`}></div>
                          </div>
                          <div className={`strength-text ${passwordStrength.color}`}>
                            Password Strength: {passwordStrength.label}
                          </div>
                        </div>
                      )}

                      {/* Password Requirements */}
                      <div className="password-requirements">
                        <div className="requirements-title">Password Requirements:</div>
                        <ul className="requirements-list">
                          {passwordRequirements.map((req, index) => (
                            <li key={index} className={req.regex.test(passwordData.newPassword) ? 'valid' : ''}>
                              {req.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm New Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleModalClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handlePasswordUpdate}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
        )}

        {/* Loading Overlay for Modal */}
        {loading && showPasswordModal && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className={`toast-custom ${toastType === 'error' ? 'toast-error' : 'toast-success'}`}>
            <span>{toastMessage}</span>
            <button type="button" className="toast-close" onClick={closeToast}>
              &times;
            </button>
          </div>
        )}
    </>
  );
};

export default Profile;