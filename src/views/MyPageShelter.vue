<template>
  <div class="mypage">
    <header class="mypage-header">
      <h2>이관 신청/접수 내역</h2>
    </header>

    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
    <div v-if="loading" class="loading">불러오는 중...</div>

    <div class="stack" v-else>
      <!-- 받은 접수 -->
      <section class="card">
        <h3 class="title">접수 내역</h3>
        <div v-if="received.length === 0" class="empty">받은 접수가 없습니다.</div>
        <ul v-else class="list">
          <li v-for="app in received" :key="app.id" class="item">
            <div class="col">
              <strong>← {{ app.fromShelterName || app.fromShelterId }}</strong>
              <small>동물: #{{ app.rescuedId }}</small>
              <small>{{ app.createdAt }}</small>
              <small>상태: {{ app.requestStatus }}</small>
            </div>

            <!-- 받은 항목 수락/거절 -->
            <div class="actions" v-if="app.requestStatus === 'PENDING_TARGET'">
              <button class="btn primary" :disabled="busy.has(app.id)" @click="onAccept(app)">
                수락
              </button>
              <button class="btn danger" :disabled="busy.has(app.id)" @click="openRejectModal(app)">
                거절
              </button>
            </div>
          </li>
        </ul>
      </section>

      <!-- 보낸 신청 -->
      <section class="card">
        <h3 class="title">신청 내역</h3>
        <div v-if="sent.length === 0" class="empty">보낸 신청이 없습니다.</div>
        <ul v-else class="list">
          <li v-for="app in sent" :key="app.id" class="item">
            <div class="col">
              <strong>→ {{ app.toShelterName || app.toShelterId }}</strong>
              <small>동물: #{{ app.rescuedId }}</small>
              <small>{{ app.createdAt }}</small>
              <small>상태: {{ app.requestStatus }}</small>

              <!-- 내가 보낸 신청이 거절된 경우 사유 노출 -->
              <div v-if="app.requestStatus === 'TARGET_REJECTED'" class="reject-reason">
                <span class="badge">거절 사유</span>
                <p class="reason-text">
                  {{ app.message && app.message.trim() ? app.message : '사유 없음' }}
                </p>
              </div>
            </div>

            <!-- 보낸 항목 액션 -->
            <div class="actions">
              <!-- 대기중이면 취소 -->
              <template v-if="app.requestStatus === 'PENDING_TARGET'">
                <span class="status">신청중</span>
                <button class="btn danger" :disabled="busy.has(app.id)" @click="onCancel(app)">
                  취소하기
                </button>
              </template>

              <!-- 타겟 수락되면 운송자 지정 버튼 -->
              <template v-else-if="app.requestStatus === 'TARGET_ACCEPTED'">
                <button class="btn primary" @click="openTprModal(app)">운송자 지정</button>
              </template>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <!-- 거절 사유 입력 모달 -->
    <div
      v-if="rejectModal.open"
      class="modal-backdrop"
      @click.self="closeRejectModal"
      @keyup.esc="closeRejectModal"
      tabindex="0"
    >
      <div class="modal">
        <h4 class="modal-title">
          {{ rejectModal.targetName ? `'${rejectModal.targetName}'` : '요청' }} 거절 사유
        </h4>
        <textarea
          v-model="rejectModal.message"
          class="modal-textarea"
          placeholder="거절 사유를 입력하세요 (최대 1000자)"
          maxlength="1000"
          rows="5"
          autofocus
        ></textarea>
        <div class="modal-actions">
          <button class="btn" @click="closeRejectModal" :disabled="rejectBusy">취소</button>
          <button
            class="btn danger"
            @click="submitReject"
            :disabled="rejectBusy || !canSubmitReject"
          >
            {{ rejectBusy ? '처리 중...' : '거절하기' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 우측 슬라이드 모달: 추천 운송자 목록 -->
    <RightModal v-if="isRightModalOpen" title="운송자 선택" @close="closeModal">
      <!-- 로딩 중 -->
      <div v-if="isLoadingTprs" class="loading-container">
        <div class="loading-spinner">추천 운송자를 찾는 중...</div>
      </div>

      <!-- 운송자 목록 -->
      <div v-else class="shelter-list in-modal">
        <div v-if="recommendedTransporters.length === 0" class="no-shelters">
          추천 가능한 운송자가 없습니다.
        </div>

        <div v-else class="shelter-item" v-for="tpr in recommendedTransporters" :key="tpr.id">
          <div class="shelter-info">
            <strong>{{ tpr.storeName }}</strong>
            <small>{{ tpr.tel }} · {{ tpr.addr }}</small>
            <small>거리: {{ (tpr.distance ?? 0).toFixed(1) }}km</small>
          </div>
          <div class="button-group">
            <button
              class="apply-button"
              :disabled="applyBusy"
              @click="applyToTransporterFromModal(tpr)"
            >
              신청
            </button>
          </div>
        </div>
      </div>
    </RightModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import RightModal from '@/components/RightModal.vue';
import {
  fetchFromShelter,
  fetchToShelter,
  acceptTarget,
  rejectTarget,
  cancelMySentRequest,
  recommendTransporters,
  saveTransportRequest,
} from '@/api/request';

const received = ref([]);
const sent = ref([]);

const loading = ref(false);
const errorMsg = ref('');
const busy = ref(new Set());

const rejectModal = ref({
  open: false,
  trRequestId: null,
  targetName: '',
  message: '',
});
const rejectBusy = ref(false);
const canSubmitReject = computed(() => (rejectModal.value.message || '').trim().length > 0);

const isRightModalOpen = ref(false);
const isLoadingTprs = ref(false);
const recommendedTransporters = ref([]);
const selectedApp = ref(null);
const applyBusy = ref(false);

const getShelterIdFromStorage = () => {
  const raw = localStorage.getItem('auth:data');
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw);
    return saved?.shelterId ?? null;
  } catch {
    return null;
  }
};

