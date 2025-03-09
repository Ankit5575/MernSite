const express = require("express");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/OrderItem");
const { protect } = require("../middleware/authMiddleware");
const Checkout = require("../models/Checkout");

const router = express.Router();

// @route   POST /api/checkout
// @desc    Create a new checkout session
// // @access  Private
// router.post("/", protect, async (req, res) => {
//   try {
//     const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;

//     // Validate request data
//     if (!checkoutItems || checkoutItems.length === 0) {
//       return res.status(400).json({ message: "No items in checkout" });
//     }
//     if (!shippingAddress || !paymentMethod || !totalPrice) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // Validate checkout items (ensure products exist and are in stock)
//     for (const item of checkoutItems) {
//       if (!mongoose.Types.ObjectId.isValid(item.productId)) {
//         return res.status(400).json({ message: `Invalid product ID: ${item.productId}` });
//       }

//       const product = await Product.findById(item.productId);
//       if (!product) {
//         return res.status(404).json({ message: `Product not found: ${item.productId}` });
//       }
//       if (product.stock !== undefined && product.stock < item.quantity) {
//         return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
//       }
//     }

//     // Create a new checkout session
//     const newCheckout = await Checkout.create({
//       user: req.user._id,
//       checkoutItems,
//       shippingAddress,
//       paymentMethod,
//       totalPrice,
//       paymentStatus: "pending",
//       isFinalized: false,
//     });

//     console.log(`Checkout created for user: ${req.user._id}`);
//     res.status(201).json(newCheckout);
//   } catch (error) {
//     console.error("Error creating checkout session:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });
// @route   POST /api/checkout
// @desc    Create a new checkout session
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    // Validate request data
    if (!checkoutItems || checkoutItems.length === 0) {
      return res.status(400).json({ message: "No items in checkout" });
    }
    if (!shippingAddress || !paymentMethod || !totalPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate checkout items (ensure products exist and are in stock)
    for (const item of checkoutItems) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ message: `Invalid product ID: ${item.productId}` });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }
      if (product.stock !== undefined && product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }
    }

    // Create a new checkout session
    const newCheckout = await Checkout.create({
      user: req.user._id,
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "pending",
      isFinalized: false,
    });

    console.log(`Checkout created for user: ${req.user._id}`);
    res.status(201).json(newCheckout);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// @route   PUT /api/checkout/:id/pay
// @desc    Update checkout to mark as paid after successful payment
// @access  Private
router.put("/:id/pay", protect, async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;
  
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid checkout ID" });
    }

    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    if (paymentStatus === "completed") {
      checkout.paymentStatus = "completed";
      checkout.paymentDetails = paymentDetails;
      checkout.paidAt = Date.now();
      await checkout.save();

      res.status(200).json({ message: "Payment successful", checkout });
    } else {
      res.status(400).json({ message: "Invalid payment status" });
    }
  } catch (error) {
    console.error("Error updating checkout payment status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



 
// @route   POST /api/checkout/:id/finalize
// @desc    Finalize checkout and convert to an order after payment confirmation
// @access  Private
router.post("/:id/finalize", protect, async (req, res) => {
  try {
    // ✅ Fix: Ensure checkout ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid checkout ID" });
    }

    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    if (checkout.paymentStatus === "completed" && !checkout.isFinalized) {
      // ✅ Fix: Ensure `paymentMethod` exists
      if (!checkout.paymentMethod) {
        return res.status(400).json({ message: "Missing payment method in checkout" });
      }

      // ✅ Fix: Pass `paymentMethod` when creating the order
      const finalOrder = await Order.create({
        user: checkout.user,
        orderItems: checkout.checkoutItems,
        shippingAddress: checkout.shippingAddress,
        totalPrice: checkout.totalPrice,
        paymentMethod: checkout.paymentMethod, // ✅ Ensure this is included
        isPaid: true,
        paidAt: checkout.paidAt,
        isDelivered: false,
        paymentStatus: "completed",
        paymentDetails: checkout.paymentDetails,
      });

      // ✅ Mark checkout as finalized
      checkout.isFinalized = true;
      checkout.finalizedAt = Date.now();
      await checkout.save();

      // ✅ Delete the user's cart after checkout
      await Cart.findOneAndDelete({ user: checkout.user });

      res.status(201).json({ message: "Checkout finalized", order: finalOrder });
    } else if (checkout.isFinalized) {
      res.status(400).json({ message: "Checkout already finalized" });
    } else {
      res.status(400).json({ message: "Checkout is not paid" });
    }
  } catch (error) {
    console.error("Error finalizing checkout:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;