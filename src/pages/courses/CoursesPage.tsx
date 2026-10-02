import React from 'react';
import { useAuth } from '../../context/AuthContext';
import CoursesList from './CoursesList';
import MentorCoursesPage from '../mentor/MentorCoursesPage';

const CoursesPage: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || localStorage.getItem('vora_role') || 'talent';
  const isMentor = role === 'mentor';

  if (isMentor) {
    return <MentorCoursesPage />;
  }

  return <CoursesList />;
};

export default CoursesPage;
