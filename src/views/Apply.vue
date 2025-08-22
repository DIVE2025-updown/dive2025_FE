<template>
    <div class="main-container">
        <!-- 상단 필터바 - 전체 너비 -->
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

                            <!-- 정렬 버튼 (구분선 포함) -->
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

        <!-- 하단 컨텐츠 영역 -->
        <div class="content-container" v-if="!isApplying">
            <!-- 왼쪽 동물 리스트 -->
            <div class="animals-container">
                <!-- 선택된 기준 표시 영역 -->
                <!-- 선택된 기준 표시 영역 -->
                <transition name="chip-slide-fade" @enter="onEnter" @after-enter="onAfterEnter" @leave="onLeave">
                    <div v-if="filters.conditions.length > 0 || filters.usePeriod" class="active-filters">
                        <span v-for="cond in filters.conditions" :key="cond" class="chip">
                            {{ cond === 'MILD' ? '경증' : cond === 'SEVERE' ? '중증' : cond }}
                            <i class="fa-solid fa-xmark remove-chip" @click="toggleCondition(cond)"></i>
                        </span>
                        <span v-if="filters.usePeriod && filters.dueWithinDays === 0" key="overdue" class="chip">
                            보호기간 경과
                            <i class="fa-solid fa-xmark remove-chip" @click="clearPeriod"></i>
                        </span>
                        <span v-if="filters.usePeriod && filters.dueWithinDays === 3" key="dueSoon" class="chip">
                            보호기간 3일 이내
                            <i class="fa-solid fa-xmark remove-chip" @click="clearPeriod"></i>
                        </span>
                    </div>
                </transition>
                <!-- 동물 리스트 상단 -->
                <span class="animals-header">이관 대상 동물 {{ images.length }}마리</span>

                <!-- 이미지 리스트 -->
                <div class="image-list" @scroll.passive="handleScroll">
                    <div class="image-item" v-for="image in images" :key="image.id" :class="{ 'is-selected': isSelected(image.id) }" @click="toggleSelect(image.id)">
                        <!-- 이미지 감싸는 wrapper -->
                        <div class="image-wrapper">
                            <img :src="image.imgUrl" loading="lazy" alt="동물 사진" @error="onImgError($event)" />
                            <div class="overlay"></div>
                            <div class="danger-tag-container" v-if="image.needsTransfer">위험 동물</div>
                            <div class="checkbox-container">
                                <i v-if="isSelected(image.id)" class="fa-solid fa-circle-check checkbox-icon is-selected"></i>
                                <i v-else class="fa-regular fa-circle checkbox-icon"></i>
                            </div>
                        </div>

                        <!-- 이미지 밑에 나오는 정보 -->
                        <div class="info-box">
                            <p class="animal-shelter">{{ image.careNm }}</p>
                            <p class="animal-id">#{{ image.id }}</p>
                        </div>
                    </div>

                    <!-- 로딩 표시 -->
                    <div v-if="isLoading" class="loading-spinner">불러오는 중...</div>
                    <div v-if="!hasMore" class="end-message">마지막 동물까지 다 보셨어요 🐾</div>
                </div>

                <!-- 선택 상태 표시 -->
                <div v-if="selectedImage" class="selected-indicator">
                    <i class="fa-solid fa-check-circle"></i>
                    선택됨
                </div>
            </div>

            <!-- 오른쪽 지도 -->
            <div class="map-container">
                <Map :centerCoords="{ lat: 35.154914, lng: 128.8 }" />
            </div>
        </div>

        <!-- 모달 -->
        <RightModal v-if="isRightModalOpen" title="이관 신청 대상 선택" @close="closeModal">
            <!-- 로딩 중일 때 -->
            <div v-if="isLoadingShelters" class="loading-container">
                <div class="loading-spinner">추천 보호소를 찾는 중...</div>
            </div>

            <!-- 로딩 완료 후 보호소 목록 -->
            <div v-else class="shelter-list in-modal">
                <div v-if="destinationShelters.length === 0" class="no-shelters">추천 가능한 보호소가 없습니다.</div>
                <div v-else class="shelter-item" v-for="shelter in destinationShelters" :key="shelter.id">
                    <div class="shelter-info">
                        <strong>{{ shelter.description }}</strong>
                        <small
                            >{{ shelter.shelterFeature === 'HOSPITAL' ? '병원' : shelter.shelterFeature === 'VET' ? '수의원' : '일반보호소' }} | 거리:
                            {{ shelter.distance.toFixed(1) }}km</small
                        >
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
import { ref, computed, onMounted } from 'vue';
import Map from '@/views/Map.vue';
import { useApplicationsStore } from '@/stores/applications';
import RightModal from '@/components/RightModal.vue';
import { fetchTransferCandidates } from '@/api/rescued';
import { getShelterPriority } from '@/api/shelter';
import { useAuthStore } from '@/stores/authStore';
import { filter } from 'lodash';

