import api from './api';

export const routeService = {
  getRoutes: async () => {
    const res = await api.get('/routes');
    return res.data;
  },
  createRoute: async (data) => {
    const res = await api.post('/routes', data);
    return res.data;
  },
  updateRoute: async (id, data) => {
    const res = await api.put(`/routes/${id}`, data);
    return res.data;
  },
  deleteRoute: async (id) => {
    const res = await api.delete(`/routes/${id}`);
    return res.data;
  },
  aiOptimize: async (busId) => {
    const res = await api.post(`/routes/ai-optimize/${busId}`);
    return res.data;
  },
  aiPreview: async (busId) => {
    const res = await api.get(`/routes/ai-preview/${busId}`);
    return res.data;
  },
  markAbsent: async (studentId, busId, absent) => {
    const res = await api.post('/routes/absent', null, { params: { studentId, busId, absent } });
    return res.data;
  },
};

export default routeService;
