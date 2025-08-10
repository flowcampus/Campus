import { Router } from 'express';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { signJwt } from '../utils/jwt';
import { requireAuth, requireAdminRole, logLoginAttempt, AuthRequest } from '../middleware/auth';
import emailService from '../services/emailService';
import smsService from '../services/smsService';
import {
  findUserByEmailOrPhone,
  normalizePhoneNumber,
  createOtpCode,
  verifyOtpCode,
  createPasswordResetToken,
  verifyPasswordResetToken,
} from '../utils/authUtils';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'admin', schoolCode } = req.body as {
      email: string; password: string; firstName: string; lastName: string; role?: string; schoolCode?: string;
    };

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    let schoolId: string | undefined = undefined;
    if (schoolCode) {
      const school = await prisma.school.findUnique({ where: { code: schoolCode } });
      if (school) schoolId = school.id;
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: passwordHash, firstName, lastName, role, schoolId }
    });

    const token = signJwt({ sub: user.id, role: user.role });
    return res.json({ user: { id: user.id, email: user.email, firstName, lastName, role, schoolId }, token });
  } catch (e: any) {
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login - Enhanced with email/phone support
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password, schoolCode, role } = req.body as { 
      emailOrPhone: string; 
      password: string; 
      schoolCode?: string; 
      role?: string; 
    };
    
    if (!emailOrPhone || !password) {
      await logLoginAttempt(null, emailOrPhone?.includes('@') ? emailOrPhone : undefined, 
        emailOrPhone?.includes('@') ? undefined : emailOrPhone, false, 'user', 'Missing credentials', req);
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const user = await findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      await logLoginAttempt(null, emailOrPhone?.includes('@') ? emailOrPhone : null, 
        emailOrPhone?.includes('@') ? null : emailOrPhone, false, 'user', 'User not found', req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Role-based validation
    if (role && user.role !== role) {
      await logLoginAttempt(user.id, user.email, user.phone, false, 'user', 'Invalid role', req);
      return res.status(401).json({ error: 'Invalid role for this account' });
    }

    // School code validation for students/parents
    if (schoolCode && user.schoolId) {
      const school = await prisma.school.findUnique({ where: { id: user.schoolId } });
      if (!school || school.code !== schoolCode) {
        await logLoginAttempt(user.id, user.email, user.phone, false, 'user', 'Invalid school code', req);
        return res.status(401).json({ error: 'Invalid school code' });
      }
    }

    const ok = await comparePassword(password, user.password);
    if (!ok) {
      await logLoginAttempt(user.id, user.email, user.phone, false, 'user', 'Invalid password', req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await logLoginAttempt(user.id, user.email, user.phone, true, 'user', null, req);
    const token = signJwt({ sub: user.id, role: user.role, schoolId: user.schoolId });
    
    return res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        phone: user.phone,
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role, 
        schoolId: user.schoolId,
        schoolName: user.school?.name,
        schoolCode: user.school?.code
      }, 
      token 
    });
  } catch (e: any) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/admin-login
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password, adminKey, adminRole } = req.body as { 
      email: string; 
      password: string; 
      adminKey?: string;
      adminRole?: string;
    };
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Check if user has admin privileges
    const adminRoles = ['super_admin', 'support_admin', 'sales_admin', 'content_admin', 'finance_admin'];
    if (!adminRoles.includes(user.role)) {
      return res.status(401).json({ error: 'Insufficient privileges' });
    }
    
    // Validate admin role if specified
    if (adminRole && user.role !== adminRole) {
      return res.status(401).json({ error: 'Invalid admin role' });
    }
    
    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Additional admin key validation for super_admin
    if (user.role === 'super_admin' && adminKey) {
      const expectedKey = process.env.SUPER_ADMIN_KEY || 'default-super-key';
      if (adminKey !== expectedKey) {
        return res.status(401).json({ error: 'Invalid admin key' });
      }
    }
    
    const token = signJwt({ sub: user.id, role: user.role });
    return res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role, 
        schoolId: user.schoolId,
        adminRole: user.role
      }, 
      token 
    });
  } catch (e: any) {
    return res.status(500).json({ error: 'Admin login failed' });
  }
});

