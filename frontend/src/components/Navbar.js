import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>

        {/* LOGO */}
        <h2 style={styles.logo}>
          Sukh<span style={styles.logoAccent}>Smart</span>Inventory
        </h2>

        {/* RIGHT SIDE */}
        <div style={styles.right}>

          {!token ? (
            <>
              <Link to="/login">
                <button style={styles.loginBtn}>Login</button>
              </Link>

              <Link to="/register">
                <button style={styles.registerBtn}>Register</button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" style={styles.link}>Dashboard</Link>
              <Link to="/notifications" style={styles.link}>Notifications</Link>

              <button onClick={logout} style={styles.logout}>
                Logout
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const styles = {
  wrapper: {
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0"
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  logo: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "bold",
    color: "#1e293b"
  },

  logoAccent: {
    color: "#667eea"
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  link: {
    textDecoration: "none",
    color: "#334155",
    fontWeight: "500"
  },

  loginBtn: {
    padding: "8px 14px",
    border: "1px solid #667eea",
    background: "transparent",
    borderRadius: "6px",
    cursor: "pointer"
  },

  registerBtn: {
    padding: "8px 14px",
    background: "#667eea",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "500",
    cursor: "pointer"
  },

  logout: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default Navbar;