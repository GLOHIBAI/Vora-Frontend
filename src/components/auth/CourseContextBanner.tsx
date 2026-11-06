import React from 'react';
import { BookOpenIcon } from '../common/Icons';
import type { PublicCourseLandingData } from '../../utils/courseLanding';

interface CourseContextBannerProps {
  course: Pick<
    PublicCourseLandingData,
    'title' | 'category' | 'format' | 'priceDisplay' | 'instructor'
  >;
}

export const CourseContextBanner: React.FC<CourseContextBannerProps> = ({ course }) => {
  return (
    <div className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-2 flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-7 h-7 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <BookOpenIcon size={14} className="text-[#0047CC]" strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider leading-none mb-0.5">
            Enrolling in Course
          </p>
          <h2
            className="text-xs sm:text-sm font-medium text-slate-800 leading-snug truncate max-w-xl"
            title={course.title}
          >
            {course.title}
          </h2>
          {course.instructor?.name && (
            <p className="text-[11px] text-slate-500 font-normal truncate">
              Taught by {course.instructor.name}
              {course.instructor.organisation ? ` · ${course.instructor.organisation}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Category badge only - no price, no mention of free */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        {course.category && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {course.category}
          </span>
        )}
      </div>
    </div>
  );
};

export default CourseContextBanner;
