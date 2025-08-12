import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Building, 
  Calendar,
  MapPin,
  Phone,
  Shield,
  Clock,
  TrendingUp,
  X,
  Edit,
  Download
} from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  if (!user) return null;

  const attendanceStats = {
    totalDays: 22,
    presentDays: 20,
    lateDays: 1,
    absentDays: 1,
    attendanceRate: 95.5
  };

  const recentActivity = [
    { date: '2024-01-15', action: 'Check-in', time: '09:00 AM', status: 'success' },
    { date: '2024-01-14', action: 'Check-in', time: '08:45 AM', status: 'success' },
    { date: '2024-01-13', action: 'Check-in', time: '09:15 AM', status: 'warning' },
    { date: '2024-01-12', action: 'Check-in', time: '08:30 AM', status: 'success' },
    { date: '2024-01-11', action: 'Check-in', time: '09:00 AM', status: 'success' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <User className="w-5 h-5 text-primary" />
            <span>User Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-start space-x-6">
            <img
              src={user.profilePicture}
              alt={user.name}
              className="w-24 h-24 rounded-xl object-cover shadow-card"
            />
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                  {user.status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
                <Badge variant="outline">
                  {user.department}
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* User Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Personal Information</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Phone</div>
                      <div className="text-sm text-muted-foreground">{user.phone}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Department</div>
                    <div className="text-sm text-muted-foreground">{user.department}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Join Date</div>
                    <div className="text-sm text-muted-foreground">{user.joinDate}</div>
                  </div>
                </div>

                {user.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Location</div>
                      <div className="text-sm text-muted-foreground">{user.location}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Statistics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Attendance Statistics</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-success">{attendanceStats.attendanceRate}%</div>
                  <div className="text-sm text-muted-foreground">Attendance Rate</div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary">{attendanceStats.totalDays}</div>
                  <div className="text-sm text-muted-foreground">Total Days</div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-success">{attendanceStats.presentDays}</div>
                  <div className="text-sm text-muted-foreground">Present Days</div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-warning">{attendanceStats.lateDays}</div>
                  <div className="text-sm text-muted-foreground">Late Days</div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Recent Activity */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Recent Activity</span>
            </h3>
            
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-success' : 
                      activity.status === 'warning' ? 'bg-warning' : 'bg-destructive'
                    }`} />
                    <div>
                      <div className="text-sm font-medium">{activity.action}</div>
                      <div className="text-xs text-muted-foreground">{activity.date} at {activity.time}</div>
                    </div>
                  </div>
                  <Badge variant={activity.status === 'success' ? 'default' : 'secondary'}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 