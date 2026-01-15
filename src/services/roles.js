import axiosInstance from "./axiosInstance";

/**
 * Role API Service
 * Contains all API methods for Role operations
 */

// API endpoints
const ENDPOINTS = {
  ROLES: "/roles"
};

/**
 * Get all roles
 * @returns {Promise<Array>} Response with roles array
 */
export const getRoles = async () => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.ROLES);
    return response.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

/**
 * Create or update a role
 * @param {Object} roleData - Role data to create or update
 * @returns {Promise<Object>} Response with created/updated role
 */
export const saveRole = async (roleData) => {
  try {
    const response = await axiosInstance.post(ENDPOINTS.ROLES, roleData);
    return response.data;
  } catch (error) {
    console.error(`Error saving role:`, error);
    throw error;
  }
};

/**
 * Create a new role
 * @param {Object} roleData - Role data to create
 * @returns {Promise<Object>} Response with created role
 */
export const createRole = async (roleData) => {
  return saveRole(roleData);
};

/**
 * Update an existing role (uses POST with id in the payload)
 * @param {number} roleId - ID of role to update
 * @param {Object} roleData - Updated role data
 * @returns {Promise<Object>} Response with updated role
 */
export const updateRole = async (roleId, roleData) => {
  return saveRole({ ...roleData, id: roleId });
};

/**
 * Delete a role
 * @param {number} roleId - ID of role to delete
 * @returns {Promise<Object>} Response with deletion status
 */
export const deleteRole = async (roleId) => {
  try {
    const response = await axiosInstance.delete(`${ENDPOINTS.ROLES}/${roleId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting role with ID ${roleId}:`, error);
    throw error;
  }
};

/**
 * Parse role createdAt field to display only the date
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
