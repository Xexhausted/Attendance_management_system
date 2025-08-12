# Attendance Management Backend API

A secure and robust Node.js/Express backend API for the Attendance Management System with comprehensive validation, sanitization, and security features.

## 🚀 Features

- **🔐 Authentication & Authorization**: JWT-based authentication with role-based access control
- **🛡️ Security**: Rate limiting, input sanitization, CORS protection, and security headers
- **✅ Validation**: Comprehensive input validation using express-validator
- **🧹 Sanitization**: HTML sanitization to prevent XSS attacks
- **📊 Database**: MySQL with connection pooling and error handling
- **📝 Logging**: Request logging with Morgan
- **⚡ Performance**: Compression and caching optimizations

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: bcryptjs, helmet, rate limiting
- **Sanitization**: sanitize-html

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL database
- Docker (optional, for database)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the config file and update with your settings:
```bash
cp config.env.example config.env
```

### 3. Database Setup
Ensure your MySQL database is running and accessible with the credentials in `config.env`.

### 4. Start Development Server
```bash
npm run dev
```

### 5. Start Production Server
```bash
npm start
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/preferences` - Update user preferences

### Attendance
- `GET /api/attendance` - Get all attendance (admin)
- `GET /api/attendance/my` - Get user's own attendance
- `GET /api/attendance/stats` - Get attendance statistics
- `POST /api/attendance` - Create attendance record
- `PUT /api/attendance/:id` - Update attendance record
- `DELETE /api/attendance/:id` - Delete attendance record (admin)
- `GET /api/attendance/range` - Get attendance by date range

### Salary (Admin Only)
- `GET /api/salary` - Get all salary records
- `POST /api/salary` - Create salary record

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department (admin)

## 🔐 Security Features

### Input Validation
- Email format validation
- Password strength requirements
- Date format validation
- Required field validation
- Data type validation

### Input Sanitization
- HTML tag removal
- SQL injection prevention
- XSS attack prevention
- Special character handling

### Rate Limiting
- 100 requests per 15 minutes per IP
- Speed limiting for excessive requests
- Configurable limits via environment variables

### Authentication
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Token expiration handling

## 📝 Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mysecretpassword
DB_NAME=attendance_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  department VARCHAR(100) DEFAULT 'Engineering',
  join_date DATE,
  profile_picture VARCHAR(255),
  location VARCHAR(100) DEFAULT 'Office Floor 3',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Attendance Table
```sql
CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'late', 'absent') DEFAULT 'present',
  time_in TIME,
  time_out TIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, date)
);
```

## 🧪 Testing

```bash
npm test
```

## 📚 API Documentation

### Request Format
All requests should include:
- `Content-Type: application/json` header
- `Authorization: Bearer <token>` header (for protected routes)

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    }
  ]
}
```

## 🔧 Development

### Project Structure
```
backend/
├── config/
│   └── database.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── notFound.js
│   └── validation.js
├── routes/
│   ├── auth.js
│   ├── attendance.js
│   ├── departments.js
│   ├── salary.js
│   └── users.js
├── server.js
├── package.json
└── README.md
```

### Adding New Routes
1. Create route file in `routes/` directory
2. Add validation middleware
3. Import and register in `server.js`
4. Add tests

### Adding New Validation
1. Add validation rules in `middleware/validation.js`
2. Import and use in route handlers
3. Test with various inputs

## 🚀 Deployment

### Production Checklist
- [ ] Update environment variables
- [ ] Set strong JWT secret
- [ ] Configure database connection
- [ ] Set up SSL/TLS
- [ ] Configure reverse proxy
- [ ] Set up monitoring
- [ ] Enable logging
- [ ] Configure backups

### Docker Deployment
```bash
docker build -t attendance-backend .
docker run -p 5000:5000 attendance-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs

---

**Note**: This backend is designed to work with the Attendance Management Frontend. Make sure both frontend and backend are properly configured and running. 