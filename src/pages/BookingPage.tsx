
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Clock, DollarSign, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Updated time slots based on requirements
const timeSlots = [
  { time: '07:30', type: 'free', available: true, label: 'Free for Community Students' },
  { time: '08:45', type: 'free', available: true, label: 'Free for Community Students' },
  { time: '09:45', type: 'paid', available: true, label: 'Paid' },
  { time: '10:45', type: 'paid', available: false, label: 'Paid' },
  { time: '11:45', type: 'free', available: true, label: 'Free for Community Students' },
  { time: '12:45', type: 'free', available: true, label: 'Free for Community Students' },
  { time: '14:45', type: 'paid', available: true, label: 'Paid' },
  { time: '15:45', type: 'free', available: true, label: 'Free for Community Students' },
  { time: '16:45', type: 'free', available: true, label: 'Free for Community Students' }
];

const locations = [
  'Dormitory A',
  'Dormitory B',
  'Main Campus',
  'Library',
  'Sports Center',
  'Medical Center'
];

// Mock distance data
const getDistance = (pickup: string, destination: string) => {
  const distances: Record<string, Record<string, number>> = {
    'Dormitory A': { 'Main Campus': 2.3, 'Library': 1.8, 'Sports Center': 3.1, 'Medical Center': 2.7, 'Dormitory B': 0.8 },
    'Dormitory B': { 'Main Campus': 2.1, 'Library': 1.6, 'Sports Center': 2.9, 'Medical Center': 2.5, 'Dormitory A': 0.8 },
    'Main Campus': { 'Dormitory A': 2.3, 'Dormitory B': 2.1, 'Library': 0.5, 'Sports Center': 1.2, 'Medical Center': 0.8 },
    'Library': { 'Dormitory A': 1.8, 'Dormitory B': 1.6, 'Main Campus': 0.5, 'Sports Center': 1.7, 'Medical Center': 1.3 },
    'Sports Center': { 'Dormitory A': 3.1, 'Dormitory B': 2.9, 'Main Campus': 1.2, 'Library': 1.7, 'Medical Center': 2.0 },
    'Medical Center': { 'Dormitory A': 2.7, 'Dormitory B': 2.5, 'Main Campus': 0.8, 'Library': 1.3, 'Sports Center': 2.0 }
  };
  return distances[pickup]?.[destination] || 0;
};

interface BookingItem {
  date: Date;
  time: string;
  pickup: string;
  destination: string;
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

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const isAlreadySelected = selectedDates.some(d => 
      d.toDateString() === date.toDateString()
    );
    
    if (isAlreadySelected) {
      setSelectedDates(selectedDates.filter(d => 
        d.toDateString() !== date.toDateString()
      ));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const addToBookings = () => {
    if (selectedDates.length === 0 || !selectedTime || !pickup || !destination) {
      toast({
        title: "Incomplete booking",
        description: "Please fill in all required fields and select at least one date",
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
      title: "Added to booking list",
      description: `${newBookings.length} ride(s) added to your booking list`,
    });
  };

  const removeBooking = (index: number) => {
    setBookings(bookings.filter((_, i) => i !== index));
  };

  const confirmAllBookings = () => {
    if (bookings.length === 0) {
      toast({
        title: "No bookings to confirm",
        description: "Please add some rides to your booking list first",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "All bookings confirmed!",
      description: `${bookings.length} ride(s) have been successfully booked.`,
    });
    
    navigate('/student');
  };

  const canUserBookFreeSlot = (slotType: string) => {
    return slotType === 'paid' || user?.studentType === 'community';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Date & Time Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Dates</CardTitle>
                <CardDescription>Choose multiple dates up to 7 days in advance. Click dates to toggle selection.</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => dates && setSelectedDates(dates)}
                  disabled={(date) => 
                    date < new Date() || 
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
                <CardTitle>Available Time Slots</CardTitle>
                <CardDescription>Select your preferred departure time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {timeSlots.map((slot) => {
                    const canBook = canUserBookFreeSlot(slot.type);
                    return (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        disabled={!slot.available || !canBook}
                        onClick={() => setSelectedTime(slot.time)}
                        className="flex items-center justify-between p-4 h-auto"
                      >
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{slot.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={slot.type === 'free' ? 'secondary' : 'default'}>
                            {slot.type === 'free' ? 'Free' : 'Paid'}
                          </Badge>
                          {!canBook && (
                            <Badge variant="destructive">YOYL Only</Badge>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Location & Booking Management */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Route Details</CardTitle>
                <CardDescription>Select your pickup and destination</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Pickup Location</label>
                  <Select value={pickup} onValueChange={setPickup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pickup location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{location}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Destination</label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{location}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {pickup && destination && pickup !== destination && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      Distance: {getDistance(pickup, destination)} km
                    </p>
                  </div>
                )}

                <Button onClick={addToBookings} className="w-full">
                  Add to Booking List
                </Button>
              </CardContent>
            </Card>

            {/* Booking List */}
            {bookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Booking List ({bookings.length})</CardTitle>
                  <CardDescription>Review your rides before confirming</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {bookings.map((booking, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{booking.date.toLocaleDateString()} at {booking.time}</p>
                          <p className="text-sm text-gray-600">{booking.pickup} → {booking.destination}</p>
                          <p className="text-sm text-blue-600">{getDistance(booking.pickup, booking.destination)} km</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBooking(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button onClick={confirmAllBookings} className="w-full mt-4">
                    Confirm All Bookings
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
