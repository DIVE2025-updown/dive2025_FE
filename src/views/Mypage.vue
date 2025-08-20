<template>
  <!-- 마이페이지 메인 컨테이너 -->
  <div class="mypage">
    <!-- 헤더 -->
    <header class="mypage-header">
      <h2>신청/접수 내역</h2>
    </header>

    <!-- 컨텐츠 2열: 내가 보낸 신청 / 내가 받은 접수 -->
    <div class="grid">
      <!-- 내가 보낸 신청 -->
      <section class="card">
        <h3>내가 보낸 신청</h3>
        <div v-if="sent.length === 0" class="empty">보낸 신청이 없습니다.</div>
        <ul v-else class="list">
          <li v-for="app in sent" :key="app.id" class="item">
            <div class="col">
              <strong>→ {{ app.toShelter }}</strong>
              <small>동물: {{ app.animalIds.join(', ') }}</small>
              <small>{{ new Date(app.createdAt).toLocaleString() }}</small>
            </div>
            <div class="col status">{{ mapSentStatus(app.status) }}</div>
            <div class="col actions">
              <button v-if="app.status === 'applying'" class="btn danger" @click="cancel(app.id)">
                취소
              </button>
            </div>
          </li>
        </ul>
      </section>

      <!-- 내가 받은 접수 -->
      <section class="card">
        <h3>나에게 들어온 접수</h3>
        <div v-if="received.length === 0" class="empty">받은 접수가 없습니다.</div>
        <ul v-else class="list">
          <li v-for="app in received" :key="app.id" class="item">
            <div class="col">
              <strong>← {{ app.fromShelter }}</strong>
              <small>동물: {{ app.animalIds.join(', ') }}</small>
              <small>{{ new Date(app.createdAt).toLocaleString() }}</small>
            </div>
            <div class="col status">{{ mapRecvStatus(app.status) }}</div>
            <div class="col actions">
              <template v-if="app.status === 'pending'">
                <button class="btn primary" @click="accept(app.id)">수락</button>
                <button class="btn danger" @click="reject(app.id)">거절</button>
              </template>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
// Pinia store 임포트
import { storeToRefs } from 'pinia';
import { useApplicationsStore } from '@/stores/applications';

// Store 인스턴스
const store = useApplicationsStore();
// 반응형 참조로 변환
const { sentApplications, receivedApplications } = storeToRefs(store);

// 템플릿에서 사용할 계산값
const sent = sentApplications;
const received = receivedApplications;

// 액션 바인딩
const accept = (id) => store.accept(id);
const reject = (id) => store.reject(id);
const cancel = (id) => store.cancel(id);

// 상태 텍스트 매핑(한글)
const mapSentStatus = (s) =>
  s === 'applying'
    ? '신청중'
    : s === 'accepted'
    ? '수락됨'
    : s === 'rejected'
    ? '거절됨'
    : '취소됨';

const mapRecvStatus = (s) =>
  s === 'pending' ? '대기중' : s === 'accepted' ? '수락됨' : s === 'rejected' ? '거절됨' : '취소됨';
</script>

<style scoped>
.mypage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
.mypage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 16px;
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
  grid-template-columns: 1fr auto auto;
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
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
