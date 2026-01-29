const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');
const connectDB = require('./config/db');

dotenv.config();

const checkOrders = async () => {
    try {
        await connectDB();
        const count = await Order.countDocuments();
        const orders = await Order.find().limit(5);
        console.log(`Total orders in DB: ${count}`);
        if (count > 0) {
            console.log('Sample orders:', JSON.stringify(orders, null, 2));
        } else {
            console.log('No orders found in database.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error checking orders:', error);
        process.exit(1);
    }
};

checkOrders();
