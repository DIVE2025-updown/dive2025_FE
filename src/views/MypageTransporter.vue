<template>
  <div class="mypage">
    <header class="mypage-header">
      <h2>운송 신청/접수 내역</h2>
    </header>

    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
    <div v-if="loading" class="loading">불러오는 중...</div>

    <div class="stack" v-else>
      <!-- 받은 접수(운송 의뢰가 내게 들어온 것) -->
      <section class="card">
        <h3 class="title">접수 내역</h3>
        <div v-if="received.length === 0" class="empty">받은 접수가 없습니다.</div>
        <ul v-else class="list">
          <li v-for="app in received" :key="app.id" class="item">
            <div class="col">
              <strong>← {{ app.fromShelterName || app.fromShelterId || app.fromName }}</strong>
              <small>동물: #{{ app.rescuedId }}</small>
              <small>{{ app.createdAt }}</small>
              <small>상태: {{ app.requestStatus }}</small>
            </div>

            <!-- 운송쪽 액션은 나중에 정의 -->
            <div class="actions" v-if="false">
              <button class="btn primary">수락</button>
              <button class="btn danger">거절</button>
            </div>
          </li>
        </ul>
      </section>

      <!-- 보낸 신청(내가 타 운송사/보호소로 보낸 의뢰) -->
      <section class="card">
        <h3 class="title">신청 내역</h3>
        <div v-if="sent.length === 0" class="empty">보낸 신청이 없습니다.</div>
        <ul v-else class="list">
          <li v-for="app in sent" :key="app.id" class="item">
            <div class="col">
              <strong>→ {{ app.toShelterName || app.toShelterId || app.toName }}</strong>
              <small>동물: #{{ app.rescuedId }}</small>
              <small>{{ app.createdAt }}</small>
              <small>상태: {{ app.requestStatus }}</small>

              <div v-if="app.requestStatus?.includes('REJECTED')" class="reject-reason">
                <span class="badge">거절 사유</span>
                <p class="reason-text">{{ app.message?.trim() || '사유 없음' }}</p>
              </div>
            </div>

            <!-- 운송쪽 취소/변경은 나중에 정의 -->
            <div class="actions" v-if="false">
              <button class="btn danger">취소하기</button>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { fetchTprReceived, fetchTprSent } from '@/api/request';

const auth = useAuthStore();
const received = ref([]);
const sent = ref([]);

const loading = ref(false);
const errorMsg = ref('');

const refresh = async () => {
  const transporterId =
    auth.transporterId || JSON.parse(localStorage.getItem('auth:data') || '{}')?.transporterId;
  if (!transporterId) {
    errorMsg.value = '운송업자 ID를 찾을 수 없습니다.';
    return;
  }
  loading.value = true;
  errorMsg.value = '';
  try {
    const [rec, snt] = await Promise.all([
      fetchTprReceived(transporterId),
      fetchTprSent(transporterId),
    ]);
    received.value = Array.isArray(rec) ? rec : [];
    sent.value = Array.isArray(snt) ? snt : [];
  } catch (e) {
    console.error('[TPR mypage load error]', e);
    errorMsg.value = '내역을 불러오지 못했습니다.';
  } finally {
    loading.value = false;
  }
};

onMounted(refresh);
</script>

<style scoped>
/* Shelter와 같은 스타일 사용 */
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
</style>
