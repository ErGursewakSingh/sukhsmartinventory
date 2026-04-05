import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function ProductChart({ productId, prediction }) {
  const [data, setData] = useState([]);

  // ✅ Stable function (fixes ESLint + prevents re-renders issues)
  const fetchHistory = useCallback(async () => {
    if (!productId) return;

    try {
      const res = await API.get(`/products/${productId}/history`);

      // ✅ Format data safely
      let formatted = res.data.map((item) => ({
        date: new Date(item.date).toLocaleTimeString(),
        price: Number(item.price)
      }));

      // ✅ OPTIONAL: add prediction point (if provided)
      if (prediction) {
        formatted.push({
          date: "Prediction",
          price: Number(prediction)
        });
      }

      setData(formatted);
    } catch (err) {
      console.log("Chart error:", err);
      setData([]); // fallback safety
    }
  }, [productId, prediction]); // ✅ correct dependencies

  // ✅ Proper hook usage
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ✅ Better empty state UX
  if (!productId) {
    return <p>Select a product to view chart</p>;
  }

  if (data.length === 0) {
    return <p>No price history available</p>;
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />
          <YAxis />

          <Tooltip />

          {/* ✅ Actual price line */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProductChart;
