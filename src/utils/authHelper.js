import { setCurrentUser, getAdminPermissions } from "../utils/permissions";
import { getRoles } from "../mocks/server";

/**
 * Mock user database
 * In production, this would be replaced with actual API calls
 */
const MOCK_USERS = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    name: "Admin User",
    email: "admin@example.com",
    role: "Admin",
    permissions: null, // Will be set to admin permissions
  },
  {
    id: 2,
    username: "manager",
    password: "manager123",
    name: "Manager User",
    email: "manager@example.com",
    role: "Manager",
    permissions: {}, // Custom permissions
  },
  {
    id: 3,
    username: "user",
    password: "user123",
    name: "Regular User",
    email: "user@example.com",
    role: "User",
    permissions: {}, // Custom permissions
  },
];

/**
 * Authenticate user with username and password
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object} Authentication result with success status and user data or error message
 */
export const authenticateUser = async (username, password) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Find user by username
  const user = MOCK_USERS.find((u) => u.username === username);

  if (!user) {
    return {
      success: false,
      message: "Invalid username or password",
    };
  }

  // Verify password
  if (user.password !== password) {
    return {
      success: false,
      message: "Invalid username or password",
    };
  }

  // Create user session
  const userSession = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions:
      user.role === "Admin" ? getAdminPermissions() : user.permissions,
  };

  // Save to localStorage
  setCurrentUser(userSession);

  // Dispatch custom event to notify app of auth change
  window.dispatchEvent(new Event("authChange"));

  return {
    success: true,
    user: userSession,
  };
};

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
