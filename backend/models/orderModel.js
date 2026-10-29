import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Food Processing" },
  date: { type: Date, default: Date.now() },
  payment: { type: Boolean, default: false },
  subtotal:{ type :Number, required: true,},
  discountPercentage:{ type:Number, default:0},
  discountAmount:{type: Number, default:0},
  deliveryFee:{type:Number,default:0},
  subtotal:{type:Number, default:0}
});

const newOrder= new orderModel({
  userId,items,address,subtotal,discountPercentage:percentage,discountAmount,deliveryFee,amount:finalAmount,
})
await newOrder.save();
const orders= await orderModel.find({userId});
res.json({
  success:true,
  data:orders,
})

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
