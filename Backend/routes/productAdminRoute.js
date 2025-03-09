const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const router = express.Router();

// @route   GET /api/admin/products
// @desc    Get all products (admin only)
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await Product.find({});

    // Return the list of products
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//update the product details 
// @route   PUT /api/admin/products/:id
// @desc    Update product details (Admin only)
// // @access  Private/Admin
// router.put("/:id", protect, admin, async (req, res) => {
//   try {
//     const { id } = req.params;

//     const product = await Product.findById(id);

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // Update product fields
//     product.name = req.body.name || product.name;
//     product.description = req.body.description || product.description;
//     product.price = req.body.price || product.price;
//     product.countInStock = req.body.countInStock || product.countInStock;
//     product.sku = req.body.sku || product.sku;
//     product.category = req.body.category || product.category;
//     product.brand = req.body.brand || product.brand;
//     product.sizes = req.body.sizes || product.sizes;
//     product.colors = req.body.colors || product.colors;
//     product.collection = req.body.collection || product.collection;
//     product.material = req.body.material || product.material;
//     product.gender = req.body.gender || product.gender;
//     product.images = req.body.images || product.images; // Handle images array

//     const updatedProduct = await product.save();
//     res.json(updatedProduct);
//   } catch (error) {
//     console.error("Error updating product:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });



// @route   POST /api/admin/users
// @desc    Add a new user (admin only)
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
    });

    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user info (admin only) - Name, email, and role
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;

      const updatedUser = await user.save();
      res.json({ message: "User updated successfully", user: updatedUser });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (admin only)
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;