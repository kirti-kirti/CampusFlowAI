import api from './api';

const adminService = {
  getTeachers: async () => {
    const response = await api.get('/admin/users/TEACHER');
    return response.data;
  },

  getStudents: async () => {
    const response = await api.get('/admin/users/STUDENT');
    return response.data;
  },

  registerUser: async (userData) => {
    // Admin uses the same registration endpoint but for other users
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getAdmins: async () => {
    const response = await api.get('/admin/users/ADMIN');
    return response.data;
  }
};

export default adminService;
