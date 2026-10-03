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



// End an active exchange without destroying completed learning history.
// Future scheduled lessons are cancelled and the exchange disappears from
// Active Exchanges for both participants.
const endConnection = async (req, res) => {
  const connectionId = Number(req.params.id);
  const userId = Number(req.user.id);
  if (!Number.isInteger(connectionId)) return res.status(400).json({success:false,message:'Invalid exchange.'});

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [baseRows] = await conn.query(`
      SELECT * FROM exchange_requests
      WHERE id=? AND (sender_id=? OR receiver_id=?) AND status='ACCEPTED'
      LIMIT 1
    `, [connectionId,userId,userId]);
    if (!baseRows.length) {
      await conn.rollback();
      return res.status(404).json({success:false,message:'Active exchange not found.'});
    }
    const base = baseRows[0];

    const [duplicateRows] = await conn.query(`
      SELECT id FROM exchange_requests
      WHERE ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?))
        AND ((offered_skill_id=? AND requested_skill_id=?) OR (offered_skill_id=? AND requested_skill_id=?))
        AND status='ACCEPTED'
    `, [base.sender_id,base.receiver_id,base.receiver_id,base.sender_id,base.offered_skill_id,base.requested_skill_id,base.requested_skill_id,base.offered_skill_id]);
    const ids = duplicateRows.map(x => Number(x.id));
    const marks = ids.map(()=>'?').join(',');

    const [ongoing] = await conn.query(`SELECT id FROM sessions WHERE request_id IN (${marks}) AND status='ONGOING' LIMIT 1`, ids);
    if (ongoing.length) {
      await conn.rollback();
      return res.status(409).json({success:false,message:'This exchange has a live lesson. End the current lesson before ending the exchange.'});
    }

    await conn.query(`UPDATE exchange_requests SET status='CANCELLED' WHERE id IN (${marks})`, ids);
    const [future] = await conn.query(`SELECT id,user1_id,user2_id FROM sessions WHERE request_id IN (${marks}) AND status='SCHEDULED'`, ids);
    if (future.length) {
      const sessionIds = future.map(x=>Number(x.id));
      const smarks = sessionIds.map(()=>'?').join(',');
      await conn.query(`UPDATE sessions SET status='CANCELLED', ended_at=NOW(), ended_by=?, end_reason='EXCHANGE_ENDED' WHERE id IN (${smarks})`, [userId,...sessionIds]);
      await conn.query(`DELETE FROM learning_progress WHERE session_id IN (${smarks}) AND status='IN_PROGRESS'`, sessionIds);
    }

    const partnerId = Number(base.sender_id) === userId ? Number(base.receiver_id) : Number(base.sender_id);
    await conn.query(`
      INSERT INTO notifications(user_id,type,title,message,reference_id,is_read)
      VALUES (?, 'EXCHANGE_ENDED', 'Exchange ended', 'An active skill exchange and its future lessons were ended. Completed lesson history remains available.', ?, FALSE),
             (?, 'EXCHANGE_ENDED', 'Exchange ended', 'An active skill exchange and its future lessons were ended. Completed lesson history remains available.', ?, FALSE)
    `, [userId, connectionId, partnerId, connectionId]);

    await conn.commit();
    return res.json({success:true,message:'Exchange ended. Future lessons were cancelled and completed history was preserved.'});
  } catch (error) {
    await conn.rollback();
    console.error('End connection error:', error.message);
    return res.status(500).json({success:false,message:'Could not end this exchange.'});
  } finally { conn.release(); }
};

module.exports = { getConnections, endConnection };

