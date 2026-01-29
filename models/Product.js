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
    originalPrice: {
        type: Number,
        min: 0,
    },
    category: {
        type: String,
        required: [true, 'Please provide product category'],
        enum: ['Jewellery', 'Sarees', 'Stationery'],
    },
    subcategory: {
        type: String,
        trim: true,
    },
    images: [{
        type: String,
    }],
    features: [{
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
    newArrival: {
        type: Boolean,
        default: false,
    },
    newArrivalDate: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for search and filter
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });

// Virtual field to expose first image as 'image' for frontend compatibility
productSchema.virtual('image').get(function () {
    return this.images && this.images.length > 0 ? this.images[0] : null;
});

// Virtual field to check if product is still a new arrival (within 7 days)
productSchema.virtual('isNewArrival').get(function () {
    if (!this.newArrival || !this.newArrivalDate) return false;

    const daysSinceMarked = (Date.now() - new Date(this.newArrivalDate).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceMarked <= 7;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
