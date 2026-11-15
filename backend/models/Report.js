import mongoose from 'mongoose';
const reportSchema = new mongoose.Schema({
  reportNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  attachmentUrl: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  adminResponse: { type: String, default: '' }
}, { timestamps: true });
export default mongoose.model('Report', reportSchema, 'opentech_reports');
