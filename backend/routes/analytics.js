const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { protect } = require('../middleware/auth');

// Get overall analytics
router.get('/overview', protect, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get total users
    const [usersResult] = await connection.execute(
      'SELECT COUNT(*) as total, COUNT(CASE WHEN status = "active" THEN 1 END) as active FROM users'
    );
    
    // Get attendance statistics
    const [attendanceResult] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'half-day' THEN 1 END) as half_day
      FROM attendance
    `);
    
    // Get department statistics
    const [deptResult] = await connection.execute(`
      SELECT department, COUNT(*) as count 
      FROM users 
      WHERE department IS NOT NULL 
      GROUP BY department 
      ORDER BY count DESC 
      LIMIT 5
    `);
    
    // Get attendance trend (last 7 days)
    const [trendResult] = await connection.execute(`
      SELECT 
        DATE(date) as date,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent
      FROM attendance 
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(date)
      ORDER BY date
    `);
    
    // Get top performers
    const [performersResult] = await connection.execute(`
      SELECT 
        u.name,
        u.department,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id
      WHERE u.status = 'active'
      GROUP BY u.id, u.name, u.department
      ORDER BY present_days DESC
      LIMIT 10
    `);
    
    connection.release();
    
    const analytics = {
      users: {
        total: usersResult[0].total,
        active: usersResult[0].active
      },
      attendance: {
        total: attendanceResult[0].total_records,
        present: attendanceResult[0].present,
        late: attendanceResult[0].late,
        absent: attendanceResult[0].absent,
        halfDay: attendanceResult[0].half_day
      },
      departments: deptResult,
      trend: trendResult,
      topPerformers: performersResult
    };
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load analytics data'
    });
  }
});

// Get department-specific analytics
router.get('/department/:department', protect, async (req, res) => {
  try {
    const { department } = req.params;
    const connection = await pool.getConnection();
    
    // Get users in department
    const [usersResult] = await connection.execute(
      'SELECT COUNT(*) as total, COUNT(CASE WHEN status = "active" THEN 1 END) as active FROM users WHERE department = ?',
      [department]
    );
    
    // Get attendance for department
    const [attendanceResult] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'half-day' THEN 1 END) as half_day
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE u.department = ?
    `, [department]);
    
    // Get department trend
    const [trendResult] = await connection.execute(`
      SELECT 
        DATE(a.date) as date,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE u.department = ? AND a.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(a.date)
      ORDER BY date
    `, [department]);
    
    connection.release();
    
    const analytics = {
      department,
      users: {
        total: usersResult[0].total,
        active: usersResult[0].active
      },
      attendance: {
        total: attendanceResult[0].total_records,
        present: attendanceResult[0].present,
        late: attendanceResult[0].late,
        absent: attendanceResult[0].absent,
        halfDay: attendanceResult[0].half_day
      },
      trend: trendResult
    };
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('Department analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load department analytics'
    });
  }
});

// Get user-specific analytics
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();
    
    // Get user info
    const [userResult] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user attendance
    const [attendanceResult] = await connection.execute(`
      SELECT 
        COUNT(*) as total_days,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_days,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN status = 'half-day' THEN 1 END) as half_day_days
      FROM attendance 
      WHERE user_id = ?
    `, [userId]);
    
    // Get monthly trend
    const [monthlyResult] = await connection.execute(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent
      FROM attendance 
      WHERE user_id = ?
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `, [userId]);
    
    connection.release();
    
    const analytics = {
      user: userResult[0],
      attendance: {
        total: attendanceResult[0].total_days,
        present: attendanceResult[0].present_days,
        late: attendanceResult[0].late_days,
        absent: attendanceResult[0].absent_days,
        halfDay: attendanceResult[0].half_day_days
      },
      monthlyTrend: monthlyResult
    };
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load user analytics'
    });
  }
});

// Get time-based analytics
router.get('/time-range', protect, async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    const connection = await pool.getConnection();
    
    let whereClause = 'WHERE a.date BETWEEN ? AND ?';
    let params = [startDate, endDate];
    
    if (department && department !== 'all') {
      whereClause += ' AND u.department = ?';
      params.push(department);
    }
    
    // Get attendance statistics for time range
    const [attendanceResult] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN a.status = 'half-day' THEN 1 END) as half_day
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      ${whereClause}
    `, params);
    
    // Get daily trend
    const [trendResult] = await connection.execute(`
      SELECT 
        DATE(a.date) as date,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      ${whereClause}
      GROUP BY DATE(a.date)
      ORDER BY date
    `, params);
    
    connection.release();
    
    const analytics = {
      timeRange: { startDate, endDate, department },
      attendance: {
        total: attendanceResult[0].total_records,
        present: attendanceResult[0].present,
        late: attendanceResult[0].late,
        absent: attendanceResult[0].absent,
        halfDay: attendanceResult[0].half_day
      },
      trend: trendResult
    };
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('Time range analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load time range analytics'
    });
  }
});

module.exports = router; 