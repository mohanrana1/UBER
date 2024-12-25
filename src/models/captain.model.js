import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const captainSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            index: true,
        },
        fullName: {
            firstname: {
              type: String,
              required: [true, "First name is required"],
              minlength: [3, "First name should be at least 3 characters"],
            },
            lastname: {
              type: String,
              minlength: [3, "Last name should be at least 3 characters"],
            },
          },
        email : {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, 'is invalid'],
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        refreshToken: {
            type: String,
      },
      socketId: {
        type: String,
        default: null,
      },
      status: {
        type: String,
        enum: ["active", "inactive"],   
        default: "active",        
      },
      vechile: {
        color: {
          type: String,
          required: true,
          minLength: [3, "Color should be at least 3 characters"],
      },
      plate: {
          type: String,
          required: true,
          unique: true,   
          minLength: [3, "Plate should be at least 3 characters"],
      },
      capacity: {
          type: Number,
          required: true,
          minLength: [1, "Capacity should be at least 1 characters"],
      },
      vechileType: {
          type: String,
          required: true,
          enum: ["car", "motorcycle", "auto"],
      },
      }
    },
    {timestamps: true}
);

captainSchema.pre("save", async function(next){
  if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

captainSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}


captainSchema.methods.generateAccessToken = function (){
  return jwt.sign(
       {
           _id: this.id,
           email: this.email,
           username: this.username,
           fullName: this.fullName
       },
       process.env.ACCESS_TOKEN_SECRET,
       {
           expiresIn: process.env.ACCESS_TOKEN_EXPIRY
       }
   )
}


captainSchema.methods.generateRefreshToken = function (){
   return jwt.sign(
       {
           _id: this.id,      
       },
       process.env.REFRESH_TOKEN_SECRET,
       {
           expiresIn: process.env.ACCESS_TOKEN_EXPIRY
       }
   )
}


export const Captain = mongoose.model("Captain", captainSchema);