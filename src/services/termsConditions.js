import axiosInstance from "./axiosInstance";

/**
 * Terms and Conditions API Service
 */

const ENDPOINTS = {
  TERMS_CONDITIONS: "/terms-conditions"
};

/**
 * Get all terms and conditions
 * @returns {Promise<Array>} Response with terms and conditions list
 */
export const getTermsConditions = async () => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.TERMS_CONDITIONS);
    return response.data;
  } catch (error) {
    console.error("Error fetching terms and conditions:", error);
    throw error;
  }
};
