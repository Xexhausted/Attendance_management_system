const express = require('express');
const { pool } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const { 
  validateUserUpdate, 
  validateUserId,
  validatePagination,
  sanitizeInput 
} = require('../middleware/validation');

const router = express.Router();

// @desc    Create new user (admin only)
// @route   POST /api/users
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      department, 
      join_date, 
      location, 
      status
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, role, and department are required'
      });
    }

    // Check if email already exists
    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, role, department, join_date, location, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        hashedPassword,
        role,
        department,
        join_date || null,
        location || null,
        status || 'active'
      ]
    );

    // Get created user (without password)
    const [newUser] = await pool.execute(
      'SELECT id, name, email, role, department, join_date, profile_picture, location, status, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit);
    let offset = (page - 1) * limit;
    const search = req.query.search || '';
    const department = req.query.department || '';
    const role = req.query.role || '';
    const status = req.query.status || '';

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (department) {
      whereClause += ' AND department = ?';
      params.push(department);
    }

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    console.log('params:', params, 'limit:', limit, 'offset:', offset);

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get users (without password)
    limit = Number(limit);
    offset = Number(offset);
    if (isNaN(limit) || limit <= 0) limit = 10;
    if (isNaN(offset) || offset < 0) offset = 0;
    const sql = `SELECT id, name, email, role, department, join_date, profile_picture, location, status, created_at 
       FROM users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ${limit} OFFSET ${offset}`;
    const [users] = await pool.execute(sql, params);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, validateUserId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is authorized to view this user
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user'
      });
    }

    const [users] = await pool.execute(
      'SELECT id, name, email, role, department, join_date, profile_picture, location, status, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user preferences
    const [preferences] = await pool.execute(
      'SELECT notifications, email_alerts, dark_mode, auto_checkout, timezone, language FROM user_preferences WHERE user_id = ?',
      [id]
    );

    res.json({
      success: true,
      data: {
        user: users[0],
        preferences: preferences[0] || {}
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, validateUserId, validateUserUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, location, join_date } = req.body;

    // Check if user is authorized to update this user
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    // Check if user exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    // Update user
    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (department) {
      updateFields.push('department = ?');
      updateValues.push(department);
    }

    if (location) {
      updateFields.push('location = ?');
      updateValues.push(location);
    }

    if (join_date) {
      updateFields.push('join_date = ?');
      // Convert ISO date string to MySQL date format
      const date = new Date(join_date);
      const mysqlDate = date.toISOString().split('T')[0];
      updateValues.push(mysqlDate);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const [updatedUser] = await pool.execute(
      'SELECT id, name, email, role, department, join_date, profile_picture, location, status FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), validateUserId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete user (cascade will handle related records)
    await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user preferences
// @route   PUT /api/users/:id/preferences
// @access  Private
router.put('/:id/preferences', protect, validateUserId, sanitizeInput, async (req, res) => {
  try {
    const { id } = req.params;
    const { notifications, email_alerts, dark_mode, auto_checkout, timezone, language } = req.body;

    // Check if user is authorized to update this user's preferences
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user\'s preferences'
      });
    }

    // Check if user exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if preferences exist
    const [preferences] = await pool.execute(
      'SELECT id FROM user_preferences WHERE user_id = ?',
      [id]
    );

    if (preferences.length === 0) {
      // Create preferences with default values
      await pool.execute(
        'INSERT INTO user_preferences (user_id, notifications, email_alerts, dark_mode, auto_checkout, timezone, language) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          id, 
          notifications ?? true, 
          email_alerts ?? true, 
          dark_mode ?? false, 
          auto_checkout ?? true, 
          timezone ?? 'UTC+5', 
          language ?? 'English'
        ]
      );
    } else {
      // Update preferences - only update fields that are provided
      const updateFields = [];
      const updateValues = [];

      if (notifications !== undefined) {
        updateFields.push('notifications = ?');
        updateValues.push(notifications);
      }

      if (email_alerts !== undefined) {
        updateFields.push('email_alerts = ?');
        updateValues.push(email_alerts);
      }

      if (dark_mode !== undefined) {
        updateFields.push('dark_mode = ?');
        updateValues.push(dark_mode);
      }

      if (auto_checkout !== undefined) {
        updateFields.push('auto_checkout = ?');
        updateValues.push(auto_checkout);
      }

      if (timezone !== undefined) {
        updateFields.push('timezone = ?');
        updateValues.push(timezone);
      }

      if (language !== undefined) {
        updateFields.push('language = ?');
        updateValues.push(language);
      }

      if (updateFields.length > 0) {
        updateValues.push(id);
        await pool.execute(
          `UPDATE user_preferences SET ${updateFields.join(', ')} WHERE user_id = ?`,
          updateValues
        );
      }
    }

    // Get updated preferences
    const [updatedPreferences] = await pool.execute(
      'SELECT notifications, email_alerts, dark_mode, auto_checkout, timezone, language FROM user_preferences WHERE user_id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User preferences updated successfully',
      data: updatedPreferences[0] || {}
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Admin change user password
// @route   PUT /api/users/:id/change-password
// @access  Private/Admin
router.put('/:id/change-password', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }
    // Check if user exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    // Hash new password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    // Update password
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    res.json({
      success: true,
      message: 'Password updated successfully by admin.'
    });
  } catch (error) {
    console.error('Admin change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

module.exports = router; 