const mongoose = require('mongoose');

// Function to Connect to the MongoDB Database
const connectDB = async () => {
    try {

        mongoose.connection.on("connected", () => {console.log("Database Connected Successfully")});

        mongoose.connection.on("error", (err) => {
            console.log("Database Connection Error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("Database Disconnected");
        });

        await mongoose.connect(`${process.env.MONGODB_URL}/Flash-Ai`);
        
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
module.exports = { connectDB };