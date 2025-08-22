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
  async (err) => {
    const status = err?.response?.status;
    const url = err?.config?.url || '';
    if (status === 401) {
      // 업데이트 중의 예외가 401로 오는 케이스는 일단 로그인 해제하지 않고
      // 페이지에서 refresh()로 반영 여부를 확인하게 둡니다.
      if (url.includes('/transport/update')) {
        return Promise.reject(err);
      }
      const { useAuthStore } = await import('@/stores/authStore');
      const auth = useAuthStore();
      auth.clear();
      auth.showLoginModal = true;
    }
    return Promise.reject(err);
  }
);

export default api;
