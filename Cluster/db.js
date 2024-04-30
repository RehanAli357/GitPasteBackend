const mongoose = require('mongoose');
require('dotenv').config()
const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://rehan:${process.env.PASSWORD}@gitpastebackend.e0f8svq.mongodb.net/GitPaste-RestAPI?retryWrites=true&w=majority&appName=GitPasteBackend`).then(() => {
            console.log("Connected with mongoose ");
        })
    } catch (err) {
        console.log("Error", err);
    }
}

module.exports = connectDB;