const auth = useAuthStore();
const isFilterOpen = ref(false);
const isApplying = ref(false);
const selectedImage = ref(null);
const isRightModalOpen = ref(false);
const isLoadingShelters = ref(false);
const destinationShelters = ref([]);
const images = ref([]);

const applicationsStore = useApplicationsStore();

const offset = ref(0);
const limit = 24;
const hasMore = ref(true);
const isLoading = ref(false);

const currentShelterName = computed(() => images.value[0]?.careNm ?? '');

// ---------------------- 필터 상태 ----------------------
const filters = ref({
    conditions: [], // ['MILD','SEVERE']
    usePeriod: false,
    dueWithinDays: 0,
    useSeverity: false,
    sort: 'id',
    order: 'desc',
});

// ---------------------- API 호출 ----------------------
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
            useSeverity: filters.value.useSeverity,
            ...(filters.value.conditions.length > 0 && { conditions: filters.value.conditions }),
        });

        const S3_BASE_URL = 'https://paw-on.s3.ap-northeast-2.amazonaws.com/images';

        const newImages = data.map((animal) => ({
            id: animal.id || animal.desertionNo,
            imgUrl: `${S3_BASE_URL}/shelter${animal.shelterId}/${animal.desertionNo}.jpg`,
            careNm: animal.shelterName,
            needsTransfer: animal.needsTransfer,
            animalCondition: animal.animalCondition,
            latitude: animal.latitude,
            longitude: animal.longitude,
        }));

        if (newImages.length < limit) {
            hasMore.value = false;
        }

        images.value.push(...newImages);
        offset.value += limit;
    } catch (err) {
        console.error('이관 후보 불러오기 실패:', err);
    } finally {
        isLoading.value = false;
    }
};

// 스크롤 이벤트 핸들러
const handleScroll = (event) => {
    const el = event.target;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
        loadTransferCandidates();
    }
};

// ✅ 필터 함수들
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
    filters.value.dueWithinDays = days; // n일 이내 or 0 → 경과
    resetAndReload();
};

// clearPeriod 함수 추가 (칩에서 X 버튼 클릭 시)
const clearPeriod = () => {
    filters.value.usePeriod = false;
    filters.value.dueWithinDays = 0;
    resetAndReload();
};

// script setup 안에
const onEnter = (el) => {
    el.style.height = '0';
    el.style.opacity = '0';
    requestAnimationFrame(() => {
        el.style.transition = 'all 0.3s ease';
        el.style.height = el.scrollHeight + 'px';
        el.style.opacity = '1';
    });
};
const onAfterEnter = (el) => {
    el.style.height = 'auto';
};
const onLeave = (el) => {
    el.style.height = el.scrollHeight + 'px';
    el.style.opacity = '1';
    requestAnimationFrame(() => {
        el.style.transition = 'all 0.3s ease';
        el.style.height = '0';
        el.style.opacity = '0';
    });
};

// toggleSelect 함수 수정
const toggleSelect = (id) => {
    if (selectedImage.value === id) {
        selectedImage.value = null; // 이미 선택된 것을 다시 클릭하면 해제
    } else {
        selectedImage.value = id; // 새로운 것 선택
    }
};

