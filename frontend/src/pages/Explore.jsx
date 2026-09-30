import { useState } from "react";
import { Link } from "react-router-dom";
import "./Explore.css";

function Explore() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const skills = [
    {
      name: "Python",
      category: "Programming",
      learners: "120+ learners",
      description: "Learn Python programming from fellow students.",
    },
    {
      name: "C++",
      category: "Programming",
      learners: "95+ learners",
      description: "Practice C++ and improve your problem-solving skills.",
    },
    {
      name: "UI/UX Design",
      category: "Design",
      learners: "90+ learners",
      description: "Learn modern UI/UX design and user experience.",
    },
    {
      name: "Figma",
      category: "Design",
      learners: "70+ learners",
      description: "Create beautiful interfaces using Figma.",
    },
    {
      name: "Data Science",
      category: "Data",
      learners: "75+ learners",
      description: "Explore data analysis, Python and machine learning.",
    },
    {
      name: "Machine Learning",
      category: "Data",
      learners: "65+ learners",
      description: "Learn the fundamentals of machine learning.",
    },
    {
      name: "Video Editing",
      category: "Creative",
      learners: "55+ learners",
      description: "Improve your editing and storytelling skills.",
    },
    {
      name: "Digital Marketing",
      category: "Marketing",
      learners: "60+ learners",
      description: "Learn social media and digital marketing strategies.",
    },
  ];

  const categories = [
    "All",
    "Programming",
    "Design",
    "Data",
    "Creative",
    "Marketing",
  ];

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || skill.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="explore-page">

      <section className="explore-hero">
        <div className="explore-hero-content">

          <p className="explore-label">
            DISCOVER SKILLS
          </p>

          <h1>
            Find something you
            <span> want to learn.</span>
          </h1>

          <p>
            Explore skills shared by students and find
            people who can help you grow.
          </p>

          <div className="explore-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search for a skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        </div>
      </section>


      <section className="explore-content">

        <div className="category-list">

          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}

        </div>


        <div className="explore-header">

          <div>
            <p className="section-label">
              EXPLORE
            </p>

            <h2>
              Popular skills
            </h2>
          </div>

          <span>
            {filteredSkills.length} skills found
          </span>

        </div>


        <div className="explore-grid">

          {filteredSkills.map((skill) => (

            <article
              className="explore-card"
              key={skill.name}
            >

              <div className="skill-card-top">

                <div className="skill-icon">
                  {skill.name.charAt(0)}
                </div>

                <span className="skill-category">
                  {skill.category}
                </span>

              </div>

              <h3>
                {skill.name}
              </h3>

              <p>
                {skill.description}
              </p>

              <div className="skill-card-bottom">

                <span>
                  {skill.learners}
                </span>

                <Link to="/login">
                  Find Learners →
                </Link>

              </div>

            </article>

          ))}

        </div>

        {filteredSkills.length === 0 && (
          <div className="no-results">
            <h3>No skills found</h3>
            <p>
              Try searching for another skill or category.
            </p>
          </div>
        )}

      </section>

    </main>
  );
}

export default Explore;