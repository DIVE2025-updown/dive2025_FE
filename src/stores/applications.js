// stores/applications.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  saveTransferRequest,
  deleteTransferRequest,
  getRequestsFromShelter,
} from '@/api/tr-request';

export const hoveredShelterId = ref(null);

export const useApplicationsStore = defineStore('applications', {
  state: () => ({
    sentRequests: [], // [{ id, rescuedId, ... }]
    trMetaByRescuedId: {}, // { [rescuedId]: { fromShelterId, toShelterId } }
  }),

  actions: {
    _loadMeta() {
      try {
        this.trMetaByRescuedId = JSON.parse(localStorage.getItem('tr-meta') || '{}');
      } catch {
        this.trMetaByRescuedId = {};
      }
    },
    _saveMeta() {
      localStorage.setItem('tr-meta', JSON.stringify(this.trMetaByRescuedId));
    },
    init() {
      this._loadMeta();
    },

    rememberMetaFor({ rescuedId, fromShelterId, toShelterId }) {
      if (!rescuedId) return;
      this.trMetaByRescuedId[rescuedId] = { fromShelterId, toShelterId };
      this._saveMeta();
    },
    getMetaByRescuedId(rescuedId) {
      return this.trMetaByRescuedId[rescuedId] || null;
    },

    /** 특정 보호소에서 보낸 신청 목록 전체 조회 */
    async fetchSentRequests(shelterId) {
      try {
        const { data } = await getRequestsFromShelter(shelterId);
        this.sentRequests = data;
      } catch (err) {
        console.error('보낸 신청 목록 조회 실패:', err);
        this.sentRequests = [];
      }
    },

    /** 신청 보내기 → 성공하면 다시 전체 목록 조회 */
    async sendApplication(payload, shelterId) {
      try {
        const { data } = await saveTransferRequest(payload);
        if (data === 1) {
          this.rememberMetaFor({
            rescuedId: payload.rescuedId,
            fromShelterId: payload.fromShelterId,
            toShelterId: payload.toShelterId,
          });
          // row count == 1 → 성공
          await this.fetchSentRequests(shelterId);
        } else {
          console.warn('이관 신청 실패: 예상치 못한 반환값', data);
        }
      } catch (err) {
        console.error('이관 신청 에러:', err.response?.data || err.message);
        throw err;
      }
    },

    /** 신청 취소 → 성공하면 다시 전체 목록 조회 */
    async cancelApplication(requestId, shelterId) {
      try {
        await deleteTransferRequest(requestId);
        await this.fetchSentRequests(shelterId);
      } catch (err) {
        console.error('이관 신청 취소 실패:', err.response?.data || err.message);
        throw err;
      }
    },
  },
});