// isSelected 함수 수정
const isSelected = (id) => selectedImage.value === id;

const openModal = async () => {
    if (!selectedImage.value) return;

    // 선택된 동물의 정보 찾기
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

        console.log('전체 API 응답:', response);
        destinationShelters.value = response.data || response;
    } catch (error) {
        console.error('추천 보호소 조회 실패:', error);
        destinationShelters.value = [];
    } finally {
        isLoadingShelters.value = false;
    }
};

const closeModal = () => {
    isRightModalOpen.value = false;
};

const applyToShelterFromModal = async (targetShelter) => {
    const selectedAnimal = images.value.find((img) => img.id === selectedImage.value);
    if (!selectedAnimal) return;

    const payload = {
        rescuedId: selectedAnimal.id, // 동물 id
        fromShelterId: auth.shelterId, // 로그인 보호소 id
        toShelterId: targetShelter.id, // 모달에서 선택한 보호소 id
    };

    try {
        await applicationsStore.sendApplication(payload, auth.shelterId);
        console.log(`'${targetShelter.description}'로 이관 신청 완료`);
    } catch (err) {
        console.error('이관 신청 실패:', err);
    } finally {
        closeModal();
        selectedImage.value = null;
    }
};

// ✅ 이미지 fallback
const onImgError = (e) => {
    e.target.src = '/fallback.jpg';
};

// 최초 로드
onMounted(() => {
    loadTransferCandidates();
    applicationsStore.fetchSentRequests(auth.shelterId);
});
</script>

<style scoped>
.main-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f8f9fa;
    /* 사이드바가 있는 경우를 고려한 여백 */
    margin-left: 0; /* 사이드바 너비만큼 조정 가능 */
}

/* ✅ 상단 필터바 - 사이드바 고려한 전체 너비 */
.top-filter-bar {
    width: 100%-220px;
    background: #fff;
    padding: 12px 15px;
    border-bottom: 1px solid #ddd;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    z-index: 20;
    height: 35px;
}

.filter-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.filter-left {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.other-filters {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 8px;
}

.filter-item {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 16px;
    background: #fff;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.filter-item:hover {
    background: #f7f7f7;
    border-color: #ccc;
}

.filter-item.active {
    background-color: #ff385c;
    color: #fff;
    border-color: #ff385c;
    transform: scale(1.02);
}

.filter-apply {
    background: #ff385c;
    color: #fff;
    border: none;
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    margin-right: 20px;
}

.filter-apply:hover {
    background: #e0324a;
}

.filter-apply:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.sort-divider {
    width: 1px;
    height: 20px;
    background-color: #ddd;
    margin: 0 6px;
}

.sort-item {
    color: #666;
    border-color: #ccc;
}

/* 선택된 조건 칩 */

.chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    background-color: #f0f0f0;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.chip:hover {
    background-color: #e6e6e6;
}

.remove-chip {
    margin-left: 4px;
    cursor: pointer;
    font-size: 10px;
    color: #888;
}

/* ✅ 하단 컨텐츠 영역 - 좌우 분할 */
.content-container {
    flex: 1;
    display: flex;
    min-height: 0;
    background: #fff;
    gap: 20px; /* 리스트와 지도 사이 여백 */
    padding: 16px; /* 전체 안쪽 여백 */
    box-sizing: border-box;
}

.animals-header {
    font-size: 15px; /* 글자 크기 */
    font-weight: 500; /* 굵기 */
    color: #666; /* 색상 */
    margin-left: 8px; /* 좌측 여백 */
    margin-bottom: 5px;
}

/* 왼쪽 동물 리스트 영역 */
.animals-container {
    flex: 1.1;
    width: 600px;
    height: 100%;
    /* background: #f8f9fa; */
    background: #fff;
    display: flex;
    flex-direction: column;
    position: relative;
    margin: 10px; /* 상단 여백 */
}

