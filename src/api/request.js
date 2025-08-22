import api from './api';

export const fetchFromShelter = async (shelterId) => {
  const { data } = await api.get(`/tr-request/from-shelter`, {
    params: { shelterId },
  });
  return Array.isArray(data) ? data : [];
};

export const fetchToShelter = async (shelterId) => {
  const { data } = await api.get(`/tr-request/to-shelter`, {
    params: { shelterId },
  });
  return Array.isArray(data) ? data : [];
};

export const acceptTarget = async (trRequestId, message = '') => {
  const payload = {
    trRequestId,
    requestDecision: 'ACCEPTED',
    requestStatus: 'TARGET_ACCEPTED',
    message,
  };
  const { data } = await api.post('/tr-request/update', payload);
  return data;
};

export const rejectTarget = async (trRequestId, message = '') => {
  const payload = {
    trRequestId,
    requestDecision: 'REJECTED',
    requestStatus: 'TARGET_REJECTED',
    message,
  };
  const { data } = await api.post('/tr-request/update', payload);
  return data;
};

export const cancelMySentRequest = async (id) => {
  const { data } = await api.post('/tr-request/delete', null, { params: { id } });
  return data;
};

export const fetchTprReceived = async (transporterId) => {
  // 예: await api.get('/tpr-request/inbox', { params: { transporterId } });
  return [];
};

export const fetchTprSent = async (transporterId) => {
  // 예: await api.get('/tpr-request/outbox', { params: { transporterId } });
  return [];
};
