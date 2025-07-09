
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Clock, CreditCard, AlertTriangle } from 'lucide-react';

interface Trip {
  id: string;
  date: string;
  time_slot: string;
  route: string[];
}

interface Stop {
  id: string;
  name: string;
  distance_km: number;
}

const BookingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [selectedStop, setSelectedStop] = useState('');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTrips();
    fetchStops();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date')
        .order('time_slot');

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available trips",
        variant: "destructive",
      });
    }
  };

  const fetchStops = async () => {
    try {
      const { data, error } = await supabase
        .from('stops')
        .select('*')
        .order('name');

      if (error) throw error;
      setStops(data || []);
    } catch (error) {
      console.error('Error fetching stops:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stops",
        variant: "destructive",
      });
    }
  };

  const isWeekend = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  };

  const handleBooking = async () => {
    if (!selectedTrip || !selectedStop || !pickup || !destination) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check if the selected trip is on a weekend
    const selectedTripData = trips.find(trip => trip.id === selectedTrip);
    if (selectedTripData && isWeekend(selectedTripData.date)) {
      toast({
        title: "Weekend booking not allowed",
        description: "Students cannot book trips on weekends (Saturday and Sunday)",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const selectedStopData = stops.find(stop => stop.id === selectedStop);
      const distance = selectedStopData?.distance_km || 0;
      
      // Get current rate
      const { data: rateData } = await supabase
        .from('rates')
        .select('rate_per_km')
        .eq('is_active', true)
        .single();

      const ratePerKm = rateData?.rate_per_km || 6;
      const cost = distance * ratePerKm;

      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user?.id,
          trip_id: selectedTrip,
          stop_id: selectedStop,
          pickup,
          destination,
          cost: cost,
          distance_traveled: distance,
          payment_method: user?.studentType === 'community' ? 'paid' : 'free',
          cancelled: false
        });

      if (error) throw error;

      toast({
        title: "Booking successful!",
        description: `Your trip has been booked. Cost: R${cost.toFixed(2)}`,
      });

      // Reset form
      setSelectedTrip('');
      setSelectedStop('');
      setPickup('');
      setDestination('');

      // Navigate back to dashboard
      navigate('/student');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking failed",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBookingCost = () => {
    if (!selectedStop) return 0;
    const selectedStopData = stops.find(stop => stop.id === selectedStop);
    const distance = selectedStopData?.distance_km || 0;
    return distance * 6; // Default rate of R6 per km
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Book a Trip</span>
            </CardTitle>
            <CardDescription>
              Select your trip details and destination
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Weekend Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Weekend Booking Restriction</h4>
                  <p className="text-sm text-amber-700">
                    Students cannot book trips on weekends (Saturday and Sunday).
                  </p>
                </div>
              </div>
            </div>

            {/* Trip Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Trip</label>
              <Select value={selectedTrip} onValueChange={setSelectedTrip}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a trip" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem 
                      key={trip.id} 
                      value={trip.id}
                      disabled={isWeekend(trip.date)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {trip.date} at {trip.time_slot}
                        </span>
                        {isWeekend(trip.date) && (
                          <span className="text-red-500 text-xs ml-2">(Weekend - Not Available)</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stop Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination Stop</label>
              <Select value={selectedStop} onValueChange={setSelectedStop}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your destination" />
                </SelectTrigger>
                <SelectContent>
                  {stops.map((stop) => (
                    <SelectItem key={stop.id} value={stop.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{stop.name}</span>
                        <span className="text-sm text-gray-500">
                          {stop.distance_km}km - R{(stop.distance_km * 6).toFixed(2)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pickup Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Pickup Location</label>
              <Input
                placeholder="Enter your pickup location"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>

            {/* Destination Details */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Specific Destination</label>
              <Input
                placeholder="Enter specific destination details"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            {/* Booking Summary */}
            {selectedStop && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Booking Summary</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Distance:</span>
                    <span>{stops.find(s => s.id === selectedStop)?.distance_km || 0}km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>R6.00 per km</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Cost:</span>
                    <span>R{getBookingCost().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span>{user?.studentType === 'community' ? 'Paid' : 'Free'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Book Button */}
            <Button 
              onClick={handleBooking} 
              disabled={isLoading || !selectedTrip || !selectedStop || !pickup || !destination}
              className="w-full"
            >
              {isLoading ? 'Booking...' : 'Book Trip'}
            </Button>

            <Button 
              variant="outline" 
              onClick={() => navigate('/student')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;
