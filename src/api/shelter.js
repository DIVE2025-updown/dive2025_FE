import api from './api';

export const getAllShelters = async () => {
  const res = await api.get('/shelter/get-all');
  return res.data;
};

export const getShelterPriority = async (params = {}) => {
  const res = await api.get('/shelter/recommend-for-rescued', {
    params,
  });
  return res.data;
};

export const getAdoptionPriority = async (params) => {
  const { data } = await api.get('/adoption/get-recommend-adopt-center', { params });
  return Array.isArray(data) ? data : [];
};
