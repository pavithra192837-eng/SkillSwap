const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const { pool } = require('../config/db');

const router = express.Router();
const uploadRoot = path.join(__dirname, '..', 'uploads', 'chat');
fs.mkdirSync(uploadRoot, { recursive: true });
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const allowedMimeTypes = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv', 'application/zip', 'application/x-zip-compressed',
]);
const allowedExtensions = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.zip',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const conversationId = String(req.body?.conversationId || '');
    if (!/^\d+_\d+$/.test(conversationId)) return cb(new Error('Invalid conversation.'));
    const directory = path.join(uploadRoot, conversationId);
    fs.mkdirSync(directory, { recursive: true });
    cb(null, directory);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = path.basename(file.originalname || 'file', ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'file';
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = String(file.mimetype || '').toLowerCase();
    if (!allowedExtensions.has(ext) || !allowedMimeTypes.has(mime)) {
      return cb(new Error('Unsupported file type. Photos, PDF, Office files, TXT, CSV and ZIP are allowed.'));
    }
    cb(null, true);
  },
});

router.post('/chat', authMiddleware, (req, res) => {
  upload.single('file')(req, res, async error => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'File is too large. Maximum size is 20 MB.' });
      }
      return res.status(400).json({ success: false, message: error.message || 'Could not read the uploaded file.' });
    }

    let savedPath = req.file?.path || null;
    try {
      const recipientId = Number(req.body?.recipientId);
      const conversationId = String(req.body?.conversationId || '');
      const senderId = Number(req.user.id);

      if (!req.file) return res.status(400).json({ success: false, message: 'Choose a file to upload.' });
      if (!Number.isInteger(recipientId) || recipientId <= 0 || !/^\d+_\d+$/.test(conversationId)) {
        return res.status(400).json({ success: false, message: 'Invalid chat recipient.' });
      }

      const expectedConversationId = [senderId, recipientId].sort((a, b) => a - b).join('_');
      if (conversationId !== expectedConversationId) {
        return res.status(400).json({ success: false, message: 'Invalid conversation.' });
      }

      const [connection] = await pool.query(`
        SELECT id FROM exchange_requests
        WHERE ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?))
          AND status='ACCEPTED'
        LIMIT 1
      `, [senderId, recipientId, recipientId, senderId]);
      if (!connection.length) {
        return res.status(403).json({ success: false, message: 'You can only share files with an accepted SkillSwap connection.' });
      }

      const relativePath = path.relative(path.join(__dirname, '..'), savedPath).split(path.sep).join('/');
      const url = `${req.protocol}://${req.get('host')}/${relativePath}`;
      const size = Number(req.file.size || 0);
      const mimeType = String(req.file.mimetype || 'application/octet-stream');

      return res.status(201).json({
        success: true,
        attachment: { url, name: req.file.originalname, size, type: mimeType },
      });
    } catch (err) {
      if (savedPath) fs.rmSync(savedPath, { force: true });
      console.error('Chat upload error:', err);
      return res.status(500).json({ success: false, message: 'Could not save the attachment.' });
    }
  });
});

module.exports = router;
