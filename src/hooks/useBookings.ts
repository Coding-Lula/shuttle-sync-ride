
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Booking {
  id: string;
  user_id: string;
  trip_id: string | null;
  pickup_stop_id: string | null;
  dropoff_stop_id: string | null;
  cost: number;
  distance_traveled: number;
  payment_method: string;
  cancelled: boolean;
  date: string;
  status: string;
  created_at: string;
  // Joined data
  user?: {
    name: string;
    email: string;
  };
  pickup_stop?: {
    name: string;
    distance_km: number;
  };
  dropoff_stop?: {
    name: string;
    distance_km: number;
  };
  trip?: {
    date: string;
    time_slot: {
      start_time: string;
    };
    route: string[];
  };
}

export interface TripWithBookings {
  id: string;
  date: string;
  time_slot: {
    start_time: string;
  };
  route: string[];
  driver_id: string | null;
  bookings: Array<{
    id: string;
    user_id: string;
    pickup: string;
    destination: string;
    pickedUp: boolean;
    user: {
      name: string;
      email: string;
    };
  }>;
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          users:user_id (
            name,
            email
          ),
          pickup_stops:pickup_stop_id (
            name,
            distance_km
          ),
          dropoff_stops:dropoff_stop_id (
            name,
            distance_km
          ),
          trips:trip_id (
            date,
            route,
            time_slots:time_slot_id (
              start_time
            )
          )
        `)
        .eq('cancelled', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const processedBookings = (data || []).map(booking => ({
        ...booking,
        cost: booking.cost || 0,
        distance_traveled: booking.distance_traveled || 0,
        trip: booking.trips ? {
          date: booking.trips.date,
          time_slot: booking.trips.time_slots || { start_time: 'Not specified' },
          route: booking.trips.route || []
        } : undefined,
        pickup_stop: booking.pickup_stops || undefined,
        dropoff_stop: booking.dropoff_stops || undefined,
        user: booking.users || undefined
      }));
      
      setBookings(processedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserBookings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          pickup_stops:pickup_stop_id (
            name,
            distance_km
          ),
          dropoff_stops:dropoff_stop_id (
            name,
            distance_km
          ),
          trips:trip_id (
            date,
            route,
            time_slots:time_slot_id (
              start_time
            )
          )
        `)
        .eq('user_id', userId)
        .eq('cancelled', false)
        .order('date', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(booking => ({
        ...booking,
        cost: booking.cost || 0,
        distance_traveled: booking.distance_traveled || 0,
        trip: booking.trips ? {
          date: booking.trips.date,
          time_slot: booking.trips.time_slots || { start_time: 'Not specified' },
          route: booking.trips.route || []
        } : undefined,
        pickup_stop: booking.pickup_stops || undefined,
        dropoff_stop: booking.dropoff_stops || undefined
      }));
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your bookings",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchTodaysTripsWithBookings = async (): Promise<TripWithBookings[]> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select(`
          *,
          time_slots:time_slot_id (
            start_time
          )
        `)
        .eq('date', today)
        .order('time_slot_id');

      if (tripsError) throw tripsError;

      const tripsWithBookings: TripWithBookings[] = [];

      for (const trip of trips || []) {
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            user_id,
            cancelled,
            picked_up,
            pickup_stops:pickup_stop_id (
              name
            ),
            dropoff_stops:dropoff_stop_id (
              name
            ),
            users:user_id (
              name,
              email
            )
          `)
          .eq('trip_id', trip.id)
          .eq('cancelled', false);

        if (bookingsError) throw bookingsError;

        const processedBookings = (bookings || []).map(booking => ({
          id: booking.id,
          user_id: booking.user_id,
          pickup: booking.pickup_stops?.name || 'Not specified',
          destination: booking.dropoff_stops?.name || 'Not specified',
          pickedUp: booking.picked_up || false,
          user: {
            name: booking.users?.name || 'Unknown',
            email: booking.users?.email || 'unknown@email.com'
          }
        }));

        tripsWithBookings.push({
          ...trip,
          time_slot: trip.time_slots || { start_time: 'Not specified' },
          bookings: processedBookings
        });
      }

      return tripsWithBookings;
    } catch (error) {
      console.error('Error fetching today\'s trips with bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch today's trips",
        variant: "destructive",
      });
      return [];
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    isLoading,
    fetchTodaysTripsWithBookings,
    fetchUserBookings,
    refetch: fetchBookings
  };
}
