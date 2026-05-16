import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import StudentAttendancePage from './attendance/StudentAttendancePage';
import TeacherAttendancePage from './attendance/TeacherAttendancePage';
import ParentAttendancePage from './attendance/ParentAttendancePage';
import AdminAttendanceDashboard from './attendance/AdminAttendanceDashboard';

/**
 * Attendance Module Dispatcher
 * Automatically renders the correct advanced interface based on the logged-in user's role.
 */
const Attendance = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  switch (user.role) {
    case 'TEACHER':
      return <TeacherAttendancePage />;
    case 'STUDENT':
      return <StudentAttendancePage />;
    case 'PARENT':
      return <ParentAttendancePage />;
    case 'ADMIN':
      return <AdminAttendanceDashboard />;
    default:
      return <StudentAttendancePage />; // Fallback
  }
};

export default Attendance;

