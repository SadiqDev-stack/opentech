import mongoose from 'mongoose';
const requestSchema = new mongoose.Schema({
  requestNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, default: 0 },
  attachmentUrl: { type: String, default: '' },
  status: { type: String, enum: ['submitted', 'pending', 'completed', 'cancelled'], default: 'submitted' }
}, { timestamps: true });
export default mongoose.model('InnovationRequest', requestSchema, 'opentech_innovation_requests');
