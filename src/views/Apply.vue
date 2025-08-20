<template>
  <div class="main-container">
    <Map :centerCoords="{ lat: 35.154914, lng: 128.8 }" />

    <div class="menu-container" v-if="!isApplying">
      <div class="filter-bar">
        <button class="filter-item" @click="isFilterOpen = !isFilterOpen">
          <i class="fa-solid fa-sliders"></i> 필터
        </button>

        <transition name="filter-fade">
          <div class="other-filters" v-if="isFilterOpen">
            <button class="filter-item">
              <i class="fa-solid fa-arrow-down-wide-short"></i> 정렬
            </button>
            <button class="filter-item"><i class="fa-solid fa-stethoscope"></i> 아파요</button>
            <button class="filter-item"><i class="fa-solid fa-truck-medical"></i> 위험 동물</button>
          </div>
        </transition>

        <button class="filter-apply" @click="openModal" :disabled="selectedImages.length === 0">
          이관 신청
        </button>
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
          <div class="danger-tag-container">
            <span>위험 동물</span>
          </div>
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

    <RightModal v-if="isRightModalOpen" title="이관 신청 대상 선택" @close="closeModal">
      <div class="shelter-list in-modal">
        <div class="shelter-item" v-for="shelter in destinationShelters" :key="shelter.careNm">
          <div class="shelter-info">
            <strong>{{ shelter.careNm }}</strong>
            <small>{{ shelter.careAddr }}</small>
          </div>
          <div class="button-group">
            <button class="apply-button" @click="applyToShelterFromModal(shelter)">신청</button>
          </div>
        </div>
      </div>
    </RightModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Map from '@/views/Map.vue';
import sampleImage from '@/assets/images/sample.png';
import { useApplicationsStore } from '@/stores/applications';
import RightModal from '@/components/RightModal.vue';

const isFilterOpen = ref(false);
const isApplying = ref(false);
const selectedImages = ref([]);
const isRightModalOpen = ref(false);
const destinationShelters = ref([]);

const applicationsStore = useApplicationsStore();

const shelters = ref([
  {
    careNm: '부산동물보호센터',
    careAddr: '부산광역시 강서구 맥도강변길 752-15(대저2동)',
    lat: '35.151443',
    lng: '128.93962',
    careTel: '051-832-7119',
    city: '중, 서, 영도, 북',
  },
  {
    careNm: '(사)유기동물 및 동물보호관리협회',
    careAddr: '부산광역시 강서구 가락대로1283번길25-2(봉림동)',
    lat: '35.17892661',
    lng: '128.8997584',
    careTel: '051-971-6208',
    city: '부산진',
  },
  {
    careNm: '누리동물병원',
    careAddr: '부산광역시 해운대구 송정2로 13번길 46(송정동)',
    lat: '35.19480798',
    lng: '129.2063205',
    careTel: '051-701-7599',
    city: '해운대, 수영, 동래, 남, 금정, 기장군',
  },
  {
    careNm: '청조동물병원',
    careAddr: '부산광역시 연제구 온천천남로 4(연산동) 영대빌딩 3층',
    lat: '35.19296227',
    lng: '129.091273',
    careTel: '051-503-0688',
    city: '연제',
  },
  {
    careNm: '하얀비둘기',
    careAddr: '부산광역시 강서구 제도로 726(강동동)',
    lat: '35.17721265',
    lng: '128.9167344',
    careTel: '051-293-9779',
    city: '사하, 강서, 사상',
  },
  {
    careNm: '동구종합동물병원',
    careAddr: '부산광역시 동구 망양로 835-1',
    lat: '35.135833',
    lng: '129.045556',
    careTel: '051-441-6383',
    city: '동',
  },
]);

const images = ref([
  { id: 1, src: sampleImage, careNm: '부산동물보호센터' },
  { id: 2, src: sampleImage, careNm: '부산동물보호센터' },
  { id: 3, src: sampleImage, careNm: '부산동물보호센터' },
  { id: 4, src: sampleImage, careNm: '부산동물보호센터' },
  { id: 5, src: sampleImage, careNm: '부산동물보호센터' },
  { id: 6, src: sampleImage, careNm: '부산동물보호센터' },
  { id: 7, src: sampleImage, careNm: '부산동물보호센터' },
  { id: 8, src: sampleImage, careNm: '부산동물보호센터' },
  { id: 9, src: sampleImage, careNm: '부산동물보호센터' },
  { id: 10, src: sampleImage, careNm: '부산동물보호센터' },
  { id: 11, src: sampleImage, careNm: '부산동물보호센터' },
  { id: 12, src: sampleImage, careNm: '부산동물보호센터' },
  { id: 13, src: sampleImage, careNm: '부산동물보호센터' },
  { id: 14, src: sampleImage, careNm: '부산동물보호센터' },
]);

const currentShelterName = computed(() => images.value[0]?.careNm ?? '');

const toggleSelect = (id) => {
  const idx = selectedImages.value.indexOf(id);
  if (idx === -1) selectedImages.value.push(id);
  else selectedImages.value.splice(idx, 1);
};

const isSelected = (id) => selectedImages.value.includes(id);

const openModal = () => {
  destinationShelters.value = shelters.value.filter((s) => s.careNm !== currentShelterName.value);
  isRightModalOpen.value = true;
};

const closeModal = () => {
  isRightModalOpen.value = false;
};

const applyToShelterFromModal = (targetShelter) => {
  const payload = {
    fromShelter: currentShelterName.value,
    toShelter: targetShelter.careNm,
    animalIds: [...selectedImages.value],
  };
  applicationsStore.sendApplication(payload);
  closeModal();
  selectedImages.value = [];
  console.log(`'${targetShelter.careNm}'로 이관 신청 완료`);
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
  padding: 10px;
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
.filter-apply {
  margin-left: auto;
  margin-right: 10px;
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
.danger-tag-container {
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 1;
  background-color: #ff4d4f;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
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

.shelter-list.in-modal {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 120px);
  overflow: auto;
}
.shelter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.shelter-info {
  display: flex;
  flex-direction: column;
  text-align: left;
  gap: 2px;
}
.apply-button {
  padding: 6px 12px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
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
