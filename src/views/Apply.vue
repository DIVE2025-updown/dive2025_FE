<template>
    <div class="main-container">
        <!-- 상단 필터바 - 전체 너비 -->
        <div class="top-filter-bar" v-if="!isApplying">
            <div class="filter-content">
                <div class="filter-left">
                    <button
                        class="filter-item"
                        @click="isFilterOpen = !isFilterOpen"
                    >
                        <i class="fa-solid fa-sliders"></i> 필터
                    </button>

                    <transition name="filter-fade">
                        <div class="other-filters" v-if="isFilterOpen">
                            <!-- 상태 기준 -->
                            <button
                                class="filter-item"
                                @click="toggleCondition('MILD')"
                                :class="{
                                    active: filters.conditions.includes('MILD'),
                                }"
                            >
                                경증
                            </button>
                            <button
                                class="filter-item"
                                @click="toggleCondition('SEVERE')"
                                :class="{
                                    active: filters.conditions.includes(
                                        'SEVERE'
                                    ),
                                }"
                            >
                                중증
                            </button>

                            <!-- 보호기간 기준 -->
                            <button
                                class="filter-item"
                                @click="applyPeriodFilter(3)"
                                :class="{
                                    active:
                                        filters.usePeriod &&
                                        filters.dueWithinDays === 3,
                                }"
                            >
                                3일 이내
                            </button>
                            <button
                                class="filter-item"
                                @click="applyPeriodFilter(0)"
                                :class="{
                                    active:
                                        filters.usePeriod &&
                                        filters.dueWithinDays === 0,
                                }"
                            >
                                경과
                            </button>

                            <!-- 정렬 버튼 (구분선 포함) -->
                            <div class="sort-divider"></div>
                            <button
                                class="filter-item sort-item"
                                @click="applySort('age')"
                                :class="{ active: filters.sort === 'age' }"
                            >
                                나이순
                                <i
                                    v-if="filters.sort === 'age'"
                                    :class="
                                        filters.order === 'asc'
                                            ? 'fa-solid fa-arrow-up'
                                            : 'fa-solid fa-arrow-down'
                                    "
                                ></i>
                            </button>

                            <button
                                class="filter-item sort-item"
                                @click="applySort('weight')"
                                :class="{ active: filters.sort === 'weight' }"
                            >
                                체중순
                                <i
                                    v-if="filters.sort === 'weight'"
                                    :class="
                                        filters.order === 'asc'
                                            ? 'fa-solid fa-arrow-up'
                                            : 'fa-solid fa-arrow-down'
                                    "
                                ></i>
                            </button>

                            <!-- 날짜 필터 -->
                            <div class="sort-divider"></div>
                            <div class="date-filter">
                                <label class="filter-label">날짜</label>
                                <input
                                    class="date-input"
                                    type="date"
                                    v-model="filters.date"
                                    @change="onDateChange"
                                />
                                <button
                                    class="filter-item"
                                    @click="setToday"
                                    :disabled="isTodaySelected"
                                >
                                    오늘
                                </button>
                                <button
                                    class="filter-item"
                                    @click="clearDate"
                                    :disabled="!filters.date"
                                >
                                    지우기
                                </button>
                            </div>
                        </div>
                    </transition>
                </div>

                <!-- 필터바 -->
                <button
                    class="filter-apply-cancel"
                    v-if="selectedImage && applicationMap[selectedImage]"
                    @click="
                        applicationsStore.cancelApplication(
                            applicationMap[selectedImage].id,
                            auth.shelterId
                        )
                    "
                >
                    이관 취소
                </button>

                <button
                    class="filter-apply"
                    v-else
                    @click="openModal"
                    :disabled="!selectedImage"
                >
                    이관 신청
                </button>
            </div>
        </div>

        <!-- 하단 컨텐츠 영역 -->
        <div class="content-container" v-if="!isApplying">
            <!-- 오른쪽 지도 -->
            <div class="map-container">
                <Map :centerCoords="{ lat: 35.1395543, lng: 129.0606416 }" />
            </div>
            <!-- 왼쪽 동물 리스트 -->
            <div class="animals-container">
                <!-- 선택된 기준 표시 영역 -->
                <!-- 선택된 기준 표시 영역 -->
                <transition
                    name="chip-slide-fade"
                    @enter="onEnter"
                    @after-enter="onAfterEnter"
                    @leave="onLeave"
                >
                    <div
                        v-if="
                            filters.conditions.length > 0 || filters.usePeriod
                        "
                        class="active-filters"
                    >
                        <span
                            v-for="cond in filters.conditions"
                            :key="cond"
                            class="chip"
                        >
                            {{
                                cond === 'MILD'
                                    ? '경증'
                                    : cond === 'SEVERE'
                                    ? '중증'
                                    : cond
                            }}
                            <i
                                class="fa-solid fa-xmark remove-chip"
                                @click="toggleCondition(cond)"
                            ></i>
                        </span>
                        <span
                            v-if="
                                filters.usePeriod && filters.dueWithinDays === 0
                            "
                            key="overdue"
                            class="chip"
                        >
                            보호기간 경과
                            <i
                                class="fa-solid fa-xmark remove-chip"
                                @click="clearPeriod"
                            ></i>
                        </span>
                        <span
                            v-if="
                                filters.usePeriod && filters.dueWithinDays === 3
                            "
                            key="dueSoon"
                            class="chip"
                        >
                            보호기간 3일 이내
                            <i
                                class="fa-solid fa-xmark remove-chip"
                                @click="clearPeriod"
                            ></i>
                        </span>
                        <span v-if="filters.date" class="chip">
                            {{ filters.date }}
                            <i
                                class="fa-solid fa-xmark remove-chip"
                                @click="clearDate"
                            ></i>
                        </span>
                    </div>
                </transition>
                <!-- 동물 리스트 상단 -->
                <span class="animals-header" v-html="headerText"></span>

                <!-- 이미지 리스트 -->
                <div class="image-list" @scroll.passive="handleScroll">
                    <div
                        class="image-item"
                        v-for="image in images"
                        :key="image.id"
                    >
                        <!-- 이미지 감싸는 wrapper -->
                        <div
                            class="image-wrapper"
                            :class="{ 'is-selected': isSelected(image.id) }"
                            @click="toggleSelect(image.id)"
                        >
                            <img
                                :src="image.imgUrl"
                                loading="lazy"
                                alt="동물 사진"
                                @error="onImgError($event)"
                            />
                            <div class="overlay"></div>
                            <div
                                class="tag-container"
                                :class="
                                    applicationMap[image.id]
                                        ? 'transfer-tag'
                                        : 'danger-tag'
                                "
                                v-if="
                                    image.needsTransfer ||
                                    applicationMap[image.id]
                                "
                            >
                                {{
                                    applicationMap[image.id]
                                        ? '이관 신청됨'
                                        : '위험 동물'
                                }}
                            </div>

                            <div class="checkbox-container">
                                <i
                                    v-if="isSelected(image.id)"
                                    class="fa-solid fa-circle-check checkbox-icon is-selected"
                                ></i>
                                <i
                                    v-else
                                    class="fa-regular fa-circle checkbox-icon"
                                ></i>
                            </div>
                        </div>

                        <!-- 이미지 밑에 나오는 정보 -->
                        <!-- 기존 info-box 교체 -->
                        <div class="info-box">
                            <div class="meta-top">
                                <!-- 컨디션 Pill (선택적) -->
                                <span
                                    class="cond-pill"
                                    :class="
                                        conditionClass(image.animalCondition)
                                    "
                                >
                                    {{ conditionLabel(image.animalCondition) }}
                                </span>
                            </div>

                            <p class="meta-line id-line">
                                공고번호 {{ image.desertionNo }}
                            </p>
                            <p class="meta-line sub-line">
                                {{ image.age }} · {{ image.weight }}
                            </p>
                            <p class="meta-line day-line">
                                보호
                                {{
                                    image.daysProtected ??
                                    daysSince(image.rescueDate)
                                }}일째
                            </p>
                        </div>
                    </div>

                    <!-- 로딩 표시 -->
                    <div v-if="isLoading" class="loading-spinner">
                        불러오는 중...
                    </div>
                    <div v-if="!hasMore" class="end-message">
                        마지막 동물까지 다 보셨어요 🐾
                    </div>
                </div>

                <!-- 선택 상태 표시 -->
                <div v-if="selectedImage" class="selected-indicator">
                    <i class="fa-solid fa-check-circle"></i>
                    선택됨
                </div>
            </div>
        </div>

        <!-- 모달 -->
        <RightModal
            v-if="isRightModalOpen"
            title="이관 신청 대상 선택"
            @close="closeModal"
        >
            <!-- 로딩 중일 때 -->
            <div v-if="isLoadingShelters" class="loading-container">
                <div class="loading-spinner">추천 보호소를 찾는 중...</div>
            </div>

            <!-- 로딩 완료 후 보호소 목록 -->
            <div v-else class="shelter-list in-modal">
                <div class="info">
                    <p class="info-content">
                        Paw-on은 친구들에게 <br />
                        가장 적합한 보호소를 추천해줘요!
                    </p>
                    <div class="explain">
                        <div class="explain-icon">💡</div>
                        <div class="explain-content">
                            <u>동물의 상태</u>에 맞는 보호소 중<br /><u
                                >가장 가까운 곳</u
                            >을 기준으로 추천해요!
                        </div>
                    </div>
                </div>
                <div
                    v-if="destinationShelters.length === 0"
                    class="no-shelters"
                >
                    추천 가능한 보호소가 없습니다.
                </div>
                <div
                    v-else
                    class="shelter-item"
                    v-for="shelter in destinationShelters"
                    :key="shelter.id"
                    @mouseover="getToShelterId(shelter.id)"
                    @mouseleave="clearHoveredShelter"
                >
                    <div class="count">
                        {{
                            rankLabel(destinationShelters.indexOf(shelter) + 1)
                        }}
                    </div>
                    <div class="shelter-info">
                        <strong>{{ shelter.description }}</strong>
                        <small
                            >{{
                                shelter.shelterFeature === 'HOSPITAL'
                                    ? '병원'
                                    : shelter.shelterFeature === 'VET'
                                    ? '수의원'
                                    : '일반보호소'
                            }}
                            | 거리: {{ shelter.distance.toFixed(1) }}km</small
                        >
                    </div>
                    <div class="button-group">
                        <button
                            class="apply-button"
                            @click="applyToShelterFromModal(shelter)"
                        >
                            신청
                        </button>
                    </div>
                </div>
            </div>
        </RightModal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Map from '@/views/Map.vue';
