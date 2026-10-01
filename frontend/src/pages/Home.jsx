function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050b14",
        color: "white",
        padding: "100px 40px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "60px" }}>
        Welcome to <span style={{ color: "#1683ff" }}>SkillSwap</span>
      </h1>

      <p
        style={{
          fontSize: "20px",
          color: "#94a3b8",
        }}
      >
        Share your skills. Discover your next skill.
      </p>
    </div>
  );
}

export default Home;