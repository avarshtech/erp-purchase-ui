import axiosInstance from "./axiosInstance";

/**
 * User API Service
 * Contains all API methods for User operations
 */

// API endpoints
const ENDPOINTS = {
  USERS: "/users"
};

/**
 * Get all users
 * @returns {Promise<Array>} Response with users array
 */
export const getUsers = async () => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.USERS);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Create or update a user
 * @param {Object} userData - User data to create or update
 * @returns {Promise<Object>} Response with created/updated user
 */
export const saveUser = async (userData) => {
  try {
    const response = await axiosInstance.post(ENDPOINTS.USERS, userData);
    return response.data;
  } catch (error) {
    console.error(`Error saving user:`, error);
    throw error;
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} Response with created user
 */
export const createUser = async (userData) => {
  return saveUser(userData);
};

/**
 * Update an existing user
 * @param {number} userId - ID of user to update
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Response with updated user
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(`${ENDPOINTS.USERS}/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw error;
  }
};

/**
 * Delete a user
 * @param {number} userId - ID of user to delete
 * @returns {Promise<Object>} Response with deletion status
 */
export const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(`${ENDPOINTS.USERS}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with ID ${userId}:`, error);
    throw error;
  }
};

/**
 * Parse user createdAt field to display only the date
 * @param {string} createdAt - ISO date string (e.g., "2026-01-04T10:54:18.788142")
 * @returns {string} Formatted date string (e.g., "2026-01-04")
 */
export const formatCreatedDate = (createdAt) => {
  if (!createdAt) return "-";
  try {
    return new Date(createdAt).toLocaleDateString("en-CA"); // Returns YYYY-MM-DD format
  } catch {
    return "-";
  }
};
