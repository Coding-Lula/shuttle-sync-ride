
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock, BarChart3, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock data for reports
const tripReportsData = {
  perStudent: [
    { studentName: 'John Doe', totalTrips: 24, paidTrips: 8, freeTrips: 16, totalDistance: 54.2, totalCost: 40 },
    { studentName: 'Sarah Wilson', totalTrips: 18, paidTrips: 6, freeTrips: 12, totalDistance: 41.4, totalCost: 30 },
    { studentName: 'Mike Johnson', totalTrips: 31, paidTrips: 12, freeTrips: 19, totalDistance: 69.3, totalCost: 60 },
    { studentName: 'Emily Brown', totalTrips: 12, paidTrips: 9, freeTrips: 3, totalDistance: 28.8, totalCost: 45 }
  ],
  perTimeSlot: [
    { timeSlot: '07:30', totalBookings: 89, avgOccupancy: '94%', revenue: 0, type: 'free' },
    { timeSlot: '08:45', totalBookings: 76, avgOccupancy: '87%', revenue: 0, type: 'free' },
    { timeSlot: '09:45', totalBookings: 45, avgOccupancy: '72%', revenue: 225, type: 'paid' },
    { timeSlot: '14:45', totalBookings: 52, avgOccupancy: '81%', revenue: 260, type: 'paid' },
    { timeSlot: '16:45', totalBookings: 83, avgOccupancy: '91%', revenue: 0, type: 'free' }
  ],
  customDateRange: [
    { date: '2024-06-24', totalTrips: 23, revenue: 85, avgDistance: 2.1 },
    { date: '2024-06-25', totalTrips: 19, revenue: 70, avgDistance: 1.9 },
    { date: '2024-06-26', totalTrips: 27, revenue: 95, avgDistance: 2.3 },
    { date: '2024-06-27', totalTrips: 21, revenue: 75, avgDistance: 2.0 },
    { date: '2024-06-28', totalTrips: 25, revenue: 90, avgDistance: 2.2 }
  ]
};

const TripReports = () => {
  const [reportType, setReportType] = useState<'student' | 'timeSlot' | 'dateRange'>('student');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const exportToExcel = () => {
    // In a real implementation, this would generate and download an Excel file
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Trip Reports</span>
          </CardTitle>
          <CardDescription>Generate comprehensive reports for trips and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Select value={reportType} onValueChange={(value: 'student' | 'timeSlot' | 'dateRange') => setReportType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Per Student</SelectItem>
                <SelectItem value="timeSlot">Per Time Slot</SelectItem>
                <SelectItem value="dateRange">Date Range</SelectItem>
              </SelectContent>
            </Select>

            {reportType === 'student' && (
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Students</SelectItem>
                  <SelectItem value="john">John Doe</SelectItem>
                  <SelectItem value="sarah">Sarah Wilson</SelectItem>
                  <SelectItem value="mike">Mike Johnson</SelectItem>
                  <SelectItem value="emily">Emily Brown</SelectItem>
                </SelectContent>
              </Select>
            )}

            {reportType === 'dateRange' && (
              <>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-40"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-40"
                />
              </>
            )}

            <Button onClick={exportToExcel} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>

          {/* Per Student Report */}
          {reportType === 'student' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Total Trips</TableHead>
                  <TableHead>Paid Trips</TableHead>
                  <TableHead>Free Trips</TableHead>
                  <TableHead>Distance (km)</TableHead>
                  <TableHead>Total Cost ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tripReportsData.perStudent.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{student.studentName}</TableCell>
                    <TableCell>{student.totalTrips}</TableCell>
                    <TableCell>{student.paidTrips}</TableCell>
                    <TableCell>{student.freeTrips}</TableCell>
                    <TableCell>{student.totalDistance}</TableCell>
                    <TableCell>${student.totalCost}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Per Time Slot Report */}
          {reportType === 'timeSlot' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Total Bookings</TableHead>
                  <TableHead>Avg Occupancy</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Revenue ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tripReportsData.perTimeSlot.map((slot, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{slot.timeSlot}</TableCell>
                    <TableCell>{slot.totalBookings}</TableCell>
                    <TableCell>{slot.avgOccupancy}</TableCell>
                    <TableCell>
                      <Badge variant={slot.type === 'free' ? 'secondary' : 'default'}>
                        {slot.type === 'free' ? 'Free' : 'Paid'}
                      </Badge>
                    </TableCell>
                    <TableCell>${slot.revenue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Date Range Report */}
          {reportType === 'dateRange' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Trips</TableHead>
                  <TableHead>Revenue ($)</TableHead>
                  <TableHead>Avg Distance (km)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tripReportsData.customDateRange.map((day, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{day.date}</TableCell>
                    <TableCell>{day.totalTrips}</TableCell>
                    <TableCell>${day.revenue}</TableCell>
                    <TableCell>{day.avgDistance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TripReports;
