const { body, param, query, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

// Sanitization options
const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
  allowedIframeHostnames: []
};

// Sanitize input data
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], sanitizeOptions);
      }
    });
  }
  next();
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Auth validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  sanitizeInput,
  handleValidationErrors
];

const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department must be between 2 and 100 characters'),
  sanitizeInput,
  handleValidationErrors
];

// User validation
const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department must be between 2 and 100 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('join_date')
    .optional()
    .isISO8601()
    .withMessage('Join date must be a valid date'),
  sanitizeInput,
  handleValidationErrors
];

const validateUserId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  handleValidationErrors
];

// Attendance validation
const validateAttendanceCreate = [
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('status')
    .isIn(['present', 'late', 'absent'])
    .withMessage('Status must be present, late, or absent'),
  body('time_in')
    .if(body('status').not().equals('absent'))
    .notEmpty().withMessage('Time in is required unless absent')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time in must be in HH:MM format')
    .optional({ nullable: true }),
  body('time_out')
    .if(body('status').not().equals('absent'))
    .notEmpty().withMessage('Time out is required unless absent')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time out must be in HH:MM format')
    .optional({ nullable: true }),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  sanitizeInput,
  handleValidationErrors
];

const validateAttendanceUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Attendance ID must be a positive integer'),
  body('status')
    .optional()
    .isIn(['present', 'late', 'absent'])
    .withMessage('Status must be present, late, or absent'),
  body('time_in')
    .if(body('status').not().equals('absent'))
    .notEmpty().withMessage('Time in is required unless absent')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time in must be in HH:MM format')
    .optional({ nullable: true }),
  body('time_out')
    .if(body('status').not().equals('absent'))
    .notEmpty().withMessage('Time out is required unless absent')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time out must be in HH:MM format')
    .optional({ nullable: true }),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  sanitizeInput,
  handleValidationErrors
];

// Salary validation
const validateSalaryCreate = [
  body('month')
    .isIn(['January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December'])
    .withMessage('Month must be a valid month name'),
  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  sanitizeInput,
  handleValidationErrors
];

// Department validation
const validateDepartmentCreate = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  sanitizeInput,
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

const validateDateRange = [
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  handleValidationErrors
];

module.exports = {
  sanitizeInput,
  handleValidationErrors,
  validateLogin,
  validateRegister,
  validateUserUpdate,
  validateUserId,
  validateAttendanceCreate,
  validateAttendanceUpdate,
  validateSalaryCreate,
  validateDepartmentCreate,
  validatePagination,
  validateDateRange
}; 