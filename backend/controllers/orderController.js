import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const frontendUrl =
  process.env.FRONTEND_URL || "https://food-delivery-frontend-fl09.onrender.com";

// placing user order for frontend
const placeOrder = async (req, res) => {
  try {
    const totals=CalculateTotals(subtotal, req.body.address);
    const newOrder= new orderModel({
      userId:req.body.userId,
      items: req.body.items,
      address:req.body.address,
      subtotal:totals.subtotal,
      discountAmount: totals.discountAmount,
      deliveryFee:totals.deliveryFee,
      amount:totals.finalAmount,
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
};

import {discountRule} from "../config/discount.js";
const DELIVERY_FEE =2;

const CalculateTotals=(subtotal,address) => {
  const eligible=
  address?.city?.trim().toLowerCase()===discountRule.city.trim().toLowerCase();
  const discountAmount=eligible
  ? Math.round(subtotal*discountRule.percent)/100 :0;
  const finalAmount=subtotal-discountAmount+DELIVERY_FEE;
  return {subtotal,discountAmount , deliveryFee: DELIVERY_FEE, finalAmount}
}

const previewOrder= async(req,res)=>{
  const {items,address}=req.body;
  const subtotal=items.reduce((sum,i) =>sum +i.price*i.quantity,0);
  res.json ({success :true, ...CalculateTotals(subtotal,address)})
};




export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
