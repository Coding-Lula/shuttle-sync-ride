import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Clock, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '../lib/supabaseClient';

// All time slots are available to all users
const timeSlots = [
  { time: '07:30', available: true, type: 'free' },
  { time: '08:45', available: true, type: 'free' },
  { time: '09:45', available: true, type: 'paid' },
  { time: '10:45', available: true, type: 'paid' },
  { time: '11:45', available: true, type: 'free' },
  { time: '12:45', available: true, type: 'free' },
  { time: '14:45', available: true, type: 'paid' },
  { time: '15:45', available: true, type: 'free' },
  { time: '16:45', available: true, type: 'free' }
];

interface BookingItem {
  date: Date;
  time: string;
  pickup: string;
  destination: string;
}

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

const BookingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [pickup, setPickup] = useState<string>(user?.startLocation || '');
  const [destination, setDestination] = useState<string>('');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [stops, setStops] = useState<string[]>([]);

  useEffect(() => {
    // Fetch bus stops from the database
    const fetchStops = async () => {
      const { data, error } = await supabase.from('stops').select('name');
      if (error) {
        console.error('Error fetching stops:', error.message);
        toast({
          title: "Error",
          description: "Could not fetch bus stops.",
          variant: "destructive",
        });
      } else if (data) {
        setStops(data.map((stop) => stop.name));
      }
    };
    fetchStops();
  }, [toast]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
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

    // Requirement: Prevent booking pickup and destination as the same place
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

    const newBookings = selectedDates.map(date => ({
      date,
      time: selectedTime,
      pickup,
      destination
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

    const bookingData = bookings.map(booking => ({
        user_id: user?.id,
        booking_date: booking.date.toISOString().split('T')[0], // format as YYYY-MM-DD
        booking_time: booking.time,
        pickup_location: booking.pickup,
        destination_location: booking.destination,
        status: 'confirmed', // Or any default status
        student_type: user?.studentType, // Save the student type for accounting
        fare_type: timeSlots.find(slot => slot.time === booking.time)?.type
    }));

    const { error } = await supabase.from('bookings').insert(bookingData);

    if (error) {
        toast({
            title: "Booking Failed",
            description: `An error occurred: ${error.message}`,
            variant: "destructive",
        });
    } else {
        toast({
            title: "Bookings Confirmed!",
            description: `${bookings.length} ride(s) successfully booked.`,
        });
        setBookings([]);
        navigate('/student');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => navigate('/student')} className="mr-4">
              <ArrowLeft className="w-4 h-4" />
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
                <CardDescription>You can select multiple dates up to 7 days in advance.</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={setSelectedDates}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                    date > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  }
                  className="rounded-md border"
                />
                {selectedDates.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Selected dates:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDates.map((date, index) => (
                        <Badge key={index} variant="outline">
                          {date.toLocaleDateString()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Time</CardTitle>
                <CardDescription>Choose your preferred departure time.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {timeSlots.map((slot) => {

                    const hasPassed = selectedDates.length > 0 && selectedDates.every(date => isTimeSlotPassed(slot.time, date));
                    const isDisabled = !slot.available || hasPassed;

                    return (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        disabled={isDisabled}
                        onClick={() => setSelectedTime(slot.time)}
                        className="flex items-center justify-between p-4 h-auto"
                      >
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{slot.time}</span>
                          {hasPassed && <span className="text-xs text-muted-foreground">(Passed)</span>}
                        </div>
                        <Badge variant={slot.type === 'free' ? 'secondary' : 'default'}>
                          {slot.type === 'free' ? 'Free' : 'Paid'}
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
                <CardDescription>Choose your pickup and destination points.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Pickup Location</label>
                  <Select value={pickup} onValueChange={setPickup}>
                    <SelectTrigger><SelectValue placeholder="Select a pickup location" /></SelectTrigger>
                    <SelectContent>
                      {stops.map((stop) => (
                        <SelectItem key={`pickup-${stop}`} value={stop}>
                          <div className="flex items-center space-x-2"><MapPin className="w-4 h-4" /><span>{stop}</span></div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Destination</label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger><SelectValue placeholder="Select a destination" /></SelectTrigger>
                    <SelectContent>
                      {stops.map((stop) => (
                        <SelectItem key={`dest-${stop}`} value={stop} disabled={pickup === stop}>
                          <div className="flex items-center space-x-2"><MapPin className="w-4 h-4" /><span>{stop}</span></div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addToBookings} className="w-full">Add to Booking List</Button>
              </CardContent>
            </Card>

            {bookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Booking List ({bookings.length})</CardTitle>
                  <CardDescription>Review your rides before confirming.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {bookings.map((booking, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                        <div className="flex-1">
                          <p className="font-medium">{booking.date.toLocaleDateString()} at {booking.time}</p>
                          <p className="text-sm text-muted-foreground">{booking.pickup} → {booking.destination}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeBooking(index)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button onClick={confirmAllBookings} className="w-full mt-4">Confirm All Bookings</Button>
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