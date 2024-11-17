import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true, // Ensure cookies are sent
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}token/refresh/`,
          {}, // No body required, just cookies
          { withCredentials: true }
        );

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Clear cookies if refresh fails
        document.cookie = 'access_token=; Max-Age=0; path=/;';
        document.cookie = 'refresh_token=; Max-Age=0; path=/;';

        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
