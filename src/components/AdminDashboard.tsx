import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AddUserModal } from '@/components/AddUserModal';
import { UserDetailModal } from '@/components/UserDetailModal';
import { EditUserModal } from '@/components/EditUserModal';
import { ExportModal } from '@/components/ExportModal';
import { DeleteUserModal } from '@/components/DeleteUserModal';
import { usersApi } from '@/services/api';
import { attendanceApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  BarChart3, 
  Search, 
  Download, 
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  CalendarDays,
  Loader2,
  Shield
} from 'lucide-react';
import { AttendanceModal } from './AttendanceModal';
import { InlineEditUser } from './InlineEditUser';
import { BulkEditModal } from './BulkEditModal';

export const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState('');
  const [attendanceForm, setAttendanceForm] = useState({
    status: 'present',
    timeIn: '',
    timeOut: '',
    notes: ''
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceRecord, setAttendanceRecord] = useState<any>(null);

  // Load users from API
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Loading users...');
      const response = await usersApi.getAllUsers();
      console.log('Users API response:', response);
      
      if (response.success && response.data) {
        setUsers(response.data);
        console.log('Users loaded:', response.data);
      } else {
        // Fallback data for testing
        console.log('Using fallback data');
        setUsers([
          // Fallback data for testing
            ]);
        console.error('Failed to load users:', response.message);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback data for testing
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Overall statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'active').length;
  const adminUsers = users.filter(user => user.role === 'admin').length;
  const regularUsers = users.filter(user => user.role === 'user').length;

  // Filter users based on search and filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || user.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleAddUser = (newUser: any) => {
    setUsers(prev => [...prev, newUser]);
    toast({
      title: "User Added",
      description: `${newUser.name} has been added successfully.`,
      variant: "default",
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast({
      title: "User Deleted",
      description: "User has been permanently deleted from the system.",
      variant: "default",
    });
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsUserDetailModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  const handleDeleteUserClick = (user: any) => {
    setSelectedUser(user);
    setIsDeleteUserModalOpen(true);
  };

  const handleUserUpdated = (updatedUser: any) => {
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    toast({
      title: "User Updated",
      description: `${updatedUser.name} has been updated successfully.`,
      variant: "default",
    });
  };

  const handleManageAttendance = async (user: any) => {
    setSelectedUser(user);
    if (selectedAttendanceDate) {
      // Fetch existing attendance record for this user/date
      try {
              const response = await attendanceApi.getAttendanceByRange(
        selectedAttendanceDate,
        selectedAttendanceDate,
        user.id
      );
        setAttendanceRecord(response.data && response.data.length > 0 ? response.data[0] : null);
      } catch (error) {
        setAttendanceRecord(null);
      }
    } else {
      setAttendanceRecord(null);
    }
    setIsAttendanceModalOpen(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedUser || !selectedAttendanceDate) return;
    try {
      // 1. Check if attendance exists for this user/date
      const response = await attendanceApi.getAttendanceByRange(
        selectedAttendanceDate,
        selectedAttendanceDate,
        selectedUser.id
      );
      const existing = response.data && response.data.length > 0 ? response.data[0] : null;
      if (existing) {
        // Update existing
        await attendanceApi.updateAttendance(existing.id, {
          status: attendanceForm.status as 'present' | 'late' | 'absent' | 'half-day',
          check_in: attendanceForm.timeIn,
          check_out: attendanceForm.timeOut,
          notes: attendanceForm.notes,
        });
        toast({ title: 'Success', description: 'Attendance updated.' });
      } else {
        // Create new
        await attendanceApi.createAttendance({
          user_id: selectedUser.id,
          date: selectedAttendanceDate,
          status: attendanceForm.status as 'present' | 'late' | 'absent' | 'half-day',
          check_in: attendanceForm.timeIn,
          check_out: attendanceForm.timeOut,
          notes: attendanceForm.notes,
        });
        toast({ title: 'Success', description: 'Attendance created.' });
      }
      // Optionally refresh user attendance data here
      setAttendanceForm({ status: 'present', timeIn: '', timeOut: '', notes: '' });
      setSelectedAttendanceDate('');
      setIsAttendanceModalOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to save attendance', variant: 'destructive' });
      console.error('Error saving attendance:', error);
    }
  };

  const getUserAttendance = (userId: string) => {
    // This would be replaced with real API call
    return [];
  };

  const getAttendanceForDate = (userId: string, date: string) => {
    // This would be replaced with real API call
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Admin Header */}
        <div className="bg-card rounded-xl p-6 text-foreground shadow-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage attendance and monitor team performance
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-background border-border text-foreground hover:bg-accent"
                onClick={() => setIsAddUserModalOpen(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-background border-border text-foreground hover:bg-accent"
                onClick={() => setIsBulkEditModalOpen(true)}
              >
                <Users className="w-4 h-4 mr-2" />
                Bulk Edit
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-background border-border text-foreground hover:bg-accent"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-card shadow-lg border border-border hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">{totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-success mr-1" />
                <span className="text-success">+2.5%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg border border-border hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-success">{activeUsers}</p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-muted-foreground">
                  {activeUsers === 0 ? 'No active users' : 'Good user activity'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg border border-border hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admin Users</p>
                  <p className="text-3xl font-bold text-primary">{adminUsers}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-muted-foreground">
                  {adminUsers === 0 ? 'No admin users' : 'Administrative access'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg border border-border hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Regular Users</p>
                  <p className="text-3xl font-bold text-blue-500">{regularUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-muted-foreground">
                  {regularUsers === 0 ? 'No regular users' : 'Standard user accounts'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card className="bg-card shadow-lg border border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-foreground">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span>User Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-accent">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filter Tabs */}
            <div className="flex space-x-2 mb-6">
              {[
                { key: 'all', label: 'All Users', count: totalUsers },
                { key: 'active', label: 'Active', count: users.filter(u => u.status === 'active').length },
                { key: 'inactive', label: 'Inactive', count: users.filter(u => u.status === 'inactive').length }
              ].map(filter => (
                <Button
                  key={filter.key}
                  variant={selectedFilter === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`flex items-center space-x-2 ${
                    selectedFilter === filter.key 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "bg-background border-border text-foreground hover:bg-accent"
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    selectedFilter === filter.key 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50"
                  }`}>
                    {filter.count}
                  </span>
                </Button>
              ))}
            </div>

            {/* User Table */}
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              ) : filteredUsers.map((user) => {
                const userAttendance = getUserAttendance(user.id);
                const todayRecord = userAttendance.find(
                  record => record.date === new Date().toISOString().split('T')[0]
                );
                
                return (
                  <div key={user.id} className="space-y-2">
                    {/* Inline Edit Component */}
                    <InlineEditUser
                      user={user}
                      onUserUpdated={handleUserUpdated}
                      onCancel={() => {}}
                    />
                    
                    {/* Additional Actions Row */}
                    <div className="flex items-center justify-between px-4 py-2 bg-muted/20 rounded-lg border border-border">
                      <div className="flex items-center space-x-4">
                        {/* Today's Status */}
                        <div className="text-right">
                          <div className="text-sm font-medium text-foreground">Today's Status</div>
                          {todayRecord ? (
                            <StatusBadge status={todayRecord.status} />
                          ) : (
                            <span className="text-xs text-muted-foreground">No record</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-foreground hover:bg-accent"
                          onClick={() => handleViewUser(user)}
                          title="View user details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={() => handleManageAttendance(user)}
                          title="Manage attendance"
                        >
                          <Calendar className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteUserClick(user)}
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onUserAdded={handleAddUser}
        />

        <UserDetailModal
          isOpen={isUserDetailModalOpen}
          onClose={() => setIsUserDetailModalOpen(false)}
          user={selectedUser}
        />

        <EditUserModal
          isOpen={isEditUserModalOpen}
          onClose={() => setIsEditUserModalOpen(false)}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
        />

        <DeleteUserModal
          isOpen={isDeleteUserModalOpen}
          onClose={() => setIsDeleteUserModalOpen(false)}
          user={selectedUser}
          onUserDeleted={handleDeleteUser}
        />

        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          users={users}
        />

        {/* Attendance Management Modal */}
        <AttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          user={selectedUser}
          date={selectedAttendanceDate ? new Date(selectedAttendanceDate) : new Date()}
          existingRecord={attendanceRecord}
          onSave={() => {
            // Optionally refresh data here
            setIsAttendanceModalOpen(false);
          }}
        />

        {/* Bulk Edit Modal */}
        <BulkEditModal
          isOpen={isBulkEditModalOpen}
          onClose={() => setIsBulkEditModalOpen(false)}
          users={users}
          onComplete={() => {
            loadUsers(); // Refresh user data
          }}
        />
      </div>
    </div>
  );
};