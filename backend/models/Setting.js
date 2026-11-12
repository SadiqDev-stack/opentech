import mongoose from 'mongoose';
const settingSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  paystackPublicKey: { type: String, default: '' },
  paystackSecretKey: { type: String, default: '' },
  cloudinaryCloudName: { type: String, default: '' },
  cloudinaryApiKey: { type: String, default: '' },
  cloudinaryApiSecret: { type: String, default: '' },
  ebulkSmsUsername: { type: String, default: '' },
  ebulkSmsApiKey: { type: String, default: '' }
}, { timestamps: true });
export default mongoose.model('Setting', settingSchema);
