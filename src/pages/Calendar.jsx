import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { attendanceApi, usersApi } from '../services/api';
import { 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  Edit,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Users,
  User,
  Loader2
} from 'lucide-react';
import { format, isSameDay, isToday, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from 'date-fns';
import { toast } from '../hooks/use-toast';
import { AttendanceModal } from '../components/AttendanceModal';

export const CalendarPage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceModalDate, setAttendanceModalDate] = useState(null);
  const [attendanceModalRecord, setAttendanceModalRecord] = useState(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total_days: 0,
    present_days: 0,
    late_days: 0,
    absent_days: 0
  });
  const [loading, setLoading] = useState(false);

  // Set current user for regular users, allow selection for admins
  const currentUserId = user?.role === 'admin' ? (selectedUser?.id || user?.id) : user?.id;
  const currentUserName = user?.role === 'admin' ? (selectedUser?.name || user?.name) : user?.name;

  // Load users for admin
  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user?.role]);

  // Load attendance data when user changes
  useEffect(() => {
    if (currentUserId) {
      loadAttendanceData();
      loadAttendanceStats();
    }
  }, [currentUserId, currentMonth]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setUsers([]);
        console.error('Failed to load users:', response.message);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      let response;
      if (user?.role === 'admin' && selectedUser) {
        response = await attendanceApi.getUserAttendance(String(currentUserId), {
          start_date: startDate,
          end_date: endDate,
        });
      } else {
        response = await attendanceApi.getMyAttendance({
          start_date: startDate,
          end_date: endDate,
        });
      }

      setAttendanceData(response.data || []);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceStats = async () => {
    if (!currentUserId) return;

    try {
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const response = await attendanceApi.getAttendanceStats(String(currentUserId), {
        start_date: startDate,
        end_date: endDate,
      });

      setStats(response.data.stats || {
        total_days: 0,
        present_days: 0,
        late_days: 0,
        absent_days: 0
      });
    } catch (error) {
      console.error('Error loading attendance stats:', error);
    }
  };

  // Get attendance data for current user
  const getAttendanceForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const found = attendanceData.find(record => record.date === dateStr) || null;
    console.log('Checking attendance for', dateStr, 'Found:', found, 'All:', attendanceData);
    return found;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-success text-success-foreground hover:bg-success/90';
      case 'late':
        return 'bg-warning text-warning-foreground hover:bg-warning/90';
      case 'absent':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
      case 'half-day':
        return 'bg-orange-500 text-white hover:bg-orange-600';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4" />;
      case 'late':
        return <AlertCircle className="w-4 h-4" />;
      case 'absent':
        return <X className="w-4 h-4" />;
      case 'half-day':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    setAttendanceModalDate(date);
    // Fetch existing attendance record for this user/date
    try {
      const response = await attendanceApi.getAttendanceByRange({
        start_date: format(date, 'yyyy-MM-dd'),
        end_date: format(date, 'yyyy-MM-dd'),
        user_id: String(currentUserId),
      });
      setAttendanceModalRecord(response.data && response.data.length > 0 ? response.data[0] : null);
    } catch (error) {
      setAttendanceModalRecord(null);
    }
    setAttendanceModalOpen(true);
  };

  const handleExportData = async () => {
    try {
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      let response;
      if (user?.role === 'admin' && selectedUser) {
        response = await attendanceApi.getUserAttendance(String(currentUserId), {
          start_date: startDate,
          end_date: endDate,
        });
      } else {
        response = await attendanceApi.getMyAttendance({
          start_date: startDate,
          end_date: endDate,
        });
      }

      const attendanceRecords = response.data || [];
      const csvContent = [
        ['Date', 'Status', 'Time In', 'Time Out', 'Notes'],
        ...attendanceRecords.map(record => [
          record.date,
          record.status,
          record.time_in || '',
          record.time_out || '',
          record.notes || ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${currentUserName}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Attendance data exported successfully",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export attendance data",
        variant: "destructive",
      });
    }
  };

  // Export attendance as PDF
  const handleExportPDF = async () => {
    try {
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const token = localStorage.getItem('authToken');
      let url = `http://localhost:5000/api/attendance/export/pdf?start_date=${startDate}&end_date=${endDate}`;
      if (user?.role === 'admin' && selectedUser) {
        url += `&user_id=${selectedUser.id}`;
      }
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to export PDF');
      const blob = await response.blob();
      const pdfUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `attendance-${currentUserName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(pdfUrl);
      toast({ title: 'Success', description: 'Attendance PDF exported successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to export PDF', variant: 'destructive' });
      console.error('Error exporting PDF:', error);
    }
  };

  const renderCalendarDay = (date) => {
    const attendance = getAttendanceForDate(date);
    const isSelected = isSameDay(date, selectedDate);
    const isCurrentDay = isToday(date);

    // Color for background
    let bgColor = '';
    if (attendance) {
      switch (attendance.status) {
        case 'present': bgColor = 'bg-success'; break;
        case 'late': bgColor = 'bg-warning'; break;
        case 'absent': bgColor = 'bg-destructive'; break;
        case 'half-day': bgColor = 'bg-orange-500'; break;
        default: bgColor = '';
      }
    }

    return (
      <div
        key={date.toString()}
        onClick={() => handleDateClick(date)}
        className={`
          h-12 w-12 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all
          ${bgColor}
          ${isSelected ? 'ring-2 ring-primary bg-primary/10' : ''}
          ${isCurrentDay ? 'bg-primary/10 font-bold' : ''}
          hover:bg-accent/50 text-foreground
        `}
        style={{ minWidth: 0 }}
      >
        <span className="text-sm">{format(date, 'd')}</span>
      </div>
    );
  };

  const getMonthDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Calendar */}
          <div className="lg:col-span-2">
            <Card className="bg-card shadow-lg border border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-foreground">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <span>Monthly View</span>
                    {user?.role === 'admin' && selectedUser && (
                      <span className="text-sm text-muted-foreground">
                        - {selectedUser.name}
                      </span>
                    )}
                    {loading && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    )}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      className="bg-background border-border text-foreground hover:bg-accent"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium text-foreground">
                      {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      className="bg-background border-border text-foreground hover:bg-accent"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" size="sm" onClick={handleExportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {getMonthDays().map(date => renderCalendarDay(date))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Selection (Admin Only) */}
            {user?.role === 'admin' && (
              <Card className="bg-card shadow-lg border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-foreground">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Select User</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={String(selectedUser?.id || user?.id)}
                    onValueChange={(value) => {
                      const user = users.find(u => u.id === value);
                      setSelectedUser(user || null);
                    }}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{user.name}</span>
                            <span className="text-xs text-muted-foreground">({user.department})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Legend */}
            <Card className="bg-card shadow-lg border border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <Eye className="w-5 h-5 text-primary" />
                  <span>Legend</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-success rounded-full" />
                  <span className="text-sm text-foreground">Present</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-warning rounded-full" />
                  <span className="text-sm text-foreground">Late</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-destructive rounded-full" />
                  <span className="text-sm text-foreground">Absent</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-card shadow-lg border border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>This Month</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Present Days:</span>
                  <Badge variant="default" className="bg-success text-success-foreground">
                    {stats.present_days}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Late Days:</span>
                  <Badge variant="default" className="bg-warning text-warning-foreground">
                    {stats.late_days}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Absent Days:</span>
                  <Badge variant="default" className="bg-destructive text-destructive-foreground">
                    {stats.absent_days}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Selected Date Details */}
            {selectedDate && (
              <Card className="bg-card shadow-lg border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-foreground">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <span>Selected Date</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-lg font-semibold text-foreground">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </div>
                    {getAttendanceForDate(selectedDate) ? (
                      <div className="space-y-2">
                        <Badge 
                          variant="default" 
                          className={getStatusColor(getAttendanceForDate(selectedDate).status)}
                        >
                          {getAttendanceForDate(selectedDate).status}
                        </Badge>
                        {getAttendanceForDate(selectedDate).time_in && (
                          <div className="text-sm text-muted-foreground">
                            Time: {getAttendanceForDate(selectedDate).time_in} - {getAttendanceForDate(selectedDate).time_out}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No attendance recorded
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDateClick(selectedDate)}
                      className="w-full bg-background border-border text-foreground hover:bg-accent"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {getAttendanceForDate(selectedDate) ? 'Edit' : 'Mark'} Attendance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Modal for marking/editing */}
      <AttendanceModal
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        user={users.find(u => u.id === currentUserId) || user}
        date={attendanceModalDate || new Date()}
        existingRecord={attendanceModalRecord}
        onSave={() => {
          setAttendanceModalOpen(false);
          loadAttendanceData();
          loadAttendanceStats();
        }}
      />

      {/* View Details Modal */}
      <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {user?.role === 'admin' ? `Attendance Details - ${currentUserName}` : 'Attendance Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Status</Label>
                <Badge variant="default" className={getStatusColor(selectedRecord.status)}>
                  {selectedRecord.status}
                </Badge>
              </div>
              
              {selectedRecord.time_in && (
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Time</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRecord.time_in} - {selectedRecord.time_out || 'Not recorded'}
                  </p>
                </div>
              )}
              
              {selectedRecord.notes && (
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedRecord.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewingDetails(false)}
                  className="bg-background border-border text-foreground hover:bg-accent"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setSelectedRecord(null); // Clear selected record for editing
                    handleDateClick(selectedDate); // Re-open modal for editing
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 