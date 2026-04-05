import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import ProductChart from "../components/ProductChart";
import { FaBox, FaChartLine, FaBell, FaTrash } from "react-icons/fa";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [unread, setUnread] = useState(0);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState({
    biggest_drop: { name: "N/A", drop: 0 },
    alerts: 0,
    low_stock: 0
  });
  const [user, setUser] = useState("");

  useEffect(() => {
    API.get("/me")
      .then(res => setUser(res.data.username))
      .catch(() => setUser("User"));
  }, []);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    supplier: ""
  });

  const navigate = useNavigate();
  
  // ---------------- INIT ----------------
  useEffect(() => {
    fetchProducts();
    fetchUnread();
    fetchInsights();
  }, []);

  // ---------------- API CALLS ----------------
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/products");
      setProducts(res.data || []);
    } catch (err) {
      console.log("Products error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnread = async () => {
    try {
      const res = await API.get("/notifications/unread-count");
      setUnread(res.data?.unread || 0);
    } catch (err) {
      console.log("Notification error:", err);
      setUnread(0);
    }
  };
  const fetchInsights = async () => {
    try {
      const res = await API.get("/products/insights");

      const data = res.data;

      setInsights({
        // ✅ convert biggest_drops array → single object
        biggest_drop: data.biggest_drops?.length
          ? data.biggest_drops[0]
          : { name: "N/A", drop: 0 },

        // ✅ convert array → count
        low_stock: data.low_stock?.length || 0,

        alerts: data.alerts || 0
      });

    } catch (err) {
      console.log("Insights error:", err);
    }
  };


  const deleteProduct = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
      fetchUnread(); // update alerts
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  // ---------------- FILTER ----------------
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ---------------- STATS ----------------
  const totalValue = products.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.quantity || 0),
    0
  );

  // ---------------- FORM ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      price: "",
      quantity: "",
      supplier: ""
    });
  };

  const addProduct = async () => {
    if (!form.name || !form.price) {
      alert("Name and price required");
      return;
    }

    try {
      await API.post("/products", {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity || 0)
      });

      resetForm();
      fetchProducts();
    } catch (err) {
      console.log("Add error:", err);
    }
  };

  const updateProduct = async () => {
    try {
      await API.put(`/products/${editId}`, {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity || 0)
      });

      setEditId(null);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.log("Update error:", err);
    }
  };

  // ---------------- UI ----------------
  return (
    <div style={styles.wrapper}>
      
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>SukhSmartInventory</h2>

        <p style={styles.activeMenu}><FaBox /> Products</p>

        <p style={styles.menu} onClick={() => navigate("/analytics")}>
          <FaChartLine /> Analytics
        </p>

        <p style={styles.menu} onClick={() => navigate("/notifications")}>
          <FaBell /> Alerts ({unread})
        </p>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
      

        {/* HEADER */}
        <div style={styles.header}>
          <h2>Dashboard</h2>
          
        </div>

        {/* STATS */}
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <FaBox size={22} />
            <h3>{products.length}</h3>
            <p>Total Products</p>
          </div>

          <div style={styles.statCard}>
            <FaChartLine size={22} />
            <h3>₹{totalValue.toLocaleString()}</h3>
            <p>Total Value</p>
          </div>

          <div
            style={styles.statCard}
            onClick={() => navigate("/notifications")}
          >
            <FaBell size={22} color="#ef4444" />
            <h3>{unread}</h3>
            <p>Unread Alerts</p>
          </div>

           {/* 🔥 NEW INSIGHTS */}

          <div style={styles.statCard}>
            📉
            <h3>₹{insights.biggest_drop.drop}</h3>
            <p>Biggest Drop</p>
            <small>{insights.biggest_drop.name}</small>
          </div>
          <div style={styles.statCard}>
            ⚠️
            <h3>{insights.low_stock}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>

        {/* FORM */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>
            {editId ? "Edit Product" : "Add Product"}
          </h3>

          <div style={styles.formGrid}>
            <input style={styles.input} name="name" placeholder="Product Name" value={form.name} onChange={handleChange} />
            <input style={styles.input} name="category" placeholder="Category" value={form.category} onChange={handleChange} />
            <input style={styles.input} name="price" placeholder="Price ₹" value={form.price} onChange={handleChange} />
            <input style={styles.input} name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange} />
            <input style={styles.input} name="supplier" placeholder="Supplier" value={form.supplier} onChange={handleChange} />
          </div>

          <button
            style={styles.primaryBtn}
            onClick={editId ? updateProduct : addProduct}
          >
            {editId ? "Update Product" : "Add Product"}
          </button>
        </div>

        {/* PRODUCTS */}
        <div style={styles.card}>
          <h3>Products</h3>

          <input
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />

          {loading ? (
            <p>Loading...</p>
          ) : filteredProducts.length === 0 ? (
            <p style={styles.empty}>No products found</p>
          ) : (
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.thLeft}>Product</th>
                  <th style={styles.thCenter}>Price</th>
                  <th style={styles.thCenter}>Category</th>
                  <th style={styles.thCenter}>Quantity</th>
                  <th style={styles.thRight}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} style={styles.row}>
                    <td style={styles.tdLeft}>{p.name}</td>

                    <td
                      style={{
                        ...styles.tdCenter,
                        fontWeight: "bold",
                        color: Number(p.price) > 50000 ? "#dc2626" : "#16a34a"
                      }}
                    >
                      ₹{p.price}
                    </td>

                    <td style={styles.tdCenter}>
                      <span style={styles.category}>{p.category}</span>
                    </td>
                    <td style={styles.tdCenter}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          background:
                            p.quantity === 0
                              ? "#fee2e2"
                              : p.quantity < 10
                              ? "#fef3c7"
                              : "#dcfce7",
                          color:
                            p.quantity === 0
                              ? "#dc2626"
                              : p.quantity < 10
                              ? "#b45309"
                              : "#15803d"
                        }}
                      >
                        {p.quantity === 0
                          ? "Out"
                          : p.quantity < 10
                          ? `Low (${p.quantity})`
                          : `Stock (${p.quantity})`}
                      </span>
                    </td>
                    <td style={styles.tdRight}>
                      <button
                        style={styles.btn}
                        onClick={() => navigate(`/product/${p.id}`)}
                      >
                        View
                      </button>
                      <button 
                      style={styles.warnBtn}
                      onClick={() => setSelectedProduct(p.id)}>
                        Show Chart
                      </button>

                      {p.is_auto ? (
                        <button disabled style={{ opacity: 0.5 }}>
                          Auto
                        </button>
                      ) : (
                        <button 
                        style={styles.btn}
                        onClick={() => {
                          setForm({
                            name: p.name,
                            category: p.category,
                            price: p.price,
                            quantity: p.quantity,
                            supplier: p.supplier
                          });
                          setEditId(p.id);
                        }}>
                          Edit
                        </button>
                      )}

                      <button
                        style={styles.warnBtn}
                        onClick={async () => {
                          const price = prompt("Enter target price:");
                          if (!price) return;

                          try {
                            await API.post(`/products/${p.id}/set-alert`, {   // ✅ FIXED
                              target_price: Number(price)
                            });
                            alert("Alert set!");
                            fetchUnread();
                          } catch {
                            alert("Error setting alert");
                          }
                        }}
                      >
                        Alert
                      </button>

                      <button
                        style={styles.deleteBtn}
                        onClick={() => {
                          if (window.confirm("Delete product?")) {
                            deleteProduct(p.id);
                          }
                        }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* CHART */}
        {selectedProduct && (
          <div style={styles.card}>
            <h3>Price Analytics</h3>
            <ProductChart
              key={selectedProduct} // 🔥 fixes chart stale bug
              productId={selectedProduct}
            />
          </div>
        )}

      </div>
    </div>
  );
}

