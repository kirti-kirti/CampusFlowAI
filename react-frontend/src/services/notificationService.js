import api from './api';

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications/my');
    return response.data;
  },
  sendBroadcast: async (data) => {
    const response = await api.post('/notifications/send', data);
    return response.data;
  }
};

export default notificationService;
