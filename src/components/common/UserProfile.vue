<template>
    <!-- 로그인된 상태 -->
    <div class="user-profile" v-if="auth.isAuthenticated">
        <img :src="user.imageUrl" alt="Profile" class="avatar" />
        <div class="user-info">
            <span class="user-name">{{ auth.username }}</span>
            <span class="user-role">{{ displayRole }}</span>
        </div>
        <!-- 로그아웃 버튼 제거 -->
    </div>

    <!-- 비로그인 상태 -->
    <div v-else class="user-profile">
        <span class="login-link" @click="showLogin = true">로그인</span>
        <!-- 로그인 모달 -->
        <LoginModal v-if="showLogin" @close="showLogin = false" @success="onLoginSuccess" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import LoginModal from '@/components/Login.vue';

const auth = useAuthStore();
const showLogin = ref(false);

// role 변환
const displayRole = computed(() => {
    if (auth.stype === 'SHELTER') return '동물보호센터';
    if (auth.stype === 'TRANSPORTER') return '운송자';
    return '사용자';
});

// 기본 프로필 이미지
const user = {
    imageUrl: 'https://i.pravatar.cc/40',
};

// 로그인 성공 후
const onLoginSuccess = () => {
    showLogin.value = false;
};
</script>

<style scoped>
.user-profile {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid #ddd;
}
.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}
.user-info {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
}
.user-name {
    font-weight: bold;
    font-size: 14px;
    color: #333;
}
.user-role {
    font-size: 12px;
    color: #777;
}
.login-link {
    font-size: 14px;
    font-weight: 600;
    color: #0ea5e9;
    cursor: pointer;
}
.login-link:hover {
    text-decoration: underline;
}
</style>
