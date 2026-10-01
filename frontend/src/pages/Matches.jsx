import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./Matches.css";

/* =========================
   SAMPLE USERS
========================= */

const users = [
  {
    id: 1,
    name: "Arun Kumar",
    initials: "AK",
    department: "CSE",
    skillsToTeach: ["React", "JavaScript", "HTML"],
    skillsToLearn: ["Python"],
    rating: "4.8",
    exchanges: 14,
  },

  {
    id: 2,
    name: "Priya S",
    initials: "PS",
    department: "ECE",
    skillsToTeach: ["Python", "Java"],
    skillsToLearn: ["React", "Figma"],
    rating: "4.7",
    exchanges: 9,
  },

  {
    id: 3,
    name: "Vignesh R",
    initials: "VR",
    department: "IT",
    skillsToTeach: ["React", "MongoDB"],
    skillsToLearn: ["JavaScript"],
    rating: "4.9",
    exchanges: 18,
  },

  {
    id: 4,
    name: "Divya M",
    initials: "DM",
    department: "CSE",
    skillsToTeach: ["UI/UX Design", "Figma"],
    skillsToLearn: ["React"],
    rating: "4.6",
    exchanges: 7,
  },

  {
    id: 5,
    name: "Karthik S",
    initials: "KS",
    department: "ECE",
    skillsToTeach: ["Java", "C++"],
    skillsToLearn: ["React"],
    rating: "4.8",
    exchanges: 11,
  },

  {
    id: 6,
    name: "Harini P",
    initials: "HP",
    department: "AI & DS",
    skillsToTeach: ["Python", "MongoDB"],
    skillsToLearn: ["JavaScript"],
    rating: "4.9",
    exchanges: 15,
  },
];


function Matches() {

  const [searchParams] = useSearchParams();

  const selectedSkill =
    searchParams.get("skill") || "";


  /* =========================
     FILTER USERS
  ========================= */

  const matchedUsers = useMemo(() => {

    if (!selectedSkill) {
      return [];
    }

    return users.filter((user) =>
      user.skillsToTeach.some(
        (skill) =>
          skill.toLowerCase() ===
          selectedSkill.toLowerCase()
      )
    );

  }, [selectedSkill]);


  return (
    <main className="matches-page">

      <div className="matches-container">

        {/* HEADER */}

        <div className="matches-header">

          <Link
            to="/explore"
            className="matches-back"
          >
            ← Back to Explore
          </Link>

          <p className="matches-label">
            SKILL MATCHES
          </p>

          <h1>
            Learners for {selectedSkill}
          </h1>

          <p className="matches-subtitle">
            Connect with people who can teach you{" "}
            <strong>{selectedSkill}</strong>.
          </p>

        </div>


        {/* MATCH RESULTS */}

        {matchedUsers.length > 0 ? (

          <div className="matches-grid">

            {matchedUsers.map((user) => (

              <article
                className="match-card"
                key={user.id}
              >

                {/* USER HEADER */}

                <div className="match-user-header">

                  <div className="match-avatar">
                    {user.initials}
                  </div>

                  <div>

                    <h2>
                      {user.name}
                    </h2>

                    <p>
                      {user.department}
                    </p>

                  </div>

                </div>


                {/* SKILLS */}

                <div className="match-section">

                  <span className="match-section-label">
                    CAN TEACH
                  </span>

                  <div className="match-skills">

                    {user.skillsToTeach.map(
                      (skill) => (

                        <span
                          key={skill}
                          className={
                            skill.toLowerCase() ===
                            selectedSkill.toLowerCase()
                              ? "match-skill highlighted"
                              : "match-skill"
                          }
                        >
                          {skill}
                        </span>

                      )
                    )}

                  </div>

                </div>


                {/* LEARNING */}

                <div className="match-section">

                  <span className="match-section-label">
                    WANTS TO LEARN
                  </span>

                  <div className="match-skills">

                    {user.skillsToLearn.map(
                      (skill) => (

                        <span
                          key={skill}
                          className="match-skill learn"
                        >
                          {skill}
                        </span>

                      )
                    )}

                  </div>

                </div>


                {/* STATS */}

                <div className="match-stats">

                  <div>
                    <span>Rating</span>
                    <strong>
                      {user.rating}
                    </strong>
                  </div>

                  <div>
                    <span>Exchanges</span>
                    <strong>
                      {user.exchanges}
                    </strong>
                  </div>

                </div>


                {/* ACTION */}

                <button
                  type="button"
                  className="connect-button"
                >
                  Connect
                </button>

              </article>

            ))}

          </div>

        ) : (

          <div className="no-matches">

            <div className="no-matches-icon">
              🔍
            </div>

            <h2>
              No matches found
            </h2>

            <p>
              We couldn't find anyone who can teach{" "}
              <strong>{selectedSkill}</strong> yet.
            </p>

            <Link
              to="/explore"
              className="back-explore-button"
            >
              Explore Other Skills
            </Link>

          </div>

        )}

      </div>

    </main>
  );
}

export default Matches;