import api from './api';

/**
 * Advanced Attendance Service Layer
 * Aligned with Spring Boot controller mappings.
 */
const attendanceService = {
  // --- SESSION MANAGEMENT (TEACHER/ADMIN) ---
  
  /** Start a new attendance session (Rotating QR Mode) */
  startSession: async (data) => {
    const response = await api.post('/attendance/session/start', {
      departmentId: data.departmentId,
      classRoomId: data.classRoomId,
      subject: data.subject,
      startTime: data.startTime,
      endTime: data.endTime,
      lateThresholdMinutes: data.lateThresholdMinutes || 15,
      qrRotationSeconds: data.qrRotationSeconds || 15
    });
    return response.data;
  },

  /** Get my current active session if one exists */
  getActiveSession: async () => {
    const response = await api.get('/attendance/session/active');
    return response.data;
  },

  /** Stop an active attendance session */
  stopSession: async (sessionId) => {
    const response = await api.post(`/attendance/session/${sessionId}/stop`);
    return response.data;
  },

  /** Fetch a fresh QR token for the active session */
  generateQR: async (sessionId) => {
    const response = await api.get(`/attendance/session/${sessionId}/qr`);
    return response.data;
  },

  /** Mark attendance (used by Scanner or Student) */
  markAttendance: async (qrToken, studentId = null) => {
    const payload = {};
    if (qrToken) payload.qrToken = qrToken;
    if (studentId) payload.studentId = String(studentId);
    const response = await api.post('/attendance/mark', payload);
    return response.data;
  },

  // --- HISTORY & REPORTS ---

  getStudentHistory: async () => {
    const response = await api.get('/attendance/student');
    return response.data;
  },

  getParentHistory: async () => {
    const response = await api.get('/attendance/parent');
    return response.data;
  },

  getAllAttendance: async () => {
    const response = await api.get('/attendance/all');
    return response.data;
  },

  // Compatibility method for existing UI
  getAttendanceHistory: async () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (user?.role === 'STUDENT') return attendanceService.getStudentHistory();
    if (user?.role === 'PARENT') return attendanceService.getParentHistory();
    if (user?.role === 'TEACHER') return attendanceService.getStudentHistory(); // teachers see all via /attendance/all
    return attendanceService.getAllAttendance();
  },

  /** Get real-time dashboard statistics */
  getStats: async () => {
    const response = await api.get('/attendance/stats');
    return response.data;
  },

  /** Get attendance report for a specific class */
  getClassReport: async (classRoomId) => {
    const response = await api.get(`/attendance/report/class/${classRoomId}`);
    return response.data;
  },

  /** Get student attendance report */
  getReport: async () => {
    const response = await api.get('/attendance/report/student');
    return response.data;
  }
};

export default attendanceService;
