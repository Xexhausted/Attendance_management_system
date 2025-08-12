const express = require('express');
const { pool } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const { validateSalaryCreate, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all salary records (admin only)
// @route   GET /api/salary
// @access  Private/Admin
router.get('/', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const month = req.query.month || '';
    const year = req.query.year || '';

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND u.name LIKE ?';
      params.push(`%${search}%`);
    }

    if (month) {
      whereClause += ' AND s.month = ?';
      params.push(month);
    }

    if (year) {
      whereClause += ' AND s.year = ?';
      params.push(year);
    }

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM salary s 
       JOIN users u ON s.user_id = u.id ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get salary records
    const [salary] = await pool.execute(
      `SELECT s.id, s.user_id, s.month, s.year, s.amount, s.created_at, s.updated_at, u.name, u.department
       FROM salary s 
       JOIN users u ON s.user_id = u.id 
       ${whereClause} 
       ORDER BY s.year DESC, s.month DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: salary,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create salary record (admin only)
// @route   POST /api/salary
// @access  Private/Admin
router.post('/', protect, authorize('admin'), validateSalaryCreate, async (req, res) => {
  try {
    const { user_id, month, year, amount } = req.body;

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if salary record already exists
    const [existing] = await pool.execute(
      'SELECT id FROM salary WHERE user_id = ? AND month = ? AND year = ?',
      [user_id, month, year]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Salary record already exists for this user, month, and year'
      });
    }

    // Create salary record
    const [result] = await pool.execute(
      'INSERT INTO salary (user_id, month, year, amount) VALUES (?, ?, ?, ?)',
      [user_id, month, year, amount]
    );

    // Get created record
    const [newRecord] = await pool.execute(
      'SELECT s.id, s.user_id, s.month, s.year, s.amount, s.created_at, s.updated_at, u.name, u.department FROM salary s JOIN users u ON s.user_id = u.id WHERE s.id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Salary record created successfully',
      data: newRecord[0]
    });
  } catch (error) {
    console.error('Create salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 