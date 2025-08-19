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
        <button class="filter-apply" @click="submit" :disabled="selectedImages.length === 0">
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
          <!-- 나중에 위험동물 v-if 추가 -->
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

    <div class="menu-container" v-else>
      <div class="application-container">
        <h2>이관 신청</h2>
        <div class="shelter-list">
          <div class="shelter-item" v-for="shelter in destinationShelters" :key="shelter.careNm">
            <span>{{ shelter.careNm }}</span>
            <div class="button-group">
              <button
                class="apply-button"
                @click="applyToShelter(shelter)"
                v-if="shelter.status === 'none'"
              >
                신청
              </button>
              <template v-else-if="shelter.status === 'applying'">
                <button class="status-button">신청중</button>
                <button class="cancel-button" @click="cancelApplication(shelter)">취소</button>
              </template>
            </div>
          </div>
        </div>

        <div class="received-applications-container">
          <h2>접수 내역</h2>
          <div class="shelter-list">
            <div
              class="shelter-item"
              v-for="shelter in applicationsStore.applications"
              :key="shelter.careNm"
            >
              <span>{{ shelter.careNm }}</span>
              <div class="button-group">
                <template v-if="shelter.status === 'pending'">
                  <button class="accept-button" @click="acceptApplication(shelter)">수락</button>
                  <button class="reject-button" @click="rejectApplication(shelter)">거절</button>
                </template>
                <template v-else-if="shelter.status === 'accepted'">
                  <span class="status-text accepted">수락됨</span>
                </template>
                <template v-else-if="shelter.status === 'rejected'">
                  <span class="status-text rejected">거절됨</span>
                </template>
              </div>
            </div>
          </div>
        </div>
        <button class="back-button" @click="isApplying = false">돌아가기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Map from '@/views/Map.vue';
import sampleImage from '@/assets/images/sample.png';
import { useApplicationsStore } from '@/stores/applications';

const isFilterOpen = ref(false);
const isApplying = ref(false);
const selectedImages = ref([]);
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

const submit = () => {
  if (selectedImages.value.length === 0) {
    return;
  }

  const currentShelter = images.value[0].careNm;

  destinationShelters.value = shelters.value
    .filter((shelter) => shelter.careNm !== currentShelter)
    .map((shelter) => ({ ...shelter, status: 'none' }));

  isApplying.value = true;
};

const applyToShelter = (shelter) => {
  shelter.status = 'applying';
  console.log(`'${shelter.careNm}' 보호소로 이관 신청 중...`);
};

const cancelApplication = (shelter) => {
  shelter.status = 'none';
  console.log(`'${shelter.careNm}' 보호소로의 신청이 취소되었습니다.`);
};

const acceptApplication = (app) => {
  app.status = 'accepted';
  console.log(`'${app.careNm}'의 신청을 수락했습니다.`);
};

const rejectApplication = (app) => {
  app.status = 'rejected';
  console.log(`'${app.careNm}'의 신청을 거절했습니다.`);
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

.application-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  padding: 20px;
  text-align: center;
}

.shelter-list {
  width: 100%;
  margin-top: 20px;
  flex-grow: 1;
  overflow-y: auto;
}

.shelter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  font-weight: bold;
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

.status-button {
  padding: 6px 12px;
  background-color: #ffc107;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.cancel-button {
  padding: 6px 12px;
  background-color: #dc3545;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.back-button {
  margin-top: auto;
  padding: 10px 20px;
  background-color: #000000;
  color: #fff;
  border: none;
  cursor: pointer;
}

.received-applications-container {
  width: 100%;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.accept-button {
  padding: 6px 12px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.reject-button {
  padding: 6px 12px;
  background-color: #dc3545;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}
</style>
