import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/layout/Layout';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminLogin from '../pages/AdminLogin';
import Dashboard from '../pages/Dashboard';
import Attendance from '../pages/Attendance';
import Timetable from '../pages/Timetable';
import Notifications from '../pages/Notifications';
import Transport from '../pages/Transport';
import Chatbot from '../pages/Chatbot';
import Profile from '../pages/Profile';
import AttendanceReportPage from '../pages/attendance/AttendanceReportPage';
import TeacherAttendancePage from '../pages/attendance/TeacherAttendancePage';
import StudentAttendancePage from '../pages/attendance/StudentAttendancePage';
import ScannerPage from '../pages/attendance/ScannerPage';
import ParentAttendancePage from '../pages/attendance/ParentAttendancePage';
import DepartmentManagement from '../pages/admin/DepartmentManagement';
import ClassManagement from '../pages/admin/ClassManagement';
import SubjectManagement from '../pages/admin/SubjectManagement';
import UserManagement from '../pages/admin/UserManagement';
import UniversityManagement from '../pages/admin/UniversityManagement';
import AdminAttendanceDashboard from '../pages/attendance/AdminAttendanceDashboard';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import BusTracking from '../pages/BusTracking';
import Messaging from '../pages/Messaging';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="attendance/scanner" element={<ScannerPage />} />
        <Route path="attendance/report" element={<AttendanceReportPage />} />
        
        {/* Admin Hierarchy Management */}
        <Route path="admin/university" element={<UniversityManagement />} />
        <Route path="admin/departments" element={<DepartmentManagement />} />
        <Route path="admin/classes" element={<ClassManagement />} />
        <Route path="admin/subjects" element={<SubjectManagement />} />
        <Route path="admin/users" element={<UserManagement />} />
        <Route path="admin/intelligence" element={<AdminAttendanceDashboard />} />

        <Route path="timetable" element={<Timetable />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="transport" element={<Transport />} />
        <Route path="transport/tracking/:busId" element={<BusTracking />} />
        <Route path="messages" element={<Messaging />} />
        <Route path="chatbot" element={<Chatbot />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
