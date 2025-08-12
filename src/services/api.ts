const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Generic API request helper
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Authentication API
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Users API
export const usersApi = {
  getAllUsers: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return apiRequest(`/users?limit=${limit}&offset=${offset}`);
  },

  getUser: async (id: string) => {
    return apiRequest(`/users/${id}`);
  },

  createUser: async (userData: any) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id: string, userData: any) => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id: string) => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  updateUserPreferences: async (preferences: any) => {
    return apiRequest('/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Attendance API
export const attendanceApi = {
  getAllAttendance: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return apiRequest(`/attendance?limit=${limit}&offset=${offset}`);
  },

  getMyAttendance: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return apiRequest(`/attendance/my?limit=${limit}&offset=${offset}`);
  },

  getAttendanceStats: async (userId?: string) => {
    const endpoint = userId ? `/attendance/stats/${userId}` : '/attendance/stats';
    return apiRequest(endpoint);
  },

  createAttendance: async (attendanceData: {
    user_id: string;
    date: string;
    status: 'present' | 'late' | 'absent' | 'half-day';
    check_in?: string;
    check_out?: string;
    notes?: string;
  }) => {
    return apiRequest('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  },

  updateAttendance: async (id: string, attendanceData: {
    status?: 'present' | 'late' | 'absent' | 'half-day';
    check_in?: string;
    check_out?: string;
    notes?: string;
  }) => {
    return apiRequest(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(attendanceData),
    });
  },

  deleteAttendance: async (id: string) => {
    return apiRequest(`/attendance/${id}`, {
      method: 'DELETE',
    });
  },

  getAttendanceByRange: async (startDate: string, endDate: string, userId?: string) => {
    const endpoint = userId 
      ? `/attendance/range/${userId}?start=${startDate}&end=${endDate}`
      : `/attendance/range?start=${startDate}&end=${endDate}`;
    return apiRequest(endpoint);
  },

  getUserAttendance: async (userId: string, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return apiRequest(`/attendance/user/${userId}?limit=${limit}&offset=${offset}`);
  },
};

// Analytics API
export const analyticsApi = {
  getOverview: async () => {
    return apiRequest('/analytics/overview');
  },

  getDepartmentAnalytics: async (department: string) => {
    return apiRequest(`/analytics/department/${department}`);
  },

  getUserAnalytics: async (userId: string) => {
    return apiRequest(`/analytics/user/${userId}`);
  },

  getTimeRangeAnalytics: async (startDate: string, endDate: string, department?: string) => {
    const params = new URLSearchParams({ startDate, endDate });
    if (department && department !== 'all') {
      params.append('department', department);
    }
    return apiRequest(`/analytics/time-range?${params.toString()}`);
  },
}; 