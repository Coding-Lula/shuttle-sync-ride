import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Booking {
  id: string;
  user_id: string;
  trip_id: string | null;
  stop_id: string | null;
  cost: number;
  distance_traveled: number;
  payment_method: string;
  cancelled: boolean;
  created_at: string;
  // Joined data
  user?: {
    name: string;
    email: string;
  };
  stop?: {
    name: string;
    distance_km: number;
  };
  trip?: {
    date: string;
    time_slot: string;
    route: string[];
  };
}

export interface TripWithBookings {
  id: string;
  date: string;
  time_slot: string;
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
          stops:stop_id (
            name,
            distance_km
          ),
          trips:trip_id (
            date,
            time_slot,
            route
          )
        `)
        .eq('cancelled', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
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

  const fetchTodaysTripsWithBookings = async (): Promise<TripWithBookings[]> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('date', today)
        .order('time_slot');

      if (tripsError) throw tripsError;

      const tripsWithBookings: TripWithBookings[] = [];

      for (const trip of trips || []) {
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            user_id,
            cancelled,
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
          pickup: 'Main Campus', // You'll need to store this in bookings table
          destination: 'Library', // You'll need to store this in bookings table
          pickedUp: false, // You'll need to track this
          user: {
            name: booking.users?.name || 'Unknown',
            email: booking.users?.email || 'unknown@email.com'
          }
        }));

        tripsWithBookings.push({
          ...trip,
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
    refetch: fetchBookings
  };
}