import api from './api';

// ====================== 전체 보호소 관련 ======================

// 보호동물 목록 조회
export const fetchAnimals = (params) => api.get('/rescued/animals', { params });

// 특정 보호소 총 마릿수
export const fetchCountByShelter = (shelterId) => api.get(`/rescued/animals/countByShelterId/${shelterId}`);

// 등록번호별 총 마릿수
export const fetchCountByCareRegNo = (careRegNo) => api.get('/rescued/animals/countByCareRegNo', { params: { careRegNo } });

// 보호소별 동물 카운트 (대시보드)
export const fetchCountGroupByShelter = () => api.get('/rescued/animals/count-group');

// 특정 보호소 등록번호별 그룹 카운트
export const fetchCountByShelterGroupByCareRegNo = (shelterId) => api.get('/rescued/animals/count-group/care-reg', { params: { shelterId } });

// ====================== 내 보호소 전용 ======================

// 내 보호소 동물 목록
export const fetchMyAnimals = (params) => api.get('/rescued/myAnimalList', { params });

// 내 보호소 총 마릿수
export const fetchMyAnimalCount = () => api.get('/rescued/myAnimalList/count');

// 내 보호소 등록번호별 카운트
export const fetchMyCountByCareRegNo = () => api.get('/rescued/myAnimalCount/care-reg');

// 내 보호소 등록번호별 동물 리스트
export const fetchMyAnimalsGrouped = () => api.get('/rescued/myAnimalList/care-reg');

// ====================== 이관 후보 조회 ======================

// 이관 후보 동물 조회
export const fetchTransferCandidates = (params) => api.get('/rescued/transfer-candidates', { params });
