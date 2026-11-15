import mongoose from 'mongoose';
const courseSchema = new mongoose.Schema({
  title: { ha: { type: String, required: true }, en: { type: String, required: true } },
  description: { ha: { type: String, required: true }, en: { type: String, required: true } },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  duration: { type: String, required: true },
  telegramLink: { type: String, default: '' },
  slug: { type: String, unique: true },
  archived: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Course', courseSchema, 'opentech_courses');
