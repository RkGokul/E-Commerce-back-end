const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const sampleProducts = [
    // Jewelry Products
    {
        name: 'Gold Plated Necklace Set',
        description: 'Beautiful gold plated necklace with matching earrings. Perfect for weddings and special occasions.',
        price: 2499,
        originalPrice: 3500,
        category: 'Jewelry',
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
        category: 'Jewelry',
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
        category: 'Jewelry',
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
        category: 'Jewelry',
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
        category: 'Jewelry',
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

const seedDatabase = async () => {
    try {
        // Clear existing products
        await Product.deleteMany();
        console.log('Existing products deleted');

        // Insert sample products
        await Product.insertMany(sampleProducts);
        console.log('Sample products added successfully');

        console.log(`Total products: ${sampleProducts.length}`);
        console.log('Database seeded!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
