import api from './api';

const adminService = {
  getTeachers: async () => {
    try {
      const response = await api.get('/admin/users/TEACHER');
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock teacher data');
      return [
        { id: 'T001', name: 'Dr. Sarah Connor', email: 'sarah.c@campus.edu', role: 'TEACHER' },
        { id: 'T002', name: 'Prof. James Smith', email: 'james.s@campus.edu', role: 'TEACHER' },
        { id: 'T003', name: 'Dr. Elena Vance', email: 'elena.v@campus.edu', role: 'TEACHER' }
      ];
    }
  },

  getStudents: async () => {
    try {
      const response = await api.get('/admin/users/STUDENT');
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock student data');
      return [
        { id: 'S001', name: 'John Doe', email: 'john.d@student.edu', role: 'STUDENT' },
        { id: 'S002', name: 'Jane Miller', email: 'jane.m@student.edu', role: 'STUDENT' },
        { id: 'S003', name: 'Alex Rivera', email: 'alex.r@student.edu', role: 'STUDENT' }
      ];
    }
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
