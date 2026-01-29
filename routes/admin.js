const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Contact = require('../models/Contact');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalMessages = await Contact.countDocuments();

        const orders = await Order.find();
        const totalRevenue = orders.reduce((acc, item) => acc + item.totalAmount, 0);

        const recentOrders = await Order.find()
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentMessages = await Contact.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                totalOrders,
                totalUsers,
                totalProducts,
                totalMessages,
                totalRevenue,
                recentOrders,
                recentMessages
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
