const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const createAdminUser = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'rkadmin@gmail.com' });

        if (adminExists) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'rkadmin@gmail.com',
            password: 'Rk@gokul1913',
            phone: '7550351360',
            isAdmin: true,
            address: {
                street: 'Admin Street',
                city: 'Admin City',
                state: 'Admin State',
                pincode: '123456',
                country: 'India',
            },
        });

        console.log(admin);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    }
};

createAdminUser();
