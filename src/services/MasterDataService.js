import axiosInstance from "./axiosInstance";

// API endpoints
const ENDPOINTS = {
  CATEGORIES: "/categories",
  SUBCATEGORIES: "/sub-categories",
  ITEM_TYPES: "/item-types",
  ATTRIBUTES: "/attribute-configs",
  UOMS: "/unit-of-measures"
};

export const getAllCategories = async () => {
  const response = await axiosInstance.get(ENDPOINTS.CATEGORIES);
  return response.data;
};

export const getAllSubCategories = async () => {
  const response = await axiosInstance.get(ENDPOINTS.SUBCATEGORIES);
  return response.data;
};

export const getAllItemTypes = async () => {
  const response = await axiosInstance.get(ENDPOINTS.ITEM_TYPES);
  return response.data;
};

export const getAllAttributeConfigs = async () => {
  const response = await axiosInstance.get(ENDPOINTS.ATTRIBUTES);
  return response.data;
};

export const getAllUOMs = async () => {
  const response = await axiosInstance.get(ENDPOINTS.UOMS);
  return response.data;
};

export const createCategory = async (data) => {
  const response = await axiosInstance.post(ENDPOINTS.CATEGORIES, data);
  return response.data;
};

export const createSubCategory = async (data) => {
  const response = await axiosInstance.post(ENDPOINTS.SUBCATEGORIES, data);
  return response.data;
};

export const createItemType = async (data) => {
  const response = await axiosInstance.post(ENDPOINTS.ITEM_TYPES, data);
  return response.data;
};

export const createAttributeConfig = async (data) => {
  const response = await axiosInstance.post(ENDPOINTS.ATTRIBUTES, data);
  return response.data;
};

export const createUOM = async (data) => {
  const response = await axiosInstance.post(ENDPOINTS.UOMS, data);
  return response.data;
};
