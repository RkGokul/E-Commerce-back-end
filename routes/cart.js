const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', protect, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            // Create new cart
            cart = await Cart.create({
                user: req.user._id,
                items: [{
                    product: productId,
                    quantity,
                    price: product.price,
                }],
            });
        } else {
            // Check if product already in cart
            const itemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (itemIndex > -1) {
                // Update quantity
                cart.items[itemIndex].quantity += quantity;

                // Check stock again
                if (product.stock < cart.items[itemIndex].quantity) {
                    return res.status(400).json({ message: 'Insufficient stock' });
                }
            } else {
                // Add new item
                cart.items.push({
                    product: productId,
                    quantity,
                    price: product.price,
                });
            }

            await cart.save();
        }

        cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/cart/update
// @desc    Update item quantity in cart
// @access  Private
router.put('/update', protect, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:productId', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== req.params.productId
        );

        await cart.save();

        const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        res.json({
            success: true,
            data: updatedCart,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = [];
        await cart.save();

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
