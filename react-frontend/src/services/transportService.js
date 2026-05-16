import api from './api';

export const transportService = {
  addBus: async (data) => {
    const response = await api.post('/transport/add', data);
    return response.data;
  },
  updateBus: async (busId, data) => {
    const response = await api.put(`/transport/update/${busId}`, data);
    return response.data;
  },
  deleteBus: async (busId) => {
    const response = await api.delete(`/transport/delete/${busId}`);
    return response.data;
  },
  getAllBuses: async () => {
    const response = await api.get('/transport/all');
    return response.data;
  },
  getMyBus: async () => {
    const response = await api.get('/transport/my-bus');
    return response.data;
  },
  getBusDetails: async (busId) => {
    const response = await api.get(`/transport/details/${busId}`);
    return response.data;
  },
  getBusLocation: async (busId) => {
    const response = await api.get(`/transport/location/${busId}`);
    return response.data;
  },
  getBusStudents: async (busId) => {
    const response = await api.get(`/transport/students/${busId}`);
    return response.data;
  },
  getStudentCount: async (busId) => {
    const response = await api.get(`/transport/count/${busId}`);
    return response.data;
  },
  updateLocation: async (data) => {
    const response = await api.post('/transport/location', data);
    return response.data;
  },
  checkIn: async (data) => {
    const response = await api.post('/transport/check-in', data);
    return response.data;
  },
  checkOut: async (data) => {
    const response = await api.post('/transport/check-out', data);
    return response.data;
  },
  getDistance: async (busId, userLat, userLon) => {
    const response = await api.get('/transport/distance', { params: { busId, userLat, userLon } });
    return response.data;
  },
  trackChildBus: async (studentId) => {
    const response = await api.get(`/transport/parent/${studentId}`);
    return response.data;
  }
};

export default transportService;
