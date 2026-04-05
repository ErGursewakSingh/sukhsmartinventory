import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import ProductChart from "../components/ProductChart";

function ProductDetails() {
  const { id } = useParams();

  const [analytics, setAnalytics] = useState(null);
  const [product, setProduct] = useState(null);
  

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const res1 = await API.get("/products");
      const res2 = await API.get(`/products/${id}/history`);
      const res3 = await API.get(`/products/${id}/analytics`);

      const foundProduct = res1.data.find(
        (p) => p.id === parseInt(id)
      );

      setProduct(foundProduct);
      setAnalytics(res3.data);

      const sortedHistory = res2.data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      

    } catch (err) {
      console.log("Error:", err);
    }
  };

  // ✅ USE BACKEND PREDICTION ONLY
  const getPrediction = () => {
    if (!analytics) return "Loading...";
    return `₹ ${analytics.prediction}`;
  };

  // ✅ USE BACKEND RECOMMENDATION (DO NOT RE-CALCULATE)
  const getRecommendation = () => {
    if (!product || !analytics) return "Loading...";

    const stock = product.quantity;

    if (stock === 0) return "🚨 Out of stock";
    if (stock < 5) return "⚠️ Low stock";

    return analytics.recommendation;
  };

  return (
    <div style={{ padding: "20px", background: "#f5f7fb", minHeight: "100vh" }}>
      
      <h2>📊 Product Analytics</h2>

      {/* INFO */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
        <div style={card}>💰 ₹{product?.price}</div>
        <div style={card}>📦 {product?.quantity}</div>
        <div style={card}>📊 {analytics?.trend}</div>
      </div>

      {/* CHART */}
      <div style={cardLarge}>
        <h3>Price History + Prediction</h3>
        <ProductChart productId={id} prediction={analytics?.prediction} />
      </div>

      {/* INSIGHTS */}
      <div style={{ display: "flex", gap: "15px" }}>
        <div style={card}>
          <h4>Prediction</h4>
          <p>{getPrediction()}</p>
        </div>

        <div style={card}>
          <h4>Recommendation</h4>
          <p>{getRecommendation()}</p>
        </div>
      </div>
    </div>
  );
}

const card = {
  flex: 1,
  background: "white",
  padding: "15px",
  borderRadius: "10px"
};

const cardLarge = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px"
};

export default ProductDetails;
