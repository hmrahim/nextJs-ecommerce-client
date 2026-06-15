import axios from 'axios';
import { getSession } from 'next-auth/react';
import { getSessionId } from './session';

// ✅ Session cache — getSession() network call টা প্রতিটা request এ না করে
// একবার fetch করে 30 সেকেন্ড cache করে রাখে।
let _cachedSession = null;
let _cacheExpiry   = 0;

async function getCachedSession() {
  const now = Date.now();
  if (_cachedSession !== null && now < _cacheExpiry) {
    return _cachedSession;
  }
  _cachedSession = await getSession();
  _cacheExpiry   = now + 30_000; // 30 সেকেন্ড cache
  return _cachedSession;
}

// Session cache clear করার function (logout এ call করো)
export function clearSessionCache() {
  _cachedSession = null;
  _cacheExpiry   = 0;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ✅ Cached session use করে — প্রতিটা request এ network call হবে না
api.interceptors.request.use(
  async (config) => {
    const session = await getCachedSession();
    const token   = session?.accessToken || session?.user?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const sessionId = getSessionId();
    if (sessionId) {
      config.headers['x-session-id'] = sessionId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // 401 এলে session cache clear করো যাতে next request এ fresh session নেয়
      clearSessionCache();
      if (typeof window !== 'undefined') window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const postUser = async (user) => {
  const res = await api.post(`/register`, user);
  return res.status === 200 ? res : null;
};

export default api;
