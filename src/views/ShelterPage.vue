<!-- src/views/TransferRequests.vue -->
<template>
  <div class="mypage">
    <header class="mypage-header">
      <h2>이관 신청/접수 내역</h2>
    </header>

    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
    <div v-if="loading" class="loading">불러오는 중...</div>

    <div class="stack" v-else>
      <!-- 받은 접수(타겟) -->
      <section class="card">
        <h3 class="title">접수 내역</h3>
        <div v-if="received.length === 0" class="empty">받은 접수가 없습니다.</div>

        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 17%">신청 보호소</th>
                <th style="width: 14%">동물 ID</th>
                <th style="width: 18%">동물 상태</th>
                <th style="width: 20%">접수일</th>
                <th style="width: 19%">상태</th>
                <th style="width: 12%">액션</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in received" :key="app.id">
                <td data-label="신청 보호소">
                  {{ app.fromShelterName || app.fromShelterId }}
                </td>
                <td data-label="동물 ID">#{{ app.rescuedId }}</td>
                <td data-label="동물 상태">
                  <span class="cond-pill" :class="condClass(app.animalCondition)">
                    {{ condLabel(app.animalCondition) }}
                  </span>
                </td>
                <td data-label="접수일">{{ app.createdAt }}</td>
                <td data-label="상태">
                  <span class="status-badge" :class="statusClass(app.requestStatus)">
                    {{ statusLabel(app.requestStatus) }}
                  </span>
                  <div v-if="app.requestStatus === 'TARGET_REJECTED'" class="reason-inline">
                    <span class="badge tiny">사유</span>
                    <span class="reason-text">{{ app.message?.trim() || '사유 없음' }}</span>
                  </div>
                  <div
                    v-if="
                      app.requestStatus === 'TRANSPORTER_ACCEPTED' &&
                      (app.transporterName || app.transporterId)
                    "
                    class="reason-inline"
                  >
                    <span class="badge tiny">운송자</span>
                    <span class="reason-text">{{
                      app.transporterName || `ID #${app.transporterId}`
                    }}</span>
                  </div>
                </td>
                <td data-label="액션">
                  <div class="actions-inline" v-if="app.requestStatus === 'PENDING_TARGET'">
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
                      @click="openRejectModal(app)"
                    >
                      거절
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 보낸 신청(요청자) -->
      <section class="card">
        <h3 class="title">신청 내역</h3>
        <div v-if="sentGroupA.length === 0" class="empty">보낸 신청이 없습니다.</div>

        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 17%">대상 보호소</th>
                <th style="width: 14%">동물 ID</th>
                <th style="width: 18%">동물 상태</th>
                <th style="width: 20%">신청일</th>
                <th style="width: 19%">상태</th>
                <th style="width: 12%">액션</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in sentGroupA" :key="app.id">
                <td data-label="대상 보호소">{{ app.toShelterName || app.toShelterId }}</td>
                <td data-label="동물 ID">#{{ app.rescuedId }}</td>
                <td data-label="동물 상태">
                  <span class="cond-pill" :class="condClass(app.animalCondition)">
                    {{ condLabel(app.animalCondition) }}
                  </span>
                </td>
                <td data-label="신청일">{{ app.updatedAt }}</td>
                <td data-label="상태">
                  <span class="status-badge" :class="statusClass(app.requestStatus)">
                    {{ statusLabel(app.requestStatus) }}
                  </span>

                  <!-- 거절 사유 표시 -->
                  <div v-if="app.requestStatus === 'TARGET_REJECTED'" class="reason-inline">
                    <span class="badge tiny">사유</span>
                    <span class="reason-text">{{ app.message?.trim() || '사유 없음' }}</span>
                  </div>
                  <div
                    v-if="
                      app.requestStatus === 'TRANSPORTER_ACCEPTED' &&
                      (app.transporterName || app.transporterId)
                    "
                    class="reason-inline"
                  >
                    <span class="badge tiny">운송자</span>
                    <span class="reason-text">{{
                      app.transporterName || `ID #${app.transporterId}`
                    }}</span>
                  </div>
                </td>
                <td data-label="액션">
                  <div class="actions-inline">
                    <template v-if="app.requestStatus === 'PENDING_TARGET'">
                      <button
                        class="btn xs danger"
                        :disabled="busy.has(app.id)"
                        @click="onCancel(app)"
                      >
                        취소
                      </button>
                    </template>
                    <template v-else-if="app.requestStatus === 'TARGET_ACCEPTED'">
                      <button class="btn xs primary" @click="openTprModal(app)">운송자 지정</button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <header class="mypage-header">
        <h2>입양센터 신청 내역</h2>
      </header>
      <section class="card">
        <h3 class="title">신청 내역</h3>
        <div v-if="sentGroupB.length === 0" class="empty">보낸 신청이 없습니다.</div>

        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 17%">대상 입양센터</th>
                <th style="width: 14%">동물 ID</th>
                <th style="width: 18%">동물 상태</th>
                <th style="width: 20%">신청일</th>
                <th style="width: 19%">상태</th>
                <th style="width: 12%">액션</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in sentGroupB" :key="app.id">
                <td data-label="대상 보호소">{{ app.toShelterName || app.toShelterId }}</td>
                <td data-label="동물 ID">#{{ app.rescuedId }}</td>
                <td data-label="동물 상태">
                  <span class="cond-pill" :class="condClass(app.animalCondition)">
                    {{ condLabel(app.animalCondition) }}
                  </span>
                </td>
                <td data-label="신청일">{{ app.updatedAt }}</td>
                <td data-label="상태">
                  <span class="status-badge" :class="statusClass(app.requestStatus)">
                    {{ statusLabel(app.requestStatus) }}
                  </span>

                  <!-- 거절 사유 표시 -->
                  <div v-if="app.requestStatus === 'TARGET_REJECTED'" class="reason-inline">
                    <span class="badge tiny">사유</span>
                    <span class="reason-text">{{ app.message?.trim() || '사유 없음' }}</span>
                  </div>
                  <div
                    v-if="
                      app.requestStatus === 'TRANSPORTER_ACCEPTED' &&
                      (app.transporterName || app.transporterId)
                    "
                    class="reason-inline"
                  >
                    <span class="badge tiny">운송자</span>
                    <span class="reason-text">{{
                      app.transporterName || `ID #${app.transporterId}`
                    }}</span>
                  </div>
                </td>
                <td data-label="액션">
                  <div class="actions-inline">
                    <template v-if="app.requestStatus === 'PENDING_TARGET'">
                      <button
                        class="btn xs danger"
                        :disabled="busy.has(app.id)"
                        @click="onCancel(app)"
                      >
                        취소
                      </button>
                    </template>
                    <template v-else-if="app.requestStatus === 'TARGET_ACCEPTED'">
                      <button class="btn xs primary" @click="openTprModal(app)">운송자 지정</button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <div></div>

    <!-- 거절 사유 입력 모달 (원래 디자인) -->
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
      <div v-if="isLoadingTprs" class="loading-container">
        <div class="loading-spinner">추천 운송자를 찾는 중...</div>
      </div>

      <div v-else class="shelter-list in-modal">
        <div v-if="recommendedTransporters.length === 0" class="no-shelters">
          추천 가능한 운송자가 없습니다.
        </div>

        <div v-else class="shelter-item" v-for="tpr in recommendedTransporters" :key="tpr.id">
          <div class="shelter-info">
            <strong>{{ tpr.storeName }}</strong>
            <small>{{ tpr.addr }}</small>
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
import { useApplicationsStore } from '@/stores/applications';
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