const refresh = async () => {
  const shelterId = getShelterIdFromStorage();
  if (!shelterId) {
    errorMsg.value = '보호소 ID를 찾을 수 없습니다.';
    return;
  }
  loading.value = true;
  errorMsg.value = '';
  try {
    const [receivedList, sentList] = await Promise.all([
      fetchToShelter(shelterId),
      fetchFromShelter(shelterId),
    ]);
    received.value = receivedList;
    sent.value = sentList;
  } catch (e) {
    console.error('[Mypage load error]', e);
    errorMsg.value = '내역을 불러오지 못했습니다.';
  } finally {
    loading.value = false;
  }
};

// Set 반응성 보장
const lock = (id) => {
  const next = new Set(busy.value);
  next.add(id);
  busy.value = next;
};
const unlock = (id) => {
  const next = new Set(busy.value);
  next.delete(id);
  busy.value = next;
};

const onAccept = async (app) => {
  if (!confirm('이 요청을 수락하시겠습니까?')) return;
  lock(app.id);
  try {
    await acceptTarget(app.id);
    await refresh();
  } catch (e) {
    console.error(e);
    alert('수락 처리에 실패했습니다.');
  } finally {
    unlock(app.id);
  }
};

const openRejectModal = (app) => {
  rejectModal.value.open = true;
  rejectModal.value.trRequestId = app.id;
  rejectModal.value.targetName = app.fromShelterName || app.fromShelterId || '';
  rejectModal.value.message = '';
  setTimeout(() => {
    const backdrop = document.querySelector('.modal-backdrop');
    backdrop && backdrop.focus();
  }, 0);
};
const closeRejectModal = () => {
  rejectModal.value.open = false;
  rejectModal.value.trRequestId = null;
  rejectModal.value.targetName = '';
  rejectModal.value.message = '';
};
const submitReject = async () => {
  if (!rejectModal.value.trRequestId) return;
  if (!canSubmitReject.value) {
    alert('거절 사유를 입력해주세요.');
    return;
  }
  rejectBusy.value = true;
  try {
    await rejectTarget(rejectModal.value.trRequestId, rejectModal.value.message.trim());
    await refresh();
  } catch (e) {
    console.error(e);
    alert('거절 처리에 실패했습니다.');
  } finally {
    rejectBusy.value = false;
    closeRejectModal();
  }
};

const onCancel = async (app) => {
  if (!confirm('보낸 신청을 취소하시겠습니까?')) return;
  lock(app.id);
  try {
    await cancelMySentRequest(app.id);
    await refresh();
  } catch (e) {
    console.error(e);
    alert('취소 처리에 실패했습니다.');
  } finally {
    unlock(app.id);
  }
};

const openTprModal = async (app) => {
  selectedApp.value = app;
  isRightModalOpen.value = true;
  isLoadingTprs.value = true;
  recommendedTransporters.value = [];

  try {
    const params = {
      fromShelterLatitude: app.fromShelterLatitude,
      fromShelterLongitude: app.fromShelterLongitude,
    };
    const list = await recommendTransporters(params);
    recommendedTransporters.value = Array.isArray(list) ? list : [];
  } catch (e) {
    console.error('[recommendTransporters error]', e);
    recommendedTransporters.value = [];
  } finally {
    isLoadingTprs.value = false;
  }
};

const closeModal = () => {
  isRightModalOpen.value = false;
  isLoadingTprs.value = false;
  selectedApp.value = null;
  recommendedTransporters.value = [];
  applyBusy.value = false;
};

const applyToTransporterFromModal = async (tpr) => {
  if (!selectedApp.value) return;
  if (!confirm(`'${tpr.storeName}'에게 운송을 신청하시겠습니까?`)) return;

  applyBusy.value = true;
  try {
    const payload = {
      transferRequestId: selectedApp.value.id,
      transporterId: tpr.id,
      fromShelterId: getShelterIdFromStorage(),
      message: '',
    };
    Object.keys(payload).forEach((k) => payload[k] == null && delete payload[k]);

    await saveTransportRequest(payload);
    closeModal();
    await refresh();
    alert('운송자에게 신청을 보냈습니다.');
  } catch (e) {
    console.error('[saveTransportRequest error]', e);
    alert('운송자 신청에 실패했습니다.');
  } finally {
    applyBusy.value = false;
  }
};

onMounted(refresh);
</script>

<style scoped>
.mypage {
  max-width: 100%;
  margin: 0 auto;
  padding: 24px;
}
.mypage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 16px;
}
.title {
  margin-top: 0px;
}
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 8px;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.status {
  font-weight: 700;
  margin-right: 8px;
}
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn.primary {
  background: #2563eb;
  color: #fff;
}
.btn.danger {
  background: #dc2626;
  color: #fff;
}
.empty {
  color: #666;
  padding: 24px 4px;
}
.error {
  color: #dc2626;
  margin-bottom: 8px;
}
.loading {
  color: #444;
  margin-bottom: 8px;
}

.reject-reason {
  margin-top: 8px;
  background: #fff0f0;
  border: 1px solid #f5b5b5;
  border-radius: 8px;
  padding: 8px 10px;
}
.badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  background: #dc2626;
  color: #fff;
  border-radius: 6px;
  padding: 2px 6px;
  margin-right: 6px;
}
.reason-text {
  display: inline;
  word-break: break-word;
}

.loading-container {
  padding: 12px;
}
.loading-spinner {
  color: #444;
}
.no-shelters {
  color: #666;
  padding: 8px 2px;
}
.shelter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
}
.shelter-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.apply-button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
}
</style>
