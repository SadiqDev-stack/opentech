import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  contactName: { type: String, default: '', trim: true },
  contactEmail: { type: String, default: '', lowercase: true, trim: true },
  contactPhone: { type: String, default: '', trim: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  deliveryStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  paymentReference: { type: String, default: '' }
}, { timestamps: true });
export default mongoose.model('Order', orderSchema, 'opentech_orders');
