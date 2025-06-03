// src/services/api.service.js
import axios from 'axios';

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Add request interceptor to attach token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token && !config.url.includes('/auth/login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Optional: Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => {
    // Optional: Log responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  error => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      // Log error in development
      if (import.meta.env.DEV) {
        console.error(`❌ ${status} ${error.config.url}`, data);
      }
      
      // Handle unauthorized - redirect to login
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
      
      // Handle forbidden
      if (status === 403) {
        return Promise.reject(new Error('Access denied. Insufficient permissions.'));
      }
      
      // Handle server errors
      if (status >= 500) {
        return Promise.reject(new Error('Server error. Please try again later.'));
      }
      
      // Handle other errors with API message
      const message = data?.message || data?.title || 'An error occurred';
      return Promise.reject(new Error(message));
    } 
    
    // Network errors
    if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Other errors
    return Promise.reject(new Error(error.message || 'An unexpected error occurred'));
  }
);

// API Service Methods
export const authService = {
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    
    // Store token and user data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  async refreshToken() {
    const response = await apiClient.post('/auth/refresh');
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  }
};

export const studentService = {
  async getAll(includeArchived = false) {
    const response = await apiClient.get(`/students?includeArchived=${includeArchived}`);
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },

  async create(student) {
    const response = await apiClient.post('/students', student);
    return response.data;
  },

  async update(id, student) {
    const response = await apiClient.put(`/students/${id}`, student);
    return response.data;
  },

  async delete(id) {
    await apiClient.delete(`/students/${id}`);
  },

  async getByGrade(gradeId) {
    const response = await apiClient.get(`/students/grade/${gradeId}`);
    return response.data;
  },

  async archive(id) {
    await apiClient.post(`/students/${id}/archive`);
  },

  async importFromCsv(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/students/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async downloadTemplate() {
    const response = await apiClient.get('/students/import/template', {
      responseType: 'blob'
    });
    return response.data;
  }
};

export const gradeService = {
  async getAll() {
    const response = await apiClient.get('/grades');
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/grades/${id}`);
    return response.data;
  },

  async create(grade) {
    const response = await apiClient.post('/grades', grade);
    return response.data;
  },

  async update(id, grade) {
    const response = await apiClient.put(`/grades/${id}`, grade);
    return response.data;
  }
};

export const subjectService = {
  async getAll() {
    const response = await apiClient.get('/subjects');
    return response.data;
  },

  async create(subject) {
    const response = await apiClient.post('/subjects', subject);
    return response.data;
  },

  async importFromCsv(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/subjects/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export const examService = {
  async getStudentScores(studentId, academicYear, term) {
    const response = await apiClient.get(`/exams/student/${studentId}/scores?academicYear=${academicYear}&term=${term}`);
    return response.data;
  },

  async submitScore(scoreData) {
    const response = await apiClient.post('/exams/scores', scoreData);
    return response.data;
  },

  async getExamTypes() {
    const response = await apiClient.get('/exams/types');
    return response.data;
  },

  async getTeacherAssignments() {
    const response = await apiClient.get('/exams/teacher/assignments');
    return response.data;
  }
};

export const reportService = {
  async generateReportCard(studentId, academicYear, term) {
    const response = await apiClient.post(`/reportcards/generate/student/${studentId}?academicYear=${academicYear}&term=${term}`);
    return response.data;
  },

  async generateClassReportCards(gradeId, academicYear, term) {
    const response = await apiClient.post(`/reportcards/generate/class/${gradeId}?academicYear=${academicYear}&term=${term}`);
    return response.data;
  },

  async downloadReportCard(reportCardId) {
    const response = await apiClient.get(`/reportcards/${reportCardId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async getStudentReportCards(studentId) {
    const response = await apiClient.get(`/reportcards/student/${studentId}`);
    return response.data;
  }
};

export const userService = {
  async getAll() {
    const response = await apiClient.get('/users');
    return response.data;
  },

  async create(user) {
    const response = await apiClient.post('/users', user);
    return response.data;
  },

  async update(id, user) {
    const response = await apiClient.put(`/users/${id}`, user);
    return response.data;
  },

  async resetPassword(id, newPassword) {
    await apiClient.post(`/users/${id}/reset-password`, { newPassword });
  }
};

// Utility function to get current user
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  return !!(token && user);
};

// Utility function to check user role
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user?.role === role;
};

export default apiClient;