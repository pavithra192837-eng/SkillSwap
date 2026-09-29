
const { pool } = require("../config/db");

// ========================================
// SEND REQUEST
// POST /api/requests
// ========================================
const sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;

    const {
      receiver_id,
      offered_skill_id,
      requested_skill_id,
      message,
    } = req.body;

    // ------------------------------------
    // Validate required fields
    // ------------------------------------
    if (
      !receiver_id ||
      !offered_skill_id ||
      !requested_skill_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Receiver ID, offered skill ID and requested skill ID are required",
      });
    }

    // ------------------------------------
    // Cannot send request to yourself
    // ------------------------------------
    if (
      Number(receiver_id) ===
      Number(senderId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot send a request to yourself",
      });
    }

    // ------------------------------------
    // Check receiver exists
    // ------------------------------------
    const [receivers] = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = ?
      `,
      [receiver_id]
    );

    if (receivers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // ------------------------------------
    // Check offered skill
    //
    // Sender must TEACH this skill
    // ------------------------------------
    const [offeredSkills] =
      await pool.query(
        `
        SELECT
          id,
          skill_id,
          type,
          level
        FROM user_skills
        WHERE user_id = ?
          AND skill_id = ?
          AND type = 'TEACH'
        `,
        [
          senderId,
          offered_skill_id,
        ]
      );

    if (offeredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "You do not teach the offered skill",
      });
    }

    // ------------------------------------
    // Check requested skill
    //
    // Receiver must TEACH this skill
    // ------------------------------------
    const [requestedSkills] =
      await pool.query(
        `
        SELECT
          id,
          skill_id,
          type,
          level
        FROM user_skills
        WHERE user_id = ?
          AND skill_id = ?
          AND type = 'TEACH'
        `,
        [
          receiver_id,
          requested_skill_id,
        ]
      );

    if (requestedSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Receiver does not teach the requested skill",
      });
    }

    // ------------------------------------
    // Check existing pending request
    // ------------------------------------
    const [existingRequests] =
      await pool.query(
        `
        SELECT id
        FROM exchange_requests
        WHERE sender_id = ?
          AND receiver_id = ?
          AND offered_skill_id = ?
          AND requested_skill_id = ?
          AND status = 'PENDING'
        `,
        [
          senderId,
          receiver_id,
          offered_skill_id,
          requested_skill_id,
        ]
      );

    if (existingRequests.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "A pending request already exists for these skills",
      });
    }

    // ------------------------------------
    // Create exchange request
    // ------------------------------------
    const [result] = await pool.query(
      `
      INSERT INTO exchange_requests
      (
        sender_id,
        receiver_id,
        offered_skill_id,
        requested_skill_id,
        message,
        status
      )
      VALUES (?, ?, ?, ?, ?, 'PENDING')
      `,
      [
        senderId,
        receiver_id,
        offered_skill_id,
        requested_skill_id,
        message || null,
      ]
    );

    // ------------------------------------
    // Create notification for receiver
    // ------------------------------------
    await pool.query(
      `
      INSERT INTO notifications
      (
        user_id,
        type,
        title,
        message,
        reference_id,
        is_read
      )
      VALUES (?, ?, ?, ?, ?, FALSE)
      `,
      [
        receiver_id,
        "EXCHANGE_REQUEST",
        "New exchange request",
        "You received a new skill exchange request.",
        result.insertId,
      ]
    );

    return res.status(201).json({
      success: true,
      message:
        "Exchange request sent successfully",

      request: {
        id: result.insertId,
        sender_id: senderId,
        receiver_id: Number(receiver_id),
        offered_skill_id:
          Number(offered_skill_id),
        requested_skill_id:
          Number(requested_skill_id),
        message: message || null,
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error(
      "Send request error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to send exchange request",
    });
  }
};

// ========================================
// GET INCOMING REQUESTS
// GET /api/requests/incoming
// ========================================
const getIncomingRequests = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const [requests] = await pool.query(
      `
      SELECT
        er.id,
        er.sender_id,
        er.receiver_id,

        er.offered_skill_id,
        er.requested_skill_id,

        er.message,
        er.status,
        er.created_at,
        er.updated_at,

        sender.name AS sender_name,
        sender.email AS sender_email,
        sender.phone AS sender_phone,
        sender.college AS sender_college,
        sender.roll_no AS sender_roll_no,
        sender.department AS sender_department,
        sender.bio AS sender_bio,
        sender.profile_image AS sender_profile_image,

        offered_skill.name AS offered_skill_name,
        requested_skill.name AS requested_skill_name

      FROM exchange_requests er

      INNER JOIN users sender
        ON er.sender_id = sender.id

      INNER JOIN skills offered_skill
        ON er.offered_skill_id =
           offered_skill.id

      INNER JOIN skills requested_skill
        ON er.requested_skill_id =
           requested_skill.id

      WHERE er.receiver_id = ?

      ORDER BY er.created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(
      "Get incoming requests error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get incoming requests",
    });
  }
};

