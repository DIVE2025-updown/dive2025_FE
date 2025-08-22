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

            <!-- 보낸 항목 취소 -->
            <div class="actions" v-if="app.requestStatus === 'PENDING_TARGET'">
              <span class="status">신청중</span>
              <button class="btn danger" :disabled="busy.has(app.id)" @click="onCancel(app)">
                취소하기
              </button>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import {
  fetchFromShelter,
  fetchToShelter,
  acceptTarget,
  rejectTarget,
  cancelMySentRequest,
} from '@/api/request';

const received = ref([]);
const sent = ref([]);

const loading = ref(false);
const errorMsg = ref('');
const busy = ref(new Set());

// 거절 모달 상태
const rejectModal = ref({
  open: false,
  trRequestId: null,
  targetName: '',
  message: '',
});
const rejectBusy = ref(false);
const canSubmitReject = computed(() => (rejectModal.value.message || '').trim().length > 0);

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

// Set의 반응성 보장을 위해 새 Set 재할당
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

// --- 거절 모달 흐름 ---
const openRejectModal = (app) => {
  rejectModal.value.open = true;
  rejectModal.value.trRequestId = app.id;
  rejectModal.value.targetName = app.fromShelterName || app.fromShelterId || '';
  rejectModal.value.message = '';
  // 포커스 활성 위해
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
    closeRejectModal(); // busy 해제 후 닫기
  }
};

// 보낸 신청 취소
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

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 50;
  outline: none;
}
.modal {
  width: min(640px, 92vw);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 16px;
}
.modal-title {
  margin: 0 0 8px;
}
.modal-textarea {
  width: 100%;
  resize: vertical;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fafafa;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}
</style>