import { hoveredShelterId, useApplicationsStore } from '@/stores/applications';
import RightModal from '@/components/RightModal.vue';
import { fetchTransferCandidates } from '@/api/rescued';
import { getShelterPriority } from '@/api/shelter';
import { useAuthStore } from '@/stores/authStore';
import { filter } from 'lodash';
import { faWeight } from '@fortawesome/free-solid-svg-icons';

const auth = useAuthStore();
const isFilterOpen = ref(false);
const isApplying = ref(false);
const selectedImage = ref(null);
const isRightModalOpen = ref(false);
const isLoadingShelters = ref(false);
const destinationShelters = ref([]);
const images = ref([]);

const toShelterId = ref(null);
const fromShelterId = ref(null);

const getToShelterId = (id) => {
    console.log(id);
    toShelterId.value = id;
    hoveredShelterId.value = id;
};

const clearHoveredShelter = () => {
    hoveredShelterId.value = null;
};
const applicationsStore = useApplicationsStore();

const offset = ref(0);
const limit = 24;
const hasMore = ref(true);
const isLoading = ref(false);

const currentShelterName = computed(() => images.value[0]?.careNm ?? '');

const rankLabel = (n) => {
    if (n === 1) return '🥇';
    if (n === 2) return '🥈';
    if (n === 3) return '🥉';
    return String(n);
};
// ---------------------- 필터 상태 ----------------------
const filters = ref({
    conditions: [], // ['MILD','SEVERE']
    usePeriod: false,
    dueWithinDays: 0,
    useSeverity: false,
    sort: 'id',
    order: 'desc',
    date: '', //
});

