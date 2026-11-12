import mongoose from 'mongoose';
const paymentSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  type: { type: String, enum: ['order', 'enrollment'], required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });
export default mongoose.model('Payment', paymentSchema, 'opentech_payments');
