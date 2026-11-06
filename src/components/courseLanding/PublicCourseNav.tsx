import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import VoraLogo from '../common/VoraLogo';
import { useAuth } from '../../context/AuthContext';

interface PublicCourseNavProps {
  courseSlug?: string;
}

export const PublicCourseNav: React.FC<PublicCourseNavProps> = ({ courseSlug }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b border-[#E6E6E6] px-4 sm:px-8 min-h-[60px] flex items-center justify-between transition-all">
      <div className="flex items-center gap-6">
        <VoraLogo to={courseSlug ? `/courses/${courseSlug}` : '/courses'} size="md" />
        <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0047CC] border border-blue-100">
          VORA Academy
        </span>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated && user ? (
          <Link to="/dashboard">
            <Button variant="primary" size="sm" pill={false} className="rounded-xl px-4 text-xs font-semibold">
              Go to Dashboard
            </Button>
          </Link>
        ) : (
          <>
            <Link to={courseSlug ? `/courses/${courseSlug}/login` : '/login'}>
              <Button
                variant="outline"
                size="sm"
                pill={false}
                fullWidth={false}
                className="rounded-xl text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
              >
                Log in
              </Button>
            </Link>
            <Link to={courseSlug ? `/courses/${courseSlug}/signup` : '/signup'}>
              <Button variant="primary" size="sm" pill={false} fullWidth={false} className="rounded-xl text-xs font-semibold px-4">
                Sign up
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default PublicCourseNav;

