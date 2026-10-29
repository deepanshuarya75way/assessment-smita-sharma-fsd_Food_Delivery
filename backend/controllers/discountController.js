import Discount from "../models/discountModel.js";

export const checkDiscount=async (req,res)=>{
  try{
    const{city}=req.body;
    if(!city||typeof city!=="string"){
      return res.status(400).json({
        success:false,
        message:"city is required",
      });
    }
    const discount = await Discount.findOne({
      city:city.trim().toLowerCase(),
      isActive:true,
    });
    return res.json({
      success:true,
      eligible:!!discount,
      percentage:discount?.percentage ||0
    });
  }catch(error){
    return res.status(500).json({
      success:false,
      message:error.message,
    });
  }
};

export const calculateDiscount= async(req,res)=>{
  try{
    const {city,subtotal,deliveryFee}=req.body;
    if(typeof city!=="string"|| !city.trim() ||
    typeof subtotal<0 ||
    !Number.isFinite(subtotal)||
    typeof deliveryFee!=="number"||
    deliveryFee<0||
    !Number.isFinite(deliveryFee)
   ){
    return res.status(400).json({
      success:false,
      message:"invalid city,subtotal or delivery fee"
    });
   }

   const discount=await Discount.findOne({
    city:city.trim().toLowerCase(),
    isActive:true,
   });

   const percentage=discount?.percentage||0;
   const discountAmount=Math.round((subtotal-discountAmount+deliveryFee)*100)/100;
   return res.json({
    success:true,
    subtotal,percentage,discountAmount,deliveryFee,finalTotal
   });

  }
  catch (error){
    return res.status(500).json({
      success:false,
      message:error.message,
    });
  }
};
