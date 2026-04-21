/**
 * India Post API Service - Admin Panel
 * Provides city lookup using India Post's postal pincode API
 * Supports both pincode (6-digit) and city name searches
 */

/**
 * Search for cities using India Post API
 * Detects if input is a 6-digit pincode or city name
 * @param {string} input - Either a 6-digit pincode or a city name
 * @returns {Promise<Object>} - Result with city name and other details
 */
export const searchCities = async (input) => {
  if (!input?.trim()) {
    return { error: "No input provided", success: false, cities: [] };
  }

  const isPincode = /^\d{6}$/.test(input.trim());
  const endpoint = isPincode
    ? `https://api.postalpincode.in/pincode/${input}`
    : `https://api.postalpincode.in/postoffice/${input}`;

  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const response = await fetch(endpoint, { signal: controller.signal });
    const data = await response.json();

    if (data[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
      // Extract unique cities from results
      const uniqueCities = new Map();

      data[0].PostOffice.forEach((result) => {
        const city = result.District; // District is actually the city name in India Post API
        if (city && !uniqueCities.has(city)) {
          uniqueCities.set(city, {
            name: city,
            state: result.State,
            pincode: result.Pincode,
            postOffice: result.Name,
          });
        }
      });

      return {
        success: true,
        cities: Array.from(uniqueCities.values()),
      };
    }

    return {
      error:
        "Location not found. Please check spelling or try a different pincode.",
      success: false,
      cities: [],
    };
  } catch (error) {
    if (error.name === "AbortError") {
      return {
        error: "Search timeout. Please try again.",
        success: false,
        cities: [],
      };
    }
    console.error("India Post API error:", error);
    return {
      error: "Search failed. Please try a different input.",
      success: false,
      cities: [],
    };
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Debounced search to reduce API calls
 * @param {string} input - Search input
 * @param {number} delay - Debounce delay in ms
 * @returns {Promise<Object>} - Search results
 */
let searchTimeout;
export const debouncedSearchCities = (input, delay = 300) => {
  return new Promise((resolve) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      const result = await searchCities(input);
      resolve(result);
    }, delay);
  });
};
