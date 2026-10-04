const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
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

// Uses Node's built-in multipart/form-data parser. No multer or paid storage service is required.
router.post('/chat', authMiddleware, async (req, res) => {
  let savedPath = null;
  try {
    const contentType = String(req.headers['content-type'] || '');
    if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
      return res.status(415).json({ success: false, message: 'Use multipart/form-data for file uploads.' });
    }

    const request = new Request(`http://skillswap.local${req.originalUrl || req.url}`, {
      method: req.method,
      headers: req.headers,
      body: req,
      duplex: 'half',
    });
    const form = await request.formData();
    const file = form.get('file');
    const recipientId = Number(form.get('recipientId'));
    const conversationId = String(form.get('conversationId') || '');
    const senderId = Number(req.user.id);

    if (!file || typeof file.arrayBuffer !== 'function') {
      return res.status(400).json({ success: false, message: 'Choose a file to upload.' });
    }
    if (!Number.isInteger(recipientId) || !conversationId) {
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

    const originalName = String(file.name || 'file').slice(0, 180);
    const extension = path.extname(originalName).toLowerCase();
    const mimeType = String(file.type || 'application/octet-stream');
    const size = Number(file.size || 0);
    if (size <= 0) return res.status(400).json({ success: false, message: 'The selected file is empty.' });
    if (size > MAX_FILE_SIZE) return res.status(413).json({ success: false, message: 'File is too large. Maximum size is 20 MB.' });
    if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(mimeType)) {
      return res.status(400).json({ success: false, message: 'Unsupported file type. Photos, PDF, Office files, TXT, CSV and ZIP are allowed.' });
    }

    const directory = path.join(uploadRoot, conversationId);
    fs.mkdirSync(directory, { recursive: true });
    const base = path.basename(originalName, extension).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'file';
    const storedName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${base}${extension}`;
    savedPath = path.join(directory, storedName);
    const bytes = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(savedPath, bytes);

    const relativePath = path.relative(path.join(__dirname, '..'), savedPath).split(path.sep).join('/');
    const url = `${req.protocol}://${req.get('host')}/${relativePath}`;

    return res.status(201).json({
      success: true,
      attachment: { url, name: originalName, size, type: mimeType },
    });
  } catch (error) {
    if (savedPath) fs.rmSync(savedPath, { force: true });
    console.error('Chat upload error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not save the attachment.' });
  }
});

module.exports = router;
