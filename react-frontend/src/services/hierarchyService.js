import api from './api';

/**
 * Hierarchy Service Layer
 * Fetches University -> Department -> Class -> Subject structure.
 */
const hierarchyService = {
  getDepartments: async () => {
    try {
      const response = await api.get('/hierarchy/departments');
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock department data');
      return [
        { id: 'D001', name: 'Computer Science', description: 'Faculty of Engineering & Technology' },
        { id: 'D002', name: 'Business Administration', description: 'School of Management' }
      ];
    }
  },

  createDepartment: async (data) => {
    const response = await api.post('/hierarchy/department', data);
    return response.data;
  },

  getClasses: async (departmentId) => {
    try {
      const response = await api.get(`/hierarchy/classes/${departmentId}`);
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock class data');
      return [
        { id: 'C001', name: 'CS-3A', semester: 'Semester 5', departmentId },
        { id: 'C002', name: 'CS-3B', semester: 'Semester 5', departmentId }
      ];
    }
  },

  createClass: async (data) => {
    const response = await api.post('/hierarchy/class', data);
    return response.data;
  },

  getSubjects: async (classRoomId) => {
    const response = await api.get(`/hierarchy/subjects/${classRoomId}`);
    return response.data;
  },

  createSubject: async (data) => {
    const response = await api.post('/hierarchy/subject', data);
    return response.data;
  },

  getMySubjects: async () => {
    const response = await api.get('/hierarchy/my-subjects');
    return response.data;
  },

  getUniversities: async () => {
    const response = await api.get('/hierarchy/universities');
    return response.data;
  },

  createUniversity: async (data) => {
    const response = await api.post('/hierarchy/university', data);
    return response.data;
  }
};

export default hierarchyService;
