<template>
    <div class="user-profile">
        <img :src="user.imageUrl" alt="Profile" class="avatar" />
        <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-role">{{ user.role }}</span>
        </div>
        <span class="dropdown-icon">⌄</span>
    </div>
</template>

<script setup>
import { reactive } from 'vue';

// 임시 유저 데이터 (나중에 store에서 가져오면 됨)
const user = reactive({
    name: '부산동물보호협회',
    role: 'Shelter',
    imageUrl: 'https://i.pravatar.cc/40', // 샘플 이미지 (랜덤 아바타)
});
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
    cursor: pointer;
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

.dropdown-icon {
    font-size: 14px;
    color: #555;
}
</style>
