// src/services/api.service.js
import { ensureNumber } from '@/service/numberUtils.js';
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
      
      // Convert single role to roles array for consistency
      const userData = { ...response.data.user };
      if (userData.role && !userData.roles) {
        userData.roles = [userData.role];
      } else if (!userData.roles) {
        userData.roles = [];
      }
      
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    return response.data;
  },

  async refreshToken() {
    const response = await apiClient.post('/auth/refresh');
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      // Convert single role to roles array for consistency
      const userData = { ...response.data.user };
      if (userData.role && !userData.roles) {
        userData.roles = [userData.role];
      } else if (!userData.roles) {
        userData.roles = [];
      }
      
      localStorage.setItem('user', JSON.stringify(userData));
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
    // Don't try to call logout endpoint if it doesn't exist
    // window.location.href = '/auth/login';
    // Instead, just redirect to login page
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

  async assignOptionalSubjects(studentId, subjectIds) {
    const response = await apiClient.post(`/students/${studentId}/assign-optional-subjects`, {
      subjectIds: subjectIds
    });
    return response.data;
  },

  async removeOptionalSubjects(studentId) {
    await apiClient.delete(`/students/${studentId}/remove-optional-subjects`);
  },

  async promoteStudents(promotionData) {
    const response = await apiClient.post('/students/promote', promotionData);
    return response.data;
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
    const response = await apiClient.get('/students/template', {
      responseType: 'blob'
    });
    return response.data;
  },

  async createMinimal(student) {
    // Expects: { firstName, lastName, gradeId }
    const response = await apiClient.post('/students/minimal', student);
    return response.data;
  },

  async updateMinimal(id, student) {
    // Expects: { firstName, lastName, gradeId, isActive }
    const response = await apiClient.put(`/students/minimal/${id}`, student);
    return response.data;
  }
};
export const gradeService = {
  async getAll(includeInactive = false) {
    // You may need to add a query parameter for inactive grades
    // or modify your C# controller to accept this parameter
    const response = await apiClient.get('/grades', {
      params: { includeInactive }
    });
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/grades/${id}`);
    return response.data;
  },

  async create(grade) {
    // Map your frontend grade object to match the CreateGradeDto
    const createGradeDto = {
      name: grade.name,
      stream: grade.stream,
      level: grade.level || 1,
      section: grade.section,
      homeroomTeacherId: grade.homeroomTeacherId || null // This is required by your API
    };
    
    const response = await apiClient.post('/grades', createGradeDto);
    return response.data;
  },

  async update(id, grade) {
    // You'll need to add an update endpoint in your C# controller
    const response = await apiClient.put(`/grades/${id}`, grade);
    return response.data;
  },

  async toggleStatus(id) {
    // You'll need to add this endpoint in your C# controller
    const response = await apiClient.patch(`/grades/${id}/toggle-status`);
    return response.data;
  },

  async assignHomeroomTeacher(gradeId, teacherId) {
    const response = await apiClient.post(`/grades/${gradeId}/assign-homeroom-teacher`, {
      teacherId: teacherId
    });
    return response.data;
  }
};


export const subjectService = {

  async getAll(includeInactive = false) {
    try {
      const params = includeInactive ? '?includeInactive=true' : '';
      const response = await apiClient.get(`/subjects${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  },


  async getById(id) {
    try {
      const response = await apiClient.get(`/subjects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subject ${id}:`, error);
      throw error;
    }
  },


  async create(subject) {
    try {
      const response = await apiClient.post('/subjects', subject);
      return response.data;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  },

 
  async update(id, subject) {
    try {
      const response = await apiClient.put(`/subjects/${id}`, subject);
      return response.data;
    } catch (error) {
      console.error(`Error updating subject ${id}:`, error);
      throw error;
    }
  },


  async delete(id) {
    try {
      await apiClient.delete(`/subjects/${id}`);
    } catch (error) {
      console.error(`Error deleting subject ${id}:`, error);
      throw error;
    }
  },


  async toggleStatus(id) {
    try {
      const response = await apiClient.patch(`/subjects/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling subject ${id} status:`, error);
      throw error;
    }
  },


  async getSubjectAssignments(subjectId) {
    try {
      const response = await apiClient.get(`/subjects/${subjectId}/assignments`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching assignments for subject ${subjectId}:`, error);
      throw error;
    }
  },


  async assignToGrade(subjectId, gradeId, assignmentData) {
    try {
      const response = await apiClient.post(
        `/subjects/${subjectId}/assign-to-grade/${gradeId}`, 
        assignmentData
      );
      return response.data;
    } catch (error) {
      console.error(`Error assigning subject ${subjectId} to grade ${gradeId}:`, error);
      throw error;
    }
  },

  
  async assignTeacher(subjectId, assignmentData) {
    try {
      const response = await apiClient.post(`/subjects/${subjectId}/assign-teacher`, assignmentData);
      return response.data;
    } catch (error) {
      console.error(`Error assigning teacher to subject ${subjectId}:`, error);
      throw error;
    }
  },


  async assignTeacherToMultipleGrades(subjectId, assignmentData) {
    try {
      const response = await apiClient.post(`/subjects/${subjectId}/assign-teacher-multiple-grades`, assignmentData);
      return response.data;
    } catch (error) {
      console.error(`Error assigning teacher to multiple grades for subject ${subjectId}:`, error);
      throw error;
    }
  },

  
  async bulkAssignTeachersToSubjects(bulkAssignmentData) {
    try {
      const response = await apiClient.post('/subjects/bulk-assign', bulkAssignmentData);
      return response.data;
    } catch (error) {
      console.error('Error performing bulk assignment:', error);
      throw error;
    }
  },

 
  async importFromCsv(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/subjects/import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error importing subjects from CSV:', error);
      throw error;
    }
  },

 
  async transferAssignments(transferData) {
    try {
      const response = await apiClient.post('/subjects/transfer-assignments', transferData);
      return response.data;
    } catch (error) {
      console.error('Error transferring assignments:', error);
      throw error;
    }
  },

 
  async removeTeacherAssignment(assignmentId) {
    try {
      await apiClient.delete(`/subjects/assignments/${assignmentId}`);
    } catch (error) {
      console.error(`Error removing assignment ${assignmentId}:`, error);
      throw error;
    }
  },

 
  async getByGrade(gradeId) {
    try {
      const response = await apiClient.get(`/subjects/grade/${gradeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subjects for grade ${gradeId}:`, error);
      throw error;
    }
  },

 
  async getByTeacher(teacherId) {
    try {
      const response = await apiClient.get(`/subjects/teacher/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subjects for teacher ${teacherId}:`, error);
      throw error;
    }
  },

 
  async search(query) {
    try {
      const response = await apiClient.get(`/subjects/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching subjects:', error);
      throw error;
    }
  },

 
  async getStatistics(subjectId = null) {
    try {
      const url = subjectId ? `/subjects/${subjectId}/statistics` : '/subjects/statistics';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching subject statistics:', error);
      throw error;
    }
  },


  async toggleStatus(id, isActive) {
    try {
      const response = await apiClient.patch(`/subjects/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error(`Error toggling subject ${id} status:`, error);
      throw error;
    }
  },


  async getUnassignedForGrade(gradeId) {
    try {
      const response = await apiClient.get(`/subjects/unassigned/grade/${gradeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching unassigned subjects for grade ${gradeId}:`, error);
      throw error;
    }
  },

 
  async getAssignmentConflicts() {
    try {
      const response = await apiClient.get('/subjects/assignment-conflicts');
      return response.data;
    } catch (error) {
      console.error('Error fetching assignment conflicts:', error);
      throw error;
    }
  },

 
  async resolveConflict(conflictId, resolution) {
    try {
      const response = await apiClient.post(`/subjects/conflicts/${conflictId}/resolve`, resolution);
      return response.data;
    } catch (error) {
      console.error(`Error resolving conflict ${conflictId}:`, error);
      throw error;
    }
  },

  async getTeacherAssignments(teacherId, includeInactive = false) {
    try {
      const params = includeInactive ? '?includeInactive=true' : '';
      const response = await apiClient.get(`/subjects/assignments/teacher/${teacherId}${params}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching assignments for teacher ${teacherId}:`, error);
      throw error;
    }
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



 // Replace your submitScore method with this enhanced debug version
async submitScore(scoreData) {
  try {
    console.log('📤 examService.submitScore called with:', scoreData)
    
    // 1. Validate incoming data first
    const validationErrors = this.validateScoreData(scoreData);
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors before API call:', validationErrors);
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }
    
    // 2. Build payload with explicit type conversion and validation
    const payload = {
      studentId: ensureNumber(scoreData.studentId, 'studentId'),
      subjectId: ensureNumber(scoreData.subjectId, 'subjectId'), 
      examTypeId: ensureNumber(scoreData.examTypeId, 'examTypeId'),
      score: ensureNumber(scoreData.score, 'score'),
      academicYear: ensureNumber(scoreData.academicYear, 'academicYear'),
      term: ensureNumber(scoreData.term, 'term')
    }
    
    // Only include comments if they exist and are not empty
    if (scoreData.comments && typeof scoreData.comments === 'string' && scoreData.comments.trim() !== '') {
      payload.comments = scoreData.comments?.trim() || '';
    }

    //payload.comments = scoreData.comments?.trim() || '';

    
    // 3. Final payload validation
    console.log('📦 API Payload being sent:', payload)
    console.log('📊 Payload types:', {
      studentId: typeof payload.studentId,
      subjectId: typeof payload.subjectId,
      examTypeId: typeof payload.examTypeId,
      score: typeof payload.score,
      academicYear: typeof payload.academicYear,
      term: typeof payload.term,
      comments: typeof payload.comments
    });

    const response = await apiClient.post('/exams/scores', payload)
    console.log('✅ API Response received:', response.data)
    return response.data
    
  } catch (error) {
    console.error('❌ Failed to submit score:', error)

    if (error.response?.data?.errors) {
      console.group('🔍 Validation Errors');
      Object.entries(error.response.data.errors).forEach(([field, messages]) => {
        console.error(`${field}: ${messages.join(', ')}`);
      });
      console.groupEnd();
    }
    
    
    // ENHANCED ERROR LOGGING - This is the critical part
    if (error.response) {
      console.group('🚨 DETAILED ERROR ANALYSIS')
      console.error('Status:', error.response.status)
      console.error('Status Text:', error.response.statusText)
      console.error('Headers:', error.response.headers)
      console.error('Raw Response Data:', error.response.data)
      console.error('Response Data Type:', typeof error.response.data)
      console.error('Response Data as JSON:', JSON.stringify(error.response.data, null, 2))
      console.error('Original Score Data:', scoreData)
      console.error('Final Payload Sent:', payload)
      console.groupEnd()
      
      // Try to extract and display validation errors in multiple formats
      const responseData = error.response.data;
      
      if (responseData) {
        // Format 1: Standard ASP.NET Core validation response
        if (responseData.errors) {
          console.error('🔍 ASP.NET Core Validation Errors:')
          Object.keys(responseData.errors).forEach(field => {
            console.error(`  ${field}: ${responseData.errors[field].join(', ')}`)
          })
        }
        
        // Format 2: Custom validation response
        if (responseData.message) {
          console.error('🔍 Server Message:', responseData.message)
        }
        
        // Format 3: Simple string error
        if (typeof responseData === 'string') {
          console.error('🔍 String Error:', responseData)
        }
        
        // Format 4: Array of errors
        if (Array.isArray(responseData)) {
          console.error('🔍 Error Array:', responseData)
        }
        
        // Format 5: ModelState errors
        if (responseData.modelState) {
          console.error('🔍 ModelState Errors:', responseData.modelState)
        }
      }
    } else if (error.request) {
      console.error('❌ Network Error - No response received:', error.request)
    } else {
      console.error('❌ Request Setup Error:', error.message)
    }
    
    throw error
  }
},



debugScoreDataFlow(change, context) {
  console.log('🔍 Debug Score Data Flow Input:', { change, context });
  
  // More robust field extraction
  const scoreData = {
    studentId: change.studentId,
    subjectId: context.currentSubject?.id || context.currentSubject,
    examTypeId: context.currentExamType?.id || context.currentExamType,
    academicYearId: context.selectedAcademicYear?.id || context.selectedAcademicYear,
    term: context.selectedTerm,
    score: change.score,
    gradeId: change.gradeId,
    // Add any other fields your API expects
  };

  // Additional debugging to understand the structure
  console.log('🔍 Context breakdown:', {
    currentSubject: context.currentSubject,
    currentExamType: context.currentExamType,
    selectedAcademicYear: context.selectedAcademicYear,
    selectedTerm: context.selectedTerm
  });

  // Validate required fields
  const requiredFields = ['studentId', 'subjectId', 'examTypeId', 'academicYearId', 'term'];
  const missingFields = requiredFields.filter(field => !scoreData[field]);
  
  if (missingFields.length > 0) {
    console.warn('⚠️ Missing required fields:', missingFields);
    console.warn('💡 This usually means the user hasn\'t selected all required options in the UI');
  }

  console.log('✅ Constructed Score Data:', scoreData);
  
  return scoreData; // Return plain object, NOT a Promise
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

  async getTeacherAssignmentsStats() {
    const response = await apiClient.get('/exams/admin/teacher-assignments/stats');
    return response.data;
  },

  async statistics({ gradeId, subjectId, academicYear, term } = {}) {
    const response = await apiClient.get('/exams/statistics', {
      params: {
        ...(gradeId !== undefined && { gradeId }),
        ...(subjectId !== undefined && { subjectId }),
        ...(academicYear !== undefined && { academicYear }),
        ...(term !== undefined && { term }),
      }
    });
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

async createAcademicYear(formData){
  const response = await apiClient.post(`/AcademicYears/`, formData);
  return response.data;
},
  // async closeAcademicYear(academicYearId) {
  //   const response = await apiClient.post(`/AcademicYears/${academicYearId}/close`);
  //   return response.data;
  // },
  // async promoteAllStudents(academicYearId) {
  //   const response = await apiClient.post(`/AcademicYears/${academicYearId}/promote-all`);
  //   return response.data;
  // },

  // async archiveGraduates(academicYearId) {
  //   const response = await apiClient.post(`/AcademicYears/${academicYearId}/archive-graduates`);
  //   return response.data;
  // }




  // Update academic year (Admin only)
  async updateAcademicYear(id, academicYearData) {
    try {
      if (!id) {
        throw new Error('Academic year ID is required');
      }

      if (!academicYearData) {
        throw new Error('Academic year data is required');
      }

      const response = await apiClient.put(`/AcademicYears/${id}`, {
        name: academicYearData.name,
        startDate: academicYearData.startDate,
        endDate: academicYearData.endDate
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  },

  // Delete academic year (Admin only)
  async deleteAcademicYear(id) {
    try {
      if (!id) {
        throw new Error('Academic year ID is required');
      }

      await apiClient.delete(`/AcademicYears/${id}`);
      return { success: true };
    } catch (error) {
      this.handleApiError(error);
    }
  },
  async closeAcademicYear(academicYearId) {
    try {
      const response = await apiClient.post(`/AcademicYears/${academicYearId}/close`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  },

  // Promote all students to next grade (Admin only)
  async promoteAllStudents(academicYearId) {
    try {
      const response = await apiClient.post(`/AcademicYears/${academicYearId}/promote-all`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  },

  // Archive graduates (Admin only)
  async archiveGraduates(academicYearId) {
    try {
      const response = await apiClient.post(`/AcademicYears/${academicYearId}/archive-graduates`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
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
    } else if (scoreData.score < 0 || scoreData.score > 150) {
      errors.push('Score must be between 0 and 150');
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

// In your api.service.js
export const markScheduleService = {
  async getMarkSchedulePdfForGrade(gradeId, academicYearId, term, examTypeName) {
    const response = await apiClient.get(`/markschedule/pdf/grade/${gradeId}`, {
      params: { academicYearId, term, examTypeName },
      responseType: 'blob'
    });
    return response.data;
  },

  async getMarkSchedulePdfForAllGrades(academicYearId, term, examTypeName) {
    const response = await apiClient.get('/markschedule/pdf', {
      params: { academicYearId, term, examTypeName },
      responseType: 'blob'
    });
    return response.data;
  }
};


// export const reportService = {
//   async generateReportCard(studentId, academicYear, term) {
//     const response = await apiClient.post(`/reportcards/generate/student/${studentId}?academicYear=${academicYear}&term=${term}`);
//     return response.data;
//   },

//   async generateClassReportCards(gradeId, academicYear, term) {
//     const response = await apiClient.post(`/reportcards/generate/class/${gradeId}?academicYear=${academicYear}&term=${term}`);
//     return response.data;
//   },

//   async downloadReportCard(reportCardId) {
//     const response = await apiClient.get(`/reportcards/${reportCardId}/download`, {
//       responseType: 'blob'
//     });
//     return response.data;
//   },

//   async getStudentReportCards(studentId) {
//     const response = await apiClient.get(`/reportcards/student/${studentId}`);
//     return response.data;
//   },

// async downloadClassReportCardsZip(gradeId, academicYear, term) {
//   const response = await apiClient.get(
//     `/reportcards/download/class/${gradeId}?academicYear=${academicYear}&term=${term}`,
//     { responseType: 'blob' }
//   );
//   return response.data; // This is the Blob
// },

// async downloadClassReportCardsMergedPdf(gradeId, academicYear, term) {
//   const response = await apiClient.get(
//     `/reportcards/download/class/${gradeId}/merged?academicYear=${academicYear}&term=${term}`,
//     { responseType: 'blob' }
//   );
//   return response.data; // This is the Blob (PDF)
// },

//  async requestMergedPdf(gradeId, academicYear, term) {
//   const response = await apiClient.post(
//     `/reportcards/download/class/${gradeId}/merged/request?academicYear=${academicYear}&term=${term}`
//   );
// },
// async checkMergedPdfStatus(jobId) {
//   const response = await apiClient.get(
//     `/reportcards/download/class/merged/status/${jobId}`
//   );
// },
// async downloadMergedPdfFile(gradeId, academicYear, term) {
//   const response = await apiClient.get(
//     `/reportcards/download/class/merged/file/${gradeId}/${academicYear}/${term}`,
//     { responseType: 'blob' }
//   );
// }

// };




export const reportService = {
    async generateReportCard(studentId, academicYear, term) {
        const response = await apiClient.post(
            `/reportcards/generate/student/${studentId}`, 
            null, 
            { params: { academicYear, term } }
        );
        return response.data;
    },

    async generateClassReportCards(gradeId, academicYear, term) {
        const response = await apiClient.post(
            `/reportcards/generate/class/${gradeId}`, 
            null, 
            { params: { academicYear, term } }
        );
        return response.data;
    },

    async downloadReportCard(reportCardId) {
        const response = await apiClient.get(
            `/reportcards/${reportCardId}/download`, 
            { responseType: 'blob' }
        );
        return this.handleBlobDownload(response, `ReportCard_${reportCardId}.pdf`);
    },

    async getStudentReportCards(studentId) {
        const response = await apiClient.get(`/reportcards/student/${studentId}`);
        return response.data;
    },


    async downloadClassReportCardsZip(gradeId, academicYear, term) {
      try {
          const response = await apiClient.get(
              `/reportcards/download/class/${gradeId}`,
              {
                  responseType: 'blob',
                  params: { academicYear, term }
              }
          );
          return this.handleBlobDownload(
              response,
              `ReportCards_Grade${gradeId}_${academicYear}_Term${term}.zip`
          );
      } catch (error) {
          if (error.response && error.response.status === 404) {
              // Show a user-friendly message
              alert("No report cards found for this class, year, and term.");
          } else {
              // Handle other errors
              alert("An error occurred while downloading the report cards.");
          }
          throw error;
      }
  },
    

    
    async requestMergedPdfJob(gradeId, academicYear, term) {
        // Send academicYear and term as query params, not in the body
        const response = await apiClient.post(
            `/reportcards/download/class/${gradeId}/merged/request?academicYear=${academicYear}&term=${term}`
        );
        return response.data
    },
  
    async getMergeJobStatus(jobId) {
        // GET to /reportcards/download/class/merged/status/{jobId}
        const response = await apiClient.get(`/reportcards/download/class/merged/status/${jobId}`);
        return response.data;
    },
  
    async downloadMergedPdfFile(gradeId, academicYear, term) {
        // GET to /reportcards/download/class/merged/file/{gradeId}/{academicYear}/{term}
        const response = await apiClient.get(
            `/reportcards/download/class/merged/file/${gradeId}/${academicYear}/${term}`,
            { responseType: 'blob' }
        );
        return response.data;
    },

    // Helper method to handle blob downloads
    handleBlobDownload(response, fileName) {
        const blob = new Blob([response.data], { 
            type: response.headers['content-type'] 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return blob;
    },

    // Get the view URL for a single report card (for iframe viewing)
    getReportCardViewUrl(reportCardId) {
        // Assumes the backend is served from the same origin or CORS is handled
        return `${apiClient.defaults.baseURL}/reportcards/${reportCardId}/view`;
    },

    // Get view URLs for all report cards for a class (grade, academic year, term)
    async getClassReportCardViewUrls(gradeId, academicYear, term) {
        const response = await apiClient.get(
            `/reportcards/class/${gradeId}/view-urls`,
            { params: { academicYear, term } }
        );
        return response.data; // Array of { Id, AcademicYear, Term, GradeName, StudentName, ViewUrl }
    },

    // Fetch the PDF as a blob (for viewing, not download)
    async fetchReportCardBlob(reportCardId) {
        const response = await apiClient.get(
            `/reportcards/${reportCardId}/download`,
            { responseType: 'blob' }
        );
        return response.data; // Just return the blob, no download
    },

    async getClassReportCardIds(gradeId, academicYear, term) {
        const response = await apiClient.get(
            `/reportcards/class/${gradeId}/view-urls`,
            { params: { academicYear, term } }
        );
        // Map to expected format: { id, studentName, gradeName }
        return response.data.map(rc => ({
            id: rc.id,
            studentName: rc.studentName,
            gradeName: rc.gradeName
        }));
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

    // Ensure role is a number (1, 2, or 3)
    const roleMap = {
      'Admin': 1,
      'Teacher': 2,
      'Staff': 3
    };
    const roleValue = typeof user.role === 'string' ? roleMap[user.role] : user.role;

    const payload = {
      
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: roleValue,
        password: user.password
      
    };

    try {
      const response = await apiClient.post('/users', payload);
      console.log('✅ Backend response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.create error:', error);
      if (error.response && error.response.data) {
        console.error('❌ Backend error details:', error.response.data);
        alert('Backend error: ' + JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  },

  async update(id, user) {
    console.log('🔄 userService.update called with:', { id, user });
    const roleMap = {
      1: 'Admin',
      2: 'Teacher',
      3: 'Staff',
      'Admin': 'Admin',
      'Teacher': 'Teacher',
      'Staff': 'Staff',
    };
    // Always send role as a string
    const roleValue = roleMap[user.role];
    const payload = {
      Username: user.username,
      FullName: user.fullName,
      Email: user.email,
      Role: roleValue, // string: "Admin", "Teacher", or "Staff"
      IsActive: user.isActive
    };
    try {
      const response = await apiClient.put(`/users/${id}`, payload);
      console.log('✅ Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.update error:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error response status:', error.response?.status);
      console.error('❌ Payload sent:', payload);
      throw error;
    }
  },
  async resetPassword(userId, resetData) {
    try {
      console.log('🔍 Reset password payload:', resetData); // Add this line
      const response = await apiClient.post(`/users/${userId}/reset-password`, resetData);
      return response.data;
    } catch (error) {
      console.error('❌ Reset password error details:', error.response?.data); // Add this line
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

  // async resetPassword(id, newPassword) {
  //   await apiClient.post(`/users/${id}/reset-password`, { newPassword });
  // }
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
  if (!user) return false;
  
  // Handle multiple roles
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.includes(role);
  }
  
  // Backward compatibility for single role
  return user.role === role;
};

// Utility function to check if user has any of the specified roles
export const hasAnyRole = (roles) => {
  const user = getCurrentUser();
  if (!user || !Array.isArray(roles)) return false;
  
  // Handle multiple roles
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some(userRole => roles.includes(userRole));
  }
  
  // Backward compatibility for single role
  return roles.includes(user.role);
};

export const examAnalysisService = {
  async getExamAnalysisPdf(academicYearId, term, examTypeName) {
    const response = await apiClient.get('/examanalysis/pdf', {
      params: { academicYearId, term, examTypeName },
      responseType: 'blob'
    });
    return response.data;
  },

  async getExamAnalysisPdfForGrade(gradeId, academicYearId, term, examTypeName) {
    const response = await apiClient.get(`/examanalysis/pdf/${gradeId}`, {
      params: { academicYearId, term, examTypeName },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default apiClient;