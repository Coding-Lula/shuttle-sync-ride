
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      switch (user.role) {
        case 'student':
          navigate('/student');
          break;
        case 'driver':
          navigate('/driver');
          break;
        case 'manager':
          navigate('/manager');
          break;
        case 'senior':
          navigate('/senior');
          break;
        default:
          navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default Index;
