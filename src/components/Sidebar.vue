<template>
    <aside class="sidebar">
        <!-- 상단 로고 -->
        <div class="logo">
            <i class="fa-solid fa-paw logo-icon"></i>
            <span class="logo-text">PAW-ON</span>
        </div>

        <!-- 네비게이션 메뉴 -->
        <nav class="menu">
            <RouterLink class="menu-item" to="/map">
                <i class="fa-solid fa-map menu-icon"></i>
                <span>지도</span>
            </RouterLink>

            <RouterLink class="menu-item apply-link" to="/apply">
                <i class="fa-solid fa-file-alt menu-icon"></i>
                <span>신청</span>
                <span class="notification" v-if="applicationsStore.pendingCount > 0">
                    {{ applicationsStore.pendingCount }}
                </span>
            </RouterLink>

            <RouterLink class="menu-item" to="/stats">
                <i class="fa-solid fa-chart-pie menu-icon"></i>
                <span>통계</span>
            </RouterLink>

            <RouterLink class="menu-item" to="/mypage">
                <i class="fa-solid fa-user-circle menu-icon"></i>
                <span>마이페이지</span>
            </RouterLink>
        </nav>

        <!-- 하단 (설정 / 로그아웃) -->
        <div class="bottom-menu">
            <!-- 로그아웃 -->
            <button class="menu-item logout-btn" @click="handleLogout" v-if="auth.isAuthenticated">
                <i class="fa-solid fa-sign-out-alt menu-icon"></i>
                <span>로그아웃</span>
            </button>

            <!-- 로그인 -->
            <button class="menu-item login-btn" @click="showLogin = true" v-else>
                <i class="fa-solid fa-sign-in-alt menu-icon"></i>
                <span>로그인</span>
            </button>

            <!-- 설정 -->
            <RouterLink class="menu-item" to="/settings">
                <i class="fa-solid fa-cog menu-icon"></i>
                <span>설정</span>
            </RouterLink>
        </div>

        <!-- 로그인 모달 -->
        <LoginModal v-if="showLogin" @close="showLogin = false" @success="onLoginSuccess" />

        <!-- 로그아웃 알림 모달 -->
        <div v-if="showLogoutModal" class="logout-modal">
            <div class="logout-modal-content">
                <div class="logo">
                    <i class="fa-solid fa-paw logo-icon"></i>
                    <span class="logo-text">PAW-ON</span>
                </div>
                <p>로그아웃 되었습니다.</p>
                <button @click="showLogoutModal = false" class="close-btn">확인</button>
            </div>
        </div>
    </aside>
</template>

<script setup>
import { ref } from 'vue';
import { useApplicationsStore } from '@/stores/applications';
import { useAuthStore } from '@/stores/authStore';
import LoginModal from '@/components/Login.vue';

const applicationsStore = useApplicationsStore();
const auth = useAuthStore();

const showLogin = ref(false);
const showLogoutModal = ref(false);

function handleLogout() {
    auth.logout();
    showLogoutModal.value = true; // 로그아웃 모달 열기
}

function onLoginSuccess(payload) {
    console.log('로그인 성공:', payload);
    showLogin.value = false;
}
</script>

<style scoped>
.sidebar {
    width: 220px;
    background: #fff;
    border-right: 1px solid #eee;
    height: calc(100vh - 60px); /* 헤더 높이 제외 */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

/* 상단 로고 */
.logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 18px;
    padding: 20px;
    border-bottom: 1px solid #eee;
    color: #0ea5e9;
}
.logo-icon {
    font-size: 20px;
}
.logo-text {
    font-family: 'Poppins', sans-serif;
}

/* 메뉴 */
.menu {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    margin-top: 20px;
}
.menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    color: #444;
    text-decoration: none;
    font-size: 15px;
    border-right: 3px solid transparent;
    transition: all 0.2s ease;
    position: relative;
}
.menu-item:hover {
    background: #f3f9ff;
    color: #0ea5e9;
}
.router-link-active {
    background: #e6f4ff;
    border-right: 3px solid #0ea5e9;
    color: #0ea5e9;
    font-weight: 600;
}
.menu-icon {
    font-size: 16px;
}

/* 알림 뱃지 */
.notification {
    background: #ff4d4f;
    color: white;
    font-size: 12px;
    font-weight: bold;
    padding: 2px 8px;
    border-radius: 12px;
    min-width: 20px;
    text-align: center;
    position: absolute;
    top: 8px;
    right: 14px;
}

/* 하단 메뉴 */
.bottom-menu {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
}
.logout-btn,
.login-btn {
    background: transparent;
    border: none;
    width: 100%;
    text-align: left;
    padding: 12px 20px;
    cursor: pointer;
    color: #444;
    font-size: 15px;
    display: flex;
    align-items: center;
    gap: 12px;
}
.logout-btn:hover {
    background: #ffecec;
    color: #e11d48;
}
.login-btn:hover {
    background: #f3f9ff;
    color: #0ea5e9;
}

/* 로그아웃 모달 */
.logout-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}
.logout-modal-content {
    background: #fff;
    padding: 20px 30px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    min-width: 300px;
}
.logout-modal .logo {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    color: #0ea5e9;
    font-weight: 700;
    margin-bottom: 12px;
}
.logout-modal p {
    margin: 10px 0 20px;
    font-size: 15px;
    color: #333;
}
.close-btn {
    background: #0ea5e9;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}
.close-btn:hover {
    background: #0284c7;
}
</style>
