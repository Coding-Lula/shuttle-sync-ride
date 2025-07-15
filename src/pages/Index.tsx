
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index page - user:', user?.email, 'isLoading:', isLoading);
    
    if (isLoading) {
      console.log('Still loading, waiting...');
      return;
    }

    if (user) {
      console.log('User found, redirecting based on role:', user.role);
      // Redirect based on user role
      switch (user.role) {
        case 'student':
          navigate('/student', { replace: true });
          break;
        case 'driver':
          navigate('/driver', { replace: true });
          break;
        case 'manager':
          navigate('/manager', { replace: true });
          break;
        case 'senior':
          navigate('/senior', { replace: true });
          break;
        default:
          console.log('Unknown role, redirecting to login');
          navigate('/login', { replace: true });
      }
    } else {
      console.log('No user found, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default Index;
