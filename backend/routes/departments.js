const express = require('express');
const { pool } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const { validateDepartmentCreate, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
router.get('/', protect, validatePagination, async (req, res) => {
  try {
    const [departments] = await pool.execute(
      'SELECT id, name, description, created_at, updated_at FROM departments ORDER BY name'
    );

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create department (admin only)
// @route   POST /api/departments
// @access  Private/Admin
router.post('/', protect, authorize('admin'), validateDepartmentCreate, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if department already exists
    const [existing] = await pool.execute(
      'SELECT id FROM departments WHERE name = ?',
      [name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Department already exists'
      });
    }

    // Create department
    const [result] = await pool.execute(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description]
    );

    // Get created department
    const [department] = await pool.execute(
      'SELECT id, name, description, created_at, updated_at FROM departments WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department[0]
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 