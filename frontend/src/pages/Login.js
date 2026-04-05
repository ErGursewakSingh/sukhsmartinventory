import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/login", {
        username: email,
        password: password
      });

      // Save token
      localStorage.setItem("token", res.data.token);
      setToken(true);
      // Force redirect
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
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>

        <div style={styles.inputBox}>
          <FaUser />
          <input
            type="text"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.inputBox}>
          <FaLock />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>

        <p style={{ marginTop: "10px" }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to right, #667eea, #764ba2)"
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "300px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    textAlign: "center"
  },
  title: {
    marginBottom: "20px"
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "8px",
    marginBottom: "15px",
    gap: "10px"
  },
  input: {
    border: "none",
    outline: "none",
    width: "100%"
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#667eea",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default Login;