
// This is a sample backend controller file that would be used on the server side
// showing user profile management functionality with optimized MongoDB queries

const User = require('../models/User');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const bcrypt = require('bcryptjs');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // Use lean() for improved query performance when we don't need a fully-fledged Mongoose document
    const user = await User.findById(req.user.id).lean().select('-password -resetPasswordToken -resetPasswordExpire');
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving the profile'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    // Check if user is trying to update password
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'This route is not for password updates. Please use /updatePassword.'
      });
    }

    // Filter out fields that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email', 'profileImage');

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true, // Return updated document
        runValidators: true, // Run validators on update
        select: '-password -resetPasswordToken -resetPasswordExpire' // Exclude sensitive fields
      }
    );

    res.status(200).json({
      status: 'success',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating the profile'
    });
  }
};

// Helper function to filter object
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload a file'
      });
    }

    // Check file type
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(req.file.originalname).toLowerCase());
    const mimetype = fileTypes.test(req.file.mimetype);

    if (!extname || !mimetype) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload an image file (jpeg, jpg, png, gif)'
      });
    }

    // Check file size (limit to 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        status: 'fail',
        message: 'Image must be less than 5MB'
      });
    }

    // In a real app, process image and save to cloud storage
    // For this example, we'll assume the file is saved and return a URL
    const imageUrl = `/uploads/${req.file.filename}`;

    // Update user profile with new image URL
    await User.findByIdAndUpdate(req.user.id, { profileImage: imageUrl });

    res.status(200).json({
      status: 'success',
      imageUrl
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while uploading the image'
    });
  }
};

// Change password
exports.updatePassword = async (req, res) => {
  try {
    // Get user from collection with password
    const user = await User.findById(req.user.id).select('+password');

    // Check if current password is correct
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = req.body.newPassword;
    await user.save();

    // Log user in, send JWT
    createSendToken(user, 200, res);
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating the password'
    });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    // In a real application, you might want to implement soft delete
    // rather than actually removing the user from the database
    await User.findByIdAndUpdate(req.user.id, { active: false });

    // Clear JWT cookie
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while deleting the account'
    });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Create query
    const query = User.find({ active: { $ne: false } });

    // Apply pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Execute query with pagination and projection optimization
    const users = await query
      .skip(skip)
      .limit(limit)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .lean(); // Using lean() for performance on read-only operations

    // Get total count for pagination metadata
    const totalUsers = await User.countDocuments({ active: { $ne: false } });

    res.status(200).json({
      status: 'success',
      results: users.length,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving users'
    });
  }
};

// Helper function to create and send JWT token
const createSendToken = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // Set token expiry
  const cookieExpiresIn = process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000;

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresIn),
    httpOnly: true, // Cookie cannot be accessed or modified by browser
    secure: process.env.NODE_ENV === 'production', // Cookie will only be sent on HTTPS
    sameSite: 'strict' // Protection against CSRF attacks
  };

  // Set HTTP-only cookie
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  // Send response
  res.status(statusCode).json({
    status: 'success',
    token, // For mobile clients or testing (not used by web frontend)
    user
  });
};
