// Application constants and configuration

export const APP_CONFIG = {
  name: 'Campus',
  version: '1.0.0',
  description: 'Complete School Management System',
  author: 'FlowPlatform (Dr Ofe Caleb)',
  supportEmail: 'support@campus.edu',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  autoSaveInterval: 30 * 1000, // 30 seconds
};

export const ROUTES = {
  // Auth routes
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ROLE_SELECTION: '/auth/role-selection',
    STUDENT_LOGIN: '/auth/login/student',
    PARENT_LOGIN: '/auth/login/parent',
    SCHOOL_LOGIN: '/auth/login/school',
    GUEST_LOGIN: '/auth/login/guest',
  },
  
  // Dashboard routes
  DASHBOARD: {
    ROOT: '/dashboard',
    STUDENT: '/dashboard/student',
    PARENT: '/dashboard/parent',
    TEACHER: '/dashboard/teacher',
    ADMIN: '/dashboard/admin',
    GUEST: '/dashboard/guest',
  },
  
  // Main app routes
  STUDENTS: '/students',
  TEACHERS: '/teachers',
  CLASSES: '/classes',
  ATTENDANCE: '/attendance',
  GRADES: '/grades',
  FEES: '/fees',
  SUBJECTS: '/subjects',
  ANNOUNCEMENTS: '/announcements',
  EVENTS: '/events',
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  PROFILE: '/profile',
};

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  SCHOOL_ADMIN: 'school_admin',
  PRINCIPAL: 'principal',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  GUEST: 'guest',
  SUPPORT_ADMIN: 'support_admin',
  SALES_ADMIN: 'sales_admin',
  CONTENT_ADMIN: 'content_admin',
  FINANCE_ADMIN: 'finance_admin',
  MINISTRY_INSPECTOR: 'ministry_inspector',
} as const;

export const SCHOOL_TYPES = {
  NURSERY: 'nursery',
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  TERTIARY: 'tertiary',
  MIXED: 'mixed',
} as const;

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  PREMIUM: 'premium',
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
} as const;

export const ASSESSMENT_TYPES = {
  TEST: 'test',
  EXAM: 'exam',
  ASSIGNMENT: 'assignment',
  PROJECT: 'project',
  CONTINUOUS_ASSESSMENT: 'continuous_assessment',
} as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CARD: 'card',
  MOBILE_MONEY: 'mobile_money',
  SMARTSAVE: 'smartsave',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  ANNOUNCEMENT: 'announcement',
  GRADE: 'grade',
  ATTENDANCE: 'attendance',
  FEE: 'fee',
  EVENT: 'event',
} as const;

export const EVENT_TYPES = {
  EXAM: 'exam',
  HOLIDAY: 'holiday',
  MEETING: 'meeting',
  SPORTS: 'sports',
  CULTURAL: 'cultural',
  ACADEMIC: 'academic',
  OTHER: 'other',
} as const;

export const ANNOUNCEMENT_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const TARGET_AUDIENCES = {
  ALL: 'all',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  PARENTS: 'parents',
  STAFF: 'staff',
} as const;

export const STUDENT_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  GRADUATED: 'graduated',
  TRANSFERRED: 'transferred',
  WITHDRAWN: 'withdrawn',
} as const;

export const TEACHER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  TERMINATED: 'terminated',
} as const;

export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
] as const;

export const RELATIONSHIPS = {
  FATHER: 'father',
  MOTHER: 'mother',
  GUARDIAN: 'guardian',
  UNCLE: 'uncle',
  AUNT: 'aunt',
  GRANDPARENT: 'grandparent',
  OTHER: 'other',
} as const;

export const COUNTRIES = [
  'Nigeria',
  'Cameroon',
  'Ghana',
  'Kenya',
  'South Africa',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
] as const;

