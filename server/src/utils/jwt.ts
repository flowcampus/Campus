import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  sub: string; // user id
  role: string;
  schoolId?: string;
}

export function signJwt(payload: JwtPayload) {
  // Ensure correct typings for jsonwebtoken v9
  return jwt.sign(payload as object, JWT_SECRET as unknown as jwt.Secret, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET as unknown as jwt.Secret) as JwtPayload;
}
