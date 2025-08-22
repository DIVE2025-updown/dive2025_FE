// src/api/tr-request.js
import api from './api';

// 이관 신청 저장
export const saveTransferRequest = (payload) => {
    return api.post('/tr-request/save', payload);
};

// 이관 신청 수정
export const updateTransferRequest = (payload) => {
    return api.post('/tr-request/update', payload);
};

// 이관 신청 삭제
export const deleteTransferRequest = (id) => {
    return api.post('/tr-request/delete', null, { params: { id } });
};

// 특정 보호소 → 보낸 이관 요청 조회
export const getRequestsFromShelter = (shelterId) => {
    return api.get('/tr-request/from-shelter', { params: { shelterId } });
};

// 특정 보호소 ← 받은 이관 요청 조회
export const getRequestsToShelter = (shelterId) => {
    return api.get('/tr-request/to-shelter', { params: { shelterId } });
};