export const LANGUAGES = {
  ENGLISH: 'en',
  FRENCH: 'fr',
  PIDGIN: 'pidgin',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// Grade calculation constants
export const GRADE_SCALE = {
  'A+': { min: 95, max: 100, gpa: 4.0 },
  'A': { min: 90, max: 94, gpa: 4.0 },
  'A-': { min: 85, max: 89, gpa: 3.7 },
  'B+': { min: 80, max: 84, gpa: 3.3 },
  'B': { min: 75, max: 79, gpa: 3.0 },
  'B-': { min: 70, max: 74, gpa: 2.7 },
  'C+': { min: 65, max: 69, gpa: 2.3 },
  'C': { min: 60, max: 64, gpa: 2.0 },
  'C-': { min: 55, max: 59, gpa: 1.7 },
  'D+': { min: 50, max: 54, gpa: 1.3 },
  'D': { min: 45, max: 49, gpa: 1.0 },
  'F': { min: 0, max: 44, gpa: 0.0 },
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    GUEST_LOGIN: '/auth/guest-login',
    ADMIN_LOGIN: '/auth/admin-login',
  },
  
  SCHOOLS: {
    BASE: '/schools',
    BY_ID: (id: string) => `/schools/${id}`,
    STATS: (id: string) => `/schools/${id}/stats`,
    SUBSCRIPTION: (id: string) => `/schools/${id}/subscription`,
  },
  
  STUDENTS: {
    BASE: '/students',
    BY_SCHOOL: (schoolId: string) => `/students/school/${schoolId}`,
    BY_ID: (id: string) => `/students/${id}`,
    ATTENDANCE: (id: string) => `/students/${id}/attendance`,
    GRADES: (id: string) => `/students/${id}/grades`,
  },
  
  TEACHERS: {
    BASE: '/teachers',
    BY_SCHOOL: (schoolId: string) => `/teachers/school/${schoolId}`,
    BY_ID: (id: string) => `/teachers/${id}`,
  },
  
  CLASSES: {
    BASE: '/classes',
    BY_SCHOOL: (schoolId: string) => `/classes/school/${schoolId}`,
    BY_ID: (id: string) => `/classes/${id}`,
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  GENERIC: 'An unexpected error occurred. Please try again.',
  
  // Auth specific
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Account temporarily locked due to multiple failed attempts.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in.',
  PASSWORD_EXPIRED: 'Your password has expired. Please reset it.',
  
  // Form specific
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Successfully saved!',
  CREATED: 'Successfully created!',
  UPDATED: 'Successfully updated!',
  DELETED: 'Successfully deleted!',
  SENT: 'Successfully sent!',
  UPLOADED: 'Successfully uploaded!',
  IMPORTED: 'Successfully imported!',
  EXPORTED: 'Successfully exported!',
  
  // Auth specific
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'Successfully logged out.',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PASSWORD_RESET_SENT: 'Password reset instructions sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'campus_token',
  USER: 'campus_user',
  THEME: 'campus_theme',
  LANGUAGE: 'campus_language',
  SIDEBAR_STATE: 'campus_sidebar_state',
  RECENT_SEARCHES: 'campus_recent_searches',
  DRAFT_DATA: 'campus_draft_data',
} as const;

// Feature flags
export const FEATURES = {
  OFFLINE_MODE: true,
  REAL_TIME_NOTIFICATIONS: true,
  ADVANCED_ANALYTICS: true,
  BULK_OPERATIONS: true,
  EXPORT_FUNCTIONALITY: true,
  MOBILE_APP: false,
  AI_FEATURES: false,
  PAYMENT_INTEGRATION: true,
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 10,
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  },
} as const;

// Chart colors
export const CHART_COLORS = [
  '#2196F3', // Blue
  '#4CAF50', // Green
  '#FF9800', // Orange
  '#F44336', // Red
  '#9C27B0', // Purple
  '#00BCD4', // Cyan
  '#FFEB3B', // Yellow
  '#795548', // Brown
  '#607D8B', // Blue Grey
  '#E91E63', // Pink
] as const;

// Time formats
export const TIME_FORMATS = {
  DATE_SHORT: 'MMM dd, yyyy',
  DATE_LONG: 'MMMM dd, yyyy',
  DATE_TIME: 'MMM dd, yyyy HH:mm',
  TIME_12H: 'hh:mm a',
  TIME_24H: 'HH:mm',
  ISO_DATE: 'yyyy-MM-dd',
  ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

// Regular expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  STUDENT_ID: /^[A-Z0-9-_]+$/i,
  EMPLOYEE_ID: /^[A-Z0-9-_]+$/i,
  SCHOOL_CODE: /^[A-Z0-9_]+$/i,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  LETTERS_ONLY: /^[a-zA-Z\s]+$/,
  NUMBERS_ONLY: /^\d+$/,
} as const;

// Default values
export const DEFAULTS = {
  CLASS_CAPACITY: 30,
  MAX_SCORE: 100,
  ACADEMIC_YEAR: new Date().getFullYear(),
  CURRENCY: 'NGN',
  COUNTRY: 'Nigeria',
  LANGUAGE: 'en',
  THEME: 'light',
  PAGE_SIZE: 20,
  TIMEOUT: 10000, // 10 seconds
} as const;

// Status colors mapping
export const STATUS_COLORS = {
  active: 'success',
  inactive: 'error',
  pending: 'warning',
  suspended: 'error',
  graduated: 'info',
  transferred: 'info',
  withdrawn: 'error',
  completed: 'success',
  failed: 'error',
  refunded: 'warning',
  present: 'success',
  absent: 'error',
  late: 'warning',
  excused: 'info',
  paid: 'success',
  unpaid: 'error',
  partial: 'warning',
  overdue: 'error',
} as const;

// Grade colors mapping
export const GRADE_COLORS = {
  'A+': 'success',
  'A': 'success',
  'A-': 'success',
  'B+': 'info',
  'B': 'info',
  'B-': 'info',
  'C+': 'warning',
  'C': 'warning',
  'C-': 'warning',
  'D+': 'error',
  'D': 'error',
  'F': 'error',
} as const;

// Priority colors mapping
export const PRIORITY_COLORS = {
  low: 'info',
  normal: 'primary',
  high: 'warning',
  urgent: 'error',
} as const;

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800,
} as const;

// Z-index layers
export const Z_INDEX = {
  DRAWER: 1200,
  APP_BAR: 1100,
  MODAL: 1300,
  SNACKBAR: 1400,
  TOOLTIP: 1500,
  LOADING: 9999,
} as const;

// Breakpoint values (matching MUI defaults)
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

// Common spacing values
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;