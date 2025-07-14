import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

export interface AuthRequest extends Request {
  userId?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: number } {
  return jwt.verify(token, JWT_SECRET) as { userId: number };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token ||
                  req.session?.token;

    if (!token) {
      return res.status(401).json({ error: 'لا يوجد رمز مصادقة' });
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'رمز المصادقة غير صحيح' });
  }
}

export async function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token ||
                  req.session?.token;

    if (token) {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}