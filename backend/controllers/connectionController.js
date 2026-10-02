const { pool } = require('../config/db');

// Accepted exchange requests become the user's real messaging/calling connections.
const getConnections = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT
        er.id AS request_id,
        CASE WHEN er.sender_id = ? THEN er.receiver_id ELSE er.sender_id END AS user_id,
        u.name,
        u.email,
        u.college,
        u.department,
        u.profile_image,
        er.offered_skill_id,
        er.requested_skill_id,
        er.updated_at AS connected_at
      FROM exchange_requests er
      JOIN users u ON u.id = CASE WHEN er.sender_id = ? THEN er.receiver_id ELSE er.sender_id END
      WHERE (er.sender_id = ? OR er.receiver_id = ?)
        AND er.status = 'ACCEPTED'
      ORDER BY er.updated_at DESC
    `, [userId, userId, userId, userId]);

    return res.json({ success: true, connections: rows });
  } catch (error) {
    console.error('Get connections error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load connections' });
  }
};

module.exports = { getConnections };
