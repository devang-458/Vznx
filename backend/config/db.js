const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Already connected to MongoDB');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 20000,
            retryWrites: true,
            w: 'majority'
        });
        isConnected = true;
        console.log('MongoDB connected successfully');
        return true;
    } catch (err) {
        console.log('Error connecting to MongoDB (server will continue running without DB):', err.message);
        return false;
    }
};

module.exports = connectDB;
