const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getConnections } = require('../controllers/connectionController');

const router = express.Router();
router.get('/', authMiddleware, getConnections);
module.exports = router;
