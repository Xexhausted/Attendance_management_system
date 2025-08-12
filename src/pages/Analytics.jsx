import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Navigation } from '../components/Navigation';
import { mockAttendanceData, getAttendanceStats } from '../data/mockData';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Users,
  Clock,
  Download,
  Filter,
  Eye,
  PieChart,
  Activity,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Process data for charts
  const processChartData = () => {
    const days = 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRecords = mockAttendanceData.filter(record => record.date === dateStr);
      const presentCount = dayRecords.filter(r => r.status === 'present').length;
      const lateCount = dayRecords.filter(r => r.status === 'late').length;
      const absentCount = dayRecords.filter(r => r.status === 'absent').length;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        total: dayRecords.length
      });
    }
    
    return data;
  };

  const chartData = processChartData();
  
  // Department statistics
  const departmentStats = {
    'HR Department': { present: 85, late: 10, absent: 5 },
    'Engineering': { present: 90, late: 8, absent: 2 },
    'Marketing': { present: 88, late: 12, absent: 0 },
    'Sales': { present: 92, late: 6, absent: 2 },
    'Operations': { present: 87, late: 9, absent: 4 }
  };

  const pieData = [
    { name: 'Present', value: 442, color: 'hsl(var(--success))' },
    { name: 'Late', value: 45, color: 'hsl(var(--warning))' },
    { name: 'Absent', value: 13, color: 'hsl(var(--destructive))' }
  ];

  const overallStats = getAttendanceStats(mockAttendanceData);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into attendance patterns and trends
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-background border-border text-foreground hover:bg-accent">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card shadow-lg border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Attendance</p>
                  <p className="text-3xl font-bold text-foreground">{overallStats.totalDays}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-3xl font-bold text-success">{overallStats.presentDays}</p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Late</p>
                  <p className="text-3xl font-bold text-warning">{overallStats.lateDays}</p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-3xl font-bold text-destructive">{overallStats.absentDays}</p>
                </div>
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <X className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attendance Distribution */}
          <Card className="bg-card shadow-lg border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Attendance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Performance */}
          <Card className="bg-card shadow-lg border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Department Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(departmentStats).map(([dept, stats]) => (
                  <div key={dept} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{dept}</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((stats.present / (stats.present + stats.late + stats.absent)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-success h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(stats.present / (stats.present + stats.late + stats.absent)) * 100}%` 
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Present: {stats.present}</span>
                      <span>Late: {stats.late}</span>
                      <span>Absent: {stats.absent}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trends Section */}
        <Card className="bg-card shadow-lg border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
               <LineChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis dataKey="date" />
                 <YAxis />
                 <Tooltip />
                 <Line type="monotone" dataKey="present" stroke="hsl(var(--success))" strokeWidth={2} />
                 <Line type="monotone" dataKey="late" stroke="hsl(var(--warning))" strokeWidth={2} />
                 <Line type="monotone" dataKey="absent" stroke="hsl(var(--destructive))" strokeWidth={2} />
               </LineChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 

export default AnalyticsPage;
