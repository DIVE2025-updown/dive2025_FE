<template>
  <div class="mypage">
    <header class="mypage-header">
      <h2>신청/접수 내역</h2>
    </header>

    <div class="stack">
      <section class="card">
        <h3 class="title">접수 내역</h3>
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

      <section class="card">
        <h3 class="title">신청 내역</h3>
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
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useApplicationsStore } from '@/stores/applications';

const store = useApplicationsStore();

const { sentApplications, receivedApplications } = storeToRefs(store);

const sent = sentApplications;
const received = receivedApplications;

// 액션 바인딩: 스토어 액션을 핸들러로 노출
const accept = (id) => store.accept(id); // 받은 접수 수락
const reject = (id) => store.reject(id); // 받은 접수 거절
const cancel = (id) => store.cancel(id); // 보낸 신청 취소

// 보낸 쪽 상태코드 → 한글 매핑
const mapSentStatus = (s) =>
  s === 'applying'
    ? '신청중'
    : s === 'accepted'
    ? '수락됨'
    : s === 'rejected'
    ? '거절됨'
    : '취소됨';

// 받은 쪽 상태코드 → 한글 매핑
const mapRecvStatus = (s) =>
  s === 'pending' ? '대기중' : s === 'accepted' ? '수락됨' : s === 'rejected' ? '거절됨' : '취소됨';
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
</style>