/* 오른쪽 지도 영역 */
.map-container {
    flex: 0.9;
    height: 100%;
    margin: 16px;
    margin-left: 0; /* 왼쪽 여백 제거 */
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.map-container :deep(.map) {
    width: 100%;
    height: 100%;
}

/* 동물 카드 그리드 */
/* 동물 카드 */
.image-item {
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
    cursor: pointer;
}
.image-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    overflow-y: auto;
    flex-grow: 1;
    padding: 10px; /* ✅ padding 보정 */
    /* margin-top: 8px; */
}
.image-item {
    position: relative;
    width: 100%;
    padding-top: 100%;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    background: #fff;
    cursor: pointer;
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
.image-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
}
.image-item:hover img {
    transform: scale(1.05);
}
/* ✅ 선택 시 box-shadow 강조만 */
.image-item.is-selected {
    box-shadow: 0 0 0 3px #4caf50, 0 6px 16px rgba(0, 0, 0, 0.2);
    transform: scale(1.02);
}
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
.image-item:hover .overlay {
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
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
.checkbox-container {
    position: absolute;
    top: 8px;
    right: 8px;
}
.checkbox-icon {
    font-size: 22px;
}
.fa-circle-check.is-selected {
    color: #4caf50;
    background-color: #fff;
    border-radius: 50%;
    padding: 2px;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
}
.fa-circle {
    color: rgba(255, 255, 255, 0.6);
}
.loading-spinner,
.end-message {
    grid-column: span 3;
    text-align: center;
    padding: 10px;
    color: #666;
}

.selected-indicator {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #4caf50;
    color: #fff;
    padding: 10px 20px;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
    z-index: 10;
}

/* 애니메이션 */
.filter-fade-enter-active,
.filter-fade-leave-active {
    transition: all 0.3s ease;
}

.filter-fade-enter-from,
.filter-fade-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}

/* 선택된 조건 칩 */
.active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 4px 0; /* 위아래 여백 최소화 */
    margin-left: 15px; /* 왼쪽만 살짝 띄우기 */
    min-height: 20px;
    /* margin-top: 10px; */
    margin-bottom: 8px;
    padding: 8px 0; /* 위아래 패딩 추가 */
}

.chip {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    background-color: #f0f0f0;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.chip:hover {
    background-color: #e6e6e6;
}

.remove-chip {
    margin-left: 6px;
    cursor: pointer;
    font-size: 12px;
    color: #888;
}

/* 칩 애니메이션 */
.chip-fade-enter-active,
.chip-fade-leave-active {
    transition: all 0.3s ease;
}
.chip-fade-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}
.chip-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.chip-fade-enter-active,
.chip-fade-leave-active {
    transition: all 0.3s ease;
}

.chip-fade-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.chip-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
.chip-slide-fade-enter-active,
.chip-slide-fade-leave-active {
    transition: all 0.35s ease; /* 부드럽게 */
}

.chip-slide-fade-enter-from,
.chip-slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px); /* 위에서 슬라이드 */
    max-height: 0;
}

.chip-slide-fade-enter-to,
.chip-slide-fade-leave-from {
    opacity: 1;
    transform: translateY(0);
    max-height: 100px; /* 충분히 큰 값 */
}

/* 모달 관련 스타일 */
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 60px 40px;
    background: #f8f9fa;
    border-radius: 12px;
    margin: 16px;
}

.no-shelters {
    text-align: center;
    padding: 60px 40px;
    color: #666;
    font-size: 16px;
    background: #f8f9fa;
    border-radius: 12px;
    margin: 16px;
}

.shelter-list.in-modal {
    padding: 8px 16px 16px 16px;
    max-height: 500px;
    overflow-y: auto;
}

.shelter-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    margin-bottom: 12px;
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.shelter-item:hover {
    border-color: #ff385c;
    box-shadow: 0 4px 12px rgba(255, 56, 92, 0.1);
    transform: translateY(-2px);
}

.shelter-info strong {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
}

.shelter-info small {
    color: #666;
    font-size: 14px;
}

.button-group {
    margin-left: 16px;
}

.apply-button {
    background: #ff385c;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 80px;
}

.apply-button:hover {
    background: #e0324a;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(224, 50, 74, 0.2);
}
</style>
