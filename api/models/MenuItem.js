import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  subCategory: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  price: { type: Number, required: true },
  image: { type: String, required: true }, // Cloudinary secure URL
  imagePublicId: { type: String, required: true }, // Necessary to delete images from Cloudinary
  availability: { type: Boolean, default: true },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('MenuItem', menuItemSchema);
