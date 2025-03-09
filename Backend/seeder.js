const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const products = require("./data/products");
const Cart = require("./models/Cart");

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    // Call the seedData function after successful connection
    seedData();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit with error code if connection fails
  });

// Function to seed data
const seedData = async () => {
  try {
    // Clear existing data
    await Product.deleteMany(); // Clear all products
    await User.deleteMany(); // Clear all users
    await Cart.deleteMany(); // Clear all users

    // Create a default admin user
    const createdUser = await User.create({
      username: "Admin User",
      email: "admin@example.com",
      password: "12345", // In a real app, hash the password before saving
      role: "admin",
    });

    // Assign the default user ID to each product
    const userId = createdUser._id;

    // Corrected: Properly spread each product object
    const sampleProducts = products.map((product) => ({
      ...product,
      user: userId,
    }));

    // Insert the products into the database
    await Product.insertMany(sampleProducts);
    console.log("Product data seeded successfully");

    process.exit(0); // Exit with success code
  } catch (error) {
    console.error("Error seeding the data:", error);
    process.exit(1); // Exit with error code
  }
};