// POST /api/auth/guest-login
router.post('/guest-login', async (req, res) => {
  try {
    const { schoolCode } = req.body as { schoolCode?: string };
    const email = `guest${schoolCode ? '+' + schoolCode : ''}@campus.local`;
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const school = schoolCode ? await prisma.school.findUnique({ where: { code: schoolCode } }) : null;
      user = await prisma.user.create({
        data: {
          email,
          password: await hashPassword('guest'),
          firstName: 'Guest',
          lastName: 'User',
          role: 'guest',
          schoolId: school ? school.id : null,
        },
      });
    }
    const token = signJwt({ sub: user.id, role: user.role });
    return res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, schoolId: user.schoolId }, token });
  } catch (e: any) {
    return res.status(500).json({ error: 'Guest login failed' });
  }
});

// GET /api/auth/me (legacy)
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const token = auth.split(' ')[1];
    const base64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    const userId = payload.sub as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    return res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, schoolId: user.schoolId } });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/auth/profile (matches frontend)
router.get('/profile', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const token = auth.split(' ')[1];
    const base64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    const userId = payload.sub as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    return res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, schoolId: user.schoolId } });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /api/auth/logout (stateless JWT)
router.post('/logout', async (_req, res) => {
  return res.json({ success: true });
});

// POST /api/auth/request-reset - Request password reset via email/SMS
router.post('/request-reset', async (req, res) => {
  try {
    const { emailOrPhone } = req.body as { emailOrPhone: string };
    
    if (!emailOrPhone) {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    const user = await findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If an account exists, you will receive reset instructions' });
    }

    const isEmail = emailOrPhone.includes('@');
    
    if (isEmail && user.email) {
      // Send email reset link
      const resetToken = await createPasswordResetToken(user.id);
      const emailSent = await emailService.sendPasswordResetEmail(user.email, resetToken);
      
      if (!emailSent) {
        console.error('Failed to send password reset email');
      }
    } else if (!isEmail && user.phone) {
      // Send SMS reset code
      const resetCode = await createOtpCode(user.id, 'phone', 'reset');
      const smsSent = await smsService.sendPasswordResetSms(user.phone, resetCode);
      
      if (!smsSent) {
        console.error('Failed to send password reset SMS');
      }
    }

    return res.json({ message: 'If an account exists, you will receive reset instructions' });
  } catch (e: any) {
    console.error('Password reset request error:', e);
    return res.status(500).json({ error: 'Failed to process reset request' });
  }
});

// POST /api/auth/forgot-password (legacy endpoint)
router.post('/forgot-password', async (req, res) => {
  // Redirect to new endpoint
  return req.method === 'POST' ? 
    router.handle(Object.assign(req, { url: '/request-reset' }), res, () => {}) :
    res.json({ success: true });
});

