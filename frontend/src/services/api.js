import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000"
});

// ✅ Attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// ✅ Handle errors globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log("API Error:", err.response?.data || err.message);

    // 🔥 AUTO LOGOUT if token invalid
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default API;