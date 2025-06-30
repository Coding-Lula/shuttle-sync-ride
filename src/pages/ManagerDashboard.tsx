
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LogOut, Users, TrendingUp, Calendar, UserPlus, BarChart3, Download } from 'lucide-react';

// Mock data for students
const studentsData = [
  { id: '1', name: 'John Doe', email: 'john@example.com', type: 'community', totalTrips: 24, unpaidTrips: 2 },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@example.com', type: 'yoyl', totalTrips: 18, unpaidTrips: 0 },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', type: 'community', totalTrips: 31, unpaidTrips: 1 },
  { id: '4', name: 'Emily Brown', email: 'emily@example.com', type: 'yoyl', totalTrips: 12, unpaidTrips: 3 }
];

// Mock data for statistics
const statsData = {
  totalStudents: 156,
  totalTrips: 1247,
  activeBookings: 89,
  mostUsedSlot: '08:00 AM'
};

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState(studentsData);
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
        unpaidTrips: 0
      }]);
      setNewStudent({ name: '', email: '', type: 'community' });
      setShowAddStudent(false);
    }
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
                  <p className="text-lg font-bold">{statsData.mostUsedSlot}</p>
                  <p className="text-sm text-gray-600">Most Used Slot</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Student Management</span>
                </CardTitle>
                <CardDescription>Manage student accounts and track their usage</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => setShowAddStudent(!showAddStudent)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
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
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={student.type === 'community' ? 'default' : 'secondary'}>
                      {student.type}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium">{student.totalTrips} total trips</p>
                      {student.unpaidTrips > 0 && (
                        <p className="text-sm text-red-600">{student.unpaidTrips} unpaid</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
