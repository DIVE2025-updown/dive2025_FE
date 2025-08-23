<template>
  <Teleport to="body">
    <div class="modal-overlay" role="presentation">
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <div class="modal-header">
          <h2 id="login-title" class="modal-title">로그인</h2>
          <button class="icon-btn" @click="close()" aria-label="닫기">✕</button>
        </div>

        <form class="modal-body" @submit.prevent="submit()">
          <label class="input-label" for="login-username">아이디</label>
          <input
            id="login-username"
            ref="usernameInput"
            v-model.trim="form.username"
            type="text"
            class="input"
            placeholder="아이디를 입력하세요"
            autocomplete="username"
            required
          />

          <label class="input-label" for="login-password">비밀번호</label>
          <input
            id="login-password"
            v-model.trim="form.password"
            :type="showPw ? 'text' : 'password'"
            class="input"
            placeholder="비밀번호를 입력하세요"
            autocomplete="current-password"
            required
          />

          <label class="showPW">
            <input type="checkbox" v-model="showPw" />
            비밀번호 표시
          </label>

          <button type="submit" class="primary-btn" :disabled="loading">
            {{ loading ? '로그인 중...' : '로그인' }}
          </button>

          <div class="bottom-links">
            <!-- <RouterLink class="link" to="/signup">회원가입</RouterLink>
            <span class="divider">|</span>
            <RouterLink class="link" to="/find-id">아이디 찾기</RouterLink>
            <span class="divider">|</span>
            <RouterLink class="link" to="/find-password">비밀번호 찾기</RouterLink> -->
            <button class="link">회원가입</button>
            <button class="link">아이디 찾기</button>
            <button class="link">비밀번호 찾기</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const auth = useAuthStore();
const emit = defineEmits(['close', 'success']);

const form = ref({
  username: '',
  password: '',
});

const loading = ref(false);
const showPw = ref(false);

const usernameInput = ref(null);

const onKeydown = (e) => {
  if (e.key === 'Escape') close();
};

onMounted(() => {
  usernameInput.value?.focus();
  document.body.style.overflow = 'hidden';
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  window.removeEventListener('keydown', onKeydown);
});

const close = () => {
  emit('close');
};

const submit = async () => {
  if (!form.value.username || !form.value.password) return;
  loading.value = true;
  try {
    const res = await auth.login(form.value.username, form.value.password);
    if (res.ok) {
      emit('success', { username: auth.username, role: auth.role });
      close();
    }
    window.location.href = '/';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
}

.modal-dialog {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid #eee;
}
.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}
.icon-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
}
.input-label {
  font-size: 13px;
  color: #555;
}
.input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}
.input:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
}
.showPW {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #555;
}

.primary-btn {
  margin-top: 8px;
  width: 100%;
  padding: 10px 12px;
  background: #0ea5e9;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}
.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.bottom-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 4px;
}
.link {
  color: #ffffff;
  background: #0ea5e9;
  border: #ffffff;
  border-radius: 8px;
  padding: 3px 8px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
}
.link:hover {
  text-decoration: underline;
}
.divider {
  color: #bbb;
}
</style>
