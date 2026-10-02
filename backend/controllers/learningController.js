const { pool } = require("../config/db");

const getMyLearningProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT
        lp.id,
        lp.session_id,
        lp.learner_id,
        lp.teacher_id,
        lp.skill_id,
        lp.status,
        lp.completed_at,
        lp.added_to_profile_at,
        lp.created_at,
        s.scheduled_at,
        s.status AS session_status,
        skill.name AS skill_name,
        skill.description AS skill_description,
        teacher.name AS teacher_name,
        teacher.department AS teacher_department,
        teacher.profile_image AS teacher_profile_image
      FROM learning_progress lp
      INNER JOIN sessions s ON s.id = lp.session_id
      INNER JOIN skills skill ON skill.id = lp.skill_id
      INNER JOIN users teacher ON teacher.id = lp.teacher_id
      WHERE lp.learner_id = ?
      ORDER BY lp.created_at DESC
    `, [userId]);
    res.json({ success: true, count: rows.length, progress: rows });
  } catch (error) {
    console.error("Learning progress error:", error.message);
    res.status(500).json({ success: false, message: "Failed to load learning progress" });
  }
};

const completeLearning = async (req, res) => {
  try {
    const userId = req.user.id;
    const progressId = req.params.id;
    const [rows] = await pool.query(`
      SELECT lp.*, s.status AS session_status, skill.name AS skill_name
      FROM learning_progress lp
      INNER JOIN sessions s ON s.id = lp.session_id
      INNER JOIN skills skill ON skill.id = lp.skill_id
      WHERE lp.id = ? AND lp.learner_id = ?
    `, [progressId, userId]);
    if (!rows.length) return res.status(404).json({ success:false, message:"Learning item not found" });
    const item = rows[0];
    if (item.session_status !== 'COMPLETED') {
      return res.status(409).json({ success:false, message:"Complete the exchange session before confirming this skill" });
    }
    if (item.status === 'ADDED_TO_PROFILE') return res.status(409).json({ success:false, message:"Skill is already on your profile" });
    await pool.query(`UPDATE learning_progress SET status='COMPLETED', completed_at=NOW() WHERE id=?`, [progressId]);
    await pool.query(`INSERT INTO notifications (user_id,type,title,message,reference_id,is_read) VALUES (?, 'LEARNING_COMPLETED', ?, ?, ?, FALSE)`, [
      userId, 'Learning completed', `You confirmed that you completed learning ${item.skill_name}.`, Number(progressId)
    ]);
    res.json({ success:true, message:"Learning marked as completed", progressId:Number(progressId) });
  } catch (error) {
    console.error("Complete learning error:", error.message);
    res.status(500).json({ success:false, message:"Failed to complete learning" });
  }
};

const addCompletedSkillToProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const progressId = req.params.id;
    const level = req.body.level || 'BEGINNER';
    const normalizedLevel = level === 'PROFICIENT' ? 'ADVANCED' : level;
    if (!['BEGINNER','INTERMEDIATE','ADVANCED'].includes(normalizedLevel)) {
      return res.status(400).json({ success:false, message:"Level must be BEGINNER, INTERMEDIATE or PROFICIENT" });
    }
    const [rows] = await pool.query(`
      SELECT lp.*, skill.name AS skill_name
      FROM learning_progress lp
      INNER JOIN skills skill ON skill.id = lp.skill_id
      WHERE lp.id=? AND lp.learner_id=?
    `, [progressId, userId]);
    if (!rows.length) return res.status(404).json({ success:false, message:"Learning item not found" });
    const item = rows[0];
    if (!['COMPLETED','ADDED_TO_PROFILE'].includes(item.status)) return res.status(409).json({ success:false, message:"Confirm learning completion first" });
    await pool.query(`
      INSERT INTO user_skills (user_id, skill_id, type, level) VALUES (?, ?, 'LEARN', ?)
      ON DUPLICATE KEY UPDATE level=VALUES(level)
    `, [userId, item.skill_id, normalizedLevel]);
    await pool.query(`UPDATE learning_progress SET status='ADDED_TO_PROFILE', added_to_profile_at=NOW() WHERE id=?`, [progressId]);
    res.json({ success:true, message:`${item.skill_name} added to your profile`, skill:{ skill_id:item.skill_id, name:item.skill_name, type:'LEARN', level: level === 'PROFICIENT' ? 'PROFICIENT' : level } });
  } catch (error) {
    console.error("Add learned skill error:", error.message);
    res.status(500).json({ success:false, message:"Failed to add skill to profile" });
  }
};

module.exports = { getMyLearningProgress, completeLearning, addCompletedSkillToProfile };