// POST /api/auth/reset-password - Reset password with token or OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { token, emailOrPhone, code, newPassword } = req.body as {
      token?: string;
      emailOrPhone?: string;
      code?: string;
      newPassword: string;
    };

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    let userId: string | null = null;

    if (token) {
      // Email reset flow with token
      userId = await verifyPasswordResetToken(token);
      if (!userId) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
    } else if (emailOrPhone && code) {
      // SMS reset flow with OTP
      const user = await findUserByEmailOrPhone(emailOrPhone);
      if (!user) {
        return res.status(400).json({ error: 'Invalid reset code' });
      }
      
      const isValidOtp = await verifyOtpCode(user.id, code, 'reset');
      if (!isValidOtp) {
        return res.status(400).json({ error: 'Invalid or expired reset code' });
      }
      
      userId = user.id;
    } else {
      return res.status(400).json({ error: 'Either token or phone/code combination is required' });
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.json({ message: 'Password reset successfully' });
  } catch (e: any) {
    console.error('Password reset error:', e);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const token = auth.split(' ')[1];
    const base64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    const userId = payload.sub as string | undefined;
    const role = payload.role as string | undefined;
    if (!userId || !role) return res.status(401).json({ error: 'Unauthorized' });
    const newToken = signJwt({ sub: userId, role });
    return res.json({ token: newToken });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// POST /api/auth/link-parent-child - Real parent-child linking
router.post('/link-parent-child', async (req, res) => {
  try {
    const { parentId, childCode } = req.body as { parentId: string; childCode: string };
    if (!parentId || !childCode) {
      return res.status(400).json({ error: 'Missing parent ID or child code' });
    }

    // Verify parent exists and has parent role
    const parent = await prisma.user.findUnique({ where: { id: parentId } });
    if (!parent || parent.role !== 'parent') {
      return res.status(400).json({ error: 'Invalid parent account' });
    }

    // Find student by unique code (email, phone, or ID)
    const student = await prisma.user.findFirst({
      where: {
        role: 'student',
        OR: [
          { email: { contains: childCode } },
          { phone: { contains: childCode } },
          { id: childCode },
          { firstName: { contains: childCode, mode: 'insensitive' } },
          { lastName: { contains: childCode, mode: 'insensitive' } }
        ]
      },
      include: { school: true }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found with provided code' });
    }

    // Check if relationship already exists
    const existingLink = await prisma.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId: parent.id,
          childId: student.id
        }
      }
    });

    if (existingLink) {
      return res.status(400).json({ error: 'Parent-child relationship already exists' });
    }

    // Create parent-child relationship
    await prisma.parentChild.create({
      data: {
        parentId: parent.id,
        childId: student.id
      }
    });

    // Send notification to parent
    if (parent.phone) {
      await smsService.sendParentLinkNotification(
        parent.phone, 
        `${student.firstName} ${student.lastName}`
      );
    }
    
    return res.json({ 
      message: 'Parent-child link created successfully',
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        schoolName: student.school?.name,
        schoolCode: student.school?.code
      }
    });
  } catch (e: any) {
    console.error('Parent-child linking error:', e);
    return res.status(500).json({ error: 'Parent-child linking failed' });
  }
});

// POST /api/auth/request-otp - Request OTP for login/verification
router.post('/request-otp', async (req, res) => {
  try {
    const { emailOrPhone, purpose = 'login' } = req.body as { 
      emailOrPhone: string; 
      purpose?: 'login' | 'verify' | 'reset';
    };
    
    if (!emailOrPhone) {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    const user = await findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isEmail = emailOrPhone.includes('@');
    const channel = isEmail ? 'email' : 'phone';
    
    const otpCode = await createOtpCode(user.id, channel, purpose);
    
    if (isEmail && user.email) {
      const emailSent = await emailService.sendOtpEmail(user.email, otpCode, purpose);
      if (!emailSent) {
        return res.status(500).json({ error: 'Failed to send OTP email' });
      }
    } else if (!isEmail && user.phone) {
      const smsSent = await smsService.sendOtpSms(user.phone, otpCode, purpose);
      if (!smsSent) {
        return res.status(500).json({ error: 'Failed to send OTP SMS' });
      }
    } else {
      return res.status(400).json({ error: 'No valid email or phone number found' });
    }

    return res.json({ 
      message: `OTP sent to your ${channel}`,
      channel,
      expiresIn: 600 // 10 minutes
    });
  } catch (e: any) {
    console.error('OTP request error:', e);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// POST /api/auth/verify-otp - Verify OTP and login
router.post('/verify-otp', async (req, res) => {
  try {
    const { emailOrPhone, code, purpose = 'login' } = req.body as {
      emailOrPhone: string;
      code: string;
      purpose?: 'login' | 'verify' | 'reset';
    };
    
    if (!emailOrPhone || !code) {
      return res.status(400).json({ error: 'Email/phone and code are required' });
    }

    const user = await findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      await logLoginAttempt(null, emailOrPhone?.includes('@') ? emailOrPhone : null, 
        emailOrPhone?.includes('@') ? null : emailOrPhone, false, 'user', 'User not found', req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidOtp = await verifyOtpCode(user.id, code, purpose);
    if (!isValidOtp) {
      await logLoginAttempt(user.id, user.email, user.phone, false, 'user', 'Invalid OTP', req);
      return res.status(401).json({ error: 'Invalid or expired OTP code' });
    }

    if (purpose === 'login') {
      // Generate login token
      await logLoginAttempt(user.id, user.email, user.phone, true, 'user', null, req);
      const token = signJwt({ sub: user.id, role: user.role, schoolId: user.schoolId });
      
      return res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          phone: user.phone,
          firstName: user.firstName, 
          lastName: user.lastName, 
          role: user.role, 
          schoolId: user.schoolId,
          schoolName: user.school?.name,
          schoolCode: user.school?.code
        }, 
        token 
      });
    } else {
      return res.json({ message: 'OTP verified successfully' });
    }
  } catch (e: any) {
    console.error('OTP verification error:', e);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// POST /api/auth/google - Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { idToken, role } = req.body as { idToken: string; role?: string };
    
    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    // Note: In production, verify the Google ID token here
    // For now, we'll decode it (this is not secure for production)
    const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
    
    if (!payload.email) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ 
      where: { email: payload.email },
      include: { school: true }
    });

    if (!user) {
      // Create new user from Google account
      const hashedPassword = await hashPassword(Math.random().toString(36)); // Random password
      user = await prisma.user.create({
        data: {
          email: payload.email,
          firstName: payload.given_name || payload.name?.split(' ')[0] || 'User',
          lastName: payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '',
          password: hashedPassword,
          role: role || 'student', // Default role
        },
        include: { school: true }
      });

      // Send welcome SMS if phone is available
      if (user.phone) {
        await smsService.sendWelcomeSms(user.phone, user.firstName);
      }
    }

    // Role validation if specified
    if (role && user.role !== role) {
      await logLoginAttempt(user.id, user.email, user.phone, false, 'user', 'Invalid role', req);
      return res.status(401).json({ error: 'Invalid role for this account' });
    }

    await logLoginAttempt(user.id, user.email, user.phone, true, 'user', null, req);
    const token = signJwt({ sub: user.id, role: user.role, schoolId: user.schoolId });
    
    return res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        phone: user.phone,
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role, 
        schoolId: user.schoolId,
        schoolName: user.school?.name,
        schoolCode: user.school?.code
      }, 
      token 
    });
  } catch (e: any) {
    console.error('Google OAuth error:', e);
    return res.status(500).json({ error: 'Google authentication failed' });
  }
});

