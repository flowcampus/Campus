import crypto from 'crypto';
import prisma from '../lib/prisma';

// Find user by email or phone
export async function findUserByEmailOrPhone(emailOrPhone: string) {
  const isEmail = emailOrPhone.includes('@');
  
  if (isEmail) {
    return await prisma.user.findUnique({
      where: { email: emailOrPhone },
      include: { school: true },
    });
  } else {
    const normalizedPhone = normalizePhoneNumber(emailOrPhone);
    return await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      include: { school: true },
    });
  }
}

// Normalize phone number format
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add country code if missing (assuming +254 for Kenya)
  if (digits.length === 9 && digits.startsWith('7')) {
    return `+254${digits}`;
  } else if (digits.length === 10 && digits.startsWith('07')) {
    return `+254${digits.substring(1)}`;
  } else if (digits.length === 12 && digits.startsWith('254')) {
    return `+${digits}`;
  } else if (digits.length === 13 && digits.startsWith('254')) {
    return `+${digits}`;
  }
  
  // Return as-is if already in correct format or unknown format
  return phone.startsWith('+') ? phone : `+${digits}`;
}

// Generate a 6-digit OTP code
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate a secure random token
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create OTP code in database
export async function createOtpCode(
  userId: string,
  channel: 'email' | 'phone',
  purpose: 'login' | 'reset' | 'verify'
): Promise<string> {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate any existing OTP codes for this user/purpose
  await prisma.otpCode.updateMany({
    where: {
      userId,
      purpose,
      consumed: false,
    },
    data: {
      consumed: true,
    },
  });

  // Create new OTP code
  await prisma.otpCode.create({
    data: {
      userId,
      channel,
      code,
      purpose,
      expiresAt,
    },
  });

  return code;
}

// Verify OTP code
export async function verifyOtpCode(
  userId: string,
  code: string,
  purpose: 'login' | 'reset' | 'verify'
): Promise<boolean> {
  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      userId,
      code,
      purpose,
      consumed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!otpRecord) {
    return false;
  }

  // Mark OTP as consumed
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { consumed: true },
  });

  return true;
}

// Create password reset token
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Invalidate any existing reset tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: {
      userId,
      used: false,
    },
    data: {
      used: true,
    },
  });

  // Create new reset token
  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

// Verify password reset token
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const resetRecord = await prisma.passwordResetToken.findFirst({
    where: {
      token,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!resetRecord) {
    return null;
  }

  // Mark token as used
  await prisma.passwordResetToken.update({
    where: { id: resetRecord.id },
    data: { used: true },
  });

  return resetRecord.userId;
}
