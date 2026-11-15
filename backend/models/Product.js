import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: { ha: { type: String, required: true }, en: { type: String, required: true } },
  description: { ha: { type: String, required: true }, en: { type: String, required: true } },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  stock: { type: Number, default: 0 },
  slug: { type: String, unique: true },
  archived: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Product', productSchema, 'opentech_products');
