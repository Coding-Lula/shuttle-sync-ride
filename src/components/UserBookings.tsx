
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock } from 'lucide-react';

const UserBookings = () => {
  const { user } = useAuth();
  const { fetchUserBookings } = useBookings();
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserBookings = async () => {
      if (user?.id) {
        setIsLoading(true);
        const bookings = await fetchUserBookings(user.id);
        setUserBookings(bookings);
        setIsLoading(false);
      }
    };

    loadUserBookings();
  }, [user?.id, fetchUserBookings]);

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
