
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for available time slots
const timeSlots = [
  { time: '07:00', type: 'free', available: true },
  { time: '08:00', type: 'paid', available: true },
  { time: '09:00', type: 'paid', available: false },
  { time: '10:00', type: 'free', available: true },
  { time: '17:00', type: 'paid', available: true },
  { time: '17:30', type: 'free', available: true },
  { time: '18:00', type: 'paid', available: true },
];

const locations = [
  'Dormitory A',
  'Dormitory B',
  'Main Campus',
  'Library',
  'Sports Center',
  'Medical Center'
];

const BookingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [pickup, setPickup] = useState<string>(user?.startLocation || '');
  const [destination, setDestination] = useState<string>('');

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || !pickup || !destination) {
      toast({
        title: "Incomplete booking",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Booking confirmed!",
      description: `Your ride on ${selectedDate.toLocaleDateString()} at ${selectedTime} has been booked.`,
    });
    
    navigate('/student');
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
            <h1 className="text-lg font-semibold">Book New Ride</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Date & Time Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>Choose a date up to 7 days in advance</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => 
                    date < new Date() || 
                    date > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  }
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Time Slots</CardTitle>
                <CardDescription>Select your preferred departure time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className="flex items-center justify-between p-4 h-auto"
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{slot.time}</span>
                      </div>
                      <Badge variant={slot.type === 'free' ? 'secondary' : 'default'}>
                        {slot.type === 'free' ? 'Free' : 'Paid'}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Location & Booking Summary */}
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
              </CardContent>
            </Card>

            {/* Booking Summary */}
            {selectedDate && selectedTime && pickup && destination && (
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route:</span>
                    <span className="font-medium">{pickup} → {destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost:</span>
                    <div className="flex items-center space-x-1">
                      {timeSlots.find(s => s.time === selectedTime)?.type === 'free' ? (
                        <Badge variant="secondary">Free</Badge>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">Paid</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button onClick={handleBooking} className="w-full mt-6">
                    Confirm Booking
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
