const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDb = require("./config/db");

// ✅ Ensure all routes are correctly imported
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoute");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoute"); // ✅ Fixed missing import
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const subscribeRoutes = require("./routes/subscriberRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productAdminRoutes = require("./routes/productAdminRoute");
const adminOrderRoutes = require("./routes/adminOrderRoutes.");

dotenv.config(); // ✅ Load environment variables

const app = express();
const PORT = process.env.PORT|| 7000;

// Middleware
app.use(express.json());
app.use(cors());

// ✅ Connect to MongoDB properly
(async () => {
  try {
    await connectDb();
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
})();

// Default Route
app.get("/", (req, res) => {
  res.send("Welcome To Rabbit API 🐰");
});

// ✅ Ensure all API routes are correctly set up
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", subscribeRoutes);
 
//ADMIN 

app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);




// ✅ Error Handling Middleware (Better Error Logs)
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
