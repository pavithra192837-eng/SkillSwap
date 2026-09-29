const { pool } = require("../config/db");

// =========================
// SEND REQUEST
// POST /api/requests
// =========================
const sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;

    const {
      receiverId,
      senderSkillId,
      receiverSkillId,
      message,
    } = req.body;

    // Validate required fields
    if (
      !receiverId ||
      !senderSkillId ||
      !receiverSkillId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Receiver ID, sender skill ID and receiver skill ID are required",
      });
    }

    // Cannot send request to yourself
    if (Number(receiverId) === Number(senderId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a request to yourself",
      });
    }

    // =========================
    // CHECK RECEIVER
    // =========================
    const [users] = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = ?
      `,
      [receiverId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // =========================
    // CHECK SENDER SKILL
    // Sender must actually TEACH this skill
    // =========================
    const [senderSkills] = await pool.query(
      `
      SELECT id, skill_id
      FROM user_skills
      WHERE id = ?
      AND user_id = ?
      AND type = 'TEACH'
      `,
      [senderSkillId, senderId]
    );

    if (senderSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid sender skill",
      });
    }

    // =========================
    // CHECK RECEIVER SKILL
    // Receiver must actually TEACH this skill
    // =========================
    const [receiverSkills] = await pool.query(
      `
      SELECT id, skill_id
      FROM user_skills
      WHERE id = ?
      AND user_id = ?
      AND type = 'TEACH'
      `,
      [receiverSkillId, receiverId]
    );

    if (receiverSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver skill",
      });
    }

    // =========================
    // CHECK FOR EXISTING PENDING REQUEST
    // =========================
    const [existingRequests] = await pool.query(
      `
      SELECT id
      FROM exchange_requests
      WHERE sender_id = ?
      AND receiver_id = ?
      AND status = 'pending'
      `,
      [senderId, receiverId]
    );

    if (existingRequests.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A pending request already exists",
      });
    }

    // =========================
    // CREATE REQUEST
    // =========================
    const [result] = await pool.query(
      `
      INSERT INTO exchange_requests
      (
        sender_id,
        receiver_id,
        sender_skill_id,
        receiver_skill_id,
        message,
        status
      )
      VALUES (?, ?, ?, ?, ?, 'pending')
      `,
      [
        senderId,
        receiverId,
        senderSkillId,
        receiverSkillId,
        message || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Exchange request sent successfully",
      requestId: result.insertId,
    });

  } catch (error) {
    console.error("Send request error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to send request",
    });
  }
};


// =========================
// GET RECEIVED REQUESTS
// GET /api/requests/received
// =========================
const getReceivedRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const [requests] = await pool.query(
      `
      SELECT
        er.id,
        er.sender_id,
        er.receiver_id,

        er.sender_skill_id,
        er.receiver_skill_id,

        er.message,
        er.status,
        er.created_at,

        u.name AS sender_name,
        u.email AS sender_email,
        u.bio AS sender_bio,
        u.profile_image AS sender_profile_image,

        sender_skill.name AS sender_skill_name,
        receiver_skill.name AS receiver_skill_name

      FROM exchange_requests er

      JOIN users u
        ON er.sender_id = u.id

      JOIN skills sender_skill
        ON er.sender_skill_id = sender_skill.id

      JOIN skills receiver_skill
        ON er.receiver_skill_id = receiver_skill.id

      WHERE er.receiver_id = ?

      ORDER BY er.created_at DESC
      `,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });

  } catch (error) {
    console.error(
      "Get received requests error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to get received requests",
    });
  }
};


// =========================
// GET SENT REQUESTS
// GET /api/requests/sent
// =========================
const getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const [requests] = await pool.query(
      `
      SELECT
        er.id,
        er.sender_id,
        er.receiver_id,

        er.sender_skill_id,
        er.receiver_skill_id,

        er.message,
        er.status,
        er.created_at,

        u.name AS receiver_name,
        u.email AS receiver_email,
        u.bio AS receiver_bio,
        u.profile_image AS receiver_profile_image,

        sender_skill.name AS sender_skill_name,
        receiver_skill.name AS receiver_skill_name

      FROM exchange_requests er

      JOIN users u
        ON er.receiver_id = u.id

      JOIN skills sender_skill
        ON er.sender_skill_id = sender_skill.id

      JOIN skills receiver_skill
        ON er.receiver_skill_id = receiver_skill.id

      WHERE er.sender_id = ?

      ORDER BY er.created_at DESC
      `,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });

  } catch (error) {
    console.error(
      "Get sent requests error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to get sent requests",
    });
  }
};


// =========================
// ACCEPT REQUEST
// PUT /api/requests/:id/accept
// =========================
const acceptRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.id;

    // Find request belonging to current receiver
    const [requests] = await pool.query(
      `
      SELECT *
      FROM exchange_requests
      WHERE id = ?
      AND receiver_id = ?
      `,
      [requestId, userId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const request = requests[0];

    // Check status
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          `Request has already been ${request.status}`,
      });
    }

    // Update request
    await pool.query(
      `
      UPDATE exchange_requests
      SET status = 'accepted'
      WHERE id = ?
      `,
      [requestId]
    );

    res.status(200).json({
      success: true,
      message: "Exchange request accepted",
    });

  } catch (error) {
    console.error(
      "Accept request error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to accept request",
    });
  }
};


// =========================
// REJECT REQUEST
// PUT /api/requests/:id/reject
// =========================
const rejectRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.id;

    // Make sure request belongs to current user
    const [requests] = await pool.query(
      `
      SELECT *
      FROM exchange_requests
      WHERE id = ?
      AND receiver_id = ?
      `,
      [requestId, userId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const request = requests[0];

    // Check status
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          `Request has already been ${request.status}`,
      });
    }

    // Update request
    await pool.query(
      `
      UPDATE exchange_requests
      SET status = 'rejected'
      WHERE id = ?
      `,
      [requestId]
    );

    res.status(200).json({
      success: true,
      message: "Exchange request rejected",
    });

  } catch (error) {
    console.error(
      "Reject request error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to reject request",
    });
  }
};


module.exports = {
  sendRequest,
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
};