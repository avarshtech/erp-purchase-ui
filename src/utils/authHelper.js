import { setCurrentUser, getAdminPermissions } from "../utils/permissions";
import { getRoles } from "../services/roles";
import axiosInstance from "../services/axiosInstance";

/**
 * Mock user database
 * In production, this would be replaced with actual API calls
 */
/**
 * Authenticate user with username and password against backend
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object} Authentication result with success status and user data or error message
 */
export const authenticateUser = async (username, password) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      username,
      password,
    });

    console.log(`Login Response Status: ${response.status} ${response}`);
    const { data, status } = response;
    if (response.status !== 200) {
      return {
        success: false,
        message: data || `Login failed with status: ${status}`,
      };
    }

    // Backend returns: { token: "..." }
    const { token } = data;

    if (!token) {
      console.error("Missing token in response", data);
      return {
        success: false,
        message: "Invalid response from server (missing token)",
      };
    }

    // Decode JWT to get user details (simple decoder)
    let userFromToken = {};
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      userFromToken = JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to decode token", e);
    }

    // Create user session object
    // We default to "Admin" role for superadmin if not present in token, to ensure access
    const role =
      userFromToken.role ||
      (userFromToken.sub === "superadmin" ? "Admin" : "User");

    // We need to fetch the full user details to get permissions ideally, but for now we construct a session
    const userSession = {
      username: userFromToken.sub || username,
      name: userFromToken.name || username,
      email: userFromToken.email || `${username}@avarsh.com`,
      role: role,
      permissions: role === "Admin" ? getAdminPermissions() : {}, // We need to re-import getAdminPermissions or fetch permissions
      token
    };

    // Save user session to sessionStorage
    setCurrentUser(userSession);
    // Save auth token separately to sessionStorage (for compatibility)
    sessionStorage.setItem("authToken", token);

    // Dispatch custom event to notify app of auth change
    window.dispatchEvent(new Event("authChange"));

    return {
      success: true,
      user: userSession,
    };
  } catch (error) {
    console.error("Login Error Details:", error);
    return {
      success: false,
      message: error.errorMessage || error.response?.data?.message || "Network error. Please try again.",
    };
  }
};

/**
 * Get the current authentication token
 * @returns {string|null} The bearer token or null if not found
 */
export const getToken = () => {
  // Try to get from sessionStorage
  const sessionToken = sessionStorage.getItem("authToken");
  if (sessionToken) return sessionToken;
  // Fallback to session user object
  const user = sessionStorage.getItem("currentUser");
  if (!user) return null;
  try {
    const userData = JSON.parse(user);
    return userData.token || null;
  } catch (e) {
    return null;
  }
};

/**
 * Logout user
 */
export const logoutUser = () => {
  sessionStorage.removeItem("currentUser");
  sessionStorage.removeItem("authToken");
  // Dispatch custom event to notify app of auth change
  window.dispatchEvent(new Event("authChange"));
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
export const isAuthenticated = () => {
  const user = sessionStorage.getItem("currentUser");
  return !!user;
};

/**
 * Initialize a default user for development/testing
 * In production, this would come from authentication
 */
export const initializeDefaultUser = () => {
  // Check if a user is already set
  const existingUser = sessionStorage.getItem("currentUser");
  if (!existingUser) {
    // Don't auto-login in production, redirect to login page
    console.log("No user session found. Please login.");
  }
};

/**
 * Switch to a different user (for testing purposes)
 * @param {string} roleName - Role name to switch to
 */
export const switchUserRole = async (roleName) => {
  try {
    // Fetch roles from the server
    const response = await getRoles();
    // Handle both array response and object response with data property
    const roles = Array.isArray(response) ? response : (response.data || []);

    // Find the role by name
    const role = roles.find((r) => r.name === roleName);

    if (!role) {
      console.error(`Role "${roleName}" not found`);
      alert(
        `Role "${roleName}" not found. Please create it first in Role & Access page.`
      );
      return;
    }

    // Create user with the role's permissions
    const user = {
      id: role.id,
      name: `${roleName} User`,
      email: `${roleName.toLowerCase()}@example.com`,
      role: roleName,
      permissions: role.permissions || {},
    };

    setCurrentUser(user);
    console.log(`Switched to ${roleName}`, user);

    // Reload the page to apply new permissions
    window.location.reload();
  } catch (error) {
    console.error("Error switching role:", error);
    alert("Failed to switch role. Please try again.");
  }
};
