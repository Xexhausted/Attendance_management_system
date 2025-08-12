// Generate mock attendance data for current month
const generateMockAttendance = () => {
  const records = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const users = [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Jane Doe' },
    { id: '3', name: 'Alice Johnson' },
    { id: '4', name: 'Bob Wilson' },
    { id: '5', name: 'Carol Davis' }
  ];

  const statuses = ['present', 'absent', 'late'];
  const weights = [0.7, 0.15, 0.15]; // 70% present, 15% absent, 15% late

  for (let day = 1; day <= Math.min(daysInMonth, today.getDate()); day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    users.forEach(user => {
      const random = Math.random();
      let status;
      
      if (random < weights[0]) {
        status = 'present';
      } else if (random < weights[0] + weights[1]) {
        status = 'absent';
      } else {
        status = 'late';
      }

      const timeIn = status !== 'absent' ? 
        (status === 'late' ? '09:30:00' : '09:00:00') : null;
      const timeOut = status !== 'absent' ? '18:00:00' : null;
      const totalHours = status !== 'absent' ? 
        (status === 'late' ? 8.5 : 9) : 0;

      records.push({
        id: `${user.id}-${dateStr}`,
        userId: user.id,
        userName: user.name,
        date: dateStr,
        timeIn,
        timeOut,
        status,
        totalHours,
        notes: status === 'absent' ? 'Sick leave' : undefined
      });
    });
  }

  return records;
};

export const mockAttendanceData = generateMockAttendance();

export const getUserAttendance = (userId) => {
  return mockAttendanceData.filter(record => record.userId === userId);
};

export const getAttendanceStats = (records) => {
  const totalDays = records.length;
  const presentDays = records.filter(r => r.status === 'present').length;
  const absentDays = records.filter(r => r.status === 'absent').length;
  const lateDays = records.filter(r => r.status === 'late').length;
  
  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    attendanceRate: totalDays > 0 ? Math.round((presentDays + lateDays) / totalDays * 100) : 0
  };
};

export const getMonthlyAttendance = (userId) => {
  const records = userId ? getUserAttendance(userId) : mockAttendanceData;
  const stats = getAttendanceStats(records);
  
  return {
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    records,
    stats
  };
}; 