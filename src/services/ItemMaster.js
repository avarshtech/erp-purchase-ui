import axiosInstance from "./axiosInstance";

/**
 * Item Master API Service
 * Contains all API methods for Item Master operations
 */

// API endpoints
const ENDPOINTS = {
  ITEM_META_DATA: "/items/meta",
  ITEMS: "/items",
  ITEM_BY_ID: (id) => `/items/${id}`,
};

/**
 * Get item master data (items + categories + subcategories + itemTypes)
 * @returns {Promise<Object>} Response with success status and data
 */
export const getItemMasterData = async () => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.ITEMS);
    return response.data;
  } catch (error) {
    console.error("Error fetching item master data:", error);
    throw error;
  }
};

/**
 * Get item metadata (categories, subcategories, item types, attributes, uoms)
 * @returns {Promise<Object>} Response with success status and metadata
 */
export const getItemMetaData = async () => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.ITEM_META_DATA);
    return response.data;
  } catch (error) {
    console.error("Error fetching item metadata:", error);
    throw error;
  }
};

/**
 * Create a new item
 * @param {Object} itemData - Item data to create
 * @returns {Promise<Object>} Response with created item
 */
export const createItem = async (itemData) => {
  try {
    const response = await axiosInstance.post(ENDPOINTS.ITEMS, itemData);
    return response.data;
  } catch (error) {
    console.error("Error creating item:", error);
    throw error;
  }
};

/**
 * Update an existing item
 * @param {number} id - Item ID
 * @param {Object} itemData - Updated item data
 * @returns {Promise<Object>} Response with updated item
 */
export const updateItem = async (id, itemData) => {
  try {
    const response = await axiosInstance.put(ENDPOINTS.ITEMS, itemData);
    return response.data;
  } catch (error) {
    console.error(`Error updating item with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an item
 * @param {number} id - Item ID to delete
 * @returns {Promise<Object>} Response with deleted item
 */
export const deleteItem = async (id) => {
  try {
    const response = await axiosInstance.delete(ENDPOINTS.ITEM_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error deleting item with ID ${id}:`, error);
    throw error;
  }
};
