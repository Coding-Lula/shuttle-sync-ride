
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock } from 'lucide-react';
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

const UserBookings = () => {
  const { user } = useAuth();
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
        console.log('Fetching bookings for user:', user.id);
        
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
          .order('date', { ascending: true });

        if (error) {
          console.error('Error fetching user bookings:', error);
          toast({
            title: "Error",
            description: "Failed to fetch your bookings",
            variant: "destructive",
          });
          return;
        }

        console.log('Raw booking data:', data);

        const processedBookings = (data || []).map(booking => {
          console.log('Processing booking:', booking);
          return {
            id: booking.id,
            date: booking.date,
            cost: booking.cost || 0,
            distance_traveled: booking.distance_traveled || 0,
            status: booking.status || 'confirmed',
            pickup_stop: Array.isArray(booking.pickup_stop) ? booking.pickup_stop[0] : booking.pickup_stop,
            dropoff_stop: Array.isArray(booking.dropoff_stop) ? booking.dropoff_stop[0] : booking.dropoff_stop,
            trip: Array.isArray(booking.trip) ? booking.trip[0] : booking.trip
          };
        });

        console.log('Processed bookings:', processedBookings);
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>Loading your upcoming rides...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (userBookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>Your upcoming shuttle rides</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No upcoming bookings found</p>
            <p className="text-sm mt-2">Book a shuttle ride to see it here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Bookings</CardTitle>
        <CardDescription>Your upcoming shuttle rides</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userBookings.map((booking) => (
            <div key={booking.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
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
                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                  {booking.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserBookings;
