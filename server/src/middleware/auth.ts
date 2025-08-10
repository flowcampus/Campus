import { NextFunction, Request, Response } from 'express';
import { verifyJwt } from '../utils/jwt';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; schoolId?: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = verifyJwt(token);
    req.user = { id: payload.sub, role: payload.role, schoolId: payload.schoolId };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdminRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient privileges' });
    }
    
    next();
  };
}

export function requireSchoolRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient privileges for this school resource' });
    }
    
    // Ensure user has a school association for school-specific roles
    if (['teacher', 'school_admin', 'support_staff'].includes(req.user.role) && !req.user.schoolId) {
      return res.status(403).json({ error: 'School association required' });
    }
    
    next();
  };
}

// Audit logging utility
export async function logLoginAttempt(
  userId: string | null,
  email: string | null,
  phone: string | null,
  success: boolean,
  context: string,
  reason: string | null,
  req: Request
) {
  try {
    await prisma.loginAudit.create({
      data: {
        userId,
        email,
        phone,
        ip: req.ip || req.connection.remoteAddress || null,
        userAgent: req.headers['user-agent'] || null,
        success,
        context,
        reason,
      },
    });
  } catch (error) {
    console.error('Failed to log login attempt:', error);
  }
}
