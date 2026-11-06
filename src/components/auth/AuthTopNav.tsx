import { Link } from 'react-router-dom';
import VoraLogo from '../common/VoraLogo';

interface AuthTopNavProps {
  logoTo?: string;
  loginTo?: string;
}

const AuthTopNav: React.FC<AuthTopNavProps> = ({ logoTo = '/signup', loginTo = '/login' }) => (
  <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 px-4 sm:px-8 min-h-[54px] flex items-center justify-between">
    <VoraLogo to={logoTo} size="md" />
    {loginTo && (
      <div className="text-[13px] sm:text-sm text-slate-600 font-medium">
        Already have an account?{' '}
        <Link
          to={loginTo}
          className="text-[#0047CC] hover:text-[#0039A6] font-semibold transition-colors duration-200"
        >
          Log in
        </Link>
      </div>
    )}
  </header>
);

export default AuthTopNav;
