import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
  {
   
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
        min: [6,"must be 6 character"],
        max: [16, "max be a 16 character"],
        lowercase: true,

    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true

    },
    fullName: {
        type: String,
        required: true,
        index: true,
    },
    avatar: {
        type: String, 
        required: true
    },
    coverImage: {
        type: String,
        
    },
    watchHistory: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Video",
        },
      ],
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String,

    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function(next) {
    if(!this.isModified("password")) return next();

   try {
     this.password =  await bcrypt.hash(this.password, 10)
     next()
   } catch (error) {
    next(error);
   }
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function(){
    return await jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}
userSchema.methods.generateRefreshToken = async function(){
    return await jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
}

export const User = mongoose.model("User", userSchema);
