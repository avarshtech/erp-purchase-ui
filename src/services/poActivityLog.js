import axiosInstance from "./axiosInstance";

// API endpoints
const ENDPOINTS = {
  PURCHASE_ORDER: "/purchase-orders",
};

/**
 * Create a new activity for a Purchase Order
 * POST /purchase-order/{poId}/activities
 * @param {number|string} poId
 * @param {object} payload
 * @returns {Promise<object>} response data
 */
export const createActivity = async (poId, payload) => {
  if (!poId) throw new Error("poId is required");
  try {
    const url = `${ENDPOINTS.PURCHASE_ORDER}/${poId}/activities`;
    const now = new Date().toISOString();
    const body = {
      id: 0,
      poId: Number(poId),
      comment: payload?.comment || payload?.text || "",
      edited: payload?.edited || false,
      createdAt: payload?.createdAt || now,
      updatedAt: payload?.updatedAt || now,
    };
    const res = await axiosInstance.post(url, body);
    return res.data;
  } catch (error) {
    console.error(`Error creating activity for PO ${poId}:`, error);
    throw error;
  }
};

/**
 * Update an existing activity for a Purchase Order
 * PUT /purchase-order/{poId}/activities/{activity-id}
 * @param {number|string} poId
 * @param {number|string} activityId
 * @param {object} payload
 * @returns {Promise<object>} response data
 */
export const updateActivity = async (poId, activityId, payload) => {
  if (!poId) throw new Error("poId is required");
  if (!activityId) throw new Error("activityId is required");
  try {
    const url = `${ENDPOINTS.PURCHASE_ORDER}/${poId}/activities/${activityId}`;
    const now = new Date().toISOString();
    const body = {
      id: Number(activityId),
      poId: Number(poId),
      comment: payload?.comment || payload?.text || "",
      edited: payload?.edited ?? true,
      createdAt: payload?.createdAt || now,
      updatedAt: payload?.updatedAt || now,
    };
    const res = await axiosInstance.put(url, body);
    return res.data;
  } catch (error) {
    console.error(`Error updating activity ${activityId} for PO ${poId}:`, error);
    throw error;
  }
};
