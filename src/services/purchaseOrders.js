import axiosInstance from "./axiosInstance";

/**
 * Purchase Order API Service
 * Contains all API methods for Purchase Order operations
 */

// API endpoints
const ENDPOINTS = {
  PURCHASE_ORDERS: "/purchase-orders"
};

/**
 * Get all purchase orders with pagination
 * @param {Object} params - Query parameters for pagination and filtering
 * @param {number} params.page - Page number (0-indexed)
 * @param {number} params.size - Page size
 * @param {string} params.sort - Sort field
 * @param {string} params.direction - Sort direction (asc/desc)
 * @returns {Promise<Object>} Response with paginated purchase orders
 */
export const getPurchaseOrders = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.sort) {
      queryParams.append('sort', params.sort);
      queryParams.append('sort', params.direction || 'asc');
    }

    const queryString = queryParams.toString();
    const url = queryString ? `${ENDPOINTS.PURCHASE_ORDERS}?${queryString}` : ENDPOINTS.PURCHASE_ORDERS;
    
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    throw error;
  }
};

/**
 * Get a purchase order by ID
 * @param {number} id - Purchase order ID
 * @returns {Promise<Object>} Response with purchase order details
 */
export const getPurchaseOrderById = async (id) => {
  try {
    const response = await axiosInstance.get(`${ENDPOINTS.PURCHASE_ORDERS}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase order with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new purchase order
 * @param {Object} poData - Purchase order data to create
 * @returns {Promise<Object>} Response with created purchase order
 */
export const createPurchaseOrder = async (poData) => {
  try {
    const response = await axiosInstance.post(ENDPOINTS.PURCHASE_ORDERS, poData);
    return response.data;
  } catch (error) {
    console.error("Error creating purchase order:", error);
    throw error;
  }
};

/**
 * Update an existing purchase order
 * @param {number} id - Purchase order ID
 * @param {Object} poData - Updated purchase order data
 * @returns {Promise<Object>} Response with updated purchase order
 */
export const updatePurchaseOrder = async (id, poData) => {
  try {
    // Backend expects POST for updates and requires `id` in the request body
    // Send to the collection endpoint with `id` included so the API treats it as an update
    const payload = { id, ...poData };
    const response = await axiosInstance.post(`${ENDPOINTS.PURCHASE_ORDERS}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating purchase order with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a purchase order
 * @param {number} id - ID of purchase order to delete
 * @returns {Promise<Object>} Response with deletion status
 */
export const deletePurchaseOrder = async (id) => {
  try {
    const response = await axiosInstance.delete(`${ENDPOINTS.PURCHASE_ORDERS}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting purchase order with ID ${id}:`, error);
    throw error;
  }
};
