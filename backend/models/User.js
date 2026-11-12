import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '', trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  emailVerified: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  loginToken: { type: String, default: null },
  loginTokenExpires: { type: Date, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpires: { type: Date, default: null }
}, { timestamps: true });
userSchema.methods.toSafeJSON = function() { return { id: this._id, fullName: this.fullName, email: this.email, phone: this.phone, role: this.role }; };
export default mongoose.model('User', userSchema);
