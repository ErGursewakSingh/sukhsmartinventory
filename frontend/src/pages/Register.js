import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await API.post("/register", {
        username: email,
        password: password
      });

      alert("Registered successfully");
      navigate("/");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>

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

        <button onClick={handleRegister} style={styles.button}>
          Register
        </button>

        <p style={{ marginTop: "10px" }}>
          Already have an account? <Link to="/">Login</Link>
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
    background: "linear-gradient(to right, #ff7e5f, #feb47b)"
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
    background: "#ff7e5f",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default Register;