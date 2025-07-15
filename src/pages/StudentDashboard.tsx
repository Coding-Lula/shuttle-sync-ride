
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Calendar, CreditCard, LogOut } from 'lucide-react';
import UserBookings from '@/components/UserBookings';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleBookShuttle = () => {
    navigate('/student/book');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
            <p className="text-gray-600">Student Dashboard</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleBookShuttle}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bus className="w-5 h-5 mr-2 text-blue-600" />
                Book Shuttle
              </CardTitle>
              <CardDescription>
                Schedule your next shuttle ride
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                My Bookings
              </CardTitle>
              <CardDescription>
                View your upcoming rides
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                Credits
              </CardTitle>
              <CardDescription>
                Check your credit balance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* User Bookings */}
        <div className="mb-8">
          <UserBookings />
        </div>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Student Type</label>
                <p className="text-gray-900 capitalize">{user?.studentType || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Start Location</label>
                <p className="text-gray-900">{user?.startLocation || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-gray-900 capitalize">{user?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
