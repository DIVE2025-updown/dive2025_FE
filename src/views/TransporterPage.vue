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

        <!-- 표 형식 -->
        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 28%">출발보호소</th>
                <th style="width: 28%">도착보호소</th>
                <th style="width: 22%">운송 결정 상태</th>
                <th style="width: 22%">신청일</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in received" :key="app.id">
                <td data-label="fromShelterName">
                  {{ app.fromShelterName || app.fromShelterId || app.fromName || '보호소' }}
                </td>
                <td data-label="toShelterName">
                  {{ app.toShelterName || app.toShelterId || app.toName || '-' }}
                </td>
                <td data-label="tpr_decision_status">
                  <span
                    class="status-badge"
                    :class="tprClass(app.tprDecisionStatus || app.requestStatus)"
                  >
                    {{ tprLabel(app.tprDecisionStatus || app.requestStatus) }}
                  </span>

                  <!-- PENDING이면 상태 셀 안에서 액션 노출 -->
                  <div
                    class="actions-inline"
                    v-if="isPending(app.tprDecisionStatus || app.requestStatus)"
                  >
                    <button
                      class="btn xs primary"
                      :disabled="busy.has(app.id)"
                      @click="onAccept(app)"
                    >
                      수락
                    </button>
                    <button
                      class="btn xs danger"
                      :disabled="busy.has(app.id)"
                      @click="openReject(app)"
                    >
                      거절
                    </button>
                  </div>

                  <!-- 거절 사유 -->
                  <div v-if="showRejectReason(app)" class="reason-inline">
                    <span class="badge tiny">사유</span>
                    <span class="reason-text">{{ (app.message || '').trim() || '사유 없음' }}</span>
                  </div>
                </td>
                <td data-label="created_at">{{ formatDate(app.updatedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
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

const formatDate = (date) => {
  let year = String(date[0]);
  if (year.length === 1) year = '0' + year;

  let month = String(date[1]);
  if (month.length === 1) month = '0' + month;

  let day = String(date[2]);
  if (day.length === 1) day = '0' + day;

  let hour = String(date[3]);
  if (hour.length === 1) hour = '0' + hour;

  let minute = String(date[4]);
  if (minute.length === 1) minute = '0' + minute;

  return `${year}-${month}-${day} ${hour}:${minute}`;
};

// 거절 모달 상태
const rejectModal = ref({
  open: false,
  id: null, // transporter_request.id
  trRequestId: null, // transfer_request.id
  message: '',
});
const rejectBusy = ref(false);

// 상태 라벨/클래스
const tprLabel = (s) => {
  const v = String(s || '').toUpperCase();
  if (v.includes('PENDING')) return 'PENDING';
  if (v.includes('ACCEPT')) return 'ACCEPT';
  if (v.includes('REJECT')) return 'REJECT';
  return v || '-';
};
const tprClass = (s) => {
  const v = String(s || '').toUpperCase();
  if (v.includes('REJECT')) return 'rejected';
  if (v.includes('ACCEPT')) return 'accepted';
  if (v.includes('PENDING')) return 'pending';
  return 'unknown';
};

// "PENDING" 포함 여부로 판정 (TPR or TRR 양쪽 필드 대응)
const isPending = (s) => !!s && String(s).toUpperCase().includes('PENDING');

// 거절 사유 노출 여부
const showRejectReason = (app) => {
  const v = String(app.tprDecisionStatus || app.requestStatus || '').toUpperCase();
  return v.includes('REJECT');
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

/* ---------- 표 ---------- */
.table-wrap {
  width: 100%;
  overflow: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
}
.table thead th {
  text-align: left;
  padding: 10px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}
.table tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  height: 50px;
}
.table tbody tr:hover {
  background: #f8fafc;
}

/* 상태 뱃지 */
.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
  border: 1px solid transparent;
}
.status-badge.pending {
  color: #6b7280;
  background: #f3f4f6;
  border-color: #e5e7eb;
}
.status-badge.accepted {
  color: #065f46;
  background: #ecfdf5;
  border-color: #a7f3d0;
}
.status-badge.rejected {
  color: #991b1b;
  background: #fef2f2;
  border-color: #fecaca;
}
.status-badge.unknown {
  color: #334155;
  background: #e2e8f0;
  border-color: #cbd5e1;
}

/* 표 셀 내 액션 & 사유 */
.actions-inline {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}
.reason-inline {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.badge.tiny {
  padding: 2px 6px;
  font-size: 14px;
  border-radius: 6px;
  background: #dc2626;
  color: #fff;
  font-weight: 700;
}
.reason-text {
  color: #374151;
}

/* 버튼 */
.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #e5e7eb;
}
.btn.primary {
  background: #2563eb;
  color: #fff;
}
.btn.danger {
  background: #dc2626;
  color: #fff;
}
.btn.xs {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 6px;
}

/* ---------- 반응형 (모바일 카드형) ---------- */
@media (max-width: 720px) {
  .table thead {
    display: none;
  }
  .table,
  .table tbody,
  .table tr,
  .table td {
    display: block;
    width: 100%;
  }
  .table tr {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    margin-bottom: 10px;
    background: #fafafa;
  }
  .table tbody td {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 8px;
    border: none;
    padding: 10px 12px;
  }
  .table tbody td::before {
    content: attr(data-label);
    font-weight: 700;
    color: #374151;
  }
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  z-index: 100;
  outline: none;

  opacity: 0;
  animation: backdrop-fade 180ms ease-out forwards;
}

.modal {
  width: min(560px, 92vw);
  background: #fff;
  border-radius: 14px;
  padding: 18px 18px 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18), 0 2px 10px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);

  transform: translateY(8px) scale(0.98);
  opacity: 0;
  animation: modal-pop 200ms cubic-bezier(0.2, 0.6, 0.2, 1) 60ms forwards;
}

.modal-title {
  margin: 0 0 10px;
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.01em;
  color: #111827;
}

.modal-textarea {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 14px;
  resize: vertical;
  font: inherit;
  min-height: 120px;
  background: #fafafa;
  transition: border-color 120ms ease, box-shadow 120ms ease, background 120ms ease;
}

.modal-textarea:focus {
  outline: none;
  border-color: #0a84ff;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.15);
}

.modal-actions {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* 액션 버튼들(모달 안에서만 살짝 다듬기) */
.modal-actions .btn {
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  color: #111827;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 600;
  transition: transform 80ms ease, box-shadow 120ms ease, background 120ms ease,
    border-color 120ms ease;
}

.modal-actions .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
  background: #ffffff;
}

.modal-actions .btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.modal-actions .btn.primary {
  background: #0a84ff;
  border-color: #0a84ff;
  color: #fff;
}

.modal-actions .btn.primary:hover {
  background: #0a7bff;
  border-color: #0a7bff;
}

.modal-actions .btn.danger {
  background: #ff3b30;
  border-color: #ff3b30;
  color: #fff;
}

.modal-actions .btn.danger:hover {
  background: #f33227;
  border-color: #f33227;
}

/* 작은 보조 텍스트(이미 쓰는 .muted가 있으면 그대로 사용) */
.muted {
  color: #6b7280;
}

/* 애니메이션 */
@keyframes backdrop-fade {
  to {
    opacity: 1;
  }
}
@keyframes modal-pop {
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>
