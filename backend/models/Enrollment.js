import mongoose from 'mongoose';
const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  contactName: { type: String, default: '', trim: true },
  contactEmail: { type: String, default: '', lowercase: true, trim: true },
  contactPhone: { type: String, default: '', trim: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  paymentReference: { type: String, default: '' }
}, { timestamps: true });
export default mongoose.model('Enrollment', enrollmentSchema, 'opentech_enrollments');
