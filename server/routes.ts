import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, comparePassword, generateToken, authMiddleware, type AuthRequest } from "./auth";
import { insertUserSchema, insertVaultSchema } from "@shared/schema";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import express from 'express';

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/mov',
      'video/avi',
      'video/quicktime',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
      }
      
      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({ username, password: hashedPassword });
      
      // Generate token
      const token = generateToken(user.id);
      
      res.json({ user: { id: user.id, username: user.username }, token });
    } catch (error) {
      res.status(400).json({ error: 'خطأ في إنشاء الحساب' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
      }
      
      // Check password
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
      }
      
      // Generate token
      const token = generateToken(user.id);
      
      res.json({ user: { id: user.id, username: user.username }, token });
    } catch (error) {
      res.status(400).json({ error: 'خطأ في تسجيل الدخول' });
    }
  });

  app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ error: 'المستخدم غير موجود' });
      }
      
      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ error: 'خطأ في جلب بيانات المستخدم' });
    }
  });

  // Vault routes
  app.get('/api/vault', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const files = await storage.getVaultFiles(req.userId!);
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: 'خطأ في جلب الملفات' });
    }
  });

  app.post('/api/vault/upload', authMiddleware, upload.single('file'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
      }

      const { description, isPrivate } = req.body;
      const fileName = `${Date.now()}_${req.file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      
      // Move file to permanent location
      fs.renameSync(req.file.path, filePath);

      const vaultFile = await storage.createVaultFile({
        userId: req.userId!,
        fileName,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        filePath: `/uploads/${fileName}`,
        description: description || null,
        isPrivate: isPrivate === 'true',
      });

      res.json(vaultFile);
    } catch (error) {
      res.status(500).json({ error: 'خطأ في رفع الملف' });
    }
  });

  app.get('/api/vault/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getVaultFile(fileId, req.userId!);
      
      if (!file) {
        return res.status(404).json({ error: 'الملف غير موجود' });
      }
      
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: 'خطأ في جلب الملف' });
    }
  });

  app.delete('/api/vault/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getVaultFile(fileId, req.userId!);
      
      if (!file) {
        return res.status(404).json({ error: 'الملف غير موجود' });
      }
      
      // Delete file from filesystem
      const fullPath = path.join(process.cwd(), file.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      
      // Delete from database
      await storage.deleteVaultFile(fileId, req.userId!);
      
      res.json({ message: 'تم حذف الملف بنجاح' });
    } catch (error) {
      res.status(500).json({ error: 'خطأ في حذف الملف' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', authMiddleware, (req: AuthRequest, res, next) => {
    // Additional security check can be added here to verify file ownership
    next();
  });
  
  app.use('/uploads', express.static(uploadDir));

  const httpServer = createServer(app);
  return httpServer;
}
