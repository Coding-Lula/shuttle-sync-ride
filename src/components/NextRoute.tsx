
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus, Clock, MapPin, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NextRouteInfo {
  id: string;
  date: string;
  startTime: string;
  route: string[];
  driverName: string;
  capacity: number;
  bookings: number;
}

const NextRoute = () => {
  const [nextRoute, setNextRoute] = useState<NextRouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNextRoute = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toTimeString().slice(0, 8);

        // First try to get today's trips that haven't started yet
        let { data: trips, error } = await supabase
          .from('trips')
          .select(`
            id,
            date,
            route,
            time_slots:time_slot_id (
              start_time
            ),
            users:driver_id (
              name
            ),
            bookings:bookings(count)
          `)
          .eq('date', today)
          .order('time_slot_id');

        if (error) throw error;

        // Filter trips that haven't started yet
        let upcomingTrips = (trips || []).filter(trip => {
          const tripTime = trip.time_slots?.start_time || '00:00:00';
          return tripTime > now;
        });

        // If no trips today, get tomorrow's first trip
        if (upcomingTrips.length === 0) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];

          const { data: tomorrowTrips, error: tomorrowError } = await supabase
            .from('trips')
            .select(`
              id,
              date,
              route,
              time_slots:time_slot_id (
                start_time
              ),
              users:driver_id (
                name
              ),
              bookings:bookings(count)
            `)
            .eq('date', tomorrowStr)
            .order('time_slot_id')
            .limit(1);

          if (tomorrowError) throw tomorrowError;
          upcomingTrips = tomorrowTrips || [];
        }

        if (upcomingTrips.length > 0) {
          const trip = upcomingTrips[0];
          setNextRoute({
            id: trip.id,
            date: trip.date,
            startTime: trip.time_slots?.start_time || 'Not specified',
            route: trip.route || [],
            driverName: trip.users?.name || 'TBA',
            capacity: 15, // Assuming standard shuttle capacity
            bookings: trip.bookings?.length || 0
          });
        } else {
          setNextRoute(null);
        }
      } catch (error) {
        console.error('Error fetching next route:', error);
        toast({
          title: "Error",
          description: "Failed to fetch next route information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNextRoute();
  }, [toast]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bus className="w-5 h-5 text-blue-600" />
            <span>Next Route</span>
          </CardTitle>
          <CardDescription>Loading next shuttle route...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!nextRoute) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bus className="w-5 h-5 text-blue-600" />
            <span>Next Route</span>
          </CardTitle>
          <CardDescription>Next scheduled shuttle route</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Bus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No upcoming routes found</p>
            <p className="text-sm mt-2">Check back later for route updates</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableSeats = nextRoute.capacity - nextRoute.bookings;
  const occupancyPercentage = Math.round((nextRoute.bookings / nextRoute.capacity) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bus className="w-5 h-5 text-blue-600" />
          <span>Next Route</span>
        </CardTitle>
        <CardDescription>Next scheduled shuttle route</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Date and Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="font-medium">{nextRoute.date}</span>
              <span className="text-sm text-gray-600">{nextRoute.startTime}</span>
            </div>
            <Badge variant={availableSeats > 5 ? 'default' : availableSeats > 0 ? 'secondary' : 'destructive'}>
              {availableSeats > 0 ? `${availableSeats} seats left` : 'Full'}
            </Badge>
          </div>

          {/* Driver */}
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-purple-600" />
            <span className="text-sm">
              Driver: <span className="font-medium">{nextRoute.driverName}</span>
            </span>
          </div>

          {/* Route */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Route</span>
            </div>
            {nextRoute.route.length > 0 ? (
              <div className="ml-6 space-y-1">
                {nextRoute.route.map((stop, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">{stop}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ml-6 text-sm text-gray-500">Route details not available</div>
            )}
          </div>

          {/* Capacity Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span>Occupancy</span>
              <span>{nextRoute.bookings}/{nextRoute.capacity}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  occupancyPercentage >= 90 ? 'bg-red-500' : 
                  occupancyPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${occupancyPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {occupancyPercentage}% full
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextRoute;
