import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AttendanceCard } from '@/components/AttendanceCard';
import { StatusBadge } from '@/components/ui/status-badge';
import { ZenAlert, ZenToast } from '@/components/ui/zen-alert';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAttendance, getAttendanceStats } from '@/data/mockData';
import { 
  Calendar, 
  Clock, 
  Download, 
  Bell,
  ChevronRight,
  MapPin,
  Mail,
  User as UserIcon,
  Heart,
  Zap,
  CheckCircle,
  AlertCircle,
  X,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { ProfileEditModal } from './ProfileEditModal';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userAttendance = getUserAttendance(user?.id?.toString() || '');
  const stats = getAttendanceStats(userAttendance);
  const recentAttendance = userAttendance.slice(-5).reverse();

  const [alertOpen, setAlertOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string>('');
  const [checkOutTime, setCheckOutTime] = useState<string>('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(user);

  // Update current time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    setCheckInTime(timeString);
    setIsCheckedIn(true);
    setIsCheckedOut(false);
    setToastOpen(true);
    
    // Simulate API call
    console.log(`User ${user?.name} checked in at ${timeString}`);
  };

  const handleCheckOut = () => {
    if (!isCheckedIn) {
      setAlertOpen(true);
      return;
    }
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    setCheckOutTime(timeString);
    setIsCheckedOut(true);
    setToastOpen(true);
    
    // Simulate API call
    console.log(`User ${user?.name} checked out at ${timeString}`);
  };

  const handleViewCalendar = () => {
    // Navigate to calendar page
    navigate('/calendar');
    console.log('Navigating to calendar view...');
  };

  const handleShowAlert = () => {
    setAlertOpen(true);
  };

  const getCurrentStatus = () => {
    if (isCheckedOut) return 'Checked Out';
    if (isCheckedIn) return 'Checked In';
    return 'Not Checked In';
  };

  const getStatusColor = () => {
    if (isCheckedOut) return 'text-destructive';
    if (isCheckedIn) return 'text-success';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="bg-card rounded-2xl p-8 text-foreground shadow-lg border border-border animate-breath">
          <div className="flex items-center justify-between">
            <div className="animate-slide-in">
              <h1 className="text-3xl font-bold mb-3 text-foreground">Welcome back, {user?.name}! 🌿</h1>
              <p className="text-muted-foreground text-lg">
                Find your zen in today's attendance journey
              </p>
              <div className="mt-2 flex items-center space-x-4">
                <div className={`text-sm ${getStatusColor()}`}>
                  Status: {getCurrentStatus()}
                </div>
                {checkInTime && (
                  <div className="text-sm text-muted-foreground">
                    Check-in: {checkInTime}
                  </div>
                )}
                {checkOutTime && (
                  <div className="text-sm text-muted-foreground">
                    Check-out: {checkOutTime}
                  </div>
                )}
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-right animate-fade-in">
                <div className="text-sm opacity-80 flex items-center space-x-2 text-muted-foreground">
                  <Heart className="w-4 h-4 animate-gentle-pulse" />
                  <span>Current Time</span>
                </div>
                <div className="text-2xl font-mono text-foreground">{currentTime.toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card className="bg-card shadow-lg hover:shadow-xl transition-all backdrop-blur-sm border border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-foreground">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Zap className="w-5 h-5 text-primary animate-zen-float" />
                  </div>
                  <span>Peaceful Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant={isCheckedIn ? "default" : "secondary"}
                    onClick={handleCheckIn}
                    disabled={isCheckedIn}
                    className={`h-auto py-6 flex-col space-y-3 hover:animate-peaceful-glow ${
                      isCheckedIn 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "bg-background border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    {isCheckedIn ? (
                      <CheckCircle className="w-8 h-8" />
                    ) : (
                    <Clock className="w-8 h-8" />
                    )}
                    <span className="text-sm">
                      {isCheckedIn ? "Checked In" : "Check In"}
                    </span>
                  </Button>
                  
                  <Button 
                    variant={isCheckedOut ? "default" : "secondary"}
                    onClick={handleCheckOut}
                    disabled={!isCheckedIn || isCheckedOut}
                    className={`h-auto py-6 flex-col space-y-3 hover:animate-zen-float ${
                      isCheckedOut 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "bg-background border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    {isCheckedOut ? (
                      <CheckCircle className="w-8 h-8" />
                    ) : (
                    <Clock className="w-8 h-8" />
                    )}
                    <span className="text-sm">
                      {isCheckedOut ? "Checked Out" : "Check Out"}
                    </span>
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    onClick={handleViewCalendar}
                    className="h-auto py-6 flex-col space-y-3 hover:animate-breath bg-background border-border text-foreground hover:bg-accent"
                  >
                    <Calendar className="w-8 h-8" />
                    <span className="text-sm">View Calendar</span>
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    onClick={handleShowAlert}
                    className="h-auto py-6 flex-col space-y-3 bg-background border-border text-foreground hover:bg-accent"
                  >
                    <Bell className="w-8 h-8" />
                    <span className="text-sm">Show Alert</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Attendance */}
            <Card className="bg-card shadow-lg hover:shadow-xl transition-all backdrop-blur-sm border border-border animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Calendar className="w-5 h-5 text-primary animate-zen-float" />
                    </div>
                    <span>Recent Mindful Moments</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:animate-zen-float hover:bg-accent">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAttendance.map((record, index) => (
                    <div 
                      key={record.id} 
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-all hover:animate-zen-float border border-border"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 rounded-full bg-primary animate-gentle-pulse" />
                        <div className="text-sm">
                          <div className="font-medium text-foreground">
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {record.timeIn ? `${record.timeIn} - ${record.timeOut}` : 'Rest day'}
                          </div>
                        </div>
                      </div>
                        <StatusBadge status={record.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="bg-card shadow-lg border border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <UserIcon className="w-5 h-5 text-primary" />
                  <span>Profile</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto text-muted-foreground hover:text-primary"
                    onClick={() => setProfileEditOpen(true)}
                    title="Edit Profile"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M15.232 5.232l-2.464-2.464a2 2 0 0 0-2.828 0l-6.464 6.464a2 2 0 0 0-.586 1.414V15a1 1 0 0 0 1 1h4.354a2 2 0 0 0 1.414-.586l6.464-6.464a2 2 0 0 0 0-2.828z"></path><path d="M13.5 6.5l-7 7"></path></svg>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-foreground">
                <div className="flex items-center space-x-3">
                  <img
                    src={user?.profile_picture}
                    alt={user?.name}
                    className="w-16 h-16 rounded-xl object-cover shadow-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{user?.name}</h3>
                    <p className="text-sm text-muted-foreground">{user?.department}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Office Floor 3</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {user?.join_date}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <ProfileEditModal
              isOpen={profileEditOpen}
              onClose={() => setProfileEditOpen(false)}
              user={user}
              onSave={updatedUser => {
                setProfileUser(updatedUser);
                setProfileEditOpen(false);
              }}
            />

            {/* Attendance Overview */}
            <AttendanceCard stats={stats} />

            {/* Notifications */}
            <Card className="bg-card shadow-lg border border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <Bell className="w-5 h-5 text-primary" />
                  <span>Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-foreground">
                <div className="space-y-3 text-muted-foreground">
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="text-sm font-medium text-primary">Reminder</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Don't forget to check out before leaving
                    </div>
                  </div>
                  <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
                    <div className="text-sm font-medium text-success">Achievement</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Perfect attendance for 5 days!
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Zen Alerts */}
        <ZenAlert
          type="warning"
          title="Check-in Required! ⚠️"
          message="You need to check in first before checking out. Please check in to start your day."
          isOpen={alertOpen}
          onClose={() => setAlertOpen(false)}
          action={{
            label: "Check In Now",
            onClick: () => {
              handleCheckIn();
              setAlertOpen(false);
            }
          }}
        />

        <ZenToast
          type="success"
          message={
            isCheckedIn && !isCheckedOut 
              ? "Check-in successful! 🌱 Welcome to your zen workspace" 
              : isCheckedOut 
                ? "Check-out successful! 🧘‍♀️ Have a peaceful evening"
                : "Action completed successfully!"
          }
          isOpen={toastOpen}
          onClose={() => setToastOpen(false)}
        />
      </div>
    </div>
  );
};