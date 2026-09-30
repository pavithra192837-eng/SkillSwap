import { useState } from "react";
import { Link } from "react-router-dom";
import "./Matches.css";

const matchesData = [
  {
    id: 1,
    name: "Arun Kumar",
    department: "Computer Science",
    year: "3rd Year",
    teaches: "Python",
    wants: "UI/UX Design",
    match: "92%",
    avatar: "A",
    status: "Available",
  },
  {
    id: 2,
    name: "Priya Sharma",
    department: "Information Technology",
    year: "3rd Year",
    teaches: "Figma",
    wants: "JavaScript",
    match: "88%",
    avatar: "P",
    status: "Available",
  },
  {
    id: 3,
    name: "Rahul Raj",
    department: "ECE",
    year: "3rd Year",
    teaches: "React",
    wants: "Data Science",
    match: "84%",
    avatar: "R",
    status: "Available",
  },
  {
    id: 4,
    name: "Sneha Devi",
    department: "AI & DS",
    year: "2nd Year",
    teaches: "Machine Learning",
    wants: "Python",
    match: "81%",
    avatar: "S",
    status: "Available",
  },
  {
    id: 5,
    name: "Karthik Raj",
    department: "CSE",
    year: "3rd Year",
    teaches: "JavaScript",
    wants: "C++",
    match: "78%",
    avatar: "K",
    status: "Available",
  },
  {
    id: 6,
    name: "Meena Priya",
    department: "ECE",
    year: "2nd Year",
    teaches: "UI/UX Design",
    wants: "Python",
    match: "75%",
    avatar: "M",
    status: "Available",
  },
];

function Matches() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [connected, setConnected] = useState([]);

  const filteredMatches = matchesData.filter((person) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      person.name.toLowerCase().includes(searchValue) ||
      person.teaches.toLowerCase().includes(searchValue) ||
      person.wants.toLowerCase().includes(searchValue) ||
      person.department.toLowerCase().includes(searchValue);

    const matchesFilter =
      filter === "All" ||
      person.teaches === filter ||
      person.wants === filter;

    return matchesSearch && matchesFilter;
  });

  const handleConnect = (id) => {
    if (!connected.includes(id)) {
      setConnected([...connected, id]);
    }
  };

  return (
    <main className="matches-page">

      <div className="matches-container">

        {/* HEADER */}

        <section className="matches-header">

          <div>
            <Link
              to="/dashboard"
              className="matches-back"
            >
              ← Back to Dashboard
            </Link>

            <p className="matches-label">
              SKILLSWAP MATCHING
            </p>

            <h1>
              Find your <span>skill match.</span>
            </h1>

            <p>
              Discover students who can teach what you want
              to learn and want to learn what you can teach.
            </p>
          </div>

        </section>


        {/* SEARCH + FILTER */}

        <section className="matches-toolbar">

          <div className="matches-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search people or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>


          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="matches-filter"
          >
            <option value="All">
              All Skills
            </option>

            <option value="Python">
              Python
            </option>

            <option value="JavaScript">
              JavaScript
            </option>

            <option value="React">
              React
            </option>

            <option value="Figma">
              Figma
            </option>

            <option value="UI/UX Design">
              UI/UX Design
            </option>

            <option value="C++">
              C++
            </option>

          </select>

        </section>


        {/* RESULT HEADER */}

        <div className="matches-result-header">

          <div>
            <span className="result-label">
              DISCOVER
            </span>

            <h2>
              Suggested Matches
            </h2>
          </div>

          <span className="result-count">
            {filteredMatches.length} matches
          </span>

        </div>


        {/* MATCH GRID */}

        <section className="matches-grid">

          {filteredMatches.map((person) => {

            const isConnected =
              connected.includes(person.id);

            return (

              <article
                className="match-card"
                key={person.id}
              >

                {/* CARD TOP */}

                <div className="match-card-top">

                  <div className="match-card-avatar">
                    {person.avatar}
                  </div>

                  <div className="match-card-score">

                    <strong>
                      {person.match}
                    </strong>

                    <span>
                      Match
                    </span>

                  </div>

                </div>


                {/* PERSON */}

                <div className="match-card-person">

                  <h3>
                    {person.name}
                  </h3>

                  <p>
                    {person.department} · {person.year}
                  </p>

                  <span className="available-badge">
                    ● {person.status}
                  </span>

                </div>


                {/* SKILLS */}

                <div className="exchange-box">

                  <div className="exchange-skill">

                    <span>
                      CAN TEACH
                    </span>

                    <strong>
                      {person.teaches}
                    </strong>

                  </div>

                  <div className="exchange-arrow">
                    ⇄
                  </div>

                  <div className="exchange-skill">

                    <span>
                      WANTS TO LEARN
                    </span>

                    <strong>
                      {person.wants}
                    </strong>

                  </div>

                </div>


                {/* CONNECT */}

                <button
                  className={`connect-button ${
                    isConnected ? "connected" : ""
                  }`}
                  onClick={() =>
                    handleConnect(person.id)
                  }
                  disabled={isConnected}
                >
                  {isConnected
                    ? "✓ Request Sent"
                    : "Connect"}
                </button>

              </article>

            );
          })}

        </section>


        {/* NO RESULTS */}

        {filteredMatches.length === 0 && (

          <div className="matches-empty">

            <div>
              🔎
            </div>

            <h3>
              No matches found
            </h3>

            <p>
              Try searching for another skill or person.
            </p>

          </div>

        )}

      </div>

    </main>
  );
}

export default Matches;