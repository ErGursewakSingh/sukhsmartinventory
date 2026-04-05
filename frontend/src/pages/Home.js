import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Home({ setToken }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/login", {
        username: email,
        password: password
      });

      localStorage.setItem("token", res.data.token);
      setToken(true);
      navigate("/dashboard");

    } catch (err) {
      if (err.response) {
        alert(err.response.data.message);
      } else {
        alert("Server not reachable");
      }
    }
  };


  return (
    <div style={styles.container}>

      <div style={styles.main}>

        {/* LEFT SIDE */}
        <div style={styles.left}>

          {/* HERO CENTERED */}
          <div style={styles.heroCenter}>
            <h1 style={styles.heroTitle}>
              Smart Inventory & <br />
              <span style={styles.gradientText}>
                Price Intelligence
              </span>
            </h1>

            <p style={styles.heroDesc}>
              Track products, analyze price trends, predict future prices,
              and get alerts when prices drop — all in one intelligent system.
            </p>
          </div>

          {/* FEATURES */}
          <h3 style={styles.sectionTitle}>Features</h3>

          <div style={styles.pillGrid}>
            <div style={styles.pill}>📦 Product Management</div>
            <div style={styles.pill}>📊 Price Analytics</div>
            <div style={styles.pill}>🔮 Price Prediction</div>
            <div style={styles.pill}>🔔 Smart Alerts</div>
            <div style={styles.pill}>📉 Price History</div>
            <div style={styles.pill}>🛒 Buy Recommendation</div>
          </div>

          <hr style={styles.divider} />

          {/* HOW IT WORKS */}
          <h3 style={styles.sectionTitle}>How It Works</h3>

          <div style={styles.stepsContainer}>

            <div style={styles.step}>
              <div style={styles.stepCircle}>1</div>
              <h4>Add Products</h4>
              <p>Manually add or fetch products from API.</p>
            </div>

            <div style={styles.stepLine}></div>

            <div style={styles.step}>
              <div style={styles.stepCircle}>2</div>
              <h4>Track & Analyze</h4>
              <p>System tracks prices and detects trends.</p>
            </div>

            <div style={styles.stepLine}></div>

            <div style={styles.step}>
              <div style={styles.stepCircle}>3</div>
              <h4>Get Insights</h4>
              <p>Receive alerts and smart recommendations.</p>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div style={styles.authCard}>
        <h3>Welcome</h3>

        <div style={styles.inputBox}>
            <input
            type="text"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            />
        </div>

        <div style={styles.inputBox}>
            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            />
        </div>

        <button onClick={handleLogin} style={styles.fullBtn}>
            Login
        </button>

        <p style={styles.registerText}>
            Don’t have an account?{" "}
            <Link to="/register" style={styles.registerLink}>
            Register
            </Link>
        </p>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>© 2026 Smart Inventory System</p>
      </footer>

    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    fontFamily: "Segoe UI, sans-serif"
  },

  main: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "40px 20px",
    gap: "40px",
    minHeight: "80vh"
  },

  left: {
    flex: "0 0 65%"
  },

  right: {
    flex: "0 0 35%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  heroCenter: {
    textAlign: "center",
    marginBottom: "40px"
  },

  heroTitle: {
    fontSize: "42px",
    fontWeight: "bold",
    color: "#1e293b",
    lineHeight: "1.2"
  },

  gradientText: {
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },

  heroDesc: {
    marginTop: "15px",
    color: "#475569",
    fontSize: "16px",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
    lineHeight: "1.6"
  },

  sectionTitle: {
    marginTop: "30px",
    
    marginBottom: "12px",
    fontSize: "20px",
    color: "#1e293b"
  },

  pillGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px"
  },

  pill: {
    background: "#ffffff",
    padding: "12px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    fontSize: "14px"
  },

  divider: {
    margin: "30px 0",
    border: "none",
    borderTop: "1px solid #e2e8f0"
  },

  stepsContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "30px",
    textAlign: "center"
  },

  step: {
    flex: 1,
    padding: "10px"
  },

  stepCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#667eea",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 10px",
    fontWeight: "bold"
  },

  stepLine: {
    height: "2px",
    background: "#cbd5e1",
    flex: 1
  },

  authCard: {
    width: "100%",
    maxWidth: "320px",
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    textAlign: "center",
    position: "sticky",
    top: "100px"
  },

  fullBtn: {
    width: "100%",
    padding: "12px",
    marginBottom: "10px",
    background: "#667eea",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer"
  },

  fullBtnOutline: {
    width: "100%",
    padding: "12px",
    border: "1px solid #667eea",
    background: "transparent",
    borderRadius: "6px",
    cursor: "pointer"
  },

  footer: {
    textAlign: "center",
    padding: "20px",
    background: "#1e293b",
    color: "#fff",
    marginTop: "40px"
  },



  registerText: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#555"
  },


  inputBox: {
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "8px",
    marginBottom: "12px"
  },

  input: {
    border: "none",
    outline: "none",
    width: "100%"
  },



  registerLink: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "500"
  },
};

export default Home;