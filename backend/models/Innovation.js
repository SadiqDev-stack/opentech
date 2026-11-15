import mongoose from 'mongoose';
const innovationSchema = new mongoose.Schema({
  title: { ha: { type: String, required: true }, en: { type: String, required: true } },
  description: { ha: { type: String, required: true }, en: { type: String, required: true } },
  category: { type: String, required: true },
  image: { type: String, required: true },
  slug: { type: String, unique: true },
  archived: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Innovation', innovationSchema, 'opentech_innovations');
