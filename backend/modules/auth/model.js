import mongoose, { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {

    image: {
      src:  String,
      id: String
    },
    
    fullname: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    accessRole: {
      type: String,
      default: 'user'
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["admin", "user", "support", "super"],
      default: "user",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      default: true,
    },

    loginFailAttempt: {
      type: Number,
      default: 0,
    },

    config: {
      notification: {
        email: {
          type: Boolean,
          default: true
        },
        sms: {
          type: Boolean,
          default: true
        },
        inApp: {
          type: Boolean,
          default: true
        }
      },
    },

    lastLogin: Date,
  },

  {
    timestamps: true,
  },
);

UserSchema.index({ createdAt: -1 });

export default model("busypilot-user", UserSchema);