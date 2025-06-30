
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus, LogOut, History, Bell, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for upcoming bookings with distance
const initialBookings = [
  {
    id: '1',
    date: '2024-07-01',
    time: '07:30',
    pickup: 'Dormitory A',
    destination: 'Main Campus',
    status: 'confirmed',
    distance: 2.3
  },
  {
    id: '2',
    date: '2024-07-01',
    time: '16:45',
    pickup: 'Main Campus',
    destination: 'Dormitory A',
    status: 'confirmed',
    distance: 2.3
  },
  {
    id: '3',
    date: '2024-07-02',
    time: '08:45',
    pickup: 'Dormitory A',
    destination: 'Library',
    status: 'pending',
    distance: 1.8
  }
];

// Mock trip history data
const tripHistory = [
  {
    id: 'h1',
    date: '2024-06-28',
    time: '07:30',
    pickup: 'Dormitory A',
    destination: 'Main Campus',
    status: 'completed',
    distance: 2.3,
    cost: 0
  },
  {
    id: 'h2',
    date: '2024-06-27',
    time: '14:45',
    pickup: 'Main Campus',
    destination: 'Sports Center',
    status: 'completed',
    distance: 1.2,
    cost: 5
  },
  {
    id: 'h3',
    date: '2024-06-26',
    time: '09:45',
    pickup: 'Library',
    destination: 'Medical Center',
    status: 'cancelled',
    distance: 1.3,
    cost: 0
  }
];

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [upcomingBookings, setUpcomingBookings] = useState(initialBookings);
  const [showHistory, setShowHistory] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCancelBooking = (bookingId: string) => {
    setUpcomingBookings(upcomingBookings.filter(booking => booking.id !== bookingId));
    toast({
      title: "Booking cancelled",
      description: "Your ride has been successfully cancelled.",
    });
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const totalDistance = tripHistory
    .filter(trip => trip.status === 'completed')
    .reduce((sum, trip) => sum + trip.distance, 0);

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" onClick={toggleHistory}>
                  ← Back to Dashboard
                </Button>
                <h1 className="text-lg font-semibold">Trip History</h1>
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
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{tripHistory.length}</p>
                  <p className="text-sm text-gray-600">Total Trips</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{totalDistance.toFixed(1)} km</p>
                  <p className="text-sm text-gray-600">Distance Traveled</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {tripHistory.filter(t => t.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Completed Trips</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trip History */}
          <Card>
            <CardHeader>
              <CardTitle>Your Trip History</CardTitle>
              <CardDescription>All your past and cancelled rides</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tripHistory.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-center">
                        <Clock className="w-4 h-4 text-blue-600 mb-1" />
                        <span className="text-sm font-medium">{trip.time}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{trip.date}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>{trip.pickup} → {trip.destination}</span>
                        </div>
                        <p className="text-sm text-blue-600">{trip.distance} km</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={
                          trip.status === 'completed' ? 'default' : 
                          trip.status === 'cancelled' ? 'destructive' : 'secondary'
                        }
                      >
                        {trip.status}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {trip.cost === 0 ? 'Free' : `$${trip.cost}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={toggleHistory}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5 text-green-600" />
                <span>Trip History</span>
              </CardTitle>
              <CardDescription>View your past and cancelled rides ({totalDistance.toFixed(1)} km traveled)</CardDescription>
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
                        <p className="text-sm text-blue-600">{booking.distance} km</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
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
