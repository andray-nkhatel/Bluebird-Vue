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

// apiClient.interceptors.response.use(
//   response => {
//     // Optional: Log responses in development
//     if (import.meta.env.DEV) {
//       console.log(`✅ ${response.status} ${response.config.url}`, response.data);
//     }
//     return response;
//   },
//   error => {
//     // Handle different error scenarios
//     if (error.response) {
//       const { status, data } = error.response;
      
//       // Log error in development - but preserve the original error
//       if (import.meta.env.DEV) {
//         console.error(`❌ ${status} ${error.config.url}`, data);
//         console.log('🔍 Full error response data:', JSON.stringify(data, null, 2));
//       }
      
//       // DON'T modify the error - just attach the response for debugging
//       error.backendData = data;
//       error.backendStatus = status;
      
//       // Only handle auth redirects here, preserve other errors as-is
//       if (status === 401) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         window.location.href = '/auth/login';
//       }
      
//       // Return the original error so we can access error.response.data
//       return Promise.reject(error);
//     } 
    
//     // Network errors
//     if (error.request) {
//       return Promise.reject(new Error('Network error. Please check your connection.'));
//     }
    
//     // Other errors  
//     return Promise.reject(error);
//   }
// );

export const promotionData = {}

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



  async promoteStudents(promotionData) {
    await apiClient.post('/students/promote', promotionData);
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
  // Get all subjects
  async getAll() {
    const response = await apiClient.get('/subjects');
    return response.data;
  },

  // Get subject by ID
  async getById(id) {
    const response = await apiClient.get(`/subjects/${id}`);
    return response.data;
  },

  // Create new subject (Admin only)
  async create(subject) {
    const response = await apiClient.post('/subjects', subject);
    return response.data;
  },

  // Assign subject to grade (Admin only)
  async assignToGrade(subjectId, gradeId, assignmentData) {
    const response = await apiClient.post(
      `/subjects/${subjectId}/assign-to-grade/${gradeId}`, 
      assignmentData
    );
    return response.data;
  },

  // Assign teacher to subject for specific grade (Admin only)
  async assignTeacher(subjectId, assignmentData) {
    const response = await apiClient.post(
      `/subjects/${subjectId}/assign-teacher`, 
      assignmentData
    );
    return response.data;
  },

  // Bulk import subjects from CSV (Admin only)
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
  // ===== CORE EXAM SCORE ENDPOINTS =====
  
  // Get exam scores for a student
  async getStudentScores(studentId, academicYear, term) {
    const response = await apiClient.get(`/exams/student/${studentId}/scores?academicYear=${academicYear}&term=${term}`);
    return response.data;
  },

  // Get exam scores for a grade/class
  async getGradeScores(gradeId, academicYear, term) {
    const response = await apiClient.get(`/exams/grade/${gradeId}/scores?academicYear=${academicYear}&term=${term}`);
    return response.data;
  },

  // Create or update exam score (Teachers only)
  async submitScore(scoreData) {
    const response = await apiClient.post('/exams/scores', scoreData);
    return response.data;
  },

  // Update existing score
  async updateScore(scoreId, scoreData) {
    const response = await apiClient.put(`/exams/scores/${scoreId}`, scoreData);
    return response.data;
  },

  // Delete score
  async deleteScore(scoreId) {
    const response = await apiClient.delete(`/exams/scores/${scoreId}`);
    return response.data;
  },

  // Bulk submit scores
  async bulkSubmitScores(scoresData) {
    const response = await apiClient.post('/exams/scores/bulk', scoresData);
    return response.data;
  },

  // ===== STUDENT ENDPOINTS =====
  
  // Get students by grade - CORRECTED ENDPOINT PATH
  async getStudentsByGrade(gradeId) {
    const response = await apiClient.get(`/students/grade/${gradeId}`);
    return response.data;
  },

  // ===== EXAM TYPE ENDPOINTS =====
  
  // Get all exam types
  async getExamTypes() {
    const response = await apiClient.get('/exams/types');
    return response.data;
  },

  // Create new exam type (Admin only)
  async createExamType(examTypeData) {
    const response = await apiClient.post('/exams/types', examTypeData);
    return response.data;
  },

  // Update exam type (Admin only)
  async updateExamType(examTypeId, examTypeData) {
    const response = await apiClient.put(`/exams/types/${examTypeId}`, examTypeData);
    return response.data;
  },

  // Delete exam type (Admin only)
  async deleteExamType(examTypeId) {
    const response = await apiClient.delete(`/exams/types/${examTypeId}`);
    return response.data;
  },

  // ===== TEACHER ASSIGNMENT ENDPOINTS =====
  
  // Get teacher's assigned subjects and grades
  async getTeacherAssignments() {
    const response = await apiClient.get('/exams/teacher/assignments');
    return response.data;
  },

  // Check if teacher can enter score for subject/grade
  async canTeacherEnterScore(teacherId, subjectId, gradeId) {
    const response = await apiClient.get(`/exams/teacher/${teacherId}/can-enter-score?subjectId=${subjectId}&gradeId=${gradeId}`);
    return response.data;
  },

  // ===== EXPORT AND REPORTING ENDPOINTS =====
  
  // Export gradebook
  async exportGradeBook(gradeId, subjectId, academicYear, term, format = 'csv') {
    const params = new URLSearchParams({
      academicYear: academicYear.toString(),
      term: term.toString(),
      format
    });
    if (subjectId) params.append('subjectId', subjectId.toString());
    
    const response = await apiClient.get(`/exams/grade/${gradeId}/export?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Generate report card for student
  async generateReportCard(studentId, academicYear, term) {
    const response = await apiClient.get(`/exams/student/${studentId}/report-card?academicYear=${academicYear}&term=${term}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // ===== STATISTICS ENDPOINTS =====
  
  // Get score statistics
  async getScoreStatistics(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get(`/exams/statistics?${params}`);
    return response.data;
  },

  // ===== ACADEMIC YEAR ENDPOINTS =====
  
  // Get academic years (using existing AcademicYears controller)
  async getAcademicYears() {
    const response = await apiClient.get('/AcademicYears');
    return response.data;
  },

  // Get active academic year
  async getActiveAcademicYear() {
    const response = await apiClient.get('/AcademicYears/active');
    return response.data;
  },

  // ===== UTILITY METHODS =====
  
  // Get gradebook data (combines grade scores with filtering)
  async getGradeBook(gradeId, subjectId, academicYear, term) {
    const response = await apiClient.get(`/exams/grade/${gradeId}/scores?academicYear=${academicYear}&term=${term}`);
    // Filter by subject if provided
    if (subjectId) {
      response.data = response.data.filter(score => score.subjectId === subjectId);
    }
    return response.data;
  },

  // Get terms (static data - you might want to make this dynamic)
  async getTerms() {
    // This could be a static return or API call depending on your needs
    return [
      { id: 1, name: 'Term 1' },
      { id: 2, name: 'Term 2' },
      { id: 3, name: 'Term 3' }
    ];
  },

  // Get current term (you might want to implement this on backend)
  async getCurrentTerm() {
    const activeYear = await this.getActiveAcademicYear();
    const now = new Date();
    const yearStart = new Date(activeYear.startDate);
    const yearEnd = new Date(activeYear.endDate);
    
    // Simple logic to determine current term based on date
    const totalDays = (yearEnd - yearStart) / (1000 * 60 * 60 * 24);
    const daysSinceStart = (now - yearStart) / (1000 * 60 * 60 * 24);
    const termProgress = daysSinceStart / totalDays;
    
    if (termProgress < 0.33) return 1;
    if (termProgress < 0.66) return 2;
    return 3;
  },

  // ===== DEBUG ENDPOINTS =====
  
  // Debug endpoints - using your existing endpoints
  async debugAuth() {
    const response = await apiClient.get('/exams/debug/auth');
    return response.data;
  },

  async debugRoles() {
    const response = await apiClient.get('/exams/debug/roles');
    return response.data;
  },

  // ===== ERROR HANDLING HELPERS =====
  
  // Helper method to handle API errors consistently
  handleApiError(error) {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      switch (status) {
        case 401:
          throw new Error('Authentication required. Please log in again.');
        case 403:
          throw new Error('Access denied. You do not have permission to perform this action.');
        case 404:
          throw new Error('Resource not found.');
        case 422:
          throw new Error(`Validation error: ${message}`);
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(`Error ${status}: ${message}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check if the backend is running.');
    } else {
      // Other error
      throw new Error('An unexpected error occurred.');
    }
  },

  // ===== VALIDATION HELPERS =====
  
  // Validate score data before submission
  validateScoreData(scoreData) {
    const errors = [];
    
    if (!scoreData.studentId) errors.push('Student ID is required');
    if (!scoreData.subjectId) errors.push('Subject ID is required');
    if (!scoreData.examTypeId) errors.push('Exam Type ID is required');
    if (scoreData.score === null || scoreData.score === undefined) {
      errors.push('Score is required');
    } else if (scoreData.score < 0 || scoreData.score > 100) {
      errors.push('Score must be between 0 and 100');
    }
    if (!scoreData.academicYear) errors.push('Academic Year is required');
    if (!scoreData.term || scoreData.term < 1 || scoreData.term > 3) {
      errors.push('Term must be 1, 2, or 3');
    }
    
    return errors;
  },

  // ===== CONVENIENCE METHODS =====
  
  // Submit score with validation
  async submitScoreWithValidation(scoreData) {
    const errors = this.validateScoreData(scoreData);
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }
    
    try {
      return await this.submitScore(scoreData);
    } catch (error) {
      this.handleApiError(error);
    }
  },

  // Get complete grade summary
  async getGradeSummary(gradeId, academicYear, term) {
    try {
      const [scores, students, statistics] = await Promise.all([
        this.getGradeScores(gradeId, academicYear, term),
        this.getStudentsByGrade(gradeId),
        this.getScoreStatistics({ gradeId, academicYear, term })
      ]);
      
      return {
        scores,
        students,
        statistics,
        summary: {
          totalStudents: students.length,
          studentsWithScores: new Set(scores.map(s => s.studentId)).size,
          averageScore: statistics.average || 0,
          passingRate: statistics.passingRate || 0
        }
      };
    } catch (error) {
      this.handleApiError(error);
    }
  }
};

// Add error handling wrapper to all methods
Object.keys(examService).forEach(key => {
  if (typeof examService[key] === 'function' && !key.startsWith('handle') && !key.startsWith('validate')) {
    const originalMethod = examService[key];
    examService[key] = async function(...args) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        this.handleApiError(error);
        
      }
    };
  }
});


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


// Updated userService with correct backend format
export const userService = {
  async getAll() {
    const response = await apiClient.get('/users');
    return response.data;
  },

  async create(user) {
    console.log('🚀 userService.create called with:', user);
    
    // Convert role string to enum number
    const roleMap = {
      'Admin': 1,      // or whatever your enum values are
      'Teacher': 2,
      'Staff': 3
    };
    
    // Create the payload in the format your backend expects
    const payload = {
      
        Username: user.username,
        FullName: user.fullName,
        Email: user.email,
        Role: roleMap[user.role] !== undefined ? roleMap[user.role] : user.role, // Convert to number
        Password: user.password,
        IsActive: user.isActive
      
    };
    
    try {
      const response = await apiClient.post('/users', payload);
      console.log('✅ Backend response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.create error:', error);
      throw error;
    }
  },

  async update(id, user) {
    console.log('🔄 userService.update called with:', { id, user });
    
    // Convert role string to enum number for updates too
    const roleMap = {
      'Admin': 1,
      'Teacher': 2,
      'Staff': 3,
      
    };
    
    // For updates, you might need a different wrapper - check your backend
    const payload = {
      // or just send the user data directly
        Username: user.username,
        FullName: user.fullName,
        Email: user.email,
        Role: user.role,
        IsActive: user.isActive
      
    };
    
    try {
      const response = await apiClient.put(`/users/${id}`, payload);
      console.log('✅ Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.update error:', error);
      throw error;
    }
  },
  async delete(id) {
    console.log('🗑️ userService.delete called with id:', id);
    try {
        const response = await apiClient.delete(`/users/${id}`);
        //console.log('✅ Delete response:', response.status);
        return response.data;
    } catch (error) {
        //console.error(' userService.delete error:', error);
        throw error;
    }
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