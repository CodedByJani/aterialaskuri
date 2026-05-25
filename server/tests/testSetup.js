const path = require('path')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const DailyStat = require('../models/DailyStat')

dotenv.config({
    path: path.resolve(process.cwd(), '.env.test')
})

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST)
    console.log("Connected DB:", mongoose.connection.name);
}

const closeDB = async () => {
    await mongoose.connection.close()
}

const clearDB = async () => {
    await DailyStat.deleteMany({})
}

const createToken = () => {
    return jwt.sign(
        { email: "testi@testi.fi" },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    )
}

module.exports = {
    connectDB,
    closeDB,
    clearDB,
    createToken
}