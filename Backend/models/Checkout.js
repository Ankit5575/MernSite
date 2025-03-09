const mongoose = require("mongoose");

const checkoutItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Product model
      ref: "Product", // Reference to the Product collection
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String, // URL of the product image
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1, // Ensure quantity is at least 1
    },
    size: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { _id: false } // Disable _id for subdocuments
);

const checkoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Fixed quotes
    }, 
checkoutItems: [checkoutItemSchema], // Changed to plural for clarity
    shippingAddress: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paidAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      default: "pending", // Default status is "pending"
      enum: ["pending", "completed", "failed"], // Allowed values
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed, // Store payment-related details
    },
    isFinalized: {
      type: Boolean,
      default: false, // Default to false
    },
    finalizedAt: {
      type: Date,
    },
    
  },
  { timestamps: true } // Automatically add `createdAt` and `updatedAt` fields
);

// Pre-save hook to set `finalizedAt` when `isFinalized` is true
checkoutSchema.pre("save", function (next) {
  if (this.isFinalized && !this.finalizedAt) {
    this.finalizedAt = new Date();
  }
  next();
});

// Create the Checkout model
const Checkout = mongoose.model("Checkout", checkoutSchema);

module.exports = Checkout;