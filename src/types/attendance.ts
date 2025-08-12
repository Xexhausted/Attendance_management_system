export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes?: string;
  totalHours?: number;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
}

export interface MonthlyAttendance {
  month: string;
  year: number;
  records: AttendanceRecord[];
  stats: AttendanceStats;
}