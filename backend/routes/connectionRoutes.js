const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getConnections, endConnection } = require('../controllers/connectionController');

const router = express.Router();
router.get('/', authMiddleware, getConnections);
router.delete('/:id', authMiddleware, endConnection);
module.exports = router;
