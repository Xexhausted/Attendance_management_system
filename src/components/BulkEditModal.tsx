import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Users, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { attendanceApi, usersApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  department: string;
  status: 'active' | 'inactive';
}

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onComplete?: () => void;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  onClose,
  users,
  onComplete,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState<'attendance' | 'user'>('attendance');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [attendanceData, setAttendanceData] = useState({
    status: 'present' as 'present' | 'late' | 'absent' | 'half-day',
    check_in: '',
    check_out: '',
    notes: '',
  });
  const [userData, setUserData] = useState({
    department: '',
    role: 'user' as 'admin' | 'user',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedUsers(new Set());
      setSelectedDates([]);
      setAttendanceData({
        status: 'present',
        check_in: '',
        check_out: '',
        notes: '',
      });
      setUserData({
        department: '',
        role: 'user',
        status: 'active',
      });
    }
  }, [isOpen]);

  const handleUserToggle = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const isSelected = selectedDates.some(d => format(d, 'yyyy-MM-dd') === dateStr);
    
    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => format(d, 'yyyy-MM-dd') !== dateStr));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleBulkAttendanceUpdate = async () => {
    if (selectedUsers.size === 0 || selectedDates.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one user and one date',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const promises: Promise<any>[] = [];
      
      for (const userId of selectedUsers) {
        for (const date of selectedDates) {
          const dateStr = format(date, 'yyyy-MM-dd');
          
          // Try to create attendance record
          promises.push(
            attendanceApi.createAttendance({
              user_id: userId.toString(),
              date: dateStr,
              ...attendanceData,
            }).catch(async (error) => {
              // If record already exists, try to update it
              if (error.message?.includes('already exists')) {
                try {
                  const response = await attendanceApi.getAttendanceByRange(dateStr, dateStr, userId.toString());
                  const existingRecord = response.data?.[0];
                  if (existingRecord) {
                    return attendanceApi.updateAttendance(existingRecord.id, attendanceData);
                  }
                } catch (updateError) {
                  console.error('Failed to update existing record:', updateError);
                }
              }
              throw error;
            })
          );
        }
      }

      await Promise.all(promises);
      
      toast({
        title: 'Success',
        description: `Updated attendance for ${selectedUsers.size} users across ${selectedDates.length} dates`,
      });
      
      onComplete?.();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update attendance',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUserUpdate = async () => {
    if (selectedUsers.size === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one user',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const promises = Array.from(selectedUsers).map(userId =>
        usersApi.updateUser(userId.toString(), userData)
      );

      await Promise.all(promises);
      
      toast({
        title: 'Success',
        description: `Updated ${selectedUsers.size} users`,
      });
      
      onComplete?.();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <Users className="w-5 h-5 text-primary" />
            <span>Bulk Edit</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select multiple users and dates to perform bulk operations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Edit Mode Selection */}
          <div className="flex space-x-4">
            <Button
              variant={editMode === 'attendance' ? 'default' : 'outline'}
              onClick={() => setEditMode('attendance')}
              className={editMode === 'attendance' ? 'bg-primary text-primary-foreground' : 'bg-background border-border text-foreground'}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Attendance
            </Button>
            <Button
              variant={editMode === 'user' ? 'default' : 'outline'}
              onClick={() => setEditMode('user')}
              className={editMode === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border-border text-foreground'}
            >
              <Users className="w-4 h-4 mr-2" />
              User Info
            </Button>
          </div>

          {/* User Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-foreground font-medium">Select Users</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllUsers}
                className="bg-background border-border text-foreground hover:bg-accent"
              >
                {selectedUsers.size === users.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-2 p-2 rounded border border-border">
                  <Checkbox
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={() => handleUserToggle(user.id)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {editMode === 'attendance' && (
            <>
              {/* Date Selection */}
              <div className="space-y-4">
                <Label className="text-foreground font-medium">Select Dates</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isSelected = selectedDates.some(d => format(d, 'yyyy-MM-dd') === dateStr);
                    
                    return (
                      <Button
                        key={i}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleDateSelect(date)}
                        className={isSelected ? 'bg-primary text-primary-foreground' : 'bg-background border-border text-foreground'}
                      >
                        {format(date, 'MMM dd')}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Attendance Data */}
              <div className="space-y-4">
                <Label className="text-foreground font-medium">Attendance Data</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Status</Label>
                    <Select value={attendanceData.status} onValueChange={(value) => setAttendanceData({ ...attendanceData, status: value as any })}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border">
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="half-day">Half Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {attendanceData.status !== 'absent' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-foreground">Check In</Label>
                        <Input
                          type="time"
                          value={attendanceData.check_in}
                          onChange={(e) => setAttendanceData({ ...attendanceData, check_in: e.target.value })}
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Check Out</Label>
                        <Input
                          type="time"
                          value={attendanceData.check_out}
                          onChange={(e) => setAttendanceData({ ...attendanceData, check_out: e.target.value })}
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-foreground">Notes</Label>
                    <Input
                      value={attendanceData.notes}
                      onChange={(e) => setAttendanceData({ ...attendanceData, notes: e.target.value })}
                      placeholder="Optional notes..."
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {editMode === 'user' && (
            <div className="space-y-4">
              <Label className="text-foreground font-medium">User Data</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Department</Label>
                  <Input
                    value={userData.department}
                    onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                    placeholder="Department"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Role</Label>
                  <Select value={userData.role} onValueChange={(value) => setUserData({ ...userData, role: value as any })}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Status</Label>
                  <Select value={userData.status} onValueChange={(value) => setUserData({ ...userData, status: value as any })}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <h4 className="font-medium text-foreground mb-2">Summary</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Selected Users: {selectedUsers.size}</div>
              {editMode === 'attendance' && (
                <div>Selected Dates: {selectedDates.length}</div>
              )}
              <div>Operation: {editMode === 'attendance' ? 'Bulk Attendance Update' : 'Bulk User Update'}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="bg-background border-border text-foreground hover:bg-accent"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={editMode === 'attendance' ? handleBulkAttendanceUpdate : handleBulkUserUpdate}
              disabled={isLoading || selectedUsers.size === 0 || (editMode === 'attendance' && selectedDates.length === 0)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editMode === 'attendance' ? 'Update Attendance' : 'Update Users'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 