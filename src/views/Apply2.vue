<template>
    <div class="main-container">
        <!-- 상단 필터바 -->
        <div class="top-filter-bar" v-if="!isApplying">
            <div class="filter-content">
                <div class="filter-left">
                    <button class="filter-item" @click="isFilterOpen = !isFilterOpen"><i class="fa-solid fa-sliders"></i> 필터</button>

                    <transition name="filter-fade">
                        <div class="other-filters" v-if="isFilterOpen">
                            <!-- 상태 기준 -->
                            <button class="filter-item" @click="toggleCondition('MILD')" :class="{ active: filters.conditions.includes('MILD') }">경증</button>
                            <button class="filter-item" @click="toggleCondition('SEVERE')" :class="{ active: filters.conditions.includes('SEVERE') }">중증</button>

                            <!-- 보호기간 기준 -->
                            <button class="filter-item" @click="applyPeriodFilter(3)" :class="{ active: filters.usePeriod && filters.dueWithinDays === 3 }">3일 이내</button>
                            <button class="filter-item" @click="applyPeriodFilter(0)" :class="{ active: filters.usePeriod && filters.dueWithinDays === 0 }">경과</button>

                            <!-- 정렬 -->
                            <div class="sort-divider"></div>
                            <button class="filter-item sort-item" @click="applySort('age')" :class="{ active: filters.sort === 'age' }">
                                나이순
                                <i v-if="filters.sort === 'age'" :class="filters.order === 'asc' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'"></i>
                            </button>
                            <button class="filter-item sort-item" @click="applySort('weight')" :class="{ active: filters.sort === 'weight' }">
                                체중순
                                <i v-if="filters.sort === 'weight'" :class="filters.order === 'asc' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'"></i>
                            </button>
                        </div>
                    </transition>
                </div>

                <button class="filter-apply" @click="openModal" :disabled="!selectedImage">이관 신청</button>
            </div>
        </div>

        <!-- 메인 컨텐츠 -->
        <div class="content-container" v-if="!isApplying">
            <!-- 왼쪽 동물 리스트 -->
            <div class="animals-container">
                <!-- 필터칩 -->
                <transition name="chip-slide-fade">
                    <div v-if="filters.conditions.length > 0 || filters.usePeriod" class="active-filters">
                        <span v-for="cond in filters.conditions" :key="cond" class="chip">
                            {{ cond === 'MILD' ? '경증' : '중증' }}
                            <i class="fa-solid fa-xmark remove-chip" @click="toggleCondition(cond)"></i>
                        </span>
                        <span v-if="filters.usePeriod && filters.dueWithinDays === 0" class="chip">
                            보호기간 경과
                            <i class="fa-solid fa-xmark remove-chip" @click="clearPeriod"></i>
                        </span>
                        <span v-if="filters.usePeriod && filters.dueWithinDays === 3" class="chip">
                            보호기간 3일 이내
                            <i class="fa-solid fa-xmark remove-chip" @click="clearPeriod"></i>
                        </span>
                    </div>
                </transition>

                <span class="animals-header">이관 대상 동물 {{ images.length }}마리</span>

                <!-- 동물 카드 리스트 -->
                <div class="image-list" @scroll.passive="handleScroll">
                    <div v-for="image in images" :key="image.id" class="image-item">
                        <div class="image-wrapper" :class="{ 'is-selected': isSelected(image.id) }" @click="toggleSelect(image.id)">
                            <img :src="image.imgUrl" alt="동물 사진" @error="onImgError" />
                            <div class="overlay"></div>
                            <div class="danger-tag-container" v-if="image.needsTransfer">위험 동물</div>
                            <div class="checkbox-container">
                                <i v-if="isSelected(image.id)" class="fa-solid fa-circle-check checkbox-icon is-selected"></i>
                                <i v-else class="fa-regular fa-circle checkbox-icon"></i>
                            </div>
                        </div>

                        <div class="info-box">
                            <p class="animal-id">#{{ image.desertionNo }}</p>
                            <p class="animal-detail">체중: {{ image.weight }}kg</p>
                            <p class="animal-detail">나이: {{ image.age }}</p>
                            <p class="animal-detail">구조일: {{ image.noticeEdt }}</p>
                        </div>
                    </div>
                </div>

                <!-- 선택 표시 -->
                <div v-if="selectedImage" class="selected-indicator"><i class="fa-solid fa-check-circle"></i> 선택됨</div>
            </div>

            <!-- 지도 -->
            <div class="map-container">
                <Map :centerCoords="{ lat: 35.154914, lng: 128.8 }" />
            </div>
        </div>

        <!-- ✅ 이관신청 모달 -->
        <RightModal v-if="isRightModalOpen" title="이관 신청 대상 선택" @close="closeModal">
            <!-- 로딩 중 -->
            <div v-if="isLoadingShelters" class="loading-container">
                <div class="loading-spinner">추천 보호소를 찾는 중...</div>
            </div>

            <!-- 보호소 목록 -->
            <div v-else class="shelter-list in-modal">
                <div v-if="destinationShelters.length === 0" class="no-shelters">추천 가능한 보호소가 없습니다.</div>
                <div v-else class="shelter-item" v-for="shelter in destinationShelters" :key="shelter.id">
                    <div class="shelter-info">
                        <strong>{{ shelter.description }}</strong>
                        <small>
                            {{ shelter.shelterFeature === 'HOSPITAL' ? '병원' : shelter.shelterFeature === 'VET' ? '수의원' : '일반보호소' }}
                            | 거리: {{ shelter.distance.toFixed(1) }}km
                        </small>
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
import { ref, onMounted, computed } from 'vue';
import Map from '@/views/Map.vue';
import RightModal from '@/components/RightModal.vue';
import { fetchTransferCandidates } from '@/api/rescued';
import { getShelterPriority } from '@/api/shelter';
import { useAuthStore } from '@/stores/authStore';
import { useApplicationsStore } from '@/stores/applications';

