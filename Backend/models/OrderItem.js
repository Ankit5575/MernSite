const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
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
       
    },
   
    size: {
      type: String,
      required: true,
    },
    color: {
      type: String,
       
    },
  },
  { _id: false } // Disable _id for subdocuments
);


const orderSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      orderItems: [orderItemSchema], // Array of order items
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
           // Allowed payment methods
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
            // Allowed values
        },
        paymentDetails: {
          type: mongoose.Schema.Types.Mixed, // Store payment-related details (e.g., transaction ID, gateway response)
        },
        isDelivered: {
            type: Boolean,
            default: false, // Default to false
          },
          deliveredAt: {
            type: Date,
          },
          status:{
type:String,
enum:["Processing" , "Shipped" , "Deliverd" , "Cancelled"],
          },
        },
       
        { timestamps: true } // Automatically add `createdAt` and `updatedAt` fields
      );
      
    //   // Pre-save hook to set `deliveredAt` when `isDelivered` is true
    //   orderSchema.pre("save", function (next) {
    //     if (this.isDelivered && !this.deliveredAt) {
    //       this.deliveredAt = new Date();
    //     }
    //     next();
    //   });
      




      const Order = mongoose.model("Order", orderSchema);

      module.exports = Order;
      