<template>
  <div class="side-bar">
    <button @click="showLogin = true" class="icon">
      <i class="fa-solid fa-user"></i>
    </button>
    <RouterLink class="btn" to="/map">Map</RouterLink>
    <RouterLink class="btn apply-link" to="/apply"
      >Apply
      <span class="notification" v-if="applicationsStore.pendingCount > 0">{{
        applicationsStore.pendingCount
      }}</span>
    </RouterLink>
    <RouterLink class="btn" to="/stats">Stats</RouterLink>
    <RouterLink class="btn" to="/mypage">Mypage</RouterLink>
  </div>

  <LoginModal v-if="showLogin" @close="showLogin = false" @success="onLoginSuccess" />
</template>

<script setup>
import { ref } from 'vue';
import { useApplicationsStore } from '@/stores/applications';
import LoginModal from '@/components/Login.vue';

const applicationsStore = useApplicationsStore();

const showLogin = ref(false);

function onLoginSuccess(payload) {
  console.log('성공', payload);
  showLogin.value = false;
}
</script>

<style scoped>
.side-bar {
  display: flex;
  flex-direction: column;
  width: 160px;
  background: #f5f5f5;
  padding: 20px 0;
}
.btn {
  margin: 10px 0;
  padding: 12px;
  font-size: 16px;
  text-decoration: none;
  color: #111;
  border-radius: 8px;
  position: relative;
}
.btn:hover {
  background: #e0e0e0;
}
.router-link-active {
  background: #0ea5e9;
  color: #fff;
}
.apply-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.notification {
  color: black;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 12px;
  text-align: center;
  position: absolute;
  top: 10px;
  right: 12px;
}
</style>
