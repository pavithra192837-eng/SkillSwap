
const { pool } = require("../config/db");

// ========================================
// CREATE SESSION
// POST /api/sessions
// ========================================
const createSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      request_id,
      scheduled_at,
      duration_minutes = 60,
      meeting_id,
      lesson_type = 'LEARNING',
    } = req.body;

    // ------------------------------------
    // Validate required fields
    // ------------------------------------
    const duration = Number(duration_minutes);
    const allowedDurations = [30, 45, 60, 90];
    const normalizedLessonType = String(lesson_type || '').toUpperCase();
    if (!['LEARNING','TEACHING'].includes(normalizedLessonType)) return res.status(400).json({ success:false, message:'Choose whether this lesson is for learning or teaching.' });
    if (!request_id || !scheduled_at) {
      return res.status(400).json({
        success: false,
        message:
          "Request ID and scheduled time are required",
      });
    }
    if (!allowedDurations.includes(duration)) {
      return res.status(400).json({
        success: false,
        message: "Duration must be 30, 45, 60, or 90 minutes.",
      });
    }

    // ------------------------------------
    // Get accepted request
    // ------------------------------------
    const [requests] = await pool.query(
      `
      SELECT
        id,
        sender_id,
        receiver_id,
        offered_skill_id,
        requested_skill_id,
        status
      FROM exchange_requests
      WHERE id = ?
        AND status = 'ACCEPTED'
      `,
      [request_id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Accepted exchange request not found",
      });
    }

    const request = requests[0];

    // ------------------------------------
    // Check user belongs to request
    // ------------------------------------
    if (
      Number(request.sender_id) !==
        Number(userId) &&
      Number(request.receiver_id) !==
        Number(userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not part of this exchange request",
      });
    }

    // Learning and teaching are separate lesson slots. Learn 1 + Teach 1 = 2 lessons.
    const [planRows] = await pool.query(`SELECT planned_learning_sessions, planned_teaching_sessions FROM exchange_requests WHERE id = ? LIMIT 1`, [request_id]);
    const plannedLearning = Number(planRows[0]?.planned_learning_sessions || 0);
    const plannedTeaching = Number(planRows[0]?.planned_teaching_sessions || 0);
    const [requestRows] = await pool.query(`SELECT id FROM exchange_requests WHERE ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)) AND ((offered_skill_id=? AND requested_skill_id=?) OR (offered_skill_id=? AND requested_skill_id=?)) AND status='ACCEPTED'`, [request.sender_id, request.receiver_id, request.receiver_id, request.sender_id, request.offered_skill_id, request.requested_skill_id, request.requested_skill_id, request.offered_skill_id]);
    const exchangeRequestIds = requestRows.map(r => Number(r.id));
    const placeholders = exchangeRequestIds.map(() => '?').join(',');
    const [countRows] = await pool.query(`SELECT lesson_type, COUNT(*) AS used_count FROM sessions WHERE request_id IN (${placeholders}) AND status IN ('SCHEDULED','ONGOING','COMPLETED') GROUP BY lesson_type`, exchangeRequestIds);
    const usedLearning = Number(countRows.find(r => r.lesson_type === 'LEARNING')?.used_count || 0);
    const usedTeaching = Number(countRows.find(r => r.lesson_type === 'TEACHING')?.used_count || 0);
    const oldBoth = Number(countRows.find(r => r.lesson_type === 'BOTH')?.used_count || 0);
    const limit = normalizedLessonType === 'LEARNING' ? plannedLearning : plannedTeaching;
    const used = normalizedLessonType === 'LEARNING' ? usedLearning + oldBoth : usedTeaching + oldBoth;
    if (limit > 0 && used >= limit) return res.status(409).json({ success:false, message:`All ${limit} planned ${normalizedLessonType.toLowerCase()} lessons are already scheduled or completed.` });

    // ------------------------------------
    // Create session
    // ------------------------------------
    const user1Id = request.sender_id;
    const user2Id = request.receiver_id;
    const learnerId = normalizedLessonType === 'LEARNING' ? Number(userId) : (Number(request.sender_id) === Number(userId) ? Number(request.receiver_id) : Number(request.sender_id));
    const teacherId = normalizedLessonType === 'LEARNING' ? (Number(request.sender_id) === Number(userId) ? Number(request.receiver_id) : Number(request.sender_id)) : Number(userId);
    const skillId = normalizedLessonType === 'LEARNING' ? (Number(userId) === Number(request.sender_id) ? request.requested_skill_id : request.offered_skill_id) : (Number(userId) === Number(request.sender_id) ? request.offered_skill_id : request.requested_skill_id);

    const [numberRows] = await pool.query(
      `SELECT COALESCE(MAX(session_number), 0) + 1 AS next_number FROM sessions WHERE request_id = ?`,
      [request_id]
    );
    const sessionNumber = Number(numberRows[0]?.next_number || 1);
    const [result] = await pool.query(
      `
      INSERT INTO sessions
      (request_id,user1_id,user2_id,scheduled_at,duration_minutes,session_number,schedule_note,status,meeting_id,lesson_type,learner_id,teacher_id,skill_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'SCHEDULED', ?, ?, ?, ?, ?)
      `,
      [request_id,user1Id,user2Id,scheduled_at,duration,sessionNumber,req.body?.schedule_note || null,meeting_id || null,normalizedLessonType,learnerId,teacherId,skillId]
    );

    // Each exchange creates two learning directions:
    // receiver learns the sender's offered skill;
    // sender learns the receiver's requested skill.
    await pool.query(
      `
      INSERT INTO learning_progress
      (session_id, learner_id, teacher_id, skill_id, status)
      VALUES
      (?, ?, ?, ?, 'IN_PROGRESS'),
      (?, ?, ?, ?, 'IN_PROGRESS')
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
      `,
      [
        result.insertId, request.receiver_id, request.sender_id, request.offered_skill_id,
        result.insertId, request.sender_id, request.receiver_id, request.requested_skill_id,
      ]
    );

    // ------------------------------------
    // Notify both users
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
      VALUES
      (?, 'SESSION_CREATED', ?, ?, ?, FALSE),
      (?, 'SESSION_CREATED', ?, ?, ?, FALSE)
      `,
      [
        user1Id,
        "Session scheduled",
        "A new skill exchange session has been scheduled.",
        result.insertId,

        user2Id,
        "Session scheduled",
        "A new skill exchange session has been scheduled.",
        result.insertId,
      ]
    );

    return res.status(201).json({
      success: true,
      message:
        "Session created successfully",

      session: {
        id: result.insertId,
        request_id: Number(request_id),
        user1_id: user1Id,
        user2_id: user2Id,
        scheduled_at,
        duration_minutes: duration,
        session_number: sessionNumber,
        started_at: null,
        ended_at: null,
        status: "SCHEDULED",
        meeting_id: meeting_id || null,
        lesson_type: normalizedLessonType,
        learner_id: learnerId,
        teacher_id: teacherId,
        skill_id: skillId,
      },
    });
  } catch (error) {
    console.error(
      "Create session error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create session",
    });
  }
};

// ========================================
// GET MY SESSIONS
// GET /api/sessions
// ========================================
const getSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const [sessions] = await pool.query(
      `
      SELECT
        s.id,
        s.request_id,
        s.user1_id,
        s.user2_id,
        s.scheduled_at,
        s.duration_minutes,
        s.session_number,
        s.lesson_type,
        s.learner_id,
        s.teacher_id,
        s.rescheduled_from_id,
        s.schedule_note,
        s.started_at,
        s.ended_at,
        s.ended_by,
        s.end_reason,
        s.status,
        s.meeting_id,
        s.created_at,
        s.updated_at,

        (SELECT rating FROM ratings WHERE session_id = s.id AND reviewer_id = ? LIMIT 1) AS my_rating,
        CASE WHEN EXISTS (SELECT 1 FROM ratings WHERE session_id = s.id AND reviewer_id = ?) THEN 1 ELSE 0 END AS rated_by_me,
        offered_skill.name AS offered_skill_name,
        requested_skill.name AS requested_skill_name,
        lesson_skill.name AS lesson_skill_name,
        learner.name AS learner_name,
        teacher.name AS teacher_name,

        user1.name AS user1_name,
        user1.roll_no AS user1_roll_no,

        user2.name AS user2_name,
        user2.roll_no AS user2_roll_no

      FROM sessions s

      INNER JOIN users user1
        ON s.user1_id = user1.id

      INNER JOIN users user2
        ON s.user2_id = user2.id

      INNER JOIN exchange_requests er
        ON s.request_id = er.id
      INNER JOIN skills offered_skill
        ON er.offered_skill_id = offered_skill.id
      INNER JOIN skills requested_skill
        ON er.requested_skill_id = requested_skill.id
      LEFT JOIN skills lesson_skill ON lesson_skill.id = s.skill_id
      LEFT JOIN users learner ON learner.id = s.learner_id
      LEFT JOIN users teacher ON teacher.id = s.teacher_id

      WHERE
        s.user1_id = ?
        OR s.user2_id = ?

      ORDER BY s.scheduled_at DESC
      `,
      [userId, userId, userId, userId]
    );

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error(
      "Get sessions error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get sessions",
    });
  }
};

// ========================================
// GET SESSION BY ID
// GET /api/sessions/:id
// ========================================
const getSessionById = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const [sessions] = await pool.query(
      `
      SELECT
        s.id,
        s.request_id,
        s.user1_id,
        s.user2_id,
        s.scheduled_at,
        s.duration_minutes,
        s.started_at,
        s.ended_at,
        s.ended_by,
        s.end_reason,
        s.status,
        s.meeting_id,
        s.created_at,
        s.updated_at,

        user1.name AS user1_name,
        user1.roll_no AS user1_roll_no,

        user2.name AS user2_name,
        user2.roll_no AS user2_roll_no

      FROM sessions s

      INNER JOIN users user1
        ON s.user1_id = user1.id

      INNER JOIN users user2
        ON s.user2_id = user2.id

      WHERE s.id = ?
        AND (
          s.user1_id = ?
          OR s.user2_id = ?
        )
      `,
      [
        sessionId,
        userId,
        userId,
      ]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    return res.status(200).json({
      success: true,
      session: sessions[0],
    });
  } catch (error) {
    console.error(
      "Get session error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get session",
    });
  }
};

// ========================================
// UPDATE SESSION
// PUT /api/sessions/:id
// ========================================
const updateSession = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const {
      scheduled_at,
      duration_minutes,
      meeting_id,
      lesson_type = 'LEARNING',
    } = req.body;

    // ------------------------------------
    // Check session ownership
    // ------------------------------------
    const [sessions] = await pool.query(
      `
      SELECT *
      FROM sessions
      WHERE id = ?
        AND (
          user1_id = ?
          OR user2_id = ?
        )
      `,
      [
        sessionId,
        userId,
        userId,
      ]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const updates = [];
    const values = [];

    // ------------------------------------
    // Update scheduled time
    // ------------------------------------
    if (
      scheduled_at !== undefined
    ) {
      updates.push(
        "scheduled_at = ?"
      );
      values.push(scheduled_at);
    }

    // ------------------------------------
    // Update duration
    // ------------------------------------
    if (duration_minutes !== undefined) {
      const duration = Number(duration_minutes);
      if (![30, 45, 60, 90].includes(duration)) {
        return res.status(400).json({ success: false, message: "Duration must be 30, 45, 60, or 90 minutes." });
      }
      updates.push("duration_minutes = ?");
      values.push(duration);
    }

    // ------------------------------------
    // Update meeting ID
    // ------------------------------------
    if (
      meeting_id !== undefined
    ) {
      updates.push(
        "meeting_id = ?"
      );
      values.push(
        meeting_id || null
      );
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No valid fields to update",
      });
    }

    values.push(sessionId);

    await pool.query(
      `
      UPDATE sessions
      SET ${updates.join(", ")}
      WHERE id = ?
      `,
      values
    );

    return res.status(200).json({
      success: true,
      message:
        "Session updated successfully",
    });
  } catch (error) {
    console.error(
      "Update session error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update session",
    });
  }
};

// ========================================
// START SESSION
// PUT /api/sessions/:id/start
// ========================================
const startSession = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const [sessions] = await pool.query(
      `
      SELECT *
      FROM sessions
      WHERE id = ?
        AND (
          user1_id = ?
          OR user2_id = ?
        )
      `,
      [
        sessionId,
        userId,
        userId,
      ]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const session = sessions[0];

    const startAt = new Date(session.scheduled_at).getTime();
    const endAt = startAt + Number(session.duration_minutes || 60) * 60 * 1000;
    const now = Date.now();
    if (now < startAt) {
      return res.status(409).json({ success:false, message:`This lesson starts at ${new Date(session.scheduled_at).toLocaleString()}. You can join when the scheduled time begins.` });
    }
    if (now >= endAt) {
      await pool.query(`UPDATE sessions SET status='COMPLETED', ended_at=COALESCE(ended_at,NOW()), end_reason=COALESCE(end_reason,'TIME_EXPIRED') WHERE id=? AND status='SCHEDULED'`, [sessionId]);
      return res.status(409).json({ success:false, message:'This lesson window has ended. Use Sessions to schedule another lesson.' });
    }

    if (session.status === "ONGOING") {
      return res.status(400).json({
        success: false,
        message:
          "Session is already ongoing",
      });
    }

    if (session.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message:
          "Completed sessions cannot be started",
      });
    }

    if (session.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled sessions cannot be started",
      });
    }

    await pool.query(
      `
      UPDATE sessions
      SET status = 'ONGOING', started_at = COALESCE(started_at, NOW()), ended_at = NULL, ended_by = NULL, end_reason = NULL
      WHERE id = ?
      `,
      [sessionId]
    );

    return res.status(200).json({
      success: true,
      message:
        "Session started successfully",
    });
  } catch (error) {
    console.error(
      "Start session error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to start session",
    });
  }
};

// ========================================
// COMPLETE SESSION
// PUT /api/sessions/:id/complete
// ========================================
const completeSession = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const [sessions] = await pool.query(
      `
      SELECT *
      FROM sessions
      WHERE id = ?
        AND (
          user1_id = ?
          OR user2_id = ?
        )
      `,
      [
        sessionId,
        userId,
        userId,
      ]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const session = sessions[0];

    if (session.status === "COMPLETED") {
      return res.status(200).json({
        success: true,
        alreadyCompleted: true,
        message: "Session is already completed",
      });
    }

    if (session.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled sessions cannot be completed",
      });
    }

    const endReason = String(req.body?.reason || 'COMPLETED').slice(0, 50);
    await pool.query(
      `
      UPDATE sessions
      SET status = 'COMPLETED', ended_at = NOW(), ended_by = ?, end_reason = ?
      WHERE id = ?
      `,
      [userId, endReason, sessionId]
    );

    // A completed session completes both learning directions.
    await pool.query(
      `
      UPDATE learning_progress
      SET status = 'COMPLETED', completed_at = COALESCE(completed_at, NOW())
      WHERE session_id = ? AND status = 'IN_PROGRESS'
      `,
      [sessionId]
    );

    // When every planned learning lesson for an exchange is completed,
    // automatically promote each learner's exchanged skill into LEARN.
    // This removes the manual 'add to profile' step while keeping the
    // skill level editable later from Skill Setup.
    const [learningPlans] = await pool.query(`
      SELECT er.planned_learning_sessions,
             lp.learner_id, lp.skill_id,
             COUNT(DISTINCT CASE WHEN s.status='COMPLETED' THEN s.id END) AS completed_lessons
      FROM exchange_requests er
      JOIN sessions s ON s.request_id = er.id
      JOIN learning_progress lp ON lp.session_id = s.id
      WHERE er.id = ?
      GROUP BY er.planned_learning_sessions, lp.learner_id, lp.skill_id
    `, [session.request_id]);
    for (const plan of learningPlans) {
      if (Number(plan.completed_lessons) < Number(plan.planned_learning_sessions)) continue;
      const [existingPurpose] = await pool.query(
        `SELECT id, type FROM user_skills WHERE user_id=? AND skill_id=? LIMIT 1`,
        [plan.learner_id, plan.skill_id]
      );
      if (!existingPurpose.length) {
        await pool.query(`
          INSERT INTO user_skills (user_id, skill_id, type, level)
          VALUES (?, ?, 'LEARN', 'BEGINNER')
        `, [plan.learner_id, plan.skill_id]);
      } else if (existingPurpose[0].type === 'TEACH') {
        // Preserve the single-purpose rule. The user can decide later whether
        // to change the skill purpose in Skill Setup.
        continue;
      }
      await pool.query(`
        UPDATE learning_progress lp
        JOIN sessions s ON s.id=lp.session_id
        SET lp.status='ADDED_TO_PROFILE', lp.added_to_profile_at=COALESCE(lp.added_to_profile_at,NOW())
        WHERE s.request_id=? AND lp.learner_id=? AND lp.skill_id=? AND s.status='COMPLETED'
      `, [session.request_id, plan.learner_id, plan.skill_id]);
      await pool.query(`
        INSERT INTO notifications (user_id,type,title,message,reference_id,is_read)
        VALUES (?, 'SKILL_LEARNED', ?, ?, ?, FALSE)
      `, [plan.learner_id, 'Skill added to your profile', 'You completed all planned lessons for this exchange. Your learned skill is now on your profile.', plan.skill_id]);
    }

    // ------------------------------------
    // Notify both participants
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
      VALUES
      (?, 'SESSION_COMPLETED', ?, ?, ?, FALSE),
      (?, 'SESSION_COMPLETED', ?, ?, ?, FALSE)
      `,
      [
        session.user1_id,
        "Session completed",
        "Your skill exchange session has been completed.",
        sessionId,

        session.user2_id,
        "Session completed",
        "Your skill exchange session has been completed.",
        sessionId,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Session completed successfully",
    });
  } catch (error) {
    console.error(
      "Complete session error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to complete session",
    });
  }
};

