import { useEffect, useState } from "react";
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

function ProductChart({ productId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (productId) fetchHistory();
  }, [productId]);

  const fetchHistory = async () => {
    try {
      const res = await API.get(`/products/${productId}/history`);

      // 🔥 Transform backend data → chart format
      const formatted = res.data.map((item, index) => ({
        date: `${new Date(item.date).toLocaleTimeString()}-${index}`,
        price: item.price
      }));
      setData(formatted);
    } catch (err) {
      console.log(err);
    }
  };

  if (data.length === 0) {
    return <p>No price history available</p>;
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          
          <XAxis dataKey="date" />
          <YAxis />
          
          <Tooltip />
          
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProductChart;