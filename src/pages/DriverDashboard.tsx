
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBookings } from '../hooks/useBookings';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bus, Users, CheckCircle, LogOut, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const { fetchTodaysTripsWithBookings } = useBookings();
  const [selectedTrips, setSelectedTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchTripsForDate = async (date: Date) => {
    setIsLoading(true);
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      
      const { data: trips, error } = await supabase
        .from('trips')
        .select(`
          *,
          time_slot:time_slots(*),
          bookings!bookings_trip_id_fkey(
            *,
            user:users(*),
            pickup_stop:pickup_stop_id(*),
            dropoff_stop:dropoff_stop_id(*)
          )
        `)
        .eq('date', dateString)
        .or(`driver_id.eq.${user?.id},driver_id.is.null`)
        .order('time_slot_id', { ascending: true });

      if (error) throw error;

      // Group trips by time slot and combine bookings
      const groupedTrips = trips.reduce((acc: any, trip) => {
        const timeSlotId = trip.time_slot?.id;
        const timeSlotKey = timeSlotId || 'no-time-slot';
        
        if (!acc[timeSlotKey]) {
          acc[timeSlotKey] = {
            ...trip,
            time_slot: trip.time_slot,
            bookings: []
          };
        }
        
        // Add bookings from this trip to the combined trip
        const transformedBookings = trip.bookings?.map((booking: any) => ({
          ...booking,
          pickup: booking.pickup_stop?.name || 'Unknown pickup',
          destination: booking.dropoff_stop?.name || 'Unknown destination',
          pickedUp: booking.picked_up
        })) || [];
        
        acc[timeSlotKey].bookings.push(...transformedBookings);
        
        return acc;
      }, {});

      // Convert back to array
      const combinedTrips = Object.values(groupedTrips);
      setSelectedTrips(combinedTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trips for selected date",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTripsForDate(selectedDate);
    }
  }, [selectedDate, user?.id]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handlePickupToggle = async (bookingId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ picked_up: !currentStatus })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh the trips data
      await fetchTripsForDate(selectedDate);

      toast({
        title: "Success",
        description: !currentStatus ? "Passenger marked as picked up" : "Passenger marked as not picked up",
      });
    } catch (error) {
      console.error('Error updating pickup status:', error);
      toast({
        title: "Error",
        description: "Failed to update pickup status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
            <p className="text-gray-600">Driver Dashboard</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Date Selection and Trips */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Trips</h2>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {selectedTrips.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No trips scheduled for {format(selectedDate, 'MMMM d, yyyy')}</p>
              </CardContent>
            </Card>
          ) : (
            selectedTrips.map((trip, index) => (
              <Card key={trip.time_slot?.id || `trip-${index}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Bus className="w-5 h-5 mr-2 text-blue-600" />
                      Trip at {trip.time_slot?.start_time || 'Time not specified'}
                    </span>
                    <Badge variant="outline">
                      <Users className="w-4 h-4 mr-1" />
                      {trip.bookings?.length || 0} passengers
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Date: {trip.date} | Combined trip for this time slot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Passengers:</h4>
                    {trip.bookings?.length === 0 ? (
                      <p className="text-gray-500">No passengers booked for this trip</p>
                    ) : (
                      <div className="space-y-2">
                        {trip.bookings?.map((booking: any) => (
                          <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{booking.user?.name}</p>
                              <p className="text-sm text-gray-600">{booking.pickup} → {booking.destination}</p>
                              <p className="text-xs text-gray-500">{booking.user?.email}</p>
                            </div>
                            <Button
                              variant={booking.pickedUp ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePickupToggle(booking.id, booking.pickedUp)}
                              className="ml-2"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {booking.pickedUp ? "Picked Up" : "Pick Up"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
