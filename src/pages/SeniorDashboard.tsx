
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Crown, TrendingUp, Users, Calendar, Download, BarChart3, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OverallStats {
  totalStudents: number;
  totalTrips: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeRoutes: number;
  avgOccupancy: number;
}

interface MonthlyData {
  month: string;
  trips: number;
  revenue: number;
  students: number;
}

interface RoutePerformance {
  route: string;
  trips: number;
  revenue: number;
  occupancy: string;
  type: string;
}

const SeniorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalStudents: 0,
    totalTrips: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    activeRoutes: 0,
    avgOccupancy: 0
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [routePerformance, setRoutePerformance] = useState<RoutePerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch overall stats
      const [studentsData, bookingsData, tripsData] = await Promise.all([
        supabase.from('users').select('*').eq('role', 'student'),
        supabase.from('bookings').select('*, trips(date)').eq('cancelled', false),
        supabase.from('trips').select('*, bookings(*)')
      ]);

      if (studentsData.error) throw studentsData.error;
      if (bookingsData.error) throw bookingsData.error;
      if (tripsData.error) throw tripsData.error;

      const totalStudents = studentsData.data?.length || 0;
      const totalBookings = bookingsData.data?.length || 0;
      const totalRevenue = bookingsData.data?.reduce((sum, booking) => sum + (booking.cost || 0), 0) || 0;
      const activeRoutes = new Set(tripsData.data?.map(trip => JSON.stringify(trip.route)).filter(Boolean)).size;
      
      // Calculate average occupancy (assuming 15 seat capacity)
      const totalCapacity = (tripsData.data?.length || 0) * 15;
      const avgOccupancy = totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0;

      setOverallStats({
        totalStudents,
        totalTrips: totalBookings,
        totalRevenue,
        monthlyGrowth: 0, // Would need historical data to calculate
        activeRoutes,
        avgOccupancy
      });

      // Process monthly data
      const monthlyStats: Record<string, MonthlyData> = {};
      bookingsData.data?.forEach(booking => {
        if (booking.trips?.date) {
          const date = new Date(booking.trips.date);
          const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          
          if (!monthlyStats[monthKey]) {
            monthlyStats[monthKey] = {
              month: monthKey,
              trips: 0,
              revenue: 0,
              students: new Set().size
            };
          }
          
          monthlyStats[monthKey].trips += 1;
          monthlyStats[monthKey].revenue += booking.cost || 0;
        }
      });

      setMonthlyData(Object.values(monthlyStats).slice(-6)); // Last 6 months

      // Process route performance
      const routeStats: Record<string, RoutePerformance> = {};
      tripsData.data?.forEach(trip => {
        if (trip.route && Array.isArray(trip.route)) {
          const routeKey = trip.route.join(' → ');
          const validBookings = (trip.bookings || []).filter(b => !b.cancelled);
          
          if (!routeStats[routeKey]) {
            routeStats[routeKey] = {
              route: routeKey,
              trips: 0,
              revenue: 0,
              occupancy: '0%',
              type: 'Free'
            };
          }
          
          const stats = routeStats[routeKey];
          stats.trips += validBookings.length;
          stats.revenue += validBookings.reduce((sum, b) => sum + (b.cost || 0), 0);
          stats.occupancy = `${Math.round((validBookings.length / 15) * 100)}%`;
          stats.type = stats.revenue > 0 ? 'Paid' : 'Free';
        }
      });

      setRoutePerformance(Object.values(routeStats));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const exportData = (dataType: string) => {
    try {
      let csvContent = '';
      let filename = '';

      switch (dataType) {
        case 'monthly':
          csvContent = 'Month,Trips,Revenue (ZAR),Active Students\n';
          monthlyData.forEach(item => {
            csvContent += `${item.month},${item.trips},${item.revenue},${item.students}\n`;
          });
          filename = 'monthly-performance.csv';
          break;

        case 'routes':
          csvContent = 'Route,Total Trips,Revenue (ZAR),Occupancy,Type\n';
          routePerformance.forEach(route => {
            csvContent += `"${route.route}",${route.trips},${route.revenue},"${route.occupancy}",${route.type}\n`;
          });
          filename = 'route-performance.csv';
          break;

        case 'summary':
          csvContent = 'Metric,Value\n';
          csvContent += `Total Students,${overallStats.totalStudents}\n`;
          csvContent += `Total Trips,${overallStats.totalTrips}\n`;
          csvContent += `Total Revenue,R${overallStats.totalRevenue}\n`;
          csvContent += `Monthly Growth,${overallStats.monthlyGrowth}%\n`;
          csvContent += `Active Routes,${overallStats.activeRoutes}\n`;
          csvContent += `Average Occupancy,${overallStats.avgOccupancy}%\n`;
          filename = 'summary-report.csv';
          break;

        default:
          throw new Error('Invalid data type');
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: `${filename} has been downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Senior Executive Dashboard</h1>
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
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{overallStats.totalStudents}</p>
                  <p className="text-sm text-gray-600">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{overallStats.totalTrips}</p>
                  <p className="text-sm text-gray-600">Total Trips</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">R{overallStats.totalRevenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold">{overallStats.monthlyGrowth}%</p>
                  <p className="text-sm text-gray-600">Monthly Growth</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{overallStats.activeRoutes}</p>
                  <p className="text-sm text-gray-600">Active Routes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-2xl font-bold">{overallStats.avgOccupancy}%</p>
                  <p className="text-sm text-gray-600">Avg Occupancy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="monthly" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monthly">Monthly Performance</TabsTrigger>
            <TabsTrigger value="routes">Route Analysis</TabsTrigger>
            <TabsTrigger value="exports">Data Exports</TabsTrigger>
          </TabsList>

          {/* Monthly Performance */}
          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Monthly Performance Overview</CardTitle>
                    <CardDescription>Key metrics tracked month over month</CardDescription>
                  </div>
                  <Button onClick={() => exportData('monthly')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Monthly Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Total Trips</TableHead>
                        <TableHead>Revenue (ZAR)</TableHead>
                        <TableHead>Active Students</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.month}</TableCell>
                          <TableCell>{item.trips}</TableCell>
                          <TableCell>R{item.revenue.toFixed(2)}</TableCell>
                          <TableCell>{item.students}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Route Analysis */}
          <TabsContent value="routes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Route Performance Analysis</CardTitle>
                    <CardDescription>Performance metrics for each shuttle route</CardDescription>
                  </div>
                  <Button onClick={() => exportData('routes')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Route Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route</TableHead>
                        <TableHead>Total Trips</TableHead>
                        <TableHead>Revenue (ZAR)</TableHead>
                        <TableHead>Occupancy</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routePerformance.map((route, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{route.route}</TableCell>
                          <TableCell>{route.trips}</TableCell>
                          <TableCell>R{route.revenue.toFixed(2)}</TableCell>
                          <TableCell>{route.occupancy}</TableCell>
                          <TableCell>
                            <Badge variant={route.type === 'Free' ? 'secondary' : 'default'}>
                              {route.type}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Exports */}
          <TabsContent value="exports">
            <Card>
              <CardHeader>
                <CardTitle>Data Export Center</CardTitle>
                <CardDescription>Export comprehensive reports and data sets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Summary Report</h3>
                      <p className="text-sm text-gray-600 mb-4">Overall system performance metrics</p>
                      <Button onClick={() => exportData('summary')} className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Export Summary
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed border-gray-200 hover:border-green-300 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Calendar className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Monthly Data</h3>
                      <p className="text-sm text-gray-600 mb-4">Month-by-month performance data</p>
                      <Button onClick={() => exportData('monthly')} className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Export Monthly
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors">
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Route Analysis</h3>
                      <p className="text-sm text-gray-600 mb-4">Detailed route performance metrics</p>
                      <Button onClick={() => exportData('routes')} className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Export Routes
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SeniorDashboard;
