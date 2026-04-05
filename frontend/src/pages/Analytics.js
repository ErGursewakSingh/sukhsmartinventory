import { useEffect, useState } from "react";
import API from "../services/api";

function Analytics() {
  const [products, setProducts] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data);
  };

  const analyze = async (product) => {
    try {
      const res = await API.get(`/products/${product.id}/analytics`);
      setAnalysis(res.data);
      setSelectedProduct(product);
    } catch (err) {
      console.log(err);
    }
  };

  //  Smart insight
  const getInsight = () => {
    if (!analysis) return "";

    if (analysis.trend === "Increasing")
      return "📈 Prices are rising. It may be better to wait.";

    if (analysis.trend === "Decreasing")
      return "📉 Prices are falling. Good time to buy.";

    return "⚖️ Prices are stable. Monitor before decision.";
  };

  return (
    <div style={styles.container}>
      <h2 style={{ marginBottom: "20px" }}>📊 Product Analytics</h2>

      {/* PRODUCT LIST */}
      <div style={styles.grid}>
        {products.map((p) => (
          <div key={p.id} style={styles.card}>
            <h3>{p.name}</h3>
            <p>₹ {p.price}</p>
            <p>Stock: {p.quantity}</p>

            <button
              style={styles.button}
              onClick={() => analyze(p)}
            >
              Analyze
            </button>
          </div>
        ))}
      </div>

      {/* RESULT SECTION */}
      {analysis && (
        <div style={styles.resultBox}>
          <h3>{selectedProduct?.name} - Analysis</h3>

          <div style={styles.resultGrid}>
            <div style={styles.resultCard}>
              <h4>📊 Trend</h4>
              <p>{analysis.trend}</p>
            </div>

            <div style={styles.resultCard}>
              <h4>🔮 Prediction</h4>
              <p>₹ {analysis.prediction}</p>
            </div>

            <div style={styles.resultCard}>
              <h4>💡 Recommendation</h4>
              <p>{analysis.recommendation}</p>
            </div>

            <div style={styles.resultCard}>
              <h4>⚠️ Anomaly</h4>
              <p style={{
                color: analysis.anomaly ? "red" : "green"
              }}>
                {analysis.anomaly ? "Yes" : "No"}
              </p>
            </div>
          </div>

          {/* SMART INSIGHT */}
          <div style={styles.insightBox}>
            <h4>🧠 Smart Insight</h4>
            <p>{getInsight()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    padding: "20px",
    background: "#f5f7fb",
    minHeight: "100vh"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px"
  },

  card: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },

  button: {
    marginTop: "10px",
    padding: "8px",
    width: "100%",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },

  resultBox: {
    marginTop: "30px",
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
  },

  resultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginTop: "15px"
  },

  resultCard: {
    background: "#f9fafc",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center"
  },

  insightBox: {
    marginTop: "20px",
    padding: "15px",
    background: "#eef2ff",
    borderRadius: "8px"
  }
};

export default Analytics;