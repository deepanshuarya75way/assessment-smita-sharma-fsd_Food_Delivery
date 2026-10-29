import express from "express"
import Discount from "../models/discountModel.js"
import { checkDiscount } from "../controllers/discountController.js";
import { calculateDiscount } from "../controllers/discountController.js";
const router=express.Router();
 
router.post("/check",checkDiscount);
router.post("/calculate", calculateDiscount);
router.post("/add",async(req,res)=>{
  try{
    const{
      city,percentage,isActive
    }=req.body;
    const discount=await Discount.create({
      city,percentage,isActive
    });
    res.status(201).json({
      success:true,
      discount,
    });
  }catch(error){
    res.status(400).json({
      success:false,
      message:error.message,
    });
  }
});
export default router;