
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Users, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import TripReports from '../components/TripReports';
import ShuttleStopsManager from '../components/ShuttleStopsManager';
import StudentManagement from '../components/StudentManagement';
import RateManagement from '../components/RateManagement';
import ShuttleStopsDisplay from '../components/ShuttleStopsDisplay';
import { useStudents } from '../hooks/useStudents';
import { useRates } from '../hooks/useRates';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { students } = useStudents();
  const { activeRate } = useRates();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate statistics from real data
  const statsData = {
    totalStudents: students.length,
    totalTrips: 1247, // This would come from trips data
    activeBookings: 89, // This would come from bookings data
    totalRevenue: 1580, // This would be calculated from completed trips
    unpaidAmount: 340 // This would come from billing data
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Manager Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{statsData.totalStudents}</p>
                  <p className="text-sm text-gray-600">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{statsData.totalTrips}</p>
                  <p className="text-sm text-gray-600">Total Trips</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{statsData.activeBookings}</p>
                  <p className="text-sm text-gray-600">Active Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">R{statsData.totalRevenue}</p>
                  <p className="text-sm text-gray-600">Total Revenue (ZAR)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">R{statsData.unpaidAmount}</p>
                  <p className="text-sm text-gray-600">Unpaid Amount (ZAR)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Rate Display */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Current Trip Rate</p>
                  <p className="text-xl font-bold text-green-600">
                    R{activeRate?.rate_per_km || '6.00'} per km
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="rates">Trip Rates</TabsTrigger>
            <TabsTrigger value="stops-view">Shuttle Stops</TabsTrigger>
            <TabsTrigger value="reports">Trip Reports</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="stops-manage">Manage Stops</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <StudentManagement />
          </TabsContent>

          <TabsContent value="rates">
            <RateManagement />
          </TabsContent>

          <TabsContent value="stops-view">
            <ShuttleStopsDisplay />
          </TabsContent>

          <TabsContent value="reports">
            <TripReports />
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-500">Billing management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stops-manage">
            <ShuttleStopsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagerDashboard;
