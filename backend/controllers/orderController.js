import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import Discount from "../models/discountModel.js";
import foodModel from "../models/foodModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const frontendUrl =
  process.env.FRONTEND_URL || "https://food-delivery-frontend-fl09.onrender.com";

// placing user order for frontend
const placeOrder = async (req, res) => {

  const {items, address}=req.body;
  const city=address?.city?.trim().toLowerCase();
  if(!city|| !Array.isArray(items) ||!items.length){
    return res.status(400).json({
      success:false,
      message:"valid address and items are required",
    });
  }
  let subtotal=0;
  for(const item of items){
    const food =await foodModel.findById(item_id);
    if(
      !food||
      !Number.isInteger(item.quantity) || item.quantity<=0
    ){
      return res.status(400).json({
        success:false,
        message:"invalid item cart",
      }
      );
    }
    subtotal+=Number(food.price)*item.quantity;
  }


  const discountRule=await Discount.findOne({
    city,
    isActive:true,
  });
  const percentage=discountRule?.percentage??0;
  const discountAmount=Math.round(subtotal*percentage)/100;

  const deliveryFee=40;

  const finalTotal=
  Math.round((subtotal-discountAmount+deliveryFee)*100)/100;

  const order=new orderModel({
    userId:req.body.userId,
    items, address,subtotal,discountPercentage:percentage,discountAmount, deliveryFee, amount:finalTotal
  });
  await order.save();

  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontendUrl}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontendUrl}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success == "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Listing orders for admin pannel
const listOrders = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const orders = await orderModel.find({});
      res.json({ success: true, data: orders });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// api for updating status
const updateStatus = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await orderModel.findByIdAndUpdate(req.body.orderId, {
        status: req.body.status,
      });
      res.json({ success: true, message: "Status Updated Successfully" });
    }else{
      res.json({ success: false, message: "You are not an admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }

  const city =req.body.address?.city?.trim().toLowerCase();
  const discount=await Discount.findOne({
    city,isActive:true,
  })
 const percentage=discount?.percentage||0;
 const discountAmount=Math.round(subtotal*percentage)/100;
 const finalAmount=subtotal-discountAmount+deliveryFee;


};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
