const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const checkCategories = async () => {
    try {
        const categories = await Product.distinct('category');
        console.log('Categories in DB:', categories);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkCategories();
