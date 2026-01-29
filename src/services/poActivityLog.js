import axiosInstance from "./axiosInstance";

// API endpoints
const ENDPOINTS = {
  PURCHASE_ORDER: "/purchase-orders",
};

/**
 * Create a new activity for a Purchase Order
 * POST /purchase-order/{poId}/activities
 * @param {number|string} poId
 * @param {object} payload - { comment, status, isSystemGenerated }
 * @returns {Promise<object>} response data
 */
export const createActivity = async (poId, payload) => {
  if (!poId) throw new Error("poId is required");
  try {
    const url = `${ENDPOINTS.PURCHASE_ORDER}/${poId}/activities`;
    const now = new Date().toISOString();
    
    // Encode isSystemGenerated and status in the comment with a prefix format
    // Format: [SYS:status] comment or [USR:status] comment
    const rawComment = payload?.comment || payload?.text || "";
    const isSystem = payload?.isSystemGenerated || false;
    const status = payload?.status || "Draft";
    const prefix = isSystem ? `[SYS:${status}]` : `[USR:${status}]`;
    const formattedComment = `${prefix} ${rawComment}`;
    
    const body = {
      poId: Number(poId),
      comment: formattedComment,
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
 * Parse activity comment to extract isSystemGenerated and status
 * Format: [SYS:status] comment or [USR:status] comment
 * @param {string} comment - The raw comment from the database
 * @returns {object} { text, isSystemGenerated, status }
 */
export const parseActivityComment = (comment) => {
  if (!comment) return { text: "", isSystemGenerated: false, status: null };
  
  // Match pattern [SYS:status] or [USR:status] at the beginning
  const prefixPattern = /^\[(SYS|USR):([^\]]+)\]\s*/;
  const match = comment.match(prefixPattern);
  
  if (match) {
    const isSystemGenerated = match[1] === "SYS";
    const status = match[2];
    const text = comment.replace(prefixPattern, "");
    return { text, isSystemGenerated, status };
  }
  
  // Legacy format: check for [SYSTEM] prefix
  if (comment.startsWith("[SYSTEM]")) {
    return {
      text: comment.replace(/^\[SYSTEM\]\s*/, ""),
      isSystemGenerated: true,
      status: null,
    };
  }
  
  // No prefix found - treat as user comment
  return { text: comment, isSystemGenerated: false, status: null };
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
    
    // For updates, preserve the user format (USR prefix) since only user comments can be edited
    const rawComment = payload?.comment || payload?.text || "";
    const status = payload?.status || "Draft";
    const formattedComment = `[USR:${status}] ${rawComment}`;
    
    const body = {
      id: Number(activityId),
      poId: Number(poId),
      comment: formattedComment,
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
