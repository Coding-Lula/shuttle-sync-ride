import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Clock, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Stop {
  id: string;
  name: string;
  distance_km: number;
}

interface TimeSlot {
  id: string;
  start_time: string;
  is_free_for_community: boolean;
}

interface BookingItem {
  date: Date;
  time: string;
  pickup: string;
  destination: string;
  pickupStopId: string;
  dropoffStopId: string;
  timeSlotId: string;
}

const BookingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [pickup, setPickup] = useState<string>(user?.startLocation || '');
  const [destination, setDestination] = useState<string>('');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [isLoadingStops, setIsLoadingStops] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Fetch all required data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingStops(true);
        
        // Fetch stops
        const { data: stopsData, error: stopsError } = await supabase
          .from('stops')
          .select('id, name, distance_km');
        
        if (stopsError) throw stopsError;
        setStops(stopsData || []);

        // Fetch time slots
        const { data: slotsData, error: slotsError } = await supabase
          .from('time_slots')
          .select('id, start_time, is_free_for_community');
        
        if (slotsError) throw slotsError;
        setTimeSlots(slotsData || []);

      } catch (error: any) {
        toast({
          title: "Error loading data",
          description: error.message || "Failed to fetch required data",
          variant: "destructive",
        });
      } finally {
        setIsLoadingStops(false);
      }
    };

    fetchData();
  }, [toast]);

  // Calculate distance between two stops in km
  const calculateDistance = (pickupName: string, destinationName: string): number => {
    const pickupStop = stops.find(s => s.name === pickupName);
    const destinationStop = stops.find(s => s.name === destinationName);
    
    if (!pickupStop || !destinationStop) {
      console.warn('Could not find stops for distance calculation');
      return 0;
    }
    
    // Simple absolute difference for demonstration
    return Math.abs(pickupStop.distance_km - destinationStop.distance_km);
  };

  // Calculate cost based on distance and student type
  const calculateCost = (distance: number, timeSlotId: string): number => {
    if (user?.studentType === 'community') {
      const slot = timeSlots.find(ts => ts.id === timeSlotId);
      return slot?.is_free_for_community ? 0 : distance * 5;
    }
    return distance * 5;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Check if it's a weekend (Saturday = 6, Sunday = 0)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast({
        title: "Weekend Booking Not Allowed",
        description: "Students cannot book shuttle rides on weekends.",
        variant: "destructive",
      });
      return;
    }
    
    const isSelected = selectedDates.some(d => d.toDateString() === date.toDateString());
    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => d.toDateString() !== date.toDateString()));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const addToBookings = () => {
    if (!selectedDates.length || !selectedTime || !pickup || !destination) {
      toast({
        title: "Incomplete Booking",
        description: "Please select a date, time, pickup, and destination.",
        variant: "destructive",
      });
      return;
    }

    if (pickup === destination) {
      toast({
        title: "Invalid Route",
        description: "Pickup and destination cannot be the same.",
        variant: "destructive",
      });
      return;
    }

    const hasPassedSlots = selectedDates.some(date => isTimeSlotPassed(selectedTime, date));
    if (hasPassedSlots) {
      toast({
        title: "Invalid Time",
        description: "You cannot book a time that has already passed.",
        variant: "destructive",
      });
      return;
    }

    // Find stop IDs
    const pickupStop = stops.find(s => s.name === pickup);
    const destinationStop = stops.find(s => s.name === destination);
    const timeSlot = timeSlots.find(ts => ts.start_time === selectedTime);

    if (!pickupStop || !destinationStop || !timeSlot) {
      toast({
        title: "Invalid Selection",
        description: "Could not find selected stops or time slot.",
        variant: "destructive",
      });
      return;
    }

    const newBookings = selectedDates.map(date => ({
      date,
      time: selectedTime,
      pickup,
      destination,
      pickupStopId: pickupStop.id,
      dropoffStopId: destinationStop.id,
      timeSlotId: timeSlot.id
    }));

    setBookings([...bookings, ...newBookings]);
    setSelectedDates([]);
    setSelectedTime('');
    setPickup(user?.startLocation || '');
    setDestination('');

    toast({
      title: "Added to Booking List",
      description: `${newBookings.length} ride(s) have been added.`,
    });
  };

  const isTimeSlotPassed = (timeSlot: string, selectedDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(selectedDate);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() !== today.getTime()) {
      return false;
    }

    const now = new Date();
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    return now > slotTime;
  };

  const removeBooking = (index: number) => {
    setBookings(bookings.filter((_, i) => i !== index));
  };

  const confirmAllBookings = async () => {
    if (bookings.length === 0) {
      toast({
        title: "No Bookings to Confirm",
        description: "Your booking list is empty.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, group bookings by date and time slot
      const groupedBookings: Record<string, BookingItem[]> = {};
      
      bookings.forEach(booking => {
        const dateStr = booking.date.getFullYear() + '-' + 
          String(booking.date.getMonth() + 1).padStart(2, '0') + '-' + 
          String(booking.date.getDate()).padStart(2, '0');
        const key = `${dateStr}_${booking.timeSlotId}`;
        
        if (!groupedBookings[key]) {
          groupedBookings[key] = [];
        }
        
        groupedBookings[key].push(booking);
      });

      // Create trips and assign bookings
      for (const [key, tripBookings] of Object.entries(groupedBookings)) {
        const [date, timeSlotId] = key.split('_');
        
        // Create trip
        const { data: trip, error: tripError } = await supabase
          .from('trips')
          .insert({
            date,
            time_slot_id: timeSlotId
          })
          .select()
          .single();

        if (tripError) throw tripError;
        
        // Create bookings with sequence numbers
        const bookingInserts = tripBookings.map((booking, index) => {
          const distance = calculateDistance(booking.pickup, booking.destination);
          const cost = calculateCost(distance, booking.timeSlotId);
          
          return {
            user_id: user?.id,
            trip_id: trip.id,
            pickup_stop_id: booking.pickupStopId,
            dropoff_stop_id: booking.dropoffStopId,
            time_slot_id: booking.timeSlotId,
            date: booking.date.getFullYear() + '-' + 
              String(booking.date.getMonth() + 1).padStart(2, '0') + '-' + 
              String(booking.date.getDate()).padStart(2, '0'),
            distance_traveled: distance,
            cost,
            payment_method: cost === 0 ? 'free' : 'paid',
            student_type: user?.studentType,
            status: 'confirmed',
            sequence_number: index + 1
          };
        });

        const { error: bookingError } = await supabase
          .from('bookings')
          .insert(bookingInserts);

        if (bookingError) throw bookingError;
      }

      toast({
        title: "Bookings Confirmed!",
        description: `${bookings.length} ride(s) successfully booked.`,
      });
      setBookings([]);
      navigate('/student');

    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStops) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/student')} 
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-lg font-semibold">Book New Rides</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Dates</CardTitle>
                <CardDescription>
                  Select dates up to 7 days in advance. Weekends are not available.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={setSelectedDates}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                    date > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ||
                    date.getDay() === 0 || date.getDay() === 6
                  }
                  className="rounded-md border"
                />
                {selectedDates.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Selected dates:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDates.map((date, index) => (
                        <Badge key={index} variant="outline">
                          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Time Slot</CardTitle>
                <CardDescription>
                  Choose your preferred departure time. Free slots are marked for community students.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {timeSlots.map((slot) => {
                    const hasPassed = selectedDates.length > 0 && 
                      selectedDates.some(date => isTimeSlotPassed(slot.start_time, date));
                    const isDisabled = hasPassed;

                    return (
                      <Button
                        key={slot.id}
                        variant={selectedTime === slot.start_time ? "default" : "outline"}
                        disabled={isDisabled}
                        onClick={() => setSelectedTime(slot.start_time)}
                        className="flex items-center justify-between p-4 h-auto"
                      >
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{slot.start_time}</span>
                          {hasPassed && <span className="text-xs text-muted-foreground ml-2">(Passed)</span>}
                        </div>
                        <Badge variant={slot.is_free_for_community ? 'secondary' : 'default'}>
                          {slot.is_free_for_community ? 'Free' : 'Paid'}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Route</CardTitle>
                <CardDescription>
                  Choose your pickup and destination locations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Pickup Location</label>
                  <Select 
                    value={pickup} 
                    onValueChange={setPickup}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pickup location" />
                    </SelectTrigger>
                    <SelectContent>
                      {stops.map((stop) => (
                        <SelectItem key={`pickup-${stop.id}`} value={stop.name}>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{stop.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Destination</label>
                  <Select 
                    value={destination} 
                    onValueChange={setDestination}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {stops.map((stop) => (
                        <SelectItem 
                          key={`dest-${stop.id}`} 
                          value={stop.name} 
                          disabled={pickup === stop.name}
                        >
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{stop.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={addToBookings} 
                  className="w-full"
                  disabled={
                    !selectedDates.length || 
                    !selectedTime || 
                    !pickup || 
                    !destination || 
                    isSubmitting
                  }
                >
                  Add to Booking List
                </Button>
              </CardContent>
            </Card>

            {bookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Booking List ({bookings.length})</CardTitle>
                  <CardDescription>
                    Review your rides before confirming. Click the trash icon to remove.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {bookings.map((booking, index) => {
                      const distance = calculateDistance(booking.pickup, booking.destination);
                      const cost = calculateCost(distance, booking.timeSlotId);
                      
                      return (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 border rounded-lg bg-background"
                        >
                          <div className="flex-1">
                            <p className="font-medium">
                              {booking.date.toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })} at {booking.time}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.pickup} → {booking.destination}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                          
                              
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeBooking(index)}
                            disabled={isSubmitting}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  
                  <Button 
                    onClick={confirmAllBookings} 
                    className="w-full mt-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing Bookings...
                      </>
                    ) : (
                      'Confirm All Bookings'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;