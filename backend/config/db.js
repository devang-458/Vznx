const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 20000, // 20s timeout
        }
        );
        console.log('MongoDB connected')
    } catch (err) {
        console.log('Error connecting to mongodb', err)
        process.exit(1);
    }
}

module.exports = connectDB; 