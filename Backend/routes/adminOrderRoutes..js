const express = require("express");
const Order = require("../models/OrderItem");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/admin/orders
// @desc    Get all orders (admin only)
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    // Fetch all orders from the database
    const orders = await Order.find({})
      .populate("user", "name email") // Populate user details
      .sort({ createdAt: -1 }); // Sort by most recent orders

    // Return the list of orders
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/admin/orders/:id
// @desc    Update order status (admin only)
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status
    order.status = status || order.status;

    // Update delivery status and timestamp if status is "Delivered"
    if (status === "Delivered") {
      order.isDelivered = true; // Fixed typo here
      order.deliveredAt = Date.now();
    }

    // Save the updated order
    const updatedOrder = await order.save();

    // Respond with the updated order
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/admin/orders/:id
// @desc    Delete an order (admin only)
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const orderId = req.params.id;

    // Find and delete the order by ID
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Respond with success message
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;  