import axios from 'axios';
import { Herb, HerbOrStub, Rarity } from '../types';

export interface HerbPayload {
  name?: string;
  latinName?: string;
  imageUrl?: string | null;
  rarity?: Rarity;
  discoveredAt?: string | null;
  description?: string;
  properties?: string[];
  effects?: string;
  isUnlocked?: boolean;
  sortOrder?: number;
}

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('dm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const herbsApi = {
  getAll: (): Promise<HerbOrStub[]> => api.get('/herbs').then(r => r.data),
  getOne: (id: string): Promise<HerbOrStub> => api.get(`/herbs/${id}`).then(r => r.data),
  search: (q: string): Promise<Herb[]> => api.get('/herbs/search', { params: { q } }).then(r => r.data),
  create: (data: HerbPayload): Promise<Herb> => api.post('/herbs', data).then(r => r.data),
  update: (id: string, data: HerbPayload): Promise<Herb> => api.put(`/herbs/${id}`, data).then(r => r.data),
  toggleUnlock: (id: string): Promise<Herb> => api.patch(`/herbs/${id}/unlock`).then(r => r.data),
  delete: (id: string): Promise<void> => api.delete(`/herbs/${id}`).then(r => r.data),
  uploadImage: (id: string, file: File): Promise<Herb> => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/herbs/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};

export const authApi = {
  login: (password: string): Promise<{ token: string }> =>
    api.post('/auth/login', { password }).then(r => r.data),
  verify: (): Promise<{ valid: boolean }> =>
    api.get('/auth/verify').then(r => r.data),
};