const headerText = computed(() => {
    const shelter = currentShelterName.value || '';
    const count = images.value.length;

    if (count === 0) {
        return '조건에 맞는 동물이 없습니다 🐾';
    }

    const conds = filters.value.conditions.map((c) => {
        if (c === 'NORMAL') return '<span class="cond-normal">정상</span>';
        if (c === 'MILD') return '<span class="cond-mild-text">경증</span>';
        if (c === 'SEVERE') return '<span class="cond-severe-text">중증</span>';
        return c;
    });
    const condText = conds.length > 0 ? conds.join(', ') : '';

    let periodText = '';
    if (filters.value.usePeriod) {
        if (filters.value.dueWithinDays === 0)
            periodText = '<span class="period-overdue">보호기간 경과</span>';
        else if (filters.value.dueWithinDays === 3)
            periodText = '<span class="period-soon">보호기간 3일 이내</span>';
    }

    let criteria = '';
    if (condText && periodText) criteria = `${condText} · ${periodText}`;
    else if (condText) criteria = condText;
    else if (periodText) criteria = periodText;

    if (criteria) {
        return `현재 ${shelter}의 ${criteria} 동물 : <strong>${count}마리</strong>`;
    } else {
        return `현재 ${shelter}의 이관 대상 동물 : <strong>${count}마리</strong>`;
    }
});

