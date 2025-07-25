
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;

mongoose.connect(MONGO_URL, {
    dbName : DB_NAME,
}).then(()=>{
    console.log('Connected to the database')
}).catch((err)=>{
    console.log('Error connecting to the database',err)
})