// ========================================
// GET OUTGOING REQUESTS
// GET /api/requests/outgoing
// ========================================
const getOutgoingRequests = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const [requests] = await pool.query(
      `
      SELECT
        er.id,
        er.sender_id,
        er.receiver_id,

        er.offered_skill_id,
        er.requested_skill_id,

        er.message,
        er.status,
        er.created_at,
        er.updated_at,

        receiver.name AS receiver_name,
        receiver.email AS receiver_email,
        receiver.phone AS receiver_phone,
        receiver.college AS receiver_college,
        receiver.roll_no AS receiver_roll_no,
        receiver.department AS receiver_department,
        receiver.bio AS receiver_bio,
        receiver.profile_image AS receiver_profile_image,

        offered_skill.name AS offered_skill_name,
        requested_skill.name AS requested_skill_name

      FROM exchange_requests er

      INNER JOIN users receiver
        ON er.receiver_id = receiver.id

      INNER JOIN skills offered_skill
        ON er.offered_skill_id =
           offered_skill.id

      INNER JOIN skills requested_skill
        ON er.requested_skill_id =
           requested_skill.id

      WHERE er.sender_id = ?

      ORDER BY er.created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(
      "Get outgoing requests error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get outgoing requests",
    });
  }
};

// ========================================
// GET REQUEST BY ID
// GET /api/requests/:id
// ========================================
const getRequestById = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.id;

    const [requests] = await pool.query(
      `
      SELECT
        er.id,
        er.sender_id,
        er.receiver_id,

        er.offered_skill_id,
        er.requested_skill_id,

        er.message,
        er.status,
        er.created_at,
        er.updated_at,

        sender.name AS sender_name,
        sender.email AS sender_email,
        sender.roll_no AS sender_roll_no,

        receiver.name AS receiver_name,
        receiver.email AS receiver_email,
        receiver.roll_no AS receiver_roll_no,

        offered_skill.name AS offered_skill_name,
        requested_skill.name AS requested_skill_name

      FROM exchange_requests er

      INNER JOIN users sender
        ON er.sender_id = sender.id

      INNER JOIN users receiver
        ON er.receiver_id = receiver.id

      INNER JOIN skills offered_skill
        ON er.offered_skill_id =
           offered_skill.id

      INNER JOIN skills requested_skill
        ON er.requested_skill_id =
           requested_skill.id

      WHERE er.id = ?
        AND (
          er.sender_id = ?
          OR er.receiver_id = ?
        )
      `,
      [
        requestId,
        userId,
        userId,
      ]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    return res.status(200).json({
      success: true,
      request: requests[0],
    });
  } catch (error) {
    console.error(
      "Get request error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get request",
    });
  }
};

// ========================================
// ACCEPT REQUEST
// PUT /api/requests/:id/accept
// ========================================
const acceptRequest = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.id;

    // ------------------------------------
    // Find request for receiver
    // ------------------------------------
    const [requests] =
      await pool.query(
        `
        SELECT *
        FROM exchange_requests
        WHERE id = ?
          AND receiver_id = ?
        `,
        [
          requestId,
          userId,
        ]
      );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const request = requests[0];

    // ------------------------------------
    // Check current status
    // ------------------------------------
    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          `Request has already been ${request.status}`,
      });
    }

    // ------------------------------------
    // Accept request
    // ------------------------------------
    await pool.query(
      `
      UPDATE exchange_requests
      SET status = 'ACCEPTED'
      WHERE id = ?
      `,
      [requestId]
    );

    // ------------------------------------
    // Notify sender
    // ------------------------------------
    await pool.query(
      `
      INSERT INTO notifications
      (
        user_id,
        type,
        title,
        message,
        reference_id,
        is_read
      )
      VALUES (?, ?, ?, ?, ?, FALSE)
      `,
      [
        request.sender_id,
        "REQUEST_ACCEPTED",
        "Exchange request accepted",
        "Your skill exchange request has been accepted.",
        requestId,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Exchange request accepted",
    });
  } catch (error) {
    console.error(
      "Accept request error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to accept request",
    });
  }
};

// ========================================
// REJECT REQUEST
// PUT /api/requests/:id/reject
// ========================================
const rejectRequest = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.id;

    // ------------------------------------
    // Find request for receiver
    // ------------------------------------
    const [requests] =
      await pool.query(
        `
        SELECT *
        FROM exchange_requests
        WHERE id = ?
          AND receiver_id = ?
        `,
        [
          requestId,
          userId,
        ]
      );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const request = requests[0];

    // ------------------------------------
    // Check current status
    // ------------------------------------
    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          `Request has already been ${request.status}`,
      });
    }

    // ------------------------------------
    // Reject request
    // ------------------------------------
    await pool.query(
      `
      UPDATE exchange_requests
      SET status = 'REJECTED'
      WHERE id = ?
      `,
      [requestId]
    );

    // ------------------------------------
    // Notify sender
    // ------------------------------------
    await pool.query(
      `
      INSERT INTO notifications
      (
        user_id,
        type,
        title,
        message,
        reference_id,
        is_read
      )
      VALUES (?, ?, ?, ?, ?, FALSE)
      `,
      [
        request.sender_id,
        "REQUEST_REJECTED",
        "Exchange request rejected",
        "Your skill exchange request has been rejected.",
        requestId,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Exchange request rejected",
    });
  } catch (error) {
    console.error(
      "Reject request error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reject request",
    });
  }
};

// ========================================
// CANCEL REQUEST
// DELETE /api/requests/:id
// ========================================
const cancelRequest = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.id;

    // ------------------------------------
    // Sender can cancel their request
    // ------------------------------------
    const [requests] =
      await pool.query(
        `
        SELECT *
        FROM exchange_requests
        WHERE id = ?
          AND sender_id = ?
        `,
        [
          requestId,
          userId,
        ]
      );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const request = requests[0];

    // ------------------------------------
    // Only pending requests can cancel
    // ------------------------------------
    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          `Cannot cancel a ${request.status.toLowerCase()} request`,
      });
    }

    // ------------------------------------
    // Cancel request
    // ------------------------------------
    await pool.query(
      `
      UPDATE exchange_requests
      SET status = 'CANCELLED'
      WHERE id = ?
      `,
      [requestId]
    );

    // ------------------------------------
    // Notify receiver
    // ------------------------------------
    await pool.query(
      `
      INSERT INTO notifications
      (
        user_id,
        type,
        title,
        message,
        reference_id,
        is_read
      )
      VALUES (?, ?, ?, ?, ?, FALSE)
      `,
      [
        request.receiver_id,
        "REQUEST_CANCELLED",
        "Exchange request cancelled",
        "An exchange request has been cancelled.",
        requestId,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Exchange request cancelled",
    });
  } catch (error) {
    console.error(
      "Cancel request error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel request",
    });
  }
};

module.exports = {
  sendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getRequestById,
  acceptRequest,
  rejectRequest,
  cancelRequest,
};

