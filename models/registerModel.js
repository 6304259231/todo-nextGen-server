import mongoose from "mongoose";

const registerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required : true
  },
  lastName: {
    type: String,
    required : true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
  },
  
  mobile: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  city: {
    type: String,
    required: [true, 'Address is required'],
  },
  dob : {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  password: {
    type: String,
    required: true,
  },
});

const registerModel = mongoose.model("User", registerSchema);
export default registerModel;