// 컨디션 라벨 / 클래스
// 컨디션 라벨 / 클래스
const conditionLabel = (c) => {
    switch (c) {
        case 'NORMAL':
            return '정상';
        case 'MILD':
            return '조금 아파요';
        case 'SEVERE':
            return '많이 아파요';
        default:
            return '';
    }
};

const conditionClass = (c) => {
    switch (c) {
        case 'NORMAL':
            return 'cond-normal';
        case 'MILD':
            return 'cond-mild';
        case 'SEVERE':
            return 'cond-severe';
        default:
            return 'cond-etc';
    }
};

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
            ...(filters.value.conditions.length > 0 && {
                conditions: filters.value.conditions,
            }),
            ...(filters.value.date && { date: filters.value.date }),
        });

        const S3_BASE_URL =
            'https://paw-on.s3.ap-northeast-2.amazonaws.com/images';

        const newImages = data.map((animal) => ({
            id: animal.id || animal.desertionNo,
            imgUrl: `${S3_BASE_URL}/shelter${animal.shelterId}/${animal.desertionNo}.jpg`,
            careNm: animal.shelterName,
            needsTransfer: animal.needsTransfer,
            animalCondition: animal.animalCondition,
            desertionNo: animal.desertionNo,
            age: animal.age,
            weight: animal.weight,
            daysProtected: animal.daysProtected,
            rescueDate: animal.rescueDate,
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
        filters.value.conditions = filters.value.conditions.filter(
            (c) => c !== cond
        );
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
    const selectedAnimal = images.value.find(
        (img) => img.id === selectedImage.value
    );
    if (!selectedAnimal) return;

    isLoadingShelters.value = true;
    isRightModalOpen.value = true;

    try {
        const response = await getShelterPriority({
            animalCondition: selectedAnimal.animalCondition,
            longitude: selectedAnimal.longitude,
            latitude: selectedAnimal.latitude,
        });
        getShelterPriority;
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
    const selectedAnimal = images.value.find(
        (img) => img.id === selectedImage.value
    );
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

const applicationMap = computed(() => {
    const map = {};
    applicationsStore.sentRequests.forEach((req) => {
        map[req.rescuedId] = req.id; // rescuedId → transferRequestId
    });
    return map;
});

const onDateChange = () => {
    if (!filters.value.date) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(filters.value.date)) {
        alert('날짜 형식은 yyyy-MM-dd 이어야 해요');
        filters.value.date = '';
        return;
    }
    resetAndReload();
};

const setToday = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    filters.value.date = `${yyyy}-${mm}-${dd}`;
    resetAndReload();
};

const clearDate = () => {
    filters.value.date = '';
    resetAndReload();
};

const isTodaySelected = computed(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return filters.value.date === `${yyyy}-${mm}-${dd}`;
});

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

.filter-apply-cancel {
    background: #1d4ed8;
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
    flex: 1.1;
    height: 100%;
    margin: 16px;
    margin-left: 0; /* 왼쪽 여백 제거 */
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
}

.map-container :deep(.map) {
    width: 100%;
    height: 96%;
}

/* 동물 카드 그리드 */

.image-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    overflow-y: auto;
    flex-grow: 1;
    padding: 10px; /* ✅ padding 보정 */
    position: relative; /* ✅ position relative 추가 */
}

/* ✅ 선택 시 box-shadow 강조만 */
.image-item.is-selected {
    box-shadow: 0 0 0 3px #4caf50, 0 6px 16px rgba(0, 0, 0, 0.2);
    transform: scale(1.02);
}
.overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.12);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1; /* ⬅️ overlay는 아래 */
    pointer-events: none; /* ⬅️ 이벤트 차단 */
}

.checkbox-container {
    position: absolute;
    z-index: 2; /* ⬅️ overlay보다 높게 */
}

