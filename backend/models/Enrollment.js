import mongoose from 'mongoose';
const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  paymentReference: { type: String, default: '' }
}, { timestamps: true });
export default mongoose.model('Enrollment', enrollmentSchema, 'opentech_enrollments');
