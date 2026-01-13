// src/services/pincodeService.js
// Service to fetch city, state, and country from pincode using the open API
import axios from "axios";

export async function getLocationByPincode(pincode) {
  try {
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = response.data;
    if (
      Array.isArray(data) &&
      data[0]?.Status === "Success" &&
      Array.isArray(data[0].PostOffice) &&
      data[0].PostOffice.length > 0
    ) {
      const first = data[0].PostOffice[0];
      return {
        city: first.District || "",
        state: first.State || "",
        country: first.Country || "",
      };
    }
    return null;
  } catch (e) {
    // Suppress errors as per requirements
    return null;
  }
}
