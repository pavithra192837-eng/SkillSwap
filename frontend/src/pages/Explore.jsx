import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Explore.css";

const skills = [
  {
    name: "React",
    description:
      "Learn modern React development and build interactive web applications.",
  },
  {
    name: "JavaScript",
    description:
      "Learn JavaScript fundamentals, ES6+, and practical programming.",
  },
  {
    name: "Python",
    description:
      "Learn Python programming, problem solving, and application development.",
  },
  {
    name: "Java",
    description:
      "Learn Java programming, object-oriented concepts, and backend development.",
  },
  {
    name: "UI/UX Design",
    description:
      "Learn user interface design, user experience, and design principles.",
  },
  {
    name: "Figma",
    description:
      "Learn how to create interfaces, prototypes, and design systems using Figma.",
  },
  {
    name: "MongoDB",
    description:
      "Learn NoSQL database concepts and MongoDB application development.",
  },
  {
    name: "C++",
    description:
      "Learn C++ programming, object-oriented programming, and problem solving.",
  },
];

function Explore() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(search.toLowerCase())
  );

  /* =========================
     FIND LEARNERS
  ========================= */

  const handleFindLearners = (skill) => {
    navigate(`/matches?skill=${encodeURIComponent(skill)}`);
  };

  return (
    <main className="explore-page">

      <div className="explore-container">

        {/* BACK TO DASHBOARD */}

        <button
          type="button"
          className="back-dashboard-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        {/* HEADER */}

        <div className="explore-header">

          <div>
            <p className="explore-label">
              DISCOVER
            </p>

            <h1>
              Explore Skills
            </h1>
          </div>

          <p className="explore-subtitle">
            Discover skills you want to learn and connect with people who can help you grow.
          </p>

        </div>

        {/* SEARCH */}

        <div className="explore-search-wrapper">

          <input
            type="text"
            className="explore-search"
            placeholder="Search for a skill..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        {/* SKILLS */}

        <div className="skills-grid">

          {filteredSkills.length > 0 ? (

            filteredSkills.map((skill) => (

              <article
                className="skill-card"
                key={skill.name}
              >

                <span className="skill-label">
                  SKILL
                </span>

                <h2>
                  {skill.name}
                </h2>

                <p>
                  {skill.description}
                </p>

                <button
                  type="button"
                  className="find-learners-button"
                  onClick={() =>
                    handleFindLearners(skill.name)
                  }
                >
                  Find Learners →
                </button>

              </article>

            ))

          ) : (

            <div className="no-skills">

              <h3>
                No skills found
              </h3>

              <p>
                Try searching for another skill.
              </p>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}

export default Explore;