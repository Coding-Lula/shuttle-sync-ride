
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { LogOut, Bus, MapPin, Users, Clock, CheckCircle, ArrowRight } from 'lucide-react';

// Mock data for today's trips with enhanced route information
const todaysTrips = [
  {
    id: '1',
    time: '08:00',
    passengers: [
      { id: '1', name: 'John Doe', pickup: 'Dormitory A', destination: 'Main Campus', pickedUp: false },
      { id: '2', name: 'Sarah Wilson', pickup: 'Dormitory B', destination: 'Library', pickedUp: false },
      { id: '3', name: 'Mike Johnson', pickup: 'Main Campus', destination: 'Sports Center', pickedUp: false }
    ],
    allStops: ['Dormitory A', 'Dormitory B', 'Main Campus', 'Library', 'Sports Center'],
    status: 'upcoming'
  },
  {
    id: '2',
    time: '17:30',
    passengers: [
      { id: '4', name: 'Emily Brown', pickup: 'Library', destination: 'Dormitory A', pickedUp: true },
      { id: '5', name: 'David Lee', pickup: 'Sports Center', destination: 'Dormitory B', pickedUp: true }
    ],
    allStops: ['Library', 'Sports Center', 'Main Campus', 'Dormitory A', 'Dormitory B'],
    status: 'completed'
  }
];

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState(todaysTrips);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const togglePassengerPickup = (tripId: string, passengerId: string) => {
    setTrips(trips.map(trip => 
      trip.id === tripId 
        ? {
            ...trip,
            passengers: trip.passengers.map(passenger =>
              passenger.id === passengerId
                ? { ...passenger, pickedUp: !passenger.pickedUp }
                : passenger
            )
          }
        : trip
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <Bus className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Driver Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{trips.length}</p>
                  <p className="text-sm text-gray-600">Total Trips Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {trips.reduce((total, trip) => total + trip.passengers.length, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Passengers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {trips.filter(trip => trip.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Completed Trips</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trip Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bus className="w-5 h-5" />
              <span>Today's Schedule</span>
            </CardTitle>
            <CardDescription>Manage your trips and passenger pickups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {trips.map((trip) => (
                <div key={trip.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{trip.time}</div>
                        <div className="text-sm text-gray-500">Departure</div>
                      </div>
                    </div>
                    <Badge variant={trip.status === 'completed' ? 'default' : 'secondary'}>
                      {trip.status}
                    </Badge>
                  </div>

                  {/* Route Information */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      All Stops for this Trip
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {trip.allStops.map((stop, index) => (
                        <div key={index} className="flex items-center">
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            {stop}
                          </Badge>
                          {index < trip.allStops.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-gray-400 mx-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Passengers ({trip.passengers.length})</h4>
                    {trip.passengers.map((passenger) => (
                      <div key={passenger.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={passenger.pickedUp}
                            onCheckedChange={() => togglePassengerPickup(trip.id, passenger.id)}
                            disabled={trip.status === 'completed'}
                          />
                          <div>
                            <p className="font-medium">{passenger.name}</p>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>{passenger.pickup}</span>
                              <ArrowRight className="w-3 h-3 mx-2" />
                              <span>{passenger.destination}</span>
                            </div>
                          </div>
                        </div>
                        {passenger.pickedUp && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Picked Up
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverDashboard;
