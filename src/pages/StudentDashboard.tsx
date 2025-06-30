
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus, LogOut, History, Bell } from 'lucide-react';

// Mock data for upcoming bookings
const upcomingBookings = [
  {
    id: '1',
    date: '2024-07-01',
    time: '08:00',
    pickup: 'Dormitory A',
    destination: 'Main Campus',
    status: 'confirmed'
  },
  {
    id: '2',
    date: '2024-07-01',
    time: '17:30',
    pickup: 'Main Campus',
    destination: 'Dormitory A',
    status: 'confirmed'
  },
  {
    id: '3',
    date: '2024-07-02',
    time: '08:00',
    pickup: 'Dormitory A',
    destination: 'Main Campus',
    status: 'pending'
  }
];

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold">Welcome, {user?.name}</h1>
                <p className="text-sm text-gray-500 capitalize">{user?.studentType} Student</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/student/book')}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Book New Ride</span>
              </CardTitle>
              <CardDescription>Schedule your shuttle rides up to 7 days in advance</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5 text-green-600" />
                <span>Trip History</span>
              </CardTitle>
              <CardDescription>View your past and cancelled rides</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Upcoming Rides</span>
            </CardTitle>
            <CardDescription>Your scheduled shuttle bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming rides scheduled</p>
                <Button className="mt-4" onClick={() => navigate('/student/book')}>
                  Book Your First Ride
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-center">
                        <Clock className="w-4 h-4 text-blue-600 mb-1" />
                        <span className="text-sm font-medium">{booking.time}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{booking.date}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>{booking.pickup} → {booking.destination}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
