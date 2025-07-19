
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Users, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import TripReports from '../components/TripReports';
import StudentManagement from '../components/StudentManagement';
import RateManagement from '../components/RateManagement';
import ManageStops from '../components/ManageStops';
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
    totalTrips: 0, // Will be populated from real data when implemented
    activeBookings: 0, // Will be populated from real data when implemented
    totalRevenue: 0, // Will be populated from real data when implemented
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="rates">Trip Rates</TabsTrigger>
            <TabsTrigger value="stops">Manage Stops</TabsTrigger>
            <TabsTrigger value="reports">Trip Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <StudentManagement />
          </TabsContent>

          <TabsContent value="rates">
            <RateManagement />
          </TabsContent>

          <TabsContent value="stops">
            <ManageStops />
          </TabsContent>

          <TabsContent value="reports">
            <TripReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagerDashboard;
