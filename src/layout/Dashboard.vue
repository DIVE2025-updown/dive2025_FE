<template>
    <div class="dashboard">
        <Header />
        <!-- 헤더 추가 -->
        <div class="content-wrapper">
            <Sidebar />
            <div class="main-content">
                <RouterView />
            </div>
        </div>
    </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/common/Header.vue'; // 추가
</script>

<style scoped>
.dashboard {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden; /* 전체 스크롤 방지 */
    position: fixed; /* ✅ 대시보드 자체를 고정 */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

/* ✅ 헤더 완전 고정 */
.dashboard :deep(.header) {
    position: absolute; /* fixed 대신 absolute 사용 */
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    z-index: 1000; /* 최상위 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* ✅ 컨텐츠 래퍼 - 헤더 아래 완전 고정 */
.content-wrapper {
    position: absolute; /* ✅ 절대 위치로 고정 */
    top: 60px; /* 헤더 바로 아래 */
    left: 0;
    right: 0;
    bottom: 0; /* 화면 하단까지 */
    display: flex;
    overflow: hidden; /* 스크롤 완전 차단 */
}

/* ✅ 사이드바 - 내부에서만 스크롤 */
.content-wrapper :deep(.sidebar) {
    width: 220px;
    background: #f8f9fa;
    border-right: 1px solid #e5e7eb;
    overflow-y: auto; /* 사이드바만 스크롤 */
    overflow-x: hidden;
    height: 100%;
    flex-shrink: 0; /* 사이드바 크기 고정 */
}

/* ✅ 메인 콘텐츠 - 스크롤 없음 */
.main-content {
    flex: 1;
    background: #fff;
    overflow: hidden; /* 메인 콘텐츠 스크롤 방지 */
    height: 100%;
}

/* ✅ 전체 body 스크롤도 방지 */
:global(html, body) {
    overflow: hidden !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
}
</style>
