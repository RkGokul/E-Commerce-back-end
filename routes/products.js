const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/products/new-arrivals
// @desc    Get new arrivals and trending products (sorted by newest first)
// @access  Public
router.get('/new-arrivals', async (req, res) => {
    try {
        const products = await Product.find({})
            .sort({ createdAt: -1 })
            .limit(20);

        console.log('Backend: New Arrivals - Found products count:', products.length);

        res.json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/products
// @desc    Get all products with filters (default: newest first)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, sort, featured } = req.query;

        let query = {};

        // Category filter
        if (category) {
            query.category = category;
        }

        // Featured filter
        if (featured === 'true') {
            query.featured = true;
        }

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Build sort option - DEFAULT: newest first (createdAt: -1)
        let sortOption = { createdAt: -1 }; // Default: newest first
        if (sort === 'price-asc') {
            sortOption = { price: 1 };
        } else if (sort === 'price-desc') {
            sortOption = { price: -1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        } else if (sort === 'rating') {
            sortOption = { 'ratings.average': -1 };
        }

        const products = await Product.find(query).sort(sortOption);
        console.log('Backend: Found products count:', products.length);
        if (products.length > 0) {
            console.log('Backend: First product in result:', products[0].name, 'createdAt:', products[0].createdAt);
        }

        res.json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            success: true,
            message: 'Product deleted',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/products/categories/all
// @desc    Get all categories
// @access  Public
router.get('/categories/all', async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
