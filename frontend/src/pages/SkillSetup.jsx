import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SkillSetup.css";

const skillOptions = [
  "C",
  "C++",
  "Java",
  "Python",
  "JavaScript",
  "React",
  "HTML",
  "CSS",
  "Node.js",
  "SQL",
  "MongoDB",
  "UI/UX Design",
  "Figma",
  "Data Structures",
  "Machine Learning",
  "Git & GitHub",
  "Flutter",
  "Android Development",
  "Communication",
  "Public Speaking",
];

function SkillSetup() {
  const navigate = useNavigate();

  const [learningSkills, setLearningSkills] = useState([]);
  const [teachingSkills, setTeachingSkills] = useState([]);

  const [customLearnSkill, setCustomLearnSkill] = useState("");
  const [customTeachSkill, setCustomTeachSkill] = useState("");

  const toggleLearningSkill = (skill) => {
    setLearningSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill]
    );
  };

  const toggleTeachingSkill = (skill) => {
    setTeachingSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill]
    );
  };

  const addCustomLearningSkill = () => {
    const skill = customLearnSkill.trim();

    if (!skill) return;

    if (!learningSkills.includes(skill)) {
      setLearningSkills((current) => [...current, skill]);
    }

    setCustomLearnSkill("");
  };

  const addCustomTeachingSkill = () => {
    const skill = customTeachSkill.trim();

    if (!skill) return;

    if (!teachingSkills.includes(skill)) {
      setTeachingSkills((current) => [...current, skill]);
    }

    setCustomTeachSkill("");
  };

  const handleContinue = (e) => {
    e.preventDefault();

    if (learningSkills.length === 0) {
      alert("Please select at least one skill you want to learn.");
      return;
    }

    if (teachingSkills.length === 0) {
      alert("Please select at least one skill you can teach.");
      return;
    }

    // Save temporarily for the frontend
    localStorage.setItem(
      "learningSkills",
      JSON.stringify(learningSkills)
    );

    localStorage.setItem(
      "teachingSkills",
      JSON.stringify(teachingSkills)
    );

    navigate("/dashboard");
  };

  return (
    <div className="skill-setup-page">

      <div className="skill-setup-container">

        {/* Header */}

        <div className="skill-setup-header">

          <div className="skill-setup-logo">
            Skill<span>Swap</span>
          </div>

          <div className="progress-text">
            <span>STEP 1 OF 1</span>
          </div>

          <h1>Let's personalize your SkillSwap experience.</h1>

          <p>
            Tell us what you want to learn and what you can teach.
            We'll use this information to find the right skill exchange
            partners for you.
          </p>

        </div>


        {/* Form */}

        <form
          className="skill-setup-form"
          onSubmit={handleContinue}
        >

          {/* Learn */}

          <section className="skill-section">

            <div className="skill-section-heading">

              <div className="skill-number learn-number">
                01
              </div>

              <div>
                <h2>What do you want to learn?</h2>

                <p>
                  Choose the skills you would like to learn from others.
                </p>
              </div>

            </div>


            <div className="skill-chips">

              {skillOptions.map((skill) => (
                <button
                  type="button"
                  key={`learn-${skill}`}
                  className={`skill-chip ${
                    learningSkills.includes(skill)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => toggleLearningSkill(skill)}
                >
                  {skill}

                  {learningSkills.includes(skill) && (
                    <span>✓</span>
                  )}
                </button>
              ))}

            </div>


            <div className="custom-skill">

              <input
                type="text"
                value={customLearnSkill}
                onChange={(e) =>
                  setCustomLearnSkill(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomLearningSkill();
                  }
                }}
                placeholder="Or enter another skill..."
              />

              <button
                type="button"
                onClick={addCustomLearningSkill}
              >
                Add
              </button>

            </div>

          </section>


          {/* Teach */}

          <section className="skill-section">

            <div className="skill-section-heading">

              <div className="skill-number teach-number">
                02
              </div>

              <div>
                <h2>What can you teach?</h2>

                <p>
                  Select the skills you are confident enough to share
                  with another learner.
                </p>
              </div>

            </div>


            <div className="skill-chips">

              {skillOptions.map((skill) => (
                <button
                  type="button"
                  key={`teach-${skill}`}
                  className={`skill-chip ${
                    teachingSkills.includes(skill)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => toggleTeachingSkill(skill)}
                >
                  {skill}

                  {teachingSkills.includes(skill) && (
                    <span>✓</span>
                  )}
                </button>
              ))}

            </div>


            <div className="custom-skill">

              <input
                type="text"
                value={customTeachSkill}
                onChange={(e) =>
                  setCustomTeachSkill(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTeachingSkill();
                  }
                }}
                placeholder="Or enter another skill..."
              />

              <button
                type="button"
                onClick={addCustomTeachingSkill}
              >
                Add
              </button>

            </div>

          </section>


          {/* Selected summary */}

          <div className="selected-summary">

            <div className="summary-item">

              <span className="summary-label">
                YOU WANT TO LEARN
              </span>

              <strong>
                {learningSkills.length}{" "}
                {learningSkills.length === 1
                  ? "skill"
                  : "skills"}
              </strong>

            </div>


            <div className="summary-divider"></div>


            <div className="summary-item">

              <span className="summary-label">
                YOU CAN TEACH
              </span>

              <strong>
                {teachingSkills.length}{" "}
                {teachingSkills.length === 1
                  ? "skill"
                  : "skills"}
              </strong>

            </div>

          </div>


          {/* Continue */}

          <button
            type="submit"
            className="continue-button"
          >
            Continue to SkillSwap
            <span>→</span>
          </button>

        </form>

      </div>

    </div>
  );
}

export default SkillSetup;