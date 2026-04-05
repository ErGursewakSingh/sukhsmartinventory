import { useEffect, useState } from "react";
import API from "../services/api";

function Notifications() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const res = await API.get("/notifications");
    setData(res.data);
  };

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
    } catch (err) {
      console.log(err.response?.data?.message); // 👈 see real error
    }
    fetchNotifications();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Notifications 🔔</h2>

      {data.map(n => (
        <div key={n.id} style={{
          background: n.is_read ? "#eee" : "#d1fae5",
          padding: "10px",
          marginBottom: "10px"
        }}>
          <p>{n.message}</p>

          {!n.is_read && (
            <button onClick={() => markRead(n.id)}>
              Mark Read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default Notifications;