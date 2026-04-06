/**
 * Centralized API configuration.
 * سارے pages اس file سے API_URL import کریں۔
 * URL بدلنا ہو تو صرف .env میں NEXT_PUBLIC_API_URL تبدیل کریں۔
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

if (!API_URL) {
  console.warn('[config] NEXT_PUBLIC_API_URL is not set in .env – falling back to localhost:5000/api');
}

export default API_URL || 'http://localhost:5000/api';
