// main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { useAuthStore } from '@/stores/authStore'; // ✅ 추가

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);

// ✅ 앱 시작 시 저장된 로그인 상태 복원
const auth = useAuthStore();
auth.hydrate();

app.mount('#app');