/* 공통 배지 스타일 (위치 + 공통 모양) */
.tag-container {
    position: absolute;
    z-index: 2;
    top: 6px;
    left: 6px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

/* 위험 동물 (빨강) */
.danger-tag {
    background-color: #ff4d4f;
}

/* 이관 신청됨 (파랑) */
.transfer-tag {
    background-color: #1d4ed8;
}

.image-wrapper:hover .overlay {
    opacity: 1;
}
.image-item:hover .overlay {
    opacity: 1;
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
    z-index: 50;
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
    margin: -10px 0 22px 10px; /* 위는 0, 아래는 살짝만 */
    min-height: 20px;
    padding: 0; /* 패딩 제거 */
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
    padding: 10px 16px;
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

.shelter-info {
    margin-right: auto;
}

.shelter-info strong {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
}

.shelter-info small {
    color: #666;
    font-size: 13px;
}

.button-group {
    margin-left: 16px;
}

.apply-button {
    background: #ff385c;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 5px 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 60px;
    margin-left: auto;
}

.apply-button:hover {
    background: #e0324a;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(224, 50, 74, 0.2);
}

.image-item {
    display: flex;
    flex-direction: column;
    gap: 8px; /* 사진과 텍스트 사이 여백 */
    background: transparent; /* 카드 배경 제거 */
    box-shadow: none; /* 카드 그림자 제거 */
    border-radius: 0; /* 라운드 제거 */
    overflow: visible;
}
/* ✅ 사진 영역 (2/3 비율) */
.image-wrapper {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08); /* 기본 그림자 */
    transition: box-shadow 0.2s ease, transform 0.2s ease;

    /* 모던 브라우저용 비율 고정 (Airbnb 느낌) */
    aspect-ratio: 1 / 1; /* 필요에 따라 3/2, 1/1로 조정 */
}

.image-wrapper img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}
.image-wrapper:hover img {
    transform: scale(1.03);
}
.image-wrapper.is-selected {
    box-shadow: 0 0 0 3px #4caf50, 0 8px 22px rgba(0, 0, 0, 0.14);
}

/* ✅ 사진에만 hover 효과 */
.image-wrapper:hover {
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.14); /* hover 시 사진만 강조 */
    transform: translateY(-2px);
}

/* ✅ 정보 영역 (1/3 비율) */
.info-box {
    padding: 0 2px; /* 살짝 좌우 여백만 */
    background: transparent; /* 배경 제거 */
    border-top: none; /* 테두리 제거 */
    text-align: left; /* Airbnb 느낌은 좌측 정렬 */
}

.animal-shelter {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 600;
    color: #222;
    line-height: 1.25;
}

.animal-id {
    margin: 0;
    font-size: 13px;
    color: #717171; /* 연한 회색 */
}

.meta-top {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
}

.meta-line {
    margin: 0;
    line-height: 1.35;
}

.id-line {
    font-size: 14px;
    font-weight: 600;
    color: #222;
}

.sub-line {
    font-size: 13px;
    color: #555;
}

.day-line {
    font-size: 13px;
    color: #717171;
}

/* 컨디션 Pill */
.cond-pill {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
}

/* ✅ 헤더 텍스트 색상 전용 */
.cond-mild-text {
    color: #f57f17; /* 노란-주황 */
    font-weight: 600;
}

.cond-severe-text {
    color: #c62828; /* 진한 빨강 */
    font-weight: 600;
}

.cond-etc {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
}

.id-line,
.sub-line {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.cond-normal {
    background: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #c8e6c9;
}
.cond-mild {
    background: #fff8e1; /* 연한 노란색 배경 */
    color: #f57f17; /* 진한 노란-주황 텍스트 */
    border: 1px solid #ffe082; /* 옅은 노란색 테두리 */
}
.cond-severe {
    background: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
}

.info-content {
    margin-top: -5px;
    text-align: center;
    font-weight: bold;
    font-size: 19px;
}

.explain {
    display: flex;
    flex-direction: row;
    border: 8px solid #ffffff;
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 14px;
    margin-bottom: 20px;
}
.explain-icon {
    margin-left: -5px;
    margin-right: 8px;
}
.count {
    font-size: 20px;
    margin-right: 30px;
}

.other-filters .date-filter {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}
.other-filters .date-input {
    padding: 6px 10px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    font-size: 13px;
}
.filter-label {
    font-size: 12px;
    color: #6b7280;
    margin-right: 4px;
}
</style>
