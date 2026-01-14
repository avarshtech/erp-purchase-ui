import axiosInstance from "./axiosInstance";

/**
 * Supplier API Service
 * Contains all API methods for Supplier operations
 */

// API endpoints
const ENDPOINTS = {
  SUPPLIERS: "/suppliers"
};

/**
 * Get all suppliers
 * @returns {Promise<Object>} Response with success status and data
 */
export const getSuppliers = async () => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.SUPPLIERS);
    return response.data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw error;
  }
};

/**
 * Create or update a supplier
 * @param {Object} supplierData - Supplier data to create or update
 * @returns {Promise<Object>} Response with created/updated supplier
 */
export const saveSupplier = async (supplierData) => {
  try {
    const response = await axiosInstance.post(ENDPOINTS.SUPPLIERS, supplierData);
    return response.data;
  } catch (error) {
    console.error(`Error saving supplier:`, error);
    throw error;
  }
};

/**
 * Create a new supplier
 * @param {Object} supplierData - Supplier data to create
 * @returns {Promise<Object>} Response with created supplier
 */
export const createSupplier = async (supplierData) => {
  return saveSupplier(supplierData);
};

/**
 * Update an existing supplier
 * @param {Object} supplierData - Updated supplier data
 * @returns {Promise<Object>} Response with updated supplier
 */
export const updateSupplier = async (supplierData) => {
  return saveSupplier(supplierData);
};

/**
 * Delete a supplier
 * @param {number} supplierId - ID of supplier to delete
 * @returns {Promise<Object>} Response with deletion status
 */
export const deleteSupplier = async (supplierId) => {
  try {
    const response = await axiosInstance.delete(`${ENDPOINTS.SUPPLIERS}/${supplierId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting supplier with ID ${supplierId}:`, error);
    throw error;
  }
};