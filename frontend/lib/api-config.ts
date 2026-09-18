/**
 * Centralized API Configuration for Krishi Bondhu frontend.
 * Resolves the backend base URL prioritizing NEXT_PUBLIC_API_URL, with fallback to NEXT_PUBLIC_BACKEND_URL or localhost.
 */

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8000"
).replace(/\/$/, "");

export default API_BASE_URL;
