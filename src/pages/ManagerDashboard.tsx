
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Users, TrendingUp, Calendar, UserPlus, BarChart3, Download, Trash2 } from 'lucide-react';
import TripReports from '../components/TripReports';
import { useToast } from '@/hooks/use-toast';

// Mock data for students with enhanced information
const initialStudentsData = [
  { id: '1', name: 'John Doe', email: 'john@example.com', type: 'community', totalTrips: 24, unpaidTrips: 2, totalDistance: 54.2, unpaidAmount: 10 },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@example.com', type: 'yoyl', totalTrips: 18, unpaidTrips: 0, totalDistance: 41.4, unpaidAmount: 0 },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', type: 'community', totalTrips: 31, unpaidTrips: 1, totalDistance: 69.3, unpaidAmount: 5 },
  { id: '4', name: 'Emily Brown', email: 'emily@example.com', type: 'yoyl', totalTrips: 12, unpaidTrips: 3, totalDistance: 28.8, unpaidAmount: 15 }
];

// Mock usage statistics
const usageStats = {
  mostUsedSlots: [
    { time: '07:30', bookings: 89, type: 'free' },
    { time: '16:45', bookings: 83, type: 'free' },
    { time: '08:45', bookings: 76, type: 'free' }
  ],
  leastUsedSlots: [
    { time: '10:45', bookings: 12, type: 'paid' },
    { time: '11:45', bookings: 23, type: 'free' },
    { time: '12:45', bookings: 34, type: 'free' }
  ]
};

// Mock statistics
const statsData = {
  totalStudents: 156,
  totalTrips: 1247,
  activeBookings: 89,
  totalRevenue: 1580,
  unpaidAmount: 340
};

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState(initialStudentsData);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', type: 'community' });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const addStudent = () => {
    if (newStudent.name && newStudent.email) {
      setStudents([...students, {
        id: Date.now().toString(),
        ...newStudent,
        totalTrips: 0,
        unpaidTrips: 0,
        totalDistance: 0,
        unpaidAmount: 0
      }]);
      setNewStudent({ name: '', email: '', type: 'community' });
      setShowAddStudent(false);
      toast({
        title: "Student added",
        description: `${newStudent.name} has been added successfully.`,
      });
    }
  };

  const removeStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setStudents(students.filter(s => s.id !== studentId));
    toast({
      title: "Student removed",
      description: `${student?.name} has been removed successfully.`,
    });
  };

  const updateStudentType = (studentId: string, newType: string) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, type: newType }
        : student
    ));
    toast({
      title: "Student type updated",
      description: "Student type has been changed successfully.",
    });
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
                  <p className="text-2xl font-bold">${statsData.totalRevenue}</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">${statsData.unpaidAmount}</p>
                  <p className="text-sm text-gray-600">Unpaid Amount</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students">Student Management</TabsTrigger>
            <TabsTrigger value="reports">Trip Reports</TabsTrigger>
            <TabsTrigger value="billing">Billing Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
          </TabsList>

          {/* Student Management */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Student Management</span>
                    </CardTitle>
                    <CardDescription>Add, remove, and manage student accounts</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddStudent(!showAddStudent)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddStudent && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium mb-3">Add New Student</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        placeholder="Student Name"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                      />
                      <Input
                        placeholder="Email Address"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                      />
                      <Select value={newStudent.type} onValueChange={(value) => setNewStudent({...newStudent, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="community">Community</SelectItem>
                          <SelectItem value="yoyl">YOYL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button onClick={addStudent}>Add Student</Button>
                      <Button variant="outline" onClick={() => setShowAddStudent(false)}>Cancel</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                          <p className="text-sm text-blue-600">{student.totalDistance} km traveled</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Select
                          value={student.type}
                          onValueChange={(value) => updateStudentType(student.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="community">Community</SelectItem>
                            <SelectItem value="yoyl">YOYL</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-right">
                          <p className="text-sm font-medium">{student.totalTrips} trips</p>
                          {student.unpaidTrips > 0 && (
                            <p className="text-sm text-red-600">${student.unpaidAmount} unpaid</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeStudent(student.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trip Reports */}
          <TabsContent value="reports">
            <TripReports />
          </TabsContent>

          {/* Billing Overview */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing Overview</CardTitle>
                <CardDescription>Monitor billing based on distance calculations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.filter(s => s.unpaidAmount > 0).map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.unpaidTrips} unpaid trips</p>
                        <p className="text-sm text-blue-600">{student.totalDistance} km total distance</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">${student.unpaidAmount}</p>
                        <Badge variant="destructive">Overdue</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Statistics */}
          <TabsContent value="usage">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Most Used Time Slots</CardTitle>
                  <CardDescription>Highest booking volumes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {usageStats.mostUsedSlots.map((slot, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-center min-w-[3rem]">
                            <p className="font-medium">{slot.time}</p>
                          </div>
                          <Badge variant={slot.type === 'free' ? 'secondary' : 'default'}>
                            {slot.type === 'free' ? 'Free' : 'Paid'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{slot.bookings} bookings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Least Used Time Slots</CardTitle>
                  <CardDescription>Lowest booking volumes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {usageStats.leastUsedSlots.map((slot, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-center min-w-[3rem]">
                            <p className="font-medium">{slot.time}</p>
                          </div>
                          <Badge variant={slot.type === 'free' ? 'secondary' : 'default'}>
                            {slot.type === 'free' ? 'Free' : 'Paid'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">{slot.bookings} bookings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagerDashboard;
