import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface RoleGuardProps {
  roles: Array<'TENANT' | 'LANDLORD' | 'ADMIN' | 'VISITOR'>;
  children: React.ReactNode;
  fallback?: string;
}

export function RoleGuard({ roles, children, fallback = '/home' }: RoleGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
      </div>
    );
  }

  if (!user || !roles.includes(user.role as RoleGuardProps['roles'][number])) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
