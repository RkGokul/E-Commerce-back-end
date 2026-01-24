const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const migrateCategories = async () => {
    try {
        const result = await Product.updateMany(
            { category: 'Jewelry' },
            { $set: { category: 'Jewellery' } }
        );
        console.log(`Migrated ${result.modifiedCount} products from 'Jewelry' to 'Jewellery'`);

        const categories = await Product.distinct('category');
        console.log('Current Categories:', categories);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

migrateCategories();
