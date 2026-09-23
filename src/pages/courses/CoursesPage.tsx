import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CoursesList from './CoursesList';
import MentorCoursesPage from '../mentor/MentorCoursesPage';

const CoursesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = user?.role?.toLowerCase() || localStorage.getItem('vora_role') || 'talent';
  const isMentor = role === 'mentor';

  const viewParam = searchParams.get('view');
  const [mentorViewMode, setMentorViewMode] = useState<'instructor' | 'learner'>(() => {
    return viewParam === 'catalog' ? 'learner' : 'instructor';
  });

  useEffect(() => {
    if (viewParam === 'catalog') {
      setMentorViewMode('learner');
    } else if (isMentor && !viewParam) {
      setMentorViewMode('instructor');
    }
  }, [viewParam, isMentor]);

  if (isMentor && mentorViewMode === 'instructor') {
    return (
      <MentorCoursesPage
        onToggleLearnerView={() => {
          setMentorViewMode('learner');
          setSearchParams({ view: 'catalog' });
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {isMentor && (
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-[#EBF6FF] border border-[#BFDBFE] rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-[#0047CC]">
            <span>You are previewing the <strong>Learner Course Catalog</strong> as a Mentor.</span>
            <button
              onClick={() => {
                setMentorViewMode('instructor');
                setSearchParams({});
              }}
              className="font-bold underline hover:text-[#003d99] cursor-pointer"
            >
              Switch to Instructor Portal →
            </button>
          </div>
        </div>
      )}
      <CoursesList />
    </div>
  );
};

export default CoursesPage;
