import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState} from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import ProductDetails from "./pages/ProductDetails";

function App() {
  const [token, setToken] = useState(!!localStorage.getItem("token"));

  return (
    <Router>
      <Navbar />
      <Routes>
        
        <Route path="/" element={<Home setToken={setToken} />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        

        {/* REGISTER */}
        <Route path="/register" element={<Register />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            token ? <Dashboard /> : <Navigate to="/" />
          }
        />
        <Route
          path="/notifications"
          element={token ? <Notifications /> : <Navigate to="/" />}
        />

        <Route
          path="/analytics"
          element={token ? <Analytics /> : <Navigate to="/" />}
        />

        <Route path="/product/:id" element={<ProductDetails />} />



      </Routes>
    </Router>
  );
}

export default App;