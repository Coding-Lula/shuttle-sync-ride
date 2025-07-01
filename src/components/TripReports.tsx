
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Download, FileSpreadsheet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

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

// Calculate most common destination
const getMostCommonDestination = () => {
  const destinations = ['Main Campus', 'Library', 'Sports Center', 'Medical Center', 'Dormitory A', 'Dormitory B'];
  const trips = [45, 38, 29, 25, 42, 31]; // Mock trip counts per destination
  const maxIndex = trips.indexOf(Math.max(...trips));
  return destinations[maxIndex];
};

const TripReports = () => {
  const [reportType, setReportType] = useState<'student' | 'timeSlot' | 'dateRange'>('student');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { toast } = useToast();

  const exportToCSV = () => {
    try {
      // Create CSV data based on current report type
      let csvContent = '';
      let filename = '';
      
      switch (reportType) {
        case 'student':
          csvContent = 'Student Name,Total Trips,Paid Trips,Free Trips,Distance (km),Total Cost ($)\n';
          const studentData = selectedStudent 
            ? tripReportsData.perStudent.filter(s => s.studentName.toLowerCase().includes(selectedStudent.toLowerCase()))
            : tripReportsData.perStudent;
          
          studentData.forEach(student => {
            csvContent += `"${student.studentName}",${student.totalTrips},${student.paidTrips},${student.freeTrips},${student.totalDistance},${student.totalCost}\n`;
          });
          filename = 'student-trip-report.csv';
          break;
          
        case 'timeSlot':
          csvContent = 'Time Slot,Total Bookings,Avg Occupancy,Type,Revenue ($)\n';
          tripReportsData.perTimeSlot.forEach(slot => {
            csvContent += `${slot.timeSlot},${slot.totalBookings},"${slot.avgOccupancy}",${slot.type},${slot.revenue}\n`;
          });
          filename = 'timeslot-report.csv';
          break;
          
        case 'dateRange':
          csvContent = 'Date,Total Trips,Revenue ($),Avg Distance (km)\n';
          tripReportsData.customDateRange.forEach(day => {
            csvContent += `${day.date},${day.totalTrips},${day.revenue},${day.avgDistance}\n`;
          });
          filename = 'date-range-report.csv';
          break;
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
        description: `Report exported as ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the report",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    try {
      const mostCommonDestination = getMostCommonDestination();
      
      // Create comprehensive Excel data with summary information
      let excelContent = 'Summary Report\n';
      excelContent += `Most Common Destination,${mostCommonDestination}\n`;
      excelContent += `Total Students,${tripReportsData.perStudent.length}\n`;
      excelContent += `Total Revenue,$${tripReportsData.perStudent.reduce((sum, student) => sum + student.totalCost, 0)}\n\n`;
      
      excelContent += 'Student Name,Trips Taken,Total Cost ($)\n';
      tripReportsData.perStudent.forEach(student => {
        excelContent += `"${student.studentName}",${student.totalTrips},${student.totalCost}\n`;
      });

      // Create and trigger download
      const blob = new Blob([excelContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'manager-trip-report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Excel export successful",
        description: `Manager report exported with summary data including most common destination: ${mostCommonDestination}`,
      });
    } catch (error) {
      toast({
        title: "Excel export failed",
        description: "There was an error exporting the Excel report",
        variant: "destructive",
      });
    }
  };

  const getFilteredStudentData = () => {
    if (!selectedStudent) return tripReportsData.perStudent;
    return tripReportsData.perStudent.filter(student => 
      student.studentName.toLowerCase().includes(selectedStudent.toLowerCase())
    );
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

            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>

            <Button onClick={exportToExcel} variant="outline">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>

          {/* Per Student Report */}
          {reportType === 'student' && (
            <div className="overflow-x-auto">
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
                  {getFilteredStudentData().map((student, index) => (
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
            </div>
          )}

          {/* Per Time Slot Report */}
          {reportType === 'timeSlot' && (
            <div className="overflow-x-auto">
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
            </div>
          )}

          {/* Date Range Report */}
          {reportType === 'dateRange' && (
            <div className="overflow-x-auto">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TripReports;
