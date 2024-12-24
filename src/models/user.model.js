import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  fullname: {
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
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    select: false,
    required: [true, "Password is required"],
  },
  refreshToken: {
    type: String,
   
  },
  socketId: {
    type: String,
    default: null,
  },
  },
  {timestamps: true}
);

userSchema.pre("save",async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10)
    }
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
  if (!this.password) {
    throw new Error('No password found for this user');
  }
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this.id,     
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:  process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
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

export const User =  mongoose.model('User', userSchema);
