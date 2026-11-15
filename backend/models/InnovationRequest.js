import mongoose from 'mongoose';
const requestSchema = new mongoose.Schema({
  requestNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  contactName: { type: String, default: '', trim: true },
  contactEmail: { type: String, default: '', lowercase: true, trim: true },
  contactPhone: { type: String, default: '', trim: true },
  relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Innovation', default: null },
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, default: 0 },
  attachmentUrl: { type: String, default: '' },
  status: { type: String, enum: ['submitted', 'pending', 'completed', 'cancelled'], default: 'submitted' }
}, { timestamps: true });
export default mongoose.model('InnovationRequest', requestSchema, 'opentech_innovation_requests');
