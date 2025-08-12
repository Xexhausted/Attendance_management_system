import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Clock, CalendarDays, TrendingUp } from 'lucide-react';
import { AttendanceStats } from '@/types/attendance';

interface AttendanceCardProps {
  stats: AttendanceStats;
  className?: string;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({ stats, className }) => {
  return (
    <Card className={`bg-card shadow-lg border border-border hover:shadow-xl transition-all duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg text-foreground">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>Attendance Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Attendance Rate Circle */}
        <div className="flex items-center justify-center">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="hsl(var(--border))"
                strokeWidth="8"
                fill="transparent"
                className="opacity-20"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="hsl(var(--success))"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${(stats.attendanceRate * 251.2) / 100} 251.2`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground">
                {stats.attendanceRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-success/5 border border-success/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-success">{stats.presentDays}</div>
            <div className="text-xs text-muted-foreground">Present Days</div>
          </div>
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-destructive">{stats.absentDays}</div>
            <div className="text-xs text-muted-foreground">Absent Days</div>
          </div>
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-warning">{stats.lateDays}</div>
            <div className="text-xs text-muted-foreground">Late Days</div>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalDays}</div>
            <div className="text-xs text-muted-foreground">Total Days</div>
          </div>
        </div>

        {/* Today's Status */}
        <div className="bg-muted/30 rounded-lg p-3 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Today's Status</span>
            </div>
            <StatusBadge status="present" />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <CalendarDays className="w-3 h-3 inline mr-1" />
            Checked in at 9:00 AM
          </div>
        </div>
      </CardContent>
    </Card>
  );
};