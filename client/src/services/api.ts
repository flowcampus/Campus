import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('campus_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string; schoolCode?: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    schoolCode?: string;
  }) => api.post('/auth/register', userData),
  
  guestLogin: (schoolCode?: string) =>
    api.post('/auth/guest-login', { schoolCode }),
  
  adminLogin: (credentials: { email: string; password: string; adminKey?: string }) =>
    api.post('/auth/admin-login', credentials),
  
  logout: () => api.post('/auth/logout'),
  
  getProfile: () => api.get('/auth/profile'),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
  
  refreshToken: () => api.post('/auth/refresh'),
};

// Schools API
export const schoolsAPI = {
  create: (schoolData: any) => api.post('/schools', schoolData),
  getAll: (params?: any) => api.get('/schools', { params }),
  getById: (id: string) => api.get(`/schools/${id}`),
  update: (id: string, data: any) => api.put(`/schools/${id}`, data),
  updateSubscription: (id: string, data: any) => api.put(`/schools/${id}/subscription`, data),
  getStats: (id: string) => api.get(`/schools/${id}/stats`),
  updateStatus: (id: string, isActive: boolean) => api.patch(`/schools/${id}/status`, { isActive }),
  search: (query: string) => api.get(`/schools/search/public?q=${query}`),
};

// Students API
export const studentsAPI = {
  getBySchool: (schoolId: string, params?: any) => api.get(`/students/school/${schoolId}`, { params }),
  create: (schoolId: string, studentData: any) => api.post(`/students/school/${schoolId}`, studentData),
  getById: (id: string) => api.get(`/students/${id}`),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
  getAttendance: (id: string, params?: any) => api.get(`/students/${id}/attendance`, { params }),
  getGrades: (id: string, params?: any) => api.get(`/students/${id}/grades`, { params }),
};

// Teachers API
export const teachersAPI = {
  getBySchool: (schoolId: string, params?: any) => api.get(`/teachers/school/${schoolId}`, { params }),
  create: (schoolId: string, teacherData: any) => api.post(`/teachers/school/${schoolId}`, teacherData),
  getById: (id: string) => api.get(`/teachers/${id}`),
  update: (id: string, data: any) => api.put(`/teachers/${id}`, data),
};

// Classes API
export const classesAPI = {
  getBySchool: (schoolId: string, params?: any) => api.get(`/classes/school/${schoolId}`, { params }),
  create: (schoolId: string, classData: any) => api.post(`/classes/school/${schoolId}`, classData),
  getById: (id: string) => api.get(`/classes/${id}`),
  update: (id: string, data: any) => api.put(`/classes/${id}`, data),
};

// Subjects API
export const subjectsAPI = {
  getBySchool: (schoolId: string) => api.get(`/subjects/school/${schoolId}`),
  create: (schoolId: string, subjectData: any) => api.post(`/subjects/school/${schoolId}`, subjectData),
  update: (id: string, data: any) => api.put(`/subjects/${id}`, data),
};

// Attendance API
export const attendanceAPI = {
  markAttendance: (classId: string, attendanceData: any) => api.post(`/attendance/class/${classId}`, attendanceData),
  getByClassAndDate: (classId: string, date: string) => api.get(`/attendance/class/${classId}/date/${date}`),
  getStudentSummary: (studentId: string, params?: any) => api.get(`/attendance/student/${studentId}/summary`, { params }),
};

// Grades API
export const gradesAPI = {
  record: (gradeData: any) => api.post('/grades', gradeData),
  getByStudent: (studentId: string, params?: any) => api.get(`/grades/student/${studentId}`, { params }),
  getByClass: (classId: string, subjectId: string, params?: any) => 
    api.get(`/grades/class/${classId}/subject/${subjectId}`, { params }),
  update: (id: string, data: any) => api.put(`/grades/${id}`, data),
};

// Fees API
export const feesAPI = {
  createStructure: (schoolId: string, feeData: any) => api.post(`/fees/structure/school/${schoolId}`, feeData),
  getStructures: (schoolId: string, params?: any) => api.get(`/fees/structure/school/${schoolId}`, { params }),
  recordPayment: (paymentData: any) => api.post('/fees/payment', paymentData),
  getStudentStatus: (studentId: string, params?: any) => api.get(`/fees/student/${studentId}/status`, { params }),
  getStudentPayments: (studentId: string, params?: any) => api.get(`/fees/student/${studentId}/payments`, { params }),
  getSchoolSummary: (schoolId: string, params?: any) => api.get(`/fees/school/${schoolId}/summary`, { params }),
};

// Timetables API
export const timetablesAPI = {
  create: (timetableData: any) => api.post('/timetables', timetableData),
  getByClass: (classId: string) => api.get(`/timetables/class/${classId}`),
  update: (id: string, data: any) => api.put(`/timetables/${id}`, data),
};

// Announcements API
export const announcementsAPI = {
  create: (schoolId: string, announcementData: any) => api.post(`/announcements/school/${schoolId}`, announcementData),
  getBySchool: (schoolId: string, params?: any) => api.get(`/announcements/school/${schoolId}`, { params }),
  update: (id: string, data: any) => api.put(`/announcements/${id}`, data),
  delete: (id: string) => api.delete(`/announcements/${id}`),
};

// Events API
export const eventsAPI = {
  create: (schoolId: string, eventData: any) => api.post(`/events/school/${schoolId}`, eventData),
  getBySchool: (schoolId: string, params?: any) => api.get(`/events/school/${schoolId}`, { params }),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

// Messages API
export const messagesAPI = {
  send: (messageData: any) => api.post('/messages', messageData),
  getByUser: (userId: string, params?: any) => api.get(`/messages/user/${userId}`, { params }),
  markAsRead: (id: string) => api.patch(`/messages/${id}/read`),
};

// Reports API
export const reportsAPI = {
  getStudentReportCard: (studentId: string, termId: string) => 
    api.get(`/reports/student/${studentId}/report-card?termId=${termId}`),
  getClassPerformance: (classId: string, params?: any) => 
    api.get(`/reports/class/${classId}/performance`, { params }),
  getSchoolAnalytics: (schoolId: string) => api.get(`/reports/school/${schoolId}/analytics`),
};

// Admin API
export const adminAPI = {
  getOverview: () => api.get('/admin/overview'),
  updateSchoolSubscription: (schoolId: string, data: any) => 
    api.put(`/admin/schools/${schoolId}/subscription`, data),
  getLogs: (params?: any) => api.get('/admin/logs', { params }),
  updateFeatures: (schoolId: string, features: any) => api.put(`/admin/features/${schoolId}`, { features }),
  sendBroadcast: (broadcastData: any) => api.post('/admin/broadcast', broadcastData),
};

// Notifications API
export const notificationsAPI = {
  getByUser: (userId: string, params?: any) => api.get(`/notifications/user/${userId}`, { params }),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: (userId: string) => api.patch(`/notifications/user/${userId}/read-all`),
  getUnreadCount: (userId: string) => api.get(`/notifications/user/${userId}/unread-count`),
};

// Users API
export const usersAPI = {
  getBySchool: (schoolId: string, params?: any) => api.get(`/users/school/${schoolId}`, { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  addToSchool: (schoolId: string, userData: any) => api.post(`/users/school/${schoolId}/add`, userData),
  removeFromSchool: (schoolId: string, userId: string) => 
    api.delete(`/users/school/${schoolId}/remove/${userId}`),
  updateRole: (schoolId: string, userId: string, roleData: any) => 
    api.put(`/users/school/${schoolId}/role/${userId}`, roleData),
};

export default api;
