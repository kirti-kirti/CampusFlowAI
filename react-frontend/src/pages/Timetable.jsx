import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminTimetable from './timetable/AdminTimetable';
import StudentTimetable from './timetable/StudentTimetable';
import TeacherTimetable from './timetable/TeacherTimetable';
import ParentTimetable from './timetable/ParentTimetable';
import { Card, CardContent } from "@/components/ui/card";

const Timetable = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container mx-auto px-4 py-8">
      {user?.role === 'ADMIN' && <AdminTimetable />}
      {user?.role === 'STUDENT' && <StudentTimetable />}
      {user?.role === 'TEACHER' && <TeacherTimetable />}
      {user?.role === 'PARENT' && <ParentTimetable />}
      {!user && (
        <Card className="text-center p-12 border-none shadow-md bg-white/50 backdrop-blur-sm">
          <CardContent>
            <p className="text-lg text-muted-foreground">Please log in to view the timetable.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Timetable;
