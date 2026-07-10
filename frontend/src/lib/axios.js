import axios from "axios";

// VITE_API_URL is the Render backend URL set in Vercel's environment variables.
// Vite bakes env vars starting with VITE_ into the production bundle at build time.
// Without the VITE_ prefix, the variable is stripped and import.meta.env.VITE_API_URL
// is undefined — the most common production-only bug in Vite projects.
//
// Dev:        VITE_API_URL=http://localhost:3000   (from frontend/.env)
// Production: VITE_API_URL=https://your-app.onrender.com  (from Vercel dashboard)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true, // sends the httpOnly JWT cookie cross-origin
});

// Request interceptor — passes all requests through unchanged.
// withCredentials on the instance handles cookie attachment automatically.
api.interceptors.request.use(
  (config) => {
    // Only set Content-Type for JSON requests, not FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
