
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Crown, TrendingUp, Users, Calendar, Download, BarChart3, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

// Mock data for senior dashboard
const overallStats = {
  totalStudents: 156,
  totalTrips: 1247,
  totalRevenue: 9480,
  monthlyGrowth: 12.5,
  activeRoutes: 8,
  avgOccupancy: 87
};

const monthlyData = [
  { month: 'January', trips: 98, revenue: 720, students: 45 },
  { month: 'February', trips: 112, revenue: 810, students: 48 },
  { month: 'March', trips: 124, revenue: 888, students: 52 },
  { month: 'April', trips: 118, revenue: 852, students: 49 },
  { month: 'May', trips: 132, revenue: 990, students: 55 },
  { month: 'June', trips: 145, revenue: 1068, students: 58 }
];

const routePerformance = [
  { route: 'Dormitory A → Main Campus', trips: 245, revenue: 0, occupancy: '94%', type: 'Free' },
  { route: 'Main Campus → Library', trips: 198, revenue: 0, occupancy: '89%', type: 'Free' },
  { route: 'Sports Center → Dormitory B', trips: 156, revenue: 4680, occupancy: '78%', type: 'Paid' },
  { route: 'Medical Center → Main Campus', trips: 134, revenue: 4020, occupancy: '71%', type: 'Paid' },
  { route: 'Library → Dormitory A', trips: 112, revenue: 0, occupancy: '83%', type: 'Free' }
];

const SeniorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

      // Create and trigger download
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
                  <p className="text-2xl font-bold">R{overallStats.totalRevenue}</p>
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
                          <TableCell>R{item.revenue}</TableCell>
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
                          <TableCell>R{route.revenue}</TableCell>
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
