export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('jwt_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  let jsonResponse;
  try {
    jsonResponse = await response.json();
  } catch (error) {
    throw new Error('Failed to parse API response as JSON');
  }

  // Handle standard ApiResponse structure { success, data, errorCode, message, devStackTrace }
  if (!response.ok || (jsonResponse && jsonResponse.success === false)) {
    const errorCode = jsonResponse?.errorCode || response.status;
    const errorMessage = jsonResponse?.message || 'An unexpected error occurred';
    
    const apiError = new Error(errorMessage);
    apiError.errorCode = errorCode;
    apiError.devStackTrace = jsonResponse?.devStackTrace;
    apiError.status = response.status;
    apiError.originalResponse = jsonResponse;
    
    throw apiError;
  }

  return jsonResponse;
};
