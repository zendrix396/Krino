// Using fetch instead of axios to avoid CORS issues
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function to handle API requests
const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    
    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// API endpoints for loan prediction
const loanPredictionService = {
  // Check if API is running
  checkApiStatus: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/`, {
        method: 'GET',
        mode: 'cors', // Important for CORS
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      console.error('API status check failed:', error);
      throw error;
    }
  },
  
  // Train the model
  trainModel: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/train`, {
        method: 'POST',
        mode: 'cors', // Important for CORS
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      console.error('Model training failed:', error);
      throw error;
    }
  },
  
  // Make a prediction
  predictLoanDefault: async (loanData) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/predict`, {
        method: 'POST',
        mode: 'cors', // Important for CORS
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData),
      });
      return response;
    } catch (error) {
      console.error('Prediction failed:', error);
      throw error;
    }
  }
};

export default loanPredictionService; 