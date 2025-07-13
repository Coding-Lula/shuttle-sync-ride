
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { LogOut, Bus, MapPin, Users, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useBookings, TripWithBookings } from '../hooks/useBookings';


const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { fetchTodaysTripsWithBookings } = useBookings();
  const [trips, setTrips] = useState<TripWithBookings[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTodaysTrips = async () => {
      setIsLoading(true);
      try {
        const todaysTrips = await fetchTodaysTripsWithBookings();
        setTrips(todaysTrips);
      } catch (error) {
        console.error('Error loading today\'s trips:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodaysTrips();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
/*
  const togglePassengerPickup = (tripId: string, passengerId: string) => 
  {
    setTrips(trips.map(trip => 
      trip.id === tripId 
        ? {
            ...trip,
            bookings: trip.bookings.map(booking =>
              booking.id === passengerId
                ? { ...booking, pickedUp: !booking.pickedUp }
                : booking
            )
          }
        : trip
    ));
  };*/
  // Update the toggle function to work with Supabase
const togglePassengerPickup = async (tripId: string, bookingId: string) => {
  try {
    // Find the booking in the current state
    const trip = trips.find(t => t.id === tripId);
    const booking = trip?.bookings.find(b => b.id === bookingId);
    
    if (!trip || !booking) {
      console.warn('Trip or booking not found');
      return;
    }

    // Calculate the new picked_up status
    const newPickedUpStatus = !booking.picked_up;

    // Update in Supabase
    const { error } = await supabase
      .from('bookings')
      .update({ 
        picked_up: newPickedUpStatus,
        updated_at: new Date().toISOString() // Track when status changed
      })
      .eq('id', bookingId);

    if (error) {
      throw error;
    }

    // Optimistically update the UI
    setTrips(trips.map(t => 
      t.id === tripId 
        ? {
            ...t,
            bookings: t.bookings.map(b =>
              b.id === bookingId 
                ? { ...b, picked_up: newPickedUpStatus } 
                : b
            )
          }
        : t
    ));

  } catch (error) {
    console.error('Error updating pickup status:', error);
    // Optional: Revert UI if Supabase update fails
    setTrips([...trips]); // This will force a re-render with original data
  }
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
                    {trips.reduce((total, trip) => total + trip.bookings.length, 0)}
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
                   {trips.filter(trip => {
                     const now = new Date();
                     const tripTime = new Date(`${trip.date} ${trip.time_slot}`);
                     return tripTime < now;
                   }).length}
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
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading today's trips...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No trips scheduled for today.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {trips.map((trip) => {
                  const now = new Date();
                  const tripTime = new Date(`${trip.date} ${trip.time_slot}`);
                  const status = tripTime < now ? 'completed' : 'upcoming';
                  
                  return (
                    <div key={trip.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{trip.time_slot}</div>
                            <div className="text-sm text-gray-500">Departure</div>
                          </div>
                        </div>
                        <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
                          {status}
                        </Badge>
                      </div>

                      {/* Route Information */}
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          Route for this Trip
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {trip.route && trip.route.length > 0 ? (
                            trip.route.map((stop, index) => (
                              <div key={index} className="flex items-center">
                                <Badge variant="outline" className="text-blue-600 border-blue-600">
                                  {stop}
                                </Badge>
                                {index < trip.route.length - 1 && (
                                  <ArrowRight className="w-3 h-3 text-gray-400 mx-1" />
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No route defined for this trip</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Passengers ({trip.bookings.length})</h4>
                        {trip.bookings.length === 0 ? (
                          <p className="text-sm text-gray-500">No passengers booked for this trip.</p>
                        ) : (
                          trip.bookings.map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  checked={booking.pickedUp}
                                  onCheckedChange={() => togglePassengerPickup(trip.id, booking.id)}
                                  disabled={status === 'completed'}
                                />
                                <div>
                                  <p className="font-medium">{booking.user.name}</p>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    <span>{booking.pickup}</span>
                                    <ArrowRight className="w-3 h-3 mx-2" />
                                    <span>{booking.destination}</span>
                                  </div>
                                </div>
                              </div>
                              {booking.pickedUp && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Picked Up
                                </Badge>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverDashboard;
