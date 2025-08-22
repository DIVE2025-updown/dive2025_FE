<template>
    <div class="list-container" @scroll.passive="handleScroll">
        <div v-for="image in images" :key="image.id" class="animal-card" @click="$emit('toggle', image.id)">
            <img :src="image.imgUrl" alt="동물 사진" />
            <div class="card-info">
                <strong>{{ image.careNm }}</strong>
                <p>
                    <b>{{ image.daysProtected }}</b
                    >일째 보호 중
                </p>
            </div>
            <span v-if="image.needsTransfer" class="danger-badge">위험 동물</span>
            <i v-if="selected.includes(image.id)" class="fa-solid fa-circle-check checkbox-icon is-selected"></i>
        </div>

        <!-- 로딩/마지막 -->
        <div v-if="isLoading" class="loading-spinner">불러오는 중...</div>
        <div v-if="!hasMore" class="end-message">마지막 동물까지 다 보셨어요 🐾</div>
    </div>
</template>

<script setup>
const props = defineProps({
    images: Array,
    selected: Array,
    isLoading: Boolean,
    hasMore: Boolean,
});
const emit = defineEmits(['toggle', 'loadMore']);

const handleScroll = (event) => {
    const el = event.target;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
        emit('loadMore');
    }
};
</script>

<style scoped>
.list-container {
    flex: 1;
    min-height: 0;
    height: 100%;
    overflow-y: auto;

    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 20px;
    background: #fafafa;
    box-sizing: border-box;
}

.animal-card {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background: #fff;
    cursor: pointer;
}
.animal-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}
.card-info {
    padding: 10px;
    font-size: 14px;
}
.card-info strong {
    display: block;
    font-size: 15px;
}
.card-info p {
    margin: 4px 0 0;
    color: #555;
}
.danger-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: #ff4d4f;
    color: #fff;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: bold;
}
.checkbox-icon {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 22px;
    color: #fff;
}
</style>
