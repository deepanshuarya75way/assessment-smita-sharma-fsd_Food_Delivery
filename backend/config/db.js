import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      process.env.MONGO_URL || "mongodb+srv://smitanimmi_db_user:gbvrhEY60gkeBltn@clustor0.jakfxk8.mongodb.net/fooddelivery?appName=Clustor0"
    )
    .then(() =>console.log("mongoDB Connected"));
};
