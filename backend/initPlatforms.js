const mongoose = require('mongoose');
const { Platform } = require('./db/schema');
require('dotenv').config();

const platforms = [
    {
        name: "Codeforces",
        url: "https://codeforces.com/contests",
        logoUrl: "https://codeforces.org/s/0/images/codeforces-sponsored-by-ton.png",
        api_url: "https://codeforces.com/api/contest.list",
        parsing_strategy: "api"
    },
    {
        name: "AtCoder",
        url: "https://atcoder.jp/contests/",
        logoUrl: "https://img.atcoder.jp/assets/atcoder.png",
        api_url: "https://kenkoooo.com/atcoder/resources/contests.json",
        parsing_strategy: "api"
    }
];


async function initializePlatforms() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing platforms
        await Platform.deleteMany({});
        console.log('Cleared existing platforms');

        // Insert new platforms
        const result = await Platform.insertMany(platforms);
        console.log('Platforms initialized:', result);

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error initializing platforms:', error);
        if (error.code === 11000) {
            console.error('Duplicate key error. Some platforms already exist.');
        }
    }
}

initializePlatforms();