const applicationsStore = useApplicationsStore();
applicationsStore.init();

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

const excludedNames = ['유기동물입양센터', '반려동물복지문화센터'];

const condLabel = (c) => {
  const v = String(c || '').toUpperCase();
  if (v === 'NORMAL') return '정상';
  if (v === 'MILD') return '조금 아파요';
  if (v === 'SEVERE') return '많이 아파요';
  return v || '-';
};
const condClass = (c) => {
  const v = String(c || '').toUpperCase();
  if (v === 'NORMAL') return 'cond-normal';
  if (v === 'MILD') return 'cond-mild';
  if (v === 'SEVERE') return 'cond-severe';
  return 'cond-etc';
};
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
    console.log(sent.value);
  } catch (e) {
    console.error('[Mypage load error]', e);
    errorMsg.value = '내역을 불러오지 못했습니다.';
  } finally {
    loading.value = false;
  }
};

// helpers
const statusLabel = (s) => {
  switch (s) {
    case 'PENDING_TARGET':
      return '대기(타겟)';
    case 'TARGET_ACCEPTED':
      return '수락됨';
    case 'TARGET_REJECTED':
      return '거절됨';
    case 'PENDING_TRANSPORTER':
      return '대기(운송자)';
    case 'TRANSPORTER_ACCEPTED':
      return '운송 수락';
    case 'TRANSPORTER_REJECTED':
      return '운송 거절';
    default:
      return s || '-';
  }
};
const statusClass = (s) => {
  const v = String(s || '').toUpperCase();
  if (v.includes('REJECT')) return 'rejected';
  if (v.includes('ACCEPT')) return 'accepted';
  if (v.includes('PENDING')) return 'pending';
  return 'unknown';
};
const animalStatusOf = (app) =>
  app.animalStatus || app.rescuedStatus || app.rescuedState || app.healthStatus || '-';

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
  const meta = applicationsStore.getMetaByRescuedId(selectedApp.value.rescuedId);
  const fromShelterId = getShelterIdFromStorage();
  const toShelterId = meta?.toShelterId || null;
  if (!fromShelterId) return alert('보호소 ID를 찾을 수 없습니다.');
  if (!toShelterId) return alert('대상 보호소 ID를 찾을 수 없습니다.');
  if (!confirm(`'${tpr.storeName}'에게 운송을 신청하시겠습니까?`)) return;

  applyBusy.value = true;
  try {
    const payload = {
      transferRequestId: selectedApp.value.id,
      transporterId: tpr.id,
      fromShelterId,
      toShelterId,
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

const sentGroupA = computed(() =>
  sent.value.filter((app) => !excludedNames.includes(String(app.toShelterName || '').trim()))
);

const sentGroupB = computed(() =>
  sent.value.filter((app) => excludedNames.includes(String(app.toShelterName || '').trim()))
);
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
  margin: 0 0 8px 0;
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
.actions-inline {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 상태 뱃지 */
.status-badge {
  display: inline-block;
  padding: 3px 8px 5px 8px;
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

/* 버튼 */
.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #e5e7eb;
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
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 40px;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 16px;
}

.no-shelters {
  text-align: center;
  padding: 60px 40px;
  color: #666;
  font-size: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 16px;
}

.shelter-list.in-modal {
  padding: 8px 16px 16px 16px;
  max-height: 95%;
  overflow-y: auto;
}

.shelter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.shelter-item:hover {
  border-color: #ff385c;
  box-shadow: 0 4px 12px rgba(255, 56, 92, 0.1);
  transform: translateY(-2px);
}

.shelter-info strong {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.shelter-info small {
  display: block;
  color: #666;
  font-size: 14px;
}
.button-group {
  margin-left: 16px;
}

.apply-button {
  background: #ff385c;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.apply-button:hover {
  background: #e0324a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(224, 50, 74, 0.2);
}

.reason-inline {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.badge.tiny {
  padding: 2px 6px 4px 6px;
  font-size: 14px;
  border-radius: 6px;
  background: #dc2626;
  color: #fff;
  font-weight: 700;
}
.reason-text {
  color: #374151;
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
  margin-bottom: 17px;
}

.modal-textarea {
  width: 95%;
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
/* 동물 상태 뱃지 */
.cond-pill {
  display: inline-block;
  padding: 3px 8px 5px 8px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
}

/* 요청한 색상셋 */
.cond-normal {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}
.cond-mild {
  background: #fff8e1; /* 연한 노란색 배경 */
  color: #f57f17; /* 진한 노란-주황 텍스트 */
  border: 1px solid #ffe082; /* 옅은 노란색 테두리 */
}
.cond-severe {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}
</style>
