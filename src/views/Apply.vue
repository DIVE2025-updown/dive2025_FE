<template>
  <div class="main-container">
    <Map :centerCoords="{ lat: 35.154914, lng: 128.8 }" />
    <div class="menu-container">
      <div class="filter-bar">
        <button class="filter-item" @click="isFilterOpen = !isFilterOpen">
          <i class="fa-solid fa-sliders"></i> 필터
        </button>

        <transition name="filter-fade">
          <div class="other-filters" v-if="isFilterOpen">
            <button class="filter-item">
              <i class="fa-solid fa-arrow-down-wide-short"></i> 정렬
            </button>
            <button class="filter-item"><i class="fa-solid fa-house-medical"></i> 아파요</button>
            <button class="filter-item"><i class="fa-solid fa-stethoscope"></i> 아파요</button>
            <button class="filter-item"><i class="fa-solid fa-truck-medical"></i> 아파요</button>
            <button class="filter-item"><i class="fa-solid fa-syringe"></i> 아파요</button>
          </div>
        </transition>
      </div>
      <div class="image-list">
        <div
          class="image-item"
          v-for="image in images"
          :key="image.id"
          @click="toggleSelect(image.id)"
        >
          <img :src="image.src" alt="Sample Image" />
          <div class="overlay"></div>
          <div class="checkbox-container">
            <i
              v-if="isSelected(image.id)"
              class="fa-solid fa-circle-check checkbox-icon is-selected"
            ></i>
            <i v-else class="fa-regular fa-circle checkbox-icon"></i>
          </div>
        </div>
      </div>
      <div class="selected-count">{{ selectedImages.length }}마리 선택됨</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Map from '@/views/Map.vue';
import sampleImage from '@/assets/images/sample.png';

const isFilterOpen = ref(false);

const images = ref([
  { id: 1, src: sampleImage },
  { id: 2, src: sampleImage },
  { id: 3, src: sampleImage },
  { id: 4, src: sampleImage },
  { id: 5, src: sampleImage },
  { id: 6, src: sampleImage },
  { id: 7, src: sampleImage },
  { id: 8, src: sampleImage },
  { id: 9, src: sampleImage },
  { id: 10, src: sampleImage },
  { id: 11, src: sampleImage },
  { id: 12, src: sampleImage },
  { id: 13, src: sampleImage },
  { id: 14, src: sampleImage },
]);

const selectedImages = ref([]);

// 이미지 선택
const toggleSelect = (id) => {
  const index = selectedImages.value.indexOf(id);
  if (index === -1) {
    selectedImages.value.push(id);
  } else {
    selectedImages.value.splice(index, 1);
  }
  console.log('Selected Images:', selectedImages.value);
};

const isSelected = (id) => {
  return selectedImages.value.includes(id);
};
</script>

<style scoped>
.main-container {
  position: relative;
  width: 100%;
  height: 97vh;
}

.menu-container {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: 600px;
  height: 100%;
  background-color: #f0f2f5;
  padding: 10px 10px -10px 10px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.filter-bar {
  display: flex;
  flex-direction: row;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
  margin-bottom: 10px;
  margin-left: 10px;
}

.filter-item {
  margin-top: 5px;
  margin-right: 10px;
  padding: 4px 8px;
}

.filter-fade-enter-from,
.filter-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.filter-fade-enter-active,
.filter-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.image-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  overflow-y: auto;
}

.image-item {
  position: relative;
  width: 100%;
  padding-top: 100%;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}

.image-item img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-item:hover img {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-item:hover .overlay {
  opacity: 1;
}

.checkbox-container {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 1;
}
.checkbox-icon {
  font-size: 24px;
  transition: color 0.2s ease-in-out;
}

.fa-circle-check.is-selected {
  color: #ffffff;
}
.fa-circle {
  color: #ffffff;
}

.selected-count {
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  pointer-events: none;
}
</style>
