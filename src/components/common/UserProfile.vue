<template>
    <!-- 로그인된 상태 -->
    <div class="user-profile" v-if="auth.isAuthenticated">
        <img :src="avatarUrl" :alt="displayRole" class="avatar" />
        <div class="user-info">
            <span class="user-name">{{ auth.username }}</span>
            <span class="user-role">{{ displayRole }}</span>
        </div>
    </div>

    <!-- 비로그인 상태 -->
    <div v-else class="user-profile">
        <span class="login-link" @click="auth.showLoginModal = true">로그인</span>
        <!-- 로그인 모달 -->
        <LoginModal v-if="auth.showLoginModal" @close="auth.showLoginModal = false" @success="onLoginSuccess" />
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import LoginModal from '@/components/Login.vue';

const auth = useAuthStore();

const displayRole = computed(() => {
    if (auth.stype === 'SHELTER') return '동물보호센터';
    if (auth.stype === 'TRANSPORTER') return '운송자';
    return '사용자';
});

/** 역할별 기본 아바타(원하면 경로만 바꿔) */
const shelterAvatar = new URL('@/assets/images/Shelter.png', import.meta.url).href;
const transporterAvatar = new URL('@/assets/images/Transporter.png', import.meta.url).href;
const defaultAvatar = 'https://i.pravatar.cc/40';

/** 실제 표시할 아바타: 사용자 업로드 > 역할별 기본 > 디폴트 */
const avatarUrl = computed(() => {
    if (auth.profileImageUrl) return auth.profileImageUrl;
    if (auth.stype === 'SHELTER') return shelterAvatar;
    if (auth.stype === 'TRANSPORTER') return transporterAvatar;
    return defaultAvatar;
});

function onLoginSuccess() {
    auth.showLoginModal = false;
}
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
