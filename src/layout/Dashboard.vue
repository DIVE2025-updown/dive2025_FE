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
    flex-direction: column; /* 헤더 위에 배치 */
    height: 100vh;
    overflow: hidden; /* 스크롤바 숨김 */
}

.content-wrapper {
    display: flex;
    flex: 1;
    overflow: hidden;
    margin-top: 60px; /* 헤더 높이만큼 여백 추가 */
    overflow: hidden; /* 스크롤바 숨김 */
}

.main-content {
    flex: 1;
    background: #fff;
    overflow-y: auto;
}
</style>