const auth = useAuthStore();
const applicationsStore = useApplicationsStore();

const isFilterOpen = ref(false);
const isApplying = ref(false);
const selectedImage = ref(null);

const isRightModalOpen = ref(false);
const isLoadingShelters = ref(false);
const destinationShelters = ref([]);

const images = ref([]);
const offset = ref(0);
const limit = 24;
const hasMore = ref(true);
const isLoading = ref(false);

const currentShelterName = computed(() => images.value[0]?.careNm ?? '');

const filters = ref({
    conditions: [],
    usePeriod: false,
    dueWithinDays: 0,
    sort: 'id',
    order: 'desc',
});

// API 불러오기
const loadTransferCandidates = async () => {
    if (isLoading.value || !hasMore.value) return;
    isLoading.value = true;
    try {
        const { data } = await fetchTransferCandidates({
            shelterId: auth.shelterId,
            offset: offset.value,
            limit,
            sort: filters.value.sort,
            order: filters.value.order,
            usePeriod: filters.value.usePeriod,
            dueWithinDays: filters.value.dueWithinDays,
            ...(filters.value.conditions.length > 0 && { conditions: filters.value.conditions }),
        });

        const S3_BASE_URL = 'https://paw-on.s3.ap-northeast-2.amazonaws.com/images';

        const newImages = data.map((animal) => ({
            id: animal.id || animal.desertionNo,
            imgUrl: `${S3_BASE_URL}/shelter${animal.shelterId}/${animal.desertionNo}.jpg`,
            desertionNo: animal.desertionNo,
            weight: animal.weight,
            age: animal.age,
            noticeEdt: animal.noticeEdt,
            careNm: animal.shelterName,
            needsTransfer: animal.needsTransfer,
            animalCondition: animal.animalCondition,
            latitude: animal.latitude,
            longitude: animal.longitude,
        }));

        if (newImages.length < limit) hasMore.value = false;
        images.value.push(...newImages);
        offset.value += limit;
    } catch (err) {
        console.error('이관 후보 불러오기 실패:', err);
    } finally {
        isLoading.value = false;
    }
};

// 스크롤 이벤트
const handleScroll = (event) => {
    const el = event.target;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
        loadTransferCandidates();
    }
};

// 필터 관련 함수
const resetAndReload = () => {
    images.value = [];
    offset.value = 0;
    hasMore.value = true;
    loadTransferCandidates();
};
const toggleCondition = (cond) => {
    if (filters.value.conditions.includes(cond)) {
        filters.value.conditions = filters.value.conditions.filter((c) => c !== cond);
    } else {
        filters.value.conditions.push(cond);
    }
    resetAndReload();
};
const applySort = (key) => {
    filters.value.sort = key;
    filters.value.order = filters.value.order === 'asc' ? 'desc' : 'asc';
    resetAndReload();
};
const applyPeriodFilter = (days) => {
    filters.value.usePeriod = true;
    filters.value.dueWithinDays = days;
    resetAndReload();
};
const clearPeriod = () => {
    filters.value.usePeriod = false;
    filters.value.dueWithinDays = 0;
    resetAndReload();
};

