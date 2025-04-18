
// Sample user routes for the backend

const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/profile/image', userController.uploadProfileImage);
router.put('/password', userController.updatePassword);
router.delete('/account', userController.deleteAccount);

// Admin routes - restricted to admin role
router.use(authController.restrictTo('admin'));
router.get('/', userController.getAllUsers);

module.exports = router;