// ========================================
// CANCEL / DELETE SESSION
// DELETE /api/sessions/:id
// ========================================
const deleteSession = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const [sessions] = await pool.query(
      `
      SELECT *
      FROM sessions
      WHERE id = ?
        AND (
          user1_id = ?
          OR user2_id = ?
        )
      `,
      [
        sessionId,
        userId,
        userId,
      ]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const session = sessions[0];

    if (session.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message:
          "Completed sessions cannot be cancelled",
      });
    }

    if (session.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message:
          "Session is already cancelled",
      });
    }

    // ------------------------------------
    // Mark as cancelled
    // ------------------------------------
    await pool.query(
      `
      UPDATE sessions
      SET status = 'CANCELLED'
      WHERE id = ?
      `,
      [sessionId]
    );

    // ------------------------------------
    // Notify both participants
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
      VALUES
      (?, 'SESSION_CANCELLED', ?, ?, ?, FALSE),
      (?, 'SESSION_CANCELLED', ?, ?, ?, FALSE)
      `,
      [
        session.user1_id,
        "Session cancelled",
        "Your skill exchange session has been cancelled.",
        sessionId,

        session.user2_id,
        "Session cancelled",
        "Your skill exchange session has been cancelled.",
        sessionId,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Session cancelled successfully",
    });
  } catch (error) {
    console.error(
      "Delete session error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel session",
    });
  }
};


// ========================================
// GET ACTIVE EXCHANGE LESSON PLANS
// GET /api/sessions/planning
// ========================================
const getPlanning = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`SELECT er.id AS request_id, er.sender_id, er.receiver_id, er.offered_skill_id, er.requested_skill_id, er.planned_learning_sessions, er.planned_teaching_sessions, CASE WHEN er.sender_id=? THEN receiver.id ELSE sender.id END AS partner_id, CASE WHEN er.sender_id=? THEN receiver.name ELSE sender.name END AS partner_name, offered_skill.name AS offered_skill_name, requested_skill.name AS requested_skill_name, CASE WHEN er.offered_skill_id < er.requested_skill_id THEN er.offered_skill_id ELSE er.requested_skill_id END AS skill_low, CASE WHEN er.offered_skill_id < er.requested_skill_id THEN er.requested_skill_id ELSE er.offered_skill_id END AS skill_high, s.id AS session_id, s.lesson_type, s.status AS session_status, s.scheduled_at, s.learner_id, s.teacher_id, lesson_skill.name AS lesson_skill_name FROM exchange_requests er JOIN users sender ON sender.id=er.sender_id JOIN users receiver ON receiver.id=er.receiver_id JOIN skills offered_skill ON offered_skill.id=er.offered_skill_id JOIN skills requested_skill ON requested_skill.id=er.requested_skill_id LEFT JOIN sessions s ON s.request_id=er.id AND s.status IN ('SCHEDULED','ONGOING','COMPLETED') LEFT JOIN skills lesson_skill ON lesson_skill.id=s.skill_id WHERE (er.sender_id=? OR er.receiver_id=?) AND er.status='ACCEPTED' ORDER BY er.updated_at DESC, er.id DESC, s.scheduled_at ASC`,[userId,userId,userId,userId]);
    const groups=new Map();
    for(const row of rows){
      const key=`${row.partner_id}:${row.skill_low}:${row.skill_high}`; let x=groups.get(key);
      if(!x){ x={...row,completed_learning:0,completed_teaching:0,scheduled_learning:0,scheduled_teaching:0,source_request_ids:[],next_learning_at:null,next_teaching_at:null,lesson_rows:[]}; groups.set(key,x); }
      x.source_request_ids.push(Number(row.request_id));
      if(row.session_id){ const type=String(row.lesson_type||'BOTH').toUpperCase();
        if(row.session_status==='COMPLETED'){ if(type==='LEARNING'||type==='BOTH')x.completed_learning++; if(type==='TEACHING'||type==='BOTH')x.completed_teaching++; }
        else if(row.session_status==='SCHEDULED'||row.session_status==='ONGOING'){ if(type==='LEARNING'||type==='BOTH')x.scheduled_learning++; if(type==='TEACHING'||type==='BOTH')x.scheduled_teaching++; if(row.session_status==='SCHEDULED'){ if((type==='LEARNING'||type==='BOTH')&&(!x.next_learning_at||new Date(row.scheduled_at)<new Date(x.next_learning_at)))x.next_learning_at=row.scheduled_at; if((type==='TEACHING'||type==='BOTH')&&(!x.next_teaching_at||new Date(row.scheduled_at)<new Date(x.next_teaching_at)))x.next_teaching_at=row.scheduled_at; } }
        x.lesson_rows.push({id:Number(row.session_id),lesson_type:type,status:row.session_status,scheduled_at:row.scheduled_at,learner_id:row.learner_id,teacher_id:row.teacher_id,lesson_skill_name:row.lesson_skill_name});
      }
    }
    const exchanges=[...groups.values()].map(x=>({request_id:x.request_id,partner_id:x.partner_id,partner_name:x.partner_name,offered_skill_name:x.offered_skill_name,requested_skill_name:x.requested_skill_name,planned_learning_sessions:Number(x.planned_learning_sessions||0),planned_teaching_sessions:Number(x.planned_teaching_sessions||0),completed_learning:x.completed_learning,completed_teaching:x.completed_teaching,scheduled_learning:x.scheduled_learning,scheduled_teaching:x.scheduled_teaching,learning_remaining:Math.max(Number(x.planned_learning_sessions||0)-x.completed_learning-x.scheduled_learning,0),teaching_remaining:Math.max(Number(x.planned_teaching_sessions||0)-x.completed_teaching-x.scheduled_teaching,0),completed_sessions:Math.max(x.completed_learning,x.completed_teaching),scheduled_sessions:Math.max(x.scheduled_learning,x.scheduled_teaching),next_learning_at:x.next_learning_at,next_teaching_at:x.next_teaching_at,lesson_rows:x.lesson_rows,source_request_ids:x.source_request_ids}));
    return res.json({success:true,exchanges});
  } catch(error){ console.error('Planning error:',error.message); return res.status(500).json({success:false,message:'Failed to load lesson plans'}); }
};

// ========================================
// RESCHEDULE / ADD MAKE-UP LESSON
// POST /api/sessions/:id/reschedule
// ========================================
const rescheduleSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = Number(req.params.id);
    const { scheduled_at, duration_minutes = 60, schedule_note } = req.body || {};
    const duration = Number(duration_minutes);
    if (!scheduled_at) return res.status(400).json({success:false,message:'Choose a new date and time.'});
    if (![30,45,60,90].includes(duration)) return res.status(400).json({success:false,message:'Duration must be 30, 45, 60, or 90 minutes.'});
    const [rows] = await pool.query(`SELECT * FROM sessions WHERE id=? AND (user1_id=? OR user2_id=?) LIMIT 1`, [sessionId,userId,userId]);
    if (!rows.length) return res.status(404).json({success:false,message:'Session not found.'});
    const old = rows[0];
    if (['COMPLETED','CANCELLED'].includes(old.status)) return res.status(400).json({success:false,message:'This lesson cannot be moved.'});
    await pool.query(`UPDATE sessions SET status='CANCELLED',ended_at=NOW(),ended_by=?,end_reason='RESCHEDULED' WHERE id=?`, [userId,sessionId]);
    const [nextRows] = await pool.query(`SELECT COALESCE(MAX(session_number),0)+1 AS next_number FROM sessions WHERE request_id=?`, [old.request_id]);
    const nextNumber = Number(nextRows[0]?.next_number || 1);
    const [r] = await pool.query(`
      INSERT INTO sessions
      (request_id,user1_id,user2_id,scheduled_at,duration_minutes,session_number,rescheduled_from_id,schedule_note,status,meeting_id,lesson_type,learner_id,teacher_id,skill_id)
      VALUES(?,?,?,?,?,?,?,?, 'SCHEDULED',?,?,?,?,?)
    `, [old.request_id,old.user1_id,old.user2_id,scheduled_at,duration,nextNumber,sessionId,schedule_note||null,old.meeting_id||null,old.lesson_type||'BOTH',old.learner_id||null,old.teacher_id||null,old.skill_id||null]);
    await pool.query(`
      INSERT INTO notifications(user_id,type,title,message,reference_id,is_read)
      VALUES(?,?,?,?,?,FALSE),(?,?,?,?,?,FALSE)
    `, [old.user1_id,'SESSION_RESCHEDULED','Lesson rescheduled','A lesson was moved. Open Sessions to see the new time.',r.insertId,old.user2_id,'SESSION_RESCHEDULED','Lesson rescheduled','A lesson was moved. Open Sessions to see the new time.',r.insertId]);
    return res.status(201).json({success:true,message:'Lesson moved. The previous booking remains in history.',session_id:r.insertId});
  } catch(error) {
    console.error('Reschedule error:',error.message);
    return res.status(500).json({success:false,message:'Failed to reschedule lesson'});
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  startSession,
  completeSession,
  deleteSession,
  getPlanning,
  rescheduleSession,
};

