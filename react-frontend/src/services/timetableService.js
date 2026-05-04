import api from './api';

export const timetableService = {
  getStudentTimetable: async () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const classId = user?.classId || 'CLASS-10A';
    const response = await api.get(`/timetable/class/${classId}`);
    return response.data;
  },
  getTeacherTimetable: async () => {
    const response = await api.get('/timetable/teacher');
    return response.data;
  },
  getClassTimetable: async (classId) => {
    const response = await api.get(`/timetable/class/${classId}`);
    return response.data;
  },
  getParentTimetable: async () => {
    const response = await api.get('/timetable/parent');
    return response.data;
  },
  createTimetable: async (data) => {
    const response = await api.post('/timetable/create', data);
    return response.data;
  },
  deleteTimetable: async (id) => {
    const response = await api.delete(`/timetable/delete/${id}`);
    return response.data;
  }
};

export default timetableService;