// 선택 관련
const toggleSelect = (id) => {
    selectedImage.value = selectedImage.value === id ? null : id;
};
const isSelected = (id) => selectedImage.value === id;

// 모달 관련
const openModal = async () => {
    if (!selectedImage.value) return;
    const selectedAnimal = images.value.find((img) => img.id === selectedImage.value);
    if (!selectedAnimal) return;

    isLoadingShelters.value = true;
    isRightModalOpen.value = true;

    try {
        const response = await getShelterPriority({
            animalCondition: selectedAnimal.animalCondition,
            longitude: selectedAnimal.longitude,
            latitude: selectedAnimal.latitude,
        });
        destinationShelters.value = response.data || response;
    } catch (error) {
        console.error('추천 보호소 조회 실패:', error);
        destinationShelters.value = [];
    } finally {
        isLoadingShelters.value = false;
    }
};
const closeModal = () => (isRightModalOpen.value = false);
const applyToShelterFromModal = (targetShelter) => {
    const payload = {
        fromShelter: currentShelterName.value,
        toShelter: targetShelter.description,
        animalIds: [selectedImage.value],
    };
    applicationsStore.sendApplication(payload);
    closeModal();
    selectedImage.value = null;
};

// 이미지 에러
const onImgError = (e) => (e.target.src = '/fallback.jpg');

onMounted(() => loadTransferCandidates());
</script>

<style scoped>
/* 전체 레이아웃 */
.main-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f8f9fa;
}

/* 필터바 */
.top-filter-bar {
    background: #fff;
    padding: 12px 15px;
    border-bottom: 1px solid #ddd;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    z-index: 20;
    height: 45px;
}
.filter-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.filter-item {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 16px;
    background: #fff;
    cursor: pointer;
    font-size: 13px;
    margin-right: 6px;
}
.filter-item.active {
    background-color: #ff385c;
    color: #fff;
    border-color: #ff385c;
}
.filter-apply {
    background: #ff385c;
    color: #fff;
    border: none;
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 13px;
    cursor: pointer;
}
.filter-apply:disabled {
    background: #ccc;
    cursor: not-allowed;
}

/* 메인 컨텐츠 */
.content-container {
    flex: 1;
    display: flex;
    background: #fff;
    gap: 20px;
    padding: 16px;
    box-sizing: border-box;
}
.animals-container {
    flex: 1.1;
    display: flex;
    flex-direction: column;
    position: relative;
}
.animals-header {
    font-size: 15px;
    font-weight: 500;
    color: #666;
    margin: 8px 0;
}
.map-container {
    flex: 0.9;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 카드 리스트 */
.image-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    overflow-y: auto;
    flex-grow: 1;
    padding: 10px;
}
.image-item {
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}
.image-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
}

/* hover 효과 */
.image-wrapper:hover img {
    transform: scale(1.05);
}

/* 선택 효과 (사진만) */
.image-wrapper.is-selected {
    box-shadow: 0 0 0 3px #4caf50 inset;
    transform: scale(1.02);
}

/* 오버레이, 태그, 체크 */
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.15);
    opacity: 0;
    transition: opacity 0.3s ease;
}
.image-wrapper:hover .overlay {
    opacity: 1;
}
.danger-tag-container {
    position: absolute;
    top: 6px;
    left: 6px;
    background-color: #ff4d4f;
    color: #fff;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
}
.checkbox-container {
    position: absolute;
    top: 8px;
    right: 8px;
}
.checkbox-icon {
    font-size: 22px;
    color: white;
}
.fa-circle-check.is-selected {
    color: #4caf50;
    background-color: #fff;
    border-radius: 50%;
}

/* info box */
.info-box {
    padding: 8px 10px;
    font-size: 13px;
    color: #333;
    border-top: 1px solid #eee;
}
.animal-id {
    font-weight: bold;
}
.animal-detail {
    font-size: 12px;
    color: #666;
}
</style>
