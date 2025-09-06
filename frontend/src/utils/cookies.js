// Cookie utility functions for storing and retrieving form data

const COOKIE_NAME = 'krona_loan_form_data';
const COOKIE_EXPIRY_DAYS = 30; // Store form data for 30 days

/**
 * Set a cookie with the given name, value, and expiration days
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Expiration days
 */
export const setCookie = (name, value, days = COOKIE_EXPIRY_DAYS) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
};

/**
 * Delete a cookie by name
 * @param {string} name - Cookie name
 */
export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * Save form data to cookies
 * @param {Object} formData - Form data object to save
 */
export const saveFormData = (formData) => {
  try {
    const formDataString = JSON.stringify(formData);
    setCookie(COOKIE_NAME, formDataString);
    console.log('Form data saved to cookies');
  } catch (error) {
    console.error('Error saving form data to cookies:', error);
  }
};

/**
 * Load form data from cookies
 * @returns {Object|null} - Form data object or null if not found
 */
export const loadFormData = () => {
  try {
    const formDataString = getCookie(COOKIE_NAME);
    if (formDataString) {
      const formData = JSON.parse(formDataString);
      console.log('Form data loaded from cookies');
      return formData;
    }
  } catch (error) {
    console.error('Error loading form data from cookies:', error);
    // If there's an error parsing, delete the corrupted cookie
    deleteCookie(COOKIE_NAME);
  }
  return null;
};

/**
 * Clear saved form data from cookies
 */
export const clearFormData = () => {
  deleteCookie(COOKIE_NAME);
  console.log('Form data cleared from cookies');
};

/**
 * Check if form data exists in cookies
 * @returns {boolean} - True if form data exists
 */
export const hasFormData = () => {
  return getCookie(COOKIE_NAME) !== null;
};
