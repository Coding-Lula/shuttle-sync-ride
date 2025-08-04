
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, ArrowLeft, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserBooking {
  id: string;
  date: string;
  cost: number;
  distance_traveled: number;
  status: string;
  pickup_stop?: {
    name: string;
  };
  dropoff_stop?: {
    name: string;
  };
  trip?: {
    date: string;
    time_slot: {
      start_time: string;
    } | null;
  };
}

const MyBookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching all bookings for user:', user.id);
        
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            date,
            cost,
            distance_traveled,
            status,
            pickup_stop:stops!pickup_stop_id (
              name
            ),
            dropoff_stop:stops!dropoff_stop_id (
              name
            ),
            trip:trips!trip_id (
              date,
              time_slot:time_slots!time_slot_id (
                start_time
              )
            )
          `)
          .eq('user_id', user.id)
          .eq('cancelled', false)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching user bookings:', error);
          toast({
            title: "Error",
            description: "Failed to fetch your bookings",
            variant: "destructive",
          });
          return;
        }

        const processedBookings = (data || []).map(booking => ({
          id: booking.id,
          date: booking.date,
          cost: booking.cost || 0,
          distance_traveled: booking.distance_traveled || 0,
          status: booking.status || 'confirmed',
          pickup_stop: Array.isArray(booking.pickup_stop) ? booking.pickup_stop[0] : booking.pickup_stop,
          dropoff_stop: Array.isArray(booking.dropoff_stop) ? booking.dropoff_stop[0] : booking.dropoff_stop,
          trip: Array.isArray(booking.trip) ? booking.trip[0] : booking.trip
        }));

        setUserBookings(processedBookings);
      } catch (error) {
        console.error('Unexpected error fetching bookings:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBookings();
  }, [user?.id, toast]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ cancelled: true, status: 'cancelled' })
        .eq('id', bookingId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to cancel booking",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });

      // Remove the cancelled booking from the list
      setUserBookings(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const canCancelBooking = (bookingDate: string, pickupTime?: string) => {
    if (!pickupTime) return false;
    
    const now = new Date();
    const bookingDateTime = new Date(`${bookingDate}T${pickupTime}`);
    const timeDifferenceMs = bookingDateTime.getTime() - now.getTime();
    
    // Can cancel if booking is at least 15 minutes in the future
    return timeDifferenceMs > 15 * 60 * 1000; // 15 minutes in milliseconds
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>Loading your booking history...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">Loading...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            onClick={() => navigate('/student')} 
            variant="outline" 
            size="sm" 
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600">Complete booking history</p>
          </div>
        </div>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>Your complete shuttle booking history</CardDescription>
          </CardHeader>
          <CardContent>
            {userBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No bookings found</p>
                <p className="text-sm mt-2">Book a shuttle ride to see it here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{booking.date}</span>
                          {booking.trip?.time_slot?.start_time && (
                            <>
                              <Clock className="w-4 h-4 text-green-600 ml-2" />
                              <span className="text-sm text-gray-600">{booking.trip.time_slot.start_time}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">
                            {booking.pickup_stop?.name || 'Pickup location'} → {booking.dropoff_stop?.name || 'Dropoff location'}
                          </span>
                        </div>
                        {booking.distance_traveled > 0 && (
                          <div className="text-sm text-gray-600">
                            Distance: {booking.distance_traveled} km
                          </div>
                        )}
                        {booking.cost > 0 && (
                          <div className="text-sm text-gray-600">
                            Cost: R{booking.cost.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                        {booking.status === 'confirmed' && canCancelBooking(booking.date, booking.trip?.time_slot?.start_time) && (
                          <Button
                            onClick={() => handleCancelBooking(booking.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
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

export default MyBookingsPage;
