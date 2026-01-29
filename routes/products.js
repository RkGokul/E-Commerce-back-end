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
// @desc    Get all products with filters and pagination
// @access  Public
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/products hit with query:', req.query);
        const { category, search, minPrice, maxPrice, sort } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};

        // Category filter
        if (category) {
            query.category = category;
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

        const totalCount = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            count: products.length,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: products,
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
        console.log('Creating product with data:', {
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            imageSize: req.body.image ? req.body.image.length : 0
        });

        // Convert single image field to images array
        const productData = { ...req.body };
        if (req.body.image) {
            productData.images = [req.body.image];
            delete productData.image; // Remove the single image field
        }

        const product = await Product.create(productData);

        res.status(201).json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error('Product creation error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            details: error.errors ? Object.keys(error.errors) : 'Unknown'
        });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        // Convert single image field to images array if provided
        const updateData = { ...req.body };
        if (req.body.image) {
            updateData.images = [req.body.image];
            delete updateData.image; // Remove the single image field
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
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

// @route   DELETE /api/products/delete-all
// @desc    Delete all products
// @access  Private/Admin
router.delete('/delete-all', protect, admin, async (req, res) => {
    try {
        await Product.deleteMany({});
        res.json({ success: true, message: 'All products deleted successfully' });
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

// Sample products data for seeding
const sampleProducts = [
    // Jewelry Products
    {
        name: 'Gold Plated Necklace Set',
        description: 'Beautiful gold plated necklace with matching earrings. Perfect for weddings and special occasions.',
        price: 2499,
        originalPrice: 3500,
        category: 'Jewellery',
        subcategory: 'Necklace',
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500'],
        features: ['24k Gold Plated', 'Matching Earrings included', 'Premium Craftsmanship', 'Elegant Design'],
        stock: 25,
        newArrival: true,
        newArrivalDate: new Date(),
        ratings: { average: 4.5, count: 120 },
    },
    {
        name: 'Diamond Studded Earrings',
        description: 'Elegant diamond studded earrings with 18k gold finish.',
        price: 3999,
        category: 'Jewellery',
        subcategory: 'Earrings',
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500'],
        stock: 15,
        newArrival: false,
        ratings: { average: 4.8, count: 85 },
    },
    {
        name: 'Silver Bracelet',
        description: 'Pure silver bracelet with intricate design work.',
        price: 1299,
        category: 'Jewellery',
        subcategory: 'Bracelet',
        images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500'],
        stock: 30,
        newArrival: false,
        ratings: { average: 4.2, count: 65 },
    },
    {
        name: 'Pearl Pendant Set',
        description: 'Classic pearl pendant with chain and earrings.',
        price: 1899,
        category: 'Jewellery',
        subcategory: 'Pendant',
        images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500'],
        stock: 20,
        newArrival: false,
        ratings: { average: 4.6, count: 95 },
    },
    {
        name: 'Traditional Bangles Set',
        description: 'Set of 6 traditional gold plated bangles.',
        price: 1599,
        category: 'Jewellery',
        subcategory: 'Bangles',
        images: ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500'],
        stock: 40,
        newArrival: false,
        ratings: { average: 4.3, count: 110 },
    },

    // Sarees Products
    {
        name: 'Banarasi Silk Saree',
        description: 'Pure Banarasi silk saree with golden zari work. Traditional and elegant.',
        price: 4999,
        originalPrice: 8500,
        category: 'Sarees',
        subcategory: 'Silk',
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500'],
        features: ['Pure Banarasi Silk', 'Golden Zari Work', 'Includes Blouse Piece', 'Traditional Design'],
        stock: 12,
        newArrival: true,
        newArrivalDate: new Date(),
        ratings: { average: 4.9, count: 150 },
    },
    {
        name: 'Cotton Saree with Blouse',
        description: 'Comfortable cotton saree perfect for daily wear with matching blouse piece.',
        price: 899,
        category: 'Sarees',
        subcategory: 'Cotton',
        images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500'],
        stock: 50,
        newArrival: false,
        ratings: { average: 4.1, count: 200 },
    },
    {
        name: 'Georgette Saree',
        description: 'Lightweight georgette saree with beautiful prints.',
        price: 1299,
        category: 'Sarees',
        subcategory: 'Georgette',
        images: ['https://images.unsplash.com/photo-1606800052052-a08af7148866?w=500'],
        stock: 35,
        newArrival: false,
        ratings: { average: 4.4, count: 88 },
    },


    // Stationery Products
    {
        name: 'Premium Notebook Set',
        description: 'Set of 5 premium quality notebooks with 200 pages each.',
        price: 499,
        category: 'Stationery',
        subcategory: 'Notebooks',
        images: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500'],
        stock: 100,
        newArrival: false,
        ratings: { average: 4.3, count: 250 },
    },

    {
        name: 'Sticky Notes Pack',
        description: 'Colorful sticky notes pack with 6 different colors.',
        price: 199,
        category: 'Stationery',
        subcategory: 'Office Supplies',
        images: ['https://images.unsplash.com/photo-1590859808308-3d2d9c515b1a?w=500'],
        stock: 200,
        newArrival: false,
        ratings: { average: 4.0, count: 140 },
    },
    {
        name: 'Desk Organizer Set',
        description: 'Wooden desk organizer with multiple compartments.',
        price: 799,
        category: 'Stationery',
        subcategory: 'Office Supplies',
        images: ['https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=500'],
        stock: 60,
        newArrival: false,
        ratings: { average: 4.4, count: 90 },
    },
];

// @route   POST /api/products/seed
// @desc    Seed database with sample products
// @access  Private/Admin
router.post('/seed', protect, admin, async (req, res) => {
    try {
        // Fix category name mismatch: 'Jewelry' in seed vs 'Jewellery' in frontend
        // We will map 'Jewelry' to 'Jewellery' for consistency with frontend tabs
        const adjustedProducts = sampleProducts.map(p => ({
            ...p,
            category: p.category === 'Jewelry' ? 'Jewellery' : p.category
        }));

        await Product.insertMany(adjustedProducts);
        res.json({ success: true, message: 'Database seeded successfully', count: adjustedProducts.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
