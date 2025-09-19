import * as yup from 'yup';

// Common validation schemas
export const commonValidation = {
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
    
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
    
  phone: yup
    .string()
    .matches(
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please enter a valid phone number'
    ),
    
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .required('Name is required'),
    
  studentId: yup
    .string()
    .matches(/^[A-Z0-9-_]+$/i, 'Student ID can only contain letters, numbers, hyphens, and underscores')
    .required('Student ID is required'),
    
  employeeId: yup
    .string()
    .matches(/^[A-Z0-9-_]+$/i, 'Employee ID can only contain letters, numbers, hyphens, and underscores')
    .required('Employee ID is required'),
    
  schoolCode: yup
    .string()
    .matches(/^[A-Z0-9_]+$/i, 'School code can only contain letters, numbers, and underscores')
    .min(3, 'School code must be at least 3 characters')
    .max(20, 'School code must be less than 20 characters')
    .required('School code is required'),
    
  amount: yup
    .number()
    .positive('Amount must be positive')
    .required('Amount is required'),
    
  percentage: yup
    .number()
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100'),
    
  date: yup
    .date()
    .required('Date is required'),
    
  futureDate: yup
    .date()
    .min(new Date(), 'Date must be in the future')
    .required('Date is required'),
    
  pastDate: yup
    .date()
    .max(new Date(), 'Date cannot be in the future')
    .required('Date is required'),
};

// Specific validation schemas
export const authValidation = {
  login: yup.object({
    email: commonValidation.email,
    password: yup.string().required('Password is required'),
  }),
  
  register: yup.object({
    firstName: commonValidation.name,
    lastName: commonValidation.name,
    email: commonValidation.email,
    password: commonValidation.password,
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
    phone: commonValidation.phone.optional(),
    role: yup
      .string()
      .oneOf(['student', 'teacher', 'parent', 'admin'], 'Please select a valid role')
      .required('Role is required'),
  }),
  
  forgotPassword: yup.object({
    email: commonValidation.email,
  }),
  
  resetPassword: yup.object({
    password: commonValidation.password,
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
  }),
};

export const studentValidation = {
  create: yup.object({
    firstName: commonValidation.name,
    lastName: commonValidation.name,
    email: commonValidation.email,
    studentId: commonValidation.studentId,
    classId: yup.string().required('Class is required'),
    dateOfBirth: commonValidation.pastDate,
    gender: yup
      .string()
      .oneOf(['male', 'female', 'other'], 'Please select a valid gender')
      .required('Gender is required'),
    guardianName: commonValidation.name,
    guardianPhone: commonValidation.phone.required('Guardian phone is required'),
    guardianEmail: commonValidation.email.optional(),
    address: yup.string().max(500, 'Address must be less than 500 characters'),
  }),
};

export const teacherValidation = {
  create: yup.object({
    firstName: commonValidation.name,
    lastName: commonValidation.name,
    email: commonValidation.email,
    employeeId: commonValidation.employeeId,
    phone: commonValidation.phone.required('Phone is required'),
    qualification: yup
      .string()
      .min(2, 'Qualification must be at least 2 characters')
      .required('Qualification is required'),
    specialization: yup
      .string()
      .min(2, 'Specialization must be at least 2 characters')
      .required('Specialization is required'),
    hireDate: commonValidation.date,
    salary: yup
      .number()
      .positive('Salary must be positive')
      .optional(),
  }),
};

export const classValidation = {
  create: yup.object({
    name: yup
      .string()
      .min(2, 'Class name must be at least 2 characters')
      .max(100, 'Class name must be less than 100 characters')
      .required('Class name is required'),
    level: yup
      .string()
      .min(1, 'Level is required')
      .required('Level is required'),
    section: yup.string().optional(),
    capacity: yup
      .number()
      .positive('Capacity must be positive')
      .max(100, 'Capacity cannot exceed 100')
      .required('Capacity is required'),
    classTeacherId: yup.string().required('Class teacher is required'),
  }),
};

export const gradeValidation = {
  create: yup.object({
    studentId: yup.string().required('Student is required'),
    subjectId: yup.string().required('Subject is required'),
    assessmentType: yup
      .string()
      .oneOf(['test', 'exam', 'assignment', 'project', 'continuous_assessment'])
      .required('Assessment type is required'),
    score: yup
      .number()
      .min(0, 'Score cannot be negative')
      .required('Score is required'),
    maxScore: yup
      .number()
      .positive('Maximum score must be positive')
      .required('Maximum score is required'),
    remarks: yup.string().max(500, 'Remarks must be less than 500 characters'),
  }),
};

export const feeValidation = {
  structure: yup.object({
    feeType: yup
      .string()
      .min(2, 'Fee type must be at least 2 characters')
      .required('Fee type is required'),
    amount: commonValidation.amount,
    dueDate: commonValidation.futureDate.optional(),
    description: yup.string().max(500, 'Description must be less than 500 characters'),
  }),
  
  payment: yup.object({
    studentId: yup.string().required('Student is required'),
    amount: commonValidation.amount,
    paymentMethod: yup
      .string()
      .oneOf(['cash', 'bank_transfer', 'card', 'mobile_money', 'smartsave'])
      .required('Payment method is required'),
    feeType: yup.string().required('Fee type is required'),
    transactionId: yup.string().optional(),
  }),
};

export const schoolValidation = {
  create: yup.object({
    name: yup
      .string()
      .min(2, 'School name must be at least 2 characters')
      .max(255, 'School name must be less than 255 characters')
      .required('School name is required'),
    code: commonValidation.schoolCode,
    email: commonValidation.email,
    phone: commonValidation.phone.optional(),
    type: yup
      .string()
      .oneOf(['nursery', 'primary', 'secondary', 'tertiary', 'mixed'])
      .required('School type is required'),
    address: yup.string().max(500, 'Address must be less than 500 characters'),
    city: yup.string().max(100, 'City must be less than 100 characters'),
    state: yup.string().max(100, 'State must be less than 100 characters'),
    country: yup.string().max(100, 'Country must be less than 100 characters'),
    motto: yup.string().max(500, 'Motto must be less than 500 characters'),
  }),
};

// Utility functions
export const validateField = async (schema: yup.Schema, field: string, value: any) => {
  try {
    await schema.validateAt(field, { [field]: value });
    return null;
  } catch (error: any) {
    return error.message;
  }
};

export const validateForm = async (schema: yup.Schema, values: any) => {
  try {
    await schema.validate(values, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error: any) {
    const errors: Record<string, string> = {};
    error.inner?.forEach((err: any) => {
      if (err.path) {
        errors[err.path] = err.message;
      }
    });
    return { isValid: false, errors };
  }
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  }
  
  return phone;
};

export const formatCurrency = (amount: number, currency = 'NGN'): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date, format = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } else if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  } else if (format === 'time') {
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return dateObj.toLocaleDateString();
};