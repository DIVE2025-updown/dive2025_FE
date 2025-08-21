import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API ERROR]', err?.response?.status, err?.response?.data);
    return Promise.reject(err);
  }
);

export default api;
