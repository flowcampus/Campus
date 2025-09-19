# Campus API Documentation

## Overview

The Campus API provides comprehensive endpoints for managing school operations, including authentication, student management, teacher administration, and academic tracking.

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:5001/api
```

## Authentication

All API requests require authentication via JWT tokens in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Auth Endpoints

#### POST /auth/login
Authenticate user with email/phone and password.

**Request:**
```json
{
  "emailOrPhone": "user@example.com",
  "password": "password123",
  "schoolCode": "SCHOOL001",
  "role": "teacher"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "teacher",
      "schoolId": "uuid"
    },
    "token": "jwt-token"
  }
}
```

#### POST /auth/register
Register new user account.

#### POST /auth/guest-login
Create temporary guest session.

#### POST /auth/logout
Invalidate current session.

## School Management

### GET /schools
List all schools (admin only).

### POST /schools
Create new school.

### GET /schools/:id
Get school details.

### PUT /schools/:id
Update school information.

## Student Management

### GET /students/school/:schoolId
List students in a school.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search term
- `classId`: Filter by class
- `status`: Filter by status

### POST /students/school/:schoolId
Create new student.

### GET /students/:id
Get student details.

### PUT /students/:id
Update student information.

## Teacher Management

### GET /teachers/school/:schoolId
List teachers in a school.

### POST /teachers/school/:schoolId
Create new teacher.

### GET /teachers/:id
Get teacher details.

### PUT /teachers/:id
Update teacher information.

## Class Management

### GET /classes/school/:schoolId
List classes in a school.

### POST /classes/school/:schoolId
Create new class.

### GET /classes/:id
Get class details with students and subjects.

### PUT /classes/:id
Update class information.

## Attendance Management

### POST /attendance/class/:classId
Mark attendance for a class.

**Request:**
```json
{
  "date": "2024-01-15",
  "attendanceData": [
    {
      "studentId": "uuid",
      "status": "present",
      "remarks": "On time"
    }
  ]
}
```

### GET /attendance/class/:classId/date/:date
Get attendance for specific class and date.

### GET /attendance/student/:studentId/summary
Get attendance summary for student.

## Grade Management

### POST /grades
Record new grade.

**Request:**
```json
{
  "studentId": "uuid",
  "subjectId": "uuid",
  "assessmentType": "test",
  "score": 85,
  "maxScore": 100,
  "remarks": "Good performance"
}
```

### GET /grades/student/:studentId
Get grades for student.

### GET /grades/class/:classId/subject/:subjectId
Get grades for class and subject.

## Fee Management

### POST /fees/structure/school/:schoolId
Create fee structure.

### GET /fees/structure/school/:schoolId
Get fee structures for school.

### POST /fees/payment
Record fee payment.

### GET /fees/student/:studentId/status
Get fee status for student.

## Notifications

### GET /notifications/user/:userId
Get notifications for user.

### PATCH /notifications/:id/read
Mark notification as read.

### PATCH /notifications/user/:userId/read-all
Mark all notifications as read.

## Error Handling

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Rate Limiting

API endpoints are rate limited:
- Authentication: 5 requests per minute
- General endpoints: 100 requests per minute
- File uploads: 10 requests per minute

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (1-based)
- `limit`: Items per page (max 100)
- `sort`: Sort field
- `order`: Sort direction (asc/desc)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Real-time Features

### WebSocket Events
- `notification:new`: New notification received
- `announcement:created`: New announcement posted
- `attendance:marked`: Attendance updated
- `grade:recorded`: New grade entered

### Supabase Subscriptions
```typescript
// Subscribe to notifications
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('New notification:', payload.new);
  })
  .subscribe();
```

## SDK Usage Examples

### JavaScript/TypeScript
```typescript
import { CampusAPI } from '@campus/sdk';

const api = new CampusAPI({
  baseURL: 'https://api.campus.edu',
  apiKey: 'your-api-key'
});

// Login
const { user, token } = await api.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get students
const students = await api.students.list({
  schoolId: 'school-uuid',
  page: 1,
  limit: 20
});
```

## Webhooks

### Available Webhooks
- `student.created`: New student registered
- `payment.completed`: Fee payment processed
- `grade.recorded`: New grade entered
- `attendance.marked`: Attendance updated

### Webhook Payload
```json
{
  "event": "student.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "studentId": "uuid",
    "schoolId": "uuid",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## API Versioning

Current version: `v1`

Version is specified in the URL:
```
https://api.campus.edu/v1/students
```

## Support

For API support:
- Documentation: https://docs.campus.edu
- Support: api-support@campus.edu
- Status: https://status.campus.edu