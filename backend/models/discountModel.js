import mongoose from "mongoose";


const discountSchema= new mongoose.Schema(
  {
    city:{
      type:String,
      required:true,
      lowercase:true,
      trim:true,
      unique:true,
    },
    percentage:{
      type:Number,
      required:true,
      min:0,
      max:100,
    },
    isActive:{
      type:Boolean,
      default:true,
    },
  },
  {timestamps:true}
);
const Discount= mongoose.model("Discount",discountSchema)

export default Discount