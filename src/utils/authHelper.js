import { setCurrentUser, getAdminPermissions } from "../utils/permissions";
import { getRoles } from "../mocks/server";

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
    const API_BASE_URL = "http://localhost:8088";
    console.log(`Attempting login to: ${API_BASE_URL}/api/v1/auth/login`);

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    console.log(`Login Response Status: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    console.log("Login Response Body:", text);

    if (!text) {
        throw new Error("Server returned empty response");
    }

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse login response JSON:", e);
        throw new Error(`Server returned invalid JSON: ${text.substring(0, 100)}...`);
    }

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Login failed with status: ${response.status}`,
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
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        userFromToken = JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode token", e);
    }

    // Create user session object
    // We default to "Admin" role for superadmin if not present in token, to ensure access
    const role = userFromToken.role || (userFromToken.sub === 'superadmin' ? 'Admin' : 'User');
    
    // We need to fetch the full user details to get permissions ideally, but for now we construct a session
    const userSession = {
      username: userFromToken.sub || username,
      name: userFromToken.name || username,
      email: userFromToken.email || `${username}@example.com`,
      role: role, 
      permissions: role === 'Admin' ? getAdminPermissions() : {}, // We need to re-import getAdminPermissions or fetch permissions
      token: token
    };

    // Save to localStorage
    setCurrentUser(userSession);

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
      message: error.message || "Network error. Please try again.",
    };
  }
};

/**
 * Get the current authentication token
 * @returns {string|null} The bearer token or null if not found
 */
export const getToken = () => {
    const user = localStorage.getItem("currentUser");
    if (!user) return null;
    try {
        const userData = JSON.parse(user);
        return userData.token || null;
    } catch (e) {
        return null;
    }
}


/**
 * Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem("currentUser");
  // Dispatch custom event to notify app of auth change
  window.dispatchEvent(new Event("authChange"));
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
export const isAuthenticated = () => {
  const user = localStorage.getItem("currentUser");
  return !!user;
};

/**
 * Initialize a default user for development/testing
 * In production, this would come from authentication
 */
export const initializeDefaultUser = () => {
  // Check if a user is already set
  const existingUser = localStorage.getItem("currentUser");

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
    const roles = response.data;

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
