import axiosInstance from "./axiosInstance";

/**
 * Item Master API Service
 * Contains all API methods for Item Master operations
 */

// API endpoints
const ENDPOINTS = {
  ITEM_META_DATA: "/items/meta",
  ITEMS: "/items"
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
 * Create or update an item
 * @param {Object} itemData - Item data to create or update
 * @returns {Promise<Object>} Response with created/updated item
 */
export const saveItem = async (itemData) => {
  try {
    const response = await axiosInstance.post(ENDPOINTS.ITEMS, itemData);
    return response.data;
  } catch (error) {
    console.error(`Error saving item${itemData.id ? ` with ID ${itemData.id}` : ''}:`, error);
    throw error;
  }
};

/**
 * Create a new item
 * @param {Object} itemData - Item data to create
 * @returns {Promise<Object>} Response with created item
 */
export const createItem = async (itemData) => {
  return saveItem(itemData);
};

/**
 * Update an existing item
 * @param {Object} itemData - Updated item data
 * @returns {Promise<Object>} Response with updated item
 */
export const updateItem = async (itemData) => {
  return saveItem(itemData);
};
