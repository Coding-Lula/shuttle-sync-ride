import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Download, FileSpreadsheet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StudentReport {
  studentName: string;
  totalTrips: number;
  paidTrips: number;
  freeTrips: number;
  totalDistance: number;
  totalCost: number;
}

interface TimeSlotReport {
  timeSlot: string;
  totalBookings: number;
  avgOccupancy: string;
  revenue: number;
  type: string;
}

interface DateRangeReport {
  studentName: string;
  studentNumber: number;
  dates: { [date: string]: { totalTrips: number; totalBilling: number } };
  totalTrips: number;
  totalCost: number;
  paidTrips: number;
}

const TripReports = () => {
  const [reportType, setReportType] = useState<'student' | 'timeSlot' | 'dateRange'>('student');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [studentReports, setStudentReports] = useState<StudentReport[]>([]);
  const [timeSlotReports, setTimeSlotReports] = useState<TimeSlotReport[]>([]);
  const [dateRangeReports, setDateRangeReports] = useState<DateRangeReport[]>([]);
  const [students, setStudents] = useState<{name: string, value: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch students for dropdown
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name')
          .eq('role', 'student');
        
        if (error) throw error;
        
        const studentOptions = (data || []).map(student => ({
          name: student.name,
          value: student.name.toLowerCase()
        }));
        
        setStudents(studentOptions);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  // Fetch reports based on type
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        if (reportType === 'student') {
          await fetchStudentReports();
        } else if (reportType === 'timeSlot') {
          await fetchTimeSlotReports();
        } else if (reportType === 'dateRange') {
          await fetchDateRangeReports();
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast({
          title: "Error",
          description: "Failed to fetch reports",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [reportType, selectedStudent, dateFrom, dateTo]);

  const fetchStudentReports = async () => {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          cost,
          distance_traveled,
          payment_method,
          users:user_id (
            name
          )
        `)
        .eq('cancelled', false);

      if (error) throw error;

      const studentStats: Record<string, StudentReport> = {};

      (bookings || []).forEach(booking => {
        const studentName = booking.users?.name || 'Unknown';
        
        if (!studentStats[studentName]) {
          studentStats[studentName] = {
            studentName,
            totalTrips: 0,
            paidTrips: 0,
            freeTrips: 0,
            totalDistance: 0,
            totalCost: 0
          };
        }

        const stats = studentStats[studentName];
        stats.totalTrips += 1;
        stats.totalDistance += booking.distance_traveled || 0;
        stats.totalCost += booking.cost || 0;

        if (booking.payment_method === 'free') {
          stats.freeTrips += 1;
        } else {
          stats.paidTrips += 1;
        }
      });

      let reports = Object.values(studentStats);
      
      if (selectedStudent && selectedStudent !== 'all') {
        reports = reports.filter(report => 
          report.studentName.toLowerCase().includes(selectedStudent.toLowerCase())
        );
      }

      setStudentReports(reports);
    } catch (error) {
      console.error('Error fetching student reports:', error);
    }
  };

  const fetchTimeSlotReports = async () => {
    try {
      const { data: trips, error } = await supabase
        .from('trips')
        .select(`
          time_slot_id,
          time_slots:time_slot_id (
            start_time
          ),
          bookings!bookings_trip_id_fkey(
            cost,
            payment_method,
            cancelled
          )
        `);

      if (error) throw error;

      const timeSlotStats: Record<string, TimeSlotReport> = {};

      (trips || []).forEach(trip => {
        const timeSlot = trip.time_slots?.start_time || 'Unknown';
        
        if (!timeSlotStats[timeSlot]) {
          timeSlotStats[timeSlot] = {
            timeSlot,
            totalBookings: 0,
            avgOccupancy: '0%',
            revenue: 0,
            type: 'mixed'
          };
        }

        const validBookings = (trip.bookings || []).filter(b => !b.cancelled);
        const stats = timeSlotStats[timeSlot];
        
        stats.totalBookings += validBookings.length;
        stats.revenue += validBookings.reduce((sum, b) => sum + (b.cost || 0), 0);
        
        // Determine if mostly free or paid
        const paidBookings = validBookings.filter(b => b.payment_method !== 'free').length;
        const freeBookings = validBookings.length - paidBookings;
        stats.type = freeBookings > paidBookings ? 'free' : 'paid';
        
        // Calculate occupancy (assuming 15 seat capacity)
        stats.avgOccupancy =`${validBookings.length}/15`;
      });

      setTimeSlotReports(Object.values(timeSlotStats));
    } catch (error) {
      console.error('Error fetching time slot reports:', error);
    }
  };

  const fetchDateRangeReports = async () => {
    try {
      let query = supabase
  .from('bookings')
  .select(`
    date,
    cost,
    cancelled,
    payment_method,
    users:user_id (
      name,
      student_number
    )
  `)
  .eq('cancelled', false); // Only include non-cancelled bookings


      if (dateFrom) {
        query = query.gte('date', dateFrom);
      }
      if (dateTo) {
        query = query.lte('date', dateTo);
      }

      const { data: bookings, error } = await query;

      if (error) throw error;

      // Group by student and date
      const studentDateMap: Record<string, DateRangeReport> = {};

      (bookings || []).forEach(booking => {
        if (booking.users) {
          const user = booking.users as any;
          const studentKey = `${user.name}-${user.student_number || 0}`;
          
          if (!studentDateMap[studentKey]) {
            studentDateMap[studentKey] = {
              studentName: user.name || 'Unknown',
              studentNumber: user.student_number||0 , // Not available in your schema
              dates: {},
              totalTrips: 0,
              totalCost: 0,
              paidTrips: 0
            };
          }

          const student = studentDateMap[studentKey];
          const date = booking.date;
          
          if (!student.dates[date]) {
            student.dates[date] = {
              totalTrips: 0,
              totalBilling: 0
            };
          }

          // Update date-specific totals
          student.dates[date].totalTrips += 1;
          student.dates[date].totalBilling += booking.cost || 0;
          
          // Update overall student totals
          student.totalTrips += 1;
          student.totalCost += booking.cost || 0;
          
          // Count paid trips
          if (booking.payment_method !== 'free') {
            student.paidTrips += 1;
          }
        }
      });

      setDateRangeReports(Object.values(studentDateMap));
    } catch (error) {
      console.error('Error fetching date range reports:', error);
    }
  };

  const exportToCSV = () => {
    try {
      let csvContent = '';
      let filename = '';
      
      switch (reportType) {
        case 'student':
          csvContent = 'Student Name,Total Trips,Paid Trips,Free Trips,Distance (km),Total Cost (ZAR)\n';
          const studentData = selectedStudent 
            ? studentReports.filter(s => s.studentName.toLowerCase().includes(selectedStudent.toLowerCase()))
            : studentReports;
          
          studentData.forEach(student => {
            csvContent += `"${student.studentName}",${student.totalTrips},${student.paidTrips},${student.freeTrips},${student.totalDistance},${student.totalCost}\n`;
          });
          filename = 'student-trip-report.csv';
          break;
          
        case 'timeSlot':
          csvContent = 'Time Slot,Total Bookings,Avg Occupancy,Type,Revenue (ZAR)\n';
          timeSlotReports.forEach(slot => {
            csvContent += `${slot.timeSlot},${slot.totalBookings},"${slot.avgOccupancy}",${slot.type},${slot.revenue}\n`;
          });
          filename = 'timeslot-report.csv';
          break;
          
        case 'dateRange':
          csvContent = 'Student Name';
          // Get all unique dates
          const allDates = new Set<string>();
          dateRangeReports.forEach(student => {
            Object.keys(student.dates).forEach(date => allDates.add(date));
          });
          const sortedDates = Array.from(allDates).sort();
          
          // Add date columns
          sortedDates.forEach(date => {
            csvContent += `,${date} Trips,${date} Billing`;
          });
          csvContent += ',Total Trips,Total Billing\n';
          
          // Add student rows
          dateRangeReports.forEach(student => {
            csvContent += `"${student.studentName}"`;
            sortedDates.forEach(date => {
              const data = student.dates[date] || { totalTrips: 0, totalBilling: 0 };
              csvContent += `,${data.totalTrips},${data.totalBilling.toFixed(2)}`;
            });
            csvContent += `,${student.totalTrips},${student.totalCost.toFixed(2)}\n`;
          });
          filename = 'date-range-report.csv';
          break;
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
    let excelContent = 'Date Range Report\n';
    excelContent += `Total Students,${dateRangeReports.length}\n`;
    excelContent += `Total Revenue,R${dateRangeReports.reduce((sum, student) => sum + student.totalCost, 0)}\n\n`;

    // Collect all unique dates (same as the table)
    const allDates = new Set<string>();
    dateRangeReports.forEach(student => {
      Object.keys(student.dates).forEach(date => allDates.add(date));
    });
    const sortedDates = Array.from(allDates).sort();

    // Header row
    let headerRow = 'Student Number,Student Name';
    sortedDates.forEach(date => {
      headerRow += `,${date} Trips,${date} Billing (ZAR)`;
    });
    headerRow += ',Total Trips,Total Billing\n';
    excelContent += headerRow;

    // Data rows
    dateRangeReports.forEach(student => {
      let row = `"${student.studentNumber}","${student.studentName}"`;

      sortedDates.forEach(date => {
        const data = student.dates[date] || { totalTrips: 0, totalBilling: 0 };
        row += `,${data.totalTrips || ""},${data.totalBilling ? "R" + data.totalBilling.toFixed(2) : ""}`;
      });

      row += `,${student.totalTrips},R${student.totalCost.toFixed(2)}\n`;
      excelContent += row;
    });

    // Create CSV blob + download
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
      description: "Manager report exported with full date range data",
    });
  } catch (error) {
    toast({
      title: "Excel export failed",
      description: "There was an error exporting the Excel report",
      variant: "destructive",
    });
  }
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
                  <SelectItem value="all">All Students</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.value} value={student.value}>
                      {student.name}
                    </SelectItem>
                  ))}
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

          {isLoading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : (
            <>
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
                        <TableHead>Total Cost (ZAR)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentReports.map((student, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{student.studentName}</TableCell>
                          <TableCell>{student.totalTrips}</TableCell>
                          <TableCell>{student.paidTrips}</TableCell>
                          <TableCell>{student.freeTrips}</TableCell>
                          <TableCell>{student.totalDistance.toFixed(2)}</TableCell>
                          <TableCell>R{student.totalCost.toFixed(2)}</TableCell>
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
                        <TableHead>Revenue (ZAR)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeSlotReports.map((slot, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{slot.timeSlot}</TableCell>
                          <TableCell>{slot.totalBookings}</TableCell>
                          <TableCell>{slot.avgOccupancy}</TableCell>
                          <TableCell>
                            <Badge variant={slot.type === 'free' ? 'secondary' : 'default'}>
                              {slot.type === 'free' ? 'Free' : 'Paid'}
                            </Badge>
                          </TableCell>
                          <TableCell>R{slot.revenue.toFixed(2)}</TableCell>
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
                      {/* First header row */}
                      <TableRow>
                        <TableHead rowSpan={2}>Student Number</TableHead>
                        <TableHead rowSpan={2}>Student Name</TableHead>
                        {(() => {
                          const allDates = new Set<string>();
                          dateRangeReports.forEach(student => {
                            Object.keys(student.dates).forEach(date => allDates.add(date));
                          });
                          const sortedDates = Array.from(allDates).sort();
                          return sortedDates.map(date => (
                            <TableHead key={date} colSpan={2} className="text-center border-l">
                              {date}
                            </TableHead>
                          ));
                        })()}
                        <TableHead rowSpan={2} className="text-center border-l">Total Trips</TableHead>
                        <TableHead rowSpan={2} className="text-center">Total Billing</TableHead>
                      </TableRow>

                      {/* Second header row */}
                      <TableRow>
                        {(() => {
                          const allDates = new Set<string>();
                          dateRangeReports.forEach(student => {
                            Object.keys(student.dates).forEach(date => allDates.add(date));
                          });
                          const sortedDates = Array.from(allDates).sort();

                          return sortedDates.flatMap(date => [
                            <TableHead key={`${date}-trips`} className="text-center border-l">Trips</TableHead>,
                            <TableHead key={`${date}-billing`} className="text-center">Billing (ZAR)</TableHead>
                          ]);
                        })()}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {dateRangeReports.map((student, index) => {
                        // Collect all unique dates again for row alignment
                        const allDates = new Set<string>();
                        dateRangeReports.forEach(s => {
                          Object.keys(s.dates).forEach(date => allDates.add(date));
                        });
                        const sortedDates = Array.from(allDates).sort();

                        return (
                          <TableRow key={index}>
                            <TableCell>{student.studentNumber}</TableCell>
                            <TableCell className="font-medium">{student.studentName}</TableCell>
                            {sortedDates.map(date => {
                              const data = student.dates[date] || { totalTrips: 0, totalBilling: 0 };
                              return (
                                <React.Fragment key={date}>
                                  <TableCell className="text-center border-l">
                                    {data.totalTrips > 0 ? data.totalTrips : ""}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {data.totalBilling > 0 ? `R${data.totalBilling.toFixed(2)}` : ""}
                                  </TableCell>
                                </React.Fragment>
                              );
                            })}

                            <TableCell className="text-center border-l">{student.totalTrips}</TableCell>
                            <TableCell className="text-center">R{student.totalCost.toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TripReports;