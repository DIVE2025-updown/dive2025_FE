<!-- src/views/TransporterRequests.vue -->
<template>
  <div class="mypage">
    <header class="mypage-header">
      <h2>운송 접수 내역</h2>
    </header>

    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
    <div v-if="loading" class="loading">불러오는 중...</div>

    <div class="stack" v-else>
      <section class="card">
        <h3 class="title">접수 내역</h3>
        <div v-if="received.length === 0" class="empty">받은 접수가 없습니다.</div>

        <ul v-else class="list">
          <li v-for="app in received" :key="app.id" class="item">
            <div class="col">
              <strong>
                ← {{ app.fromShelterName || app.fromShelterId || app.fromName || '보호소' }}
              </strong>
              <small>요청 생성: {{ app.createdAt }}</small>
              <small> 상태: {{ app.tprDecisionStatus || app.requestStatus || 'PENDING' }} </small>
            </div>

            <!-- PENDING이면 수락/거절 -->
            <div class="actions" v-if="isPending(app.tprDecisionStatus || app.requestStatus)">
              <button class="btn primary" :disabled="busy.has(app.id)" @click="onAccept(app)">
                수락
              </button>
              <button class="btn danger" :disabled="busy.has(app.id)" @click="openReject(app)">
                거절
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
      @click.self="closeReject"
      @keyup.esc="closeReject"
      tabindex="0"
    >
      <div class="modal">
        <h4 class="modal-title">거절 사유 <small class="muted">(선택)</small></h4>
        <textarea
          v-model="rejectModal.message"
          class="modal-textarea"
          placeholder="거절 사유를 입력하세요 (선택, 최대 1000자)"
          maxlength="1000"
          rows="5"
          autofocus
        ></textarea>
        <div class="modal-actions">
          <button class="btn" @click="closeReject" :disabled="rejectBusy">취소</button>
          <button class="btn danger" @click="submitReject" :disabled="rejectBusy">
            {{ rejectBusy ? '처리 중...' : '거절하기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { fetchTprAll, acceptTransport, rejectTransport } from '@/api/request';

const auth = useAuthStore();
const received = ref([]);

const loading = ref(false);
const errorMsg = ref('');
const busy = ref(new Set());

// 거절 모달 상태
const rejectModal = ref({
  open: false,
  id: null, // transporter_request.id
  trRequestId: null, // transfer_request.id
  message: '',
});
const rejectBusy = ref(false);

// "PENDING" 포함 여부로 판정 (TPR or TRR 양쪽 필드 대응)
const isPending = (s) => !!s && String(s).toUpperCase().includes('PENDING');

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

// transporterId 가져오기
const getTransporterId = () => {
  if (auth?.transporterId) return auth.transporterId;
  try {
    const saved = JSON.parse(localStorage.getItem('auth:data') || '{}');
    return saved?.transporterId ?? null;
  } catch {
    return null;
  }
};

// 목록 새로고침
const refresh = async () => {
  const transporterId = getTransporterId();
  if (!transporterId) {
    errorMsg.value = '운송업자 ID를 찾을 수 없습니다.';
    return;
  }
  loading.value = true;
  errorMsg.value = '';
  try {
    const list = await fetchTprAll(transporterId);
    received.value = Array.isArray(list) ? list : [];
  } catch (e) {
    console.error('[TPR get-all error]', e);
    errorMsg.value = '내역을 불러오지 못했습니다.';
  } finally {
    loading.value = false;
  }
};

// transfer_request ID 얻기 (백엔드 필드 명 혼용 대비)
const trIdOf = (app) =>
  app.transferRequestId ?? app.trRequestId ?? app.trId ?? app.transferId ?? null;

// 수락
const onAccept = async (app) => {
  const trRequestId = trIdOf(app);
  if (!trRequestId) return alert('연결된 이관요청 ID가 없습니다.');
  if (!confirm('해당 운송 요청을 수락하시겠습니까?')) return;

  lock(app.id);
  try {
    await acceptTransport({ id: app.id, trRequestId, message: '' });
  } catch (e) {
    console.error('[accept transport error]', e);
    alert('수락 처리에 실패했습니다.');
  } finally {
    await refresh();
    unlock(app.id);
  }
};

// 거절 모달 열기
const openReject = (app) => {
  const trRequestId = trIdOf(app);
  if (!trRequestId) return alert('연결된 이관요청 ID가 없습니다.');
  rejectModal.value.open = true;
  rejectModal.value.id = app.id;
  rejectModal.value.trRequestId = trRequestId;
  rejectModal.value.message = '';
  // 백드롭 포커스 (ESC 닫기 위한 키 이벤트 활성)
  setTimeout(() => {
    const backdrop = document.querySelector('.modal-backdrop');
    backdrop && backdrop.focus();
  }, 0);
};

// 거절 모달 닫기
const closeReject = () => {
  rejectModal.value.open = false;
  rejectModal.value.id = null;
  rejectModal.value.trRequestId = null;
  rejectModal.value.message = '';
};

// 거절 제출
const submitReject = async () => {
  const { id, trRequestId, message } = rejectModal.value;
  if (!id || !trRequestId) return;

  rejectBusy.value = true;
  lock(id);
  try {
    await rejectTransport({
      id,
      trRequestId,
      message: (message || '').trim(), // 빈 값 허용(선택)
    });
    await refresh();
    closeReject();
  } catch (e) {
    console.error('[reject transport error]', e);
    alert('거절 처리에 실패했습니다.');
  } finally {
    rejectBusy.value = false;
    unlock(id);
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
  margin-top: 0;
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

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.5);
  display: grid;
  place-items: center;
  z-index: 50;
  outline: none;
}
.modal {
  width: min(640px, 92vw);
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}
.modal-title {
  margin: 0 0 8px 0;
}
.muted {
  color: #6b7280;
  font-weight: 400;
  font-size: 0.9em;
}
.modal-textarea {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  resize: vertical;
  font: inherit;
  min-height: 120px;
}
.modal-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
