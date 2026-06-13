import axios from 'axios';
import { getSession } from 'next-auth/react';
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use(

  async (config) => {
    const session = await getSession();
     const token = session?.accessToken || session?.user?.token;
   
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