// ---------------- STYLES ----------------
const styles = {
  wrapper: { display: "flex", height: "100vh", background: "#f8fafc" },

  sidebar: {
    width: "270px",
    background: "#0f172a",
    color: "white",
    padding: "20px"
  },

  logo: { marginBottom: "30px" },

  menu: { margin: "15px 0", cursor: "pointer", display: "flex", gap: "10px" },

  activeMenu: {
    margin: "15px 0",
    display: "flex",
    gap: "10px",
    color: "#38bdf8"
  },

  main: { flex: 1, padding: "20px", overflowY: "auto" },

  header: {
    background: "linear-gradient(to right, #3b82f6, #06b6d4)",
    padding: "20px",
    borderRadius: "10px",
    color: "white",
    marginBottom: "20px"
  },

  stats: { display: "flex", gap: "15px", marginBottom: "20px" },

  statCard: {
    flex: 1,
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
    cursor: "pointer"
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.05)"
  },
  sectionTitle: {
    marginBottom: "15px",
    fontWeight: "600"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "15px"
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb"
  },
  primaryBtn: {
    background: "#3b82f6",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },

  search: {
    padding: "10px",
    width: "100%",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "15px"
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 8px"
  },
  thead: {
    textAlign: "left",
    fontSize: "14px",
    color: "#64748b"
  },
   th: {
    padding: "10px"
  },

  tr: {
    background: "white",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
    borderRadius: "10px"
  },

  td: {
    padding: "12px"
  },

  rowStyle: { borderBottom: "1px solid #eee" },

  price: { fontWeight: "bold" },

  category: {
    background: "#e0f2fe",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px"
  },

  btn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "5px 10px",
    marginRight: "5px",
    borderRadius: "5px",
    cursor: "pointer"
  },

  warnBtn: {
    background: "#f59e0b",
    color: "white",
    border: "none",
    padding: "5px 10px",
    marginRight: "5px",
    borderRadius: "5px",
    cursor: "pointer"
  },

  deleteBtn: {
    background: "red",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer"
  },

  empty: {
    textAlign: "center",
    marginTop: "20px",
    color: "#666"
  },
  thLeft: {
    textAlign: "left",
    padding: "12px"
  },

  thCenter: {
    textAlign: "center",
    padding: "12px"
  },

  thRight: {
    textAlign: "right",
    padding: "12px"
  },

  tdLeft: {
    textAlign: "left",
    padding: "12px"
  },

  tdCenter: {
    textAlign: "center",
    padding: "12px"
  },

  tdRight: {
    textAlign: "right",
    padding: "12px"
  },

  row: {
    borderBottom: "1px solid #e5e7eb",
    transition: "0.2s"
  }
};

export default Dashboard;