// POST /api/auth/generate-magic-link - Enhanced magic link with email sending
router.post('/generate-magic-link', async (req, res) => {
  try {
    const { email, adminRole } = req.body as { email: string; adminRole: string };
    if (!email || !adminRole) {
      return res.status(400).json({ error: 'Missing email or admin role' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const adminRoles = ['super_admin', 'support_admin', 'sales_admin', 'content_admin', 'finance_admin'];
    if (!adminRoles.includes(user.role)) {
      return res.status(401).json({ error: 'User does not have admin privileges' });
    }

    // Generate single-use magic token (10 minutes expiry)
    const magicToken = await createPasswordResetToken(user.id); // Reuse reset token logic
    const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/magic-login?token=${magicToken}`;

    // Send magic link via email
    const emailSent = await emailService.sendMagicLinkEmail(user.email, magicLink);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send magic link email' });
    }

    await logLoginAttempt(user.id, user.email, user.phone, true, 'admin', 'Magic link generated', req);
    
    return res.json({ 
      message: 'Magic link sent to your email',
      expiresIn: 600 // 10 minutes
    });
  } catch (e: any) {
    console.error('Magic link generation error:', e);
    return res.status(500).json({ error: 'Magic link generation failed' });
  }
});

// GET /api/auth/magic-login - Magic link consumer endpoint
router.get('/magic-login', async (req, res) => {
  try {
    const { token } = req.query as { token: string };
    
    if (!token) {
      return res.status(400).json({ error: 'Magic token is required' });
    }

    const userId = await verifyPasswordResetToken(token);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired magic link' });
    }

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { school: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const adminRoles = ['super_admin', 'support_admin', 'sales_admin', 'content_admin', 'finance_admin'];
    if (!adminRoles.includes(user.role)) {
      return res.status(401).json({ error: 'User does not have admin privileges' });
    }

    await logLoginAttempt(user.id, user.email, user.phone, true, 'admin', 'Magic link login', req);
    const authToken = signJwt({ sub: user.id, role: user.role, schoolId: user.schoolId });
    
    return res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        phone: user.phone,
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role, 
        schoolId: user.schoolId,
        adminRole: user.role
      }, 
      token: authToken
    });
  } catch (e: any) {
    console.error('Magic login error:', e);
    return res.status(500).json({ error: 'Magic login failed' });
  }
});

export default router;
