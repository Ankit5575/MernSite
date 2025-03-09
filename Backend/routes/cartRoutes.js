const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const {protect} = require("../middleware/authMiddleware")

const router = express.Router();

// Helper function to get a cart by user ID or guest ID
const getCart = async (userId, guestId) => {
  if (userId) {
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guestId });
  }
};

router.post("/", async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check if the user already has a cart
    let cart = await getCart(userId, guestId);

    if (cart) {
      // Find product in cart
      const productIndex = cart.products.findIndex(
        (p) =>
          p.productId.toString() === productId &&
          p.size === size &&
          p.color === color
      );

      if (productIndex > -1) {
        // If product exists, update quantity
        cart.products[productIndex].quantity += quantity;
      } else {
        // Add new product to cart
        cart.products.push({
          productId,
          name: product.name,
          image: product.images[0]?.url || "", // Handle case where no image exists
          price: product.price,
          size,
          color,
          quantity,
        });
      }

      // Recalculate total price
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await cart.save();
      return res.status(200).json(cart);
    } else {
      // ✅ Create a new cart and ensure `user` field is correctly assigned
      const newCart = await Cart.create({
        user: userId || null, // Ensure userId is saved properly
        guestId: guestId ? guestId : "guest_" + new Date().getTime(),
        products: [
          {
            productId,
            name: product.name,
            image: product.images[0]?.url || "",
            price: product.price,
            size,
            color,
            quantity,
          },
        ],
        totalPrice: product.price * quantity,
      });

      return res.status(201).json(newCart);
    }
  } catch (error) {
    console.error("Error creating/updating cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});


//ruout put /api/cart 
//desc update product qunaity 

router.put("/" , async(req, res)=>{
  const {productId , quantity , size , color , guestId , userId} = req.body;
   try {
    let cart = await getCart(userId , guestId);
    if(!cart) return res.status(404).json({message:"cart not found"})
      const productIndex = cart.products.findIndex(
      (p)=>p.productId.toString() ===productId && p.size ===size && p.color === color
      
      )
      if(productIndex > -1){
        if(quantity > 0){
          cart.products[productIndex].quantity = quantity;
          
        }
        else{
          cart.products.splice(productIndex , 1)//Remvoe form the cart 
        }
        cart.products.reduce((acc ,item)=> acc + item.price * item.quantity , 0)
        await cart.save()
        return res.status(200).json(cart)
      }else{
        return res.status(404).json({message : "product not found "})
      }
   } catch (error) {
    console.error(error)
    return res.status(500).json({message: "server error hai bahi "})
    
   }
})



router.delete("/" , async (req , res)=>{
  const {productId , size , color , guestId , userId} = req.body;
  try {
    let cart = await getCart(userId ,guestId)
    if(!cart) return res.status(404).json({message : "cart not found "})
      const productIndex = cart.products.findIndex(
    (p)=> p.productId.toString() === productId && p.size === size && p.color === color
    )
    if(productIndex > -1){
      cart.products.splice(productIndex , 1)
      cart.totalPrice = cart.products.reduce(
        (acc ,item)=>acc + item.price * item.quantity, 0
      )
      await cart.save()
      return res.status(200).json(cart)
    }else {
      return res.status(404).json({message : "product not ound "})
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({message : "serverr errrro ahi bhai yaha "})
  }
})



//get /api cat 
router.get("/" , async(req , res)=>{
  const {userId , guestId} = req.body;
  try {
    const cart = await getCart(userId ,guestId)
    if(cart){
      res.json(cart)
    }else{
      res.status(400).json({message : "cart not found"})
    }
    
  } catch (error) {
    console.error(error
    )
    res.status(500).json({message : "serve errro hai "})

  }
})


//route post/api/cart/merege

router.post("/merge", protect, async (req, res) => {
  const { guestId } = req.body;

  try {
    // Find the guest cart and user cart
    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: req.user._id });

    if (!guestCart || guestCart.products.length === 0) {
      return res.status(400).json({ message: "Guest cart is empty or not found" });
    }

    if (!userCart) {
      // If no user cart exists, assign the guest cart to the user
      guestCart.user = req.user._id;
      guestCart.guestId = null;
      await guestCart.save();
      return res.status(200).json({ message: "Guest cart assigned to user", cart: guestCart });
    }

    // Merge guest cart into the user cart
    guestCart.products.forEach((guestItem) => {
      const productIndex = userCart.products.findIndex(
        (item) =>
          item.productId.toString() === guestItem.productId.toString() &&
          item.size === guestItem.size &&
          item.color === guestItem.color
      );

      if (productIndex > -1) {
        // If product exists in user cart, update the quantity
        userCart.products[productIndex].quantity += guestItem.quantity;
      } else {
        // Otherwise, add the guest cart item to user cart
        userCart.products.push(guestItem);
      }
    });

    // Update total price
    userCart.totalPrice = userCart.products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await userCart.save();
    await Cart.findOneAndDelete({ guestId }); // Delete guest cart after merging

    return res.status(200).json({ message: "Cart merged successfully", cart: userCart });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});



module.exports = router;
