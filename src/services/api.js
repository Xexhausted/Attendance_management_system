const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle authentication errors
    if (response.status === 401) {
      // Clear invalid auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Attendance API functions
export const attendanceApi = {
  // Get user's own attendance
  getMyAttendance: async (params) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    return apiRequest(`/attendance/my?${queryParams.toString()}`);
  },

  // Get attendance for specific user (admin only)
  getUserAttendance: async (userId, params) => {
    const queryParams = new URLSearchParams();
    queryParams.append('user_id', userId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    return apiRequest(`/attendance/range?${queryParams.toString()}`);
  },

  // Get attendance statistics
  getAttendanceStats: async (userId, params) => {
    const queryParams = new URLSearchParams();
    if (userId) queryParams.append('user_id', userId);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    return apiRequest(`/attendance/stats?${queryParams.toString()}`);
  },

  // Create attendance record
  createAttendance: async (data) => {
    return apiRequest('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update attendance record
  updateAttendance: async (id, data) => {
    return apiRequest(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete attendance record (admin only)
  deleteAttendance: async (id) => {
    return apiRequest(`/attendance/${id}`, {
      method: 'DELETE',
    });
  },

  // Get attendance by date range
  getAttendanceByRange: async (params) => {
    const queryParams = new URLSearchParams();
    queryParams.append('start_date', params.start_date);
    queryParams.append('end_date', params.end_date);
    if (params.user_id) queryParams.append('user_id', params.user_id);

    return apiRequest(`/attendance/range?${queryParams.toString()}`);
  },
};

// Users API functions
export const usersApi = {
  // Get all users (admin only)
  getAllUsers: async () => {
    return apiRequest('/users');
  },

  // Create new user (admin only)
  createUser: async (userData) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get user by ID
  getUserById: async (id) => {
    return apiRequest(`/users/${id}`);
  },

  // Get user (alias for getUserById)
  getUser: async (id) => {
    return apiRequest(`/users/${id}`);
  },

  // Update user
  updateUser: async (id, data) => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Update user preferences
  updateUserPreferences: async (id, preferences) => {
    return apiRequest(`/users/${id}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Admin change user password
  adminChangePassword: async (userId, newPassword) => {
    return apiRequest(`/users/${userId}/change-password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  },
};

// Auth API functions
export const authApi = {
  // Login
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Get current user
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  // Logout
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
}; 