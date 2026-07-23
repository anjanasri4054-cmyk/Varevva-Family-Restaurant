import MenuItem from '../models/MenuItem.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Get all menu items
// @route   GET /api/menu
export const getMenuItems = async (req, res, next) => {
  try {
    const menuItems = await MenuItem.find({}).sort({ category: 1, name: 1 });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new menu item
// @route   POST /api/menu
export const createMenuItem = async (req, res, next) => {
  try {
    const { name, category, subCategory, description, price, image, imagePublicId, availability, featured } = req.body;

    if (!name || !category || !price || !image || !imagePublicId) {
      return res.status(400).json({ message: 'Missing required menu fields: name, category, price, image, imagePublicId' });
    }

    const menuItem = await MenuItem.create({
      name,
      category,
      subCategory: subCategory || '',
      description: description || '',
      price: Number(price),
      image,
      imagePublicId,
      availability: availability !== undefined ? availability : true,
      featured: featured !== undefined ? featured : false
    });

    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
export const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, subCategory, description, price, image, imagePublicId, availability, featured } = req.body;

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Delete the old image from Cloudinary if a new image was uploaded
    if (imagePublicId && menuItem.imagePublicId !== imagePublicId) {
      try {
        await cloudinary.uploader.destroy(menuItem.imagePublicId);
        console.log(`Successfully deleted old Cloudinary image: ${menuItem.imagePublicId}`);
      } catch (err) {
        console.error('Failed to clean up old image in Cloudinary:', err.message);
      }
    }

    menuItem.name = name !== undefined ? name : menuItem.name;
    menuItem.category = category !== undefined ? category : menuItem.category;
    menuItem.subCategory = subCategory !== undefined ? subCategory : menuItem.subCategory;
    menuItem.description = description !== undefined ? description : menuItem.description;
    menuItem.price = price !== undefined ? Number(price) : menuItem.price;
    menuItem.image = image !== undefined ? image : menuItem.image;
    menuItem.imagePublicId = imagePublicId !== undefined ? imagePublicId : menuItem.imagePublicId;
    menuItem.availability = availability !== undefined ? availability : menuItem.availability;
    menuItem.featured = featured !== undefined ? featured : menuItem.featured;

    const updatedItem = await menuItem.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
export const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Delete image from Cloudinary
    try {
      await cloudinary.uploader.destroy(menuItem.imagePublicId);
      console.log(`Successfully deleted Cloudinary image: ${menuItem.imagePublicId}`);
    } catch (err) {
      console.error('Failed to delete image from Cloudinary:', err.message);
    }

    await menuItem.deleteOne();
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
