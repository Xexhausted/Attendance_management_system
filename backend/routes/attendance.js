const express = require('express');
const { pool } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const { 
  validateAttendanceCreate, 
  validateAttendanceUpdate, 
  validateUserId,
  validatePagination,
  validateDateRange,
  sanitizeInput 
} = require('../middleware/validation');
const PDFDocument = require('pdfkit');

const router = express.Router();

// @desc    Get all attendance records (admin only)
// @route   GET /api/attendance
// @access  Private/Admin
router.get('/', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit);
    if (isNaN(limit) || limit <= 0) limit = 10;
    let offset = (page - 1) * limit;
    if (isNaN(offset) || offset < 0) offset = 0;
    const search = req.query.search || '';
    const department = req.query.department || '';
    const status = req.query.status || '';
    const startDate = req.query.start_date || '';
    const endDate = req.query.end_date || '';

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND u.name LIKE ?';
      params.push(`%${search}%`);
    }

    if (department) {
      whereClause += ' AND u.department = ?';
      params.push(department);
    }

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    if (startDate && endDate) {
      whereClause += ' AND a.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM attendance a 
       JOIN users u ON a.user_id = u.id ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get attendance records
    const [attendance] = await pool.execute(
      `SELECT a.id, a.user_id, a.date, a.status, a.time_in, a.time_out, a.notes, a.created_at, a.updated_at 
       FROM attendance a ${whereClause} 
       ORDER BY a.date DESC, a.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: attendance,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's own attendance
// @route   GET /api/attendance/my
// @access  Private
router.get('/my', protect, validatePagination, validateDateRange, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit);
    if (isNaN(limit) || limit <= 0) limit = 31;
    let offset = (page - 1) * limit;
    if (isNaN(offset) || offset < 0) offset = 0;
    const startDate = req.query.start_date || '';
    const endDate = req.query.end_date || '';
    console.log('attendance params:', req.query, 'limit:', limit, 'offset:', offset);

    let whereClause = 'WHERE a.user_id = ?';
    const params = [req.user.id];

    if (startDate && endDate) {
      whereClause += ' AND a.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM attendance a ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get attendance records
    const sql = `SELECT a.id, a.user_id, a.date, a.status, a.time_in, a.time_out, a.notes, a.created_at, a.updated_at 
       FROM attendance a ${whereClause} 
       ORDER BY a.date DESC, a.created_at DESC 
       LIMIT ${limit} OFFSET ${offset}`;
    const [attendance] = await pool.execute(sql, params);

    res.json({
      success: true,
      data: attendance,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.query.user_id || req.user.id;
    const startDate = req.query.start_date || '';
    const endDate = req.query.end_date || '';

    let whereClause = 'WHERE a.user_id = ?';
    const params = [userId];

    if (startDate && endDate) {
      whereClause += ' AND a.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Get attendance statistics
    const [stats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_days,
         SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
         SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
         SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
         AVG(CASE WHEN time_in IS NOT NULL AND time_out IS NOT NULL 
             THEN TIMESTAMPDIFF(MINUTE, time_in, time_out) ELSE NULL END) as avg_hours
       FROM attendance a ${whereClause}`,
      params
    );

    const [user] = await pool.execute(
      'SELECT name, department FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: {
        user: user[0],
        stats: stats[0]
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create attendance record
// @route   POST /api/attendance
// @access  Private
router.post('/', protect, validateAttendanceCreate, async (req, res) => {
  try {
    const { date, status, time_in, time_out, notes } = req.body;

    // Check if attendance already exists for this date and user
    const [existing] = await pool.execute(
      'SELECT id FROM attendance WHERE user_id = ? AND date = ?',
      [req.user.id, date]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Attendance record already exists for this date'
      });
    }

    // Create attendance record
    const [result] = await pool.execute(
      'INSERT INTO attendance (user_id, date, status, time_in, time_out, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, date, status, time_in, time_out, notes]
    );

    // Get created record
    const [newRecord] = await pool.execute(
      'SELECT id, user_id, date, status, time_in, time_out, notes, created_at, updated_at FROM attendance WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      data: newRecord[0]
    });
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private
router.put('/:id', protect, validateAttendanceUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, time_in, time_out, notes } = req.body;

    // Check if attendance record exists
    const [existing] = await pool.execute(
      'SELECT id, user_id, date, status, time_in, time_out, notes, created_at, updated_at FROM attendance WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Check if user owns this record or is admin
    if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this record'
      });
    }

    // Update attendance record
    await pool.execute(
      'UPDATE attendance SET status = ?, time_in = ?, time_out = ?, notes = ? WHERE id = ?',
      [status, time_in, time_out, notes, id]
    );

    // Get updated record
    const [updatedRecord] = await pool.execute(
      'SELECT id, user_id, date, status, time_in, time_out, notes, created_at, updated_at FROM attendance WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: updatedRecord[0]
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), validateUserId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if attendance record exists
    const [existing] = await pool.execute(
      'SELECT id, user_id, date, status, time_in, time_out, notes, created_at, updated_at FROM attendance WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Delete attendance record
    await pool.execute(
      'DELETE FROM attendance WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get attendance by date range
// @route   GET /api/attendance/range
// @access  Private
router.get('/range', protect, validateDateRange, async (req, res) => {
  try {
    const { start_date, end_date, user_id } = req.query;
    const userId = user_id || req.user.id;

    // Check if user is authorized to view other user's attendance
    if (user_id && req.user.role !== 'admin' && req.user.id !== parseInt(user_id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user\'s attendance'
      });
    }

    const [attendance] = await pool.execute(
      `SELECT a.id, a.user_id, a.date, a.status, a.time_in, a.time_out, a.notes, a.created_at, a.updated_at, u.name, u.department 
       FROM attendance a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.user_id = ? AND a.date BETWEEN ? AND ? 
       ORDER BY a.date DESC`,
      [userId, start_date, end_date]
    );

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Get attendance range error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Export attendance records as PDF (admin: all, user: own)
// @route   GET /api/attendance/export/pdf
// @access  Private (admin: all, user: own)
router.get('/export/pdf', protect, async (req, res) => {
  try {
    const userId = req.query.user_id || (req.user.role === 'admin' ? null : req.user.id);
    const startDate = req.query.start_date || '';
    const endDate = req.query.end_date || '';
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (userId) {
      whereClause += ' AND a.user_id = ?';
      params.push(userId);
    }
    if (startDate && endDate) {
      whereClause += ' AND a.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Only admin can export all users
    if (!userId && req.user.role !== 'admin') {
      // Always return a valid PDF, not JSON
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.pdf');
      doc.pipe(res);
      doc.fontSize(16).text('Not authorized to export all attendance.', { align: 'center' });
      doc.end();
      return;
    }

    // Get attendance records with user info
    const [attendance] = await pool.execute(
      `SELECT a.id, a.user_id, a.date, a.status, a.time_in, a.time_out, a.notes, a.created_at, a.updated_at, u.name, u.department 
       FROM attendance a 
       JOIN users u ON a.user_id = u.id 
       ${whereClause} 
       ORDER BY a.date DESC, a.created_at DESC`,
      params
    );

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Attendance Report', { align: 'center' });
    doc.moveDown();
    if (userId && attendance.length > 0) {
      doc.fontSize(12).text(`Name: ${attendance[0].name}`);
      doc.fontSize(12).text(`Department: ${attendance[0].department}`);
      doc.moveDown();
    }
    doc.fontSize(12);

    if (attendance.length === 0) {
      doc.text('No attendance records found.', { align: 'center' });
      doc.end();
      return;
    }

    // Table header
    doc.text('Date', 50, doc.y, { continued: true });
    doc.text('Status', 120, doc.y, { continued: true });
    doc.text('Time In', 180, doc.y, { continued: true });
    doc.text('Time Out', 250, doc.y, { continued: true });
    doc.text('Notes', 320, doc.y, { continued: true });
    if (!userId) doc.text('User', 420, doc.y, { continued: true });
    doc.text('Department', 500, doc.y);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    // Table rows
    attendance.forEach(rec => {
      doc.text(rec.date, 50, doc.y, { continued: true });
      doc.text(rec.status, 120, doc.y, { continued: true });
      doc.text(rec.time_in || '', 180, doc.y, { continued: true });
      doc.text(rec.time_out || '', 250, doc.y, { continued: true });
      doc.text(rec.notes || '', 320, doc.y, { continued: true });
      if (!userId) doc.text(rec.name, 420, doc.y, { continued: true });
      doc.text(rec.department, 500, doc.y);
    });
    doc.end();
  } catch (error) {
    // Always return a valid PDF, not JSON
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.pdf');
    doc.pipe(res);
    doc.fontSize(16).text('Failed to export PDF. Please try again later.', { align: 'center' });
    doc.end();
  }
});

module.exports = router; 