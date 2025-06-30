import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, TrendingUp, AlertTriangle, DollarSign, Users, Calendar, Download, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for senior overview
const overviewData = {
  totalRevenue: 15680,
  unpaidAmount: 2340,
  totalStudents: 156,
  totalTrips: 1247,
  unpaidTrips: 23
};

const unpaidStudents = [
  { name: 'John Doe', unpaidTrips: 3, amount: 45 },
  { name: 'Emily Brown', unpaidTrips: 2, amount: 30 },
  { name: 'Mike Johnson', unpaidTrips: 1, amount: 15 },
  { name: 'Sarah Wilson', unpaidTrips: 4, amount: 60 }
];

const monthlyStats = [
  { month: 'Jan', trips: 180, revenue: 2700 },
  { month: 'Feb', trips: 165, revenue: 2475 },
  { month: 'Mar', trips: 220, revenue: 3300 },
  { month: 'Apr', trips: 195, revenue: 2925 },
  { month: 'May', trips: 210, revenue: 3150 },
  { month: 'Jun', trips: 277, revenue: 4155 }
];

const SeniorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const exportToExcel = () => {
    // In a real implementation, this would generate and download an Excel file
    toast({
      title: "Export started",
      description: "Your data export is being prepared and will download shortly.",
    });
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export completed",
        description: "System data has been exported to Excel successfully.",
      });
    }, 2000);
  };

  const delegateToManager = () => {
    toast({
      title: "Enforcement delegated",
      description: "Payment enforcement has been delegated to the manager.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Executive Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={exportToExcel} variant="outline">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">$15,680</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">$2,340</p>
                  <p className="text-sm text-gray-600">Unpaid Amount</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-gray-600">Active Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-sm text-gray-600">Total Trips</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-sm text-gray-600">Unpaid Trips</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Unpaid Trips Alert */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Unpaid Rides Alert</span>
                  </CardTitle>
                  <CardDescription>Students with outstanding payments</CardDescription>
                </div>
                <Button onClick={delegateToManager} variant="outline" size="sm">
                  Delegate to Manager
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-600">3 unpaid trips</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">$45</p>
                    <Badge variant="destructive">Overdue</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium">Emily Brown</p>
                    <p className="text-sm text-gray-600">2 unpaid trips</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">$30</p>
                    <Badge variant="destructive">Overdue</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium">Mike Johnson</p>
                    <p className="text-sm text-gray-600">1 unpaid trip</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">$15</p>
                    <Badge variant="destructive">Overdue</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium">Sarah Wilson</p>
                    <p className="text-sm text-gray-600">4 unpaid trips</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">$60</p>
                    <Badge variant="destructive">Overdue</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Monthly Performance</span>
              </CardTitle>
              <CardDescription>Trip volume and revenue trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-center min-w-[3rem]">
                      <p className="font-medium">Jan</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">180 trips</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">$2,700</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-center min-w-[3rem]">
                      <p className="font-medium">Feb</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">165 trips</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">$2,475</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-center min-w-[3rem]">
                      <p className="font-medium">Mar</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">220 trips</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">$3,300</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-center min-w-[3rem]">
                      <p className="font-medium">Apr</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">195 trips</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">$2,925</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-center min-w-[3rem]">
                      <p className="font-medium">May</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">210 trips</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">$3,150</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-center min-w-[3rem]">
                      <p className="font-medium">Jun</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">277 trips</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">$4,155</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Health Summary</CardTitle>
            <CardDescription>Overall system performance and usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">94%</div>
                <p className="text-sm text-gray-600">On-time Performance</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">87%</div>
                <p className="text-sm text-gray-600">Capacity Utilization</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">4.8</div>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeniorDashboard;
