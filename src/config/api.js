// Centralized API base URL with production fallback.
// Uses Vite env variable VITE_API_URL if defined, else falls back to deployed backend.
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://constructify-backend.onrender.com').replace(/\/+$/,'');

export default API_BASE_URL;
