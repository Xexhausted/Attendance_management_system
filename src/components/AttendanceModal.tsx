import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { attendanceApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  date: Date;
  existingRecord?: any;
  onSave?: () => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  user,
  date,
  existingRecord,
  onSave,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [status, setStatus] = useState<'present' | 'late' | 'absent'>(existingRecord?.status || 'present');
  const [timeIn, setTimeIn] = useState(existingRecord?.time_in || '');
  const [timeOut, setTimeOut] = useState(existingRecord?.time_out || '');
  const [notes, setNotes] = useState(existingRecord?.notes || '');
  // Store original values for reset
  const [original, setOriginal] = useState({
    status: existingRecord?.status || 'present',
    timeIn: existingRecord?.time_in || '',
    timeOut: existingRecord?.time_out || '',
    notes: existingRecord?.notes || '',
  });

  useEffect(() => {
    setStatus(existingRecord?.status || 'present');
    setTimeIn(existingRecord?.time_in || '');
    setTimeOut(existingRecord?.time_out || '');
    setNotes(existingRecord?.notes || '');
    setOriginal({
      status: existingRecord?.status || 'present',
      timeIn: existingRecord?.time_in || '',
      timeOut: existingRecord?.time_out || '',
      notes: existingRecord?.notes || '',
    });
  }, [existingRecord, date, isOpen]);

  // Clear time fields if status is absent
  useEffect(() => {
    if (status === 'absent') {
      setTimeIn('');
      setTimeOut('');
    }
  }, [status]);

  const handleReset = () => {
    setStatus(original.status);
    setTimeIn(original.timeIn);
    setTimeOut(original.timeOut);
    setNotes(original.notes);
  };

  const handleSaveClick = () => {
    // Check if there are any changes
    const hasChanges = 
      status !== original.status ||
      timeIn !== original.timeIn ||
      timeOut !== original.timeOut ||
      notes !== original.notes;

    if (hasChanges) {
      setShowConfirmation(true);
    } else {
      // No changes, just close
      onClose();
    }
  };

  const handleConfirmSave = async () => {
    setShowConfirmation(false);
    await handleSave();
  };

  const handleSave = async () => {
    setIsLoading(true);
    const dateStr = format(date, 'yyyy-MM-dd');
    try {
      if (existingRecord) {
        await attendanceApi.updateAttendance(existingRecord.id, {
          status,
          time_in: timeIn,
          time_out: timeOut,
          notes,
        });
        toast({ title: 'Success', description: 'Attendance updated.' });
      } else {
        try {
          await attendanceApi.createAttendance({
            date: dateStr,
            status,
            time_in: timeIn,
            time_out: timeOut,
            notes,
          });
          toast({ title: 'Success', description: 'Attendance created.' });
        } catch (error: any) {
          // If error is 'already exists', fetch and update
          if (error?.response?.data?.message?.includes('already exists')) {
            // Fetch the existing record
            const response = await attendanceApi.getAttendanceByRange({
              start_date: dateStr,
              end_date: dateStr,
              user_id: user.id,
            });
            const record = response.data && response.data.length > 0 ? response.data[0] : null;
            if (record) {
              await attendanceApi.updateAttendance(record.id, {
                status,
                time_in: timeIn,
                time_out: timeOut,
                notes,
              });
              toast({ title: 'Success', description: 'Attendance updated.' });
            } else {
              toast({ title: 'Error', description: 'Attendance record already exists, but could not fetch it.', variant: 'destructive' });
            }
          } else {
            throw error;
          }
        }
      }
      if (onSave) onSave();
      onClose();
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to save attendance', variant: 'destructive' });
      console.error('Error saving attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full sm:px-6 px-2 bg-card border-border shadow-2xl overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground text-lg sm:text-xl">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <span>Manage Attendance - {user?.name || user?.email}</span>
          </DialogTitle>
          <DialogDescription>
            Mark or edit attendance for the selected date.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <div>
            <Label className="text-foreground font-medium">Date</Label>
            <div className="p-2 rounded bg-muted/30 border border-border text-foreground text-base sm:text-lg">{format(date, 'PPP')}</div>
          </div>
          <div>
            <Label className="text-foreground font-medium">Status</Label>
            <Select 
              value={status} 
              onValueChange={v => setStatus(v as 'present' | 'late' | 'absent')}
            >
              <SelectTrigger className={`bg-background border-border text-foreground ${status !== original.status ? 'ring-2 ring-primary' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Only show time fields if not absent */}
          {status !== 'absent' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground font-medium">Time In</Label>
              <Input 
                type="time" 
                value={timeIn} 
                onChange={e => setTimeIn(e.target.value)} 
                  placeholder="09:00"
                className={`bg-background border-border text-foreground ${timeIn !== original.timeIn ? 'ring-2 ring-primary' : ''}`}
              />
            </div>
            <div>
              <Label className="text-foreground font-medium">Time Out</Label>
              <Input 
                type="time" 
                value={timeOut} 
                onChange={e => setTimeOut(e.target.value)} 
                  placeholder="18:00"
                className={`bg-background border-border text-foreground ${timeOut !== original.timeOut ? 'ring-2 ring-primary' : ''}`}
              />
            </div>
          </div>
          )}
          <div>
            <Label className="text-foreground font-medium">Notes</Label>
            <Textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Add notes about attendance..." 
              className={`bg-background border-border text-foreground placeholder:text-muted-foreground ${notes !== original.notes ? 'ring-2 ring-primary' : ''}`}
              rows={3} 
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end sm:space-x-3 space-y-2 sm:space-y-0 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading} className="bg-background border-border text-foreground hover:bg-accent w-full sm:w-auto">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleReset} disabled={isLoading} className="bg-background border-border text-foreground hover:bg-accent w-full sm:w-auto">
              Reset
            </Button>
            <Button onClick={handleSaveClick} disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Save Attendance
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span>Confirm Changes</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to save these changes? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Show what's being changed */}
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <h4 className="font-medium text-foreground mb-2">Changes Summary:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                {status !== original.status && (
                  <div>• Status: {original.status} → {status}</div>
                )}
                {timeIn !== original.timeIn && (
                  <div>• Time In: {original.timeIn || 'Not set'} → {timeIn || 'Not set'}</div>
                )}
                {timeOut !== original.timeOut && (
                  <div>• Time Out: {original.timeOut || 'Not set'} → {timeOut || 'Not set'}</div>
                )}
                {notes !== original.notes && (
                  <div>• Notes: {original.notes || 'None'} → {notes || 'None'}</div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmation(false)}
                className="bg-background border-border text-foreground hover:bg-accent"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmSave}
                disabled={isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? 'Saving...' : 'Confirm Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}; 