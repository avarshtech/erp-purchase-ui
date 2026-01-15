import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { authenticateUser } from "../utils/authHelper";
import "../assets/css/login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // State for field-specific errors
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      navigate("/purchase-orders");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear global error when user starts typing
    if (error) setError("");

    // Clear specific field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newFieldErrors = { username: "", password: "" };

    if (!formData.username.trim()) {
      newFieldErrors.username = "Username is required";
      isValid = false;
    }

    if (!formData.password) {
      newFieldErrors.password = "Password is required";
      isValid = false;
    }

    setFieldErrors(newFieldErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await authenticateUser(
        formData.username,
        formData.password
      );

      if (result.success) {
        // Successful login - navigate immediately
        setLoading(false);
        navigate("/purchase-orders");
      } else {
        // Failed login
        setError(result.message);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setLoading(false);
      }
    } catch (err) {
      setError(err.errorMessage || "An unexpected error occurred. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Login Card */}
      <div className={`login-card ${shake ? "shake" : ""}`}>
        {/* Logo Section */}
        <div className="login-header">
          <div className="logo-wrapper">
            <img
              src="/assets/images/avarsh-logo.png"
              alt="Avarsh ERP"
              className="login-logo-img"
            />
          </div>
          <h1 className="login-title">Streamline Your Operations</h1>
          <p className="login-subtitle">
            Access your enterprise resource planning dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Global Error Message */}
          {error && (
            <div className="error-message">
              <Icon icon="solar:danger-circle-bold" className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Username Field */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <div
              className={`input-wrapper ${fieldErrors.username ? "error" : ""}`}
            >
              <Icon icon="solar:user-linear" className="input-icon" />
              <input
                type="text"
                id="username"
                name="username"
                className={`form-input ${
                  fieldErrors.username ? "is-invalid" : ""
                }`}
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                disabled={loading}
              />
            </div>
            {fieldErrors.username && (
              <div className="field-error-text">{fieldErrors.username}</div>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div
              className={`input-wrapper ${fieldErrors.password ? "error" : ""}`}
            >
              <Icon icon="solar:lock-password-linear" className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className={`form-input ${
                  fieldErrors.password ? "is-invalid" : ""
                }`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Icon
                  icon={
                    showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"
                  }
                  className="toggle-icon"
                />
              </button>
            </div>
            {fieldErrors.password && (
              <div className="field-error-text">{fieldErrors.password}</div>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <Icon
                  icon="svg-spinners:ring-resize"
                  className="loading-icon"
                />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <Icon
                  icon="solar:alt-arrow-right-bold"
                  className="arrow-icon"
                />
              </>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="login-footer">
          <p className="footer-text">
            <Icon
              icon="solar:shield-check-bold-duotone"
              className="footer-icon"
            />
            Secured ERP System - Admin Managed Access
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
