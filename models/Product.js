const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please provide product description'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        min: 0,
    },
    category: {
        type: String,
        required: [true, 'Please provide product category'],
        enum: ['Jewelry', 'Jewellery', 'Sarees', 'Stationery'],
    },
    subcategory: {
        type: String,
        trim: true,
    },
    images: [{
        type: String,
    }],
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        count: {
            type: Number,
            default: 0,
        },
    },
    featured: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for search and filter
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
