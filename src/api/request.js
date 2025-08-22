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

// GET + querystring
export const recommendTransporters = async (params) => {
  const { data } = await api.get('/transport/recommend-transporter', { params });
  return Array.isArray(data) ? data : [];
};

export const saveTransportRequest = async (payload) => {
  const { data } = await api.post('/transport/save', payload);
  return data;
};

export const fetchTprAll = async (transporterId) => {
  const { data } = await api.get('/transport/get-all', { params: { id: transporterId } });
  return Array.isArray(data) ? data : [];
};

export const cancelTransportRequest = async (id) => {
  const { data } = await api.post('/transport/delete', null, { params: { id } });
  return data;
};

export const acceptTransport = async ({ id, trRequestId, message = '' }) => {
  const payload = {
    id,
    transferRequestId: trRequestId,
    decisionStatus: 'ACCEPT',
    message,
  };
  const { data } = await api.post('/transport/update', payload);
  return data;
};

export const rejectTransport = async ({ id, trRequestId, message = '' }) => {
  const payload = {
    id,
    transferRequestId: trRequestId,
    decisionStatus: 'REJECT',
    message,
  };
  const { data } = await api.post('/transport/update', payload);
  return data;
};
