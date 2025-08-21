import { defineStore } from 'pinia';
import api from '@/api/api';

function setAuthHeader(token) {
  if (token) {
    // 모든 요청에 Bearer 토큰
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    username: null,
    role: null,
    stype: null,
    sid: null,
    shelterId: null,
    transporterId: null,
    latitude: null,
    longitude: null,
    isAuthenticated: false,
    loading: false,
    errorMessage: null,
  }),

  // 보호소? 운송업자?
  getters: {
    isShelter: (s) => s.stype === 'SHELTER',
    isTransporter: (s) => s.stype === 'TRANSPORTER',
  },

  actions: {
    async login(username, password) {
      this.loading = true;
      this.errorMessage = null;
      try {
        const { data } = await api.post('/auth/login', {
          username,
          password,
        });

        const {
          token,
          username: uname,
          role,
          stype,
          sid,
          shelterId,
          transporterId,
          latitude,
          longitude,
        } = data || {};

        // 상태 저장
        this.token = token || null;
        this.username = uname || null;
        this.role = role || null;
        this.stype = stype || null;
        this.sid = sid ?? null;
        this.shelterId = shelterId ?? null;
        this.transporterId = transporterId ?? null;
        this.latitude = latitude ?? null;
        this.longitude = longitude ?? null;
        this.isAuthenticated = true;

        // axios 기본 Authorization 헤더 설정(Bearer)
        setAuthHeader(this.token);

        localStorage.setItem(
          'auth:data',
          JSON.stringify({
            token: this.token,
            username: this.username,
            role: this.role,
            stype: this.stype,
            sid: this.sid,
            shelterId: this.shelterId,
            transporterId: this.transporterId,
            latitude: this.latitude,
            longitude: this.longitude,
          })
        );
        return { ok: true };
      } catch (err) {
        const msg = err?.response?.data?.message || '로그인에 실패했습니다.';
        this.errorMessage = msg;
        return { ok: false, message: msg };
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await api.post('/auth/logout');
      } catch (e) {
        console.warn('logout error(ignore):', e);
      } finally {
        this.clear();
      }
    },

    // 앱 시작 시 저장값으로 상태 복원
    hydrate() {
      const raw = localStorage.getItem('auth:data');
      if (!raw) return;
      try {
        const saved = JSON.parse(raw);
        this.token = saved.token ?? null;
        this.username = saved.username ?? null;
        this.role = saved.role ?? null;
        this.stype = saved.stype ?? null;
        this.sid = saved.sid ?? null;
        this.shelterId = saved.shelterId ?? null;
        this.transporterId = saved.transporterId ?? null;
        this.latitude = saved.latitude ?? null;
        this.longitude = saved.longitude ?? null;
        this.isAuthenticated = !!this.token; // 토큰 존재 여부로 간단 판정
        setAuthHeader(this.token);
      } catch (e) {
        console.warn('auth:data 파싱 실패', e);
        this.clear();
      }
    },

    clear() {
      this.token = null;
      this.username = null;
      this.role = null;
      this.stype = null;
      this.sid = null;
      this.shelterId = null;
      this.transporterId = null;
      this.latitude = null;
      this.longitude = null;
      this.isAuthenticated = false;
      this.errorMessage = null;
      setAuthHeader(null);
      localStorage.removeItem('auth:data');
    },
  },
});
