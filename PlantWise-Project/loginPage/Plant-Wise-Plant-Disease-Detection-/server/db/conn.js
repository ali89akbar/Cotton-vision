require('dotenv').config();  // Make sure this is at the top to load environment variables

const mongoose = require("mongoose");

const DB = process.env.DATABASE;

// Log the database URI to verify it's correctly loaded
console.log("Mongo URI:", DB);  // This should print the Mongo URI or undefined if there's an issue

if (!DB) {
    console.error("Error: DATABASE environment variable is missing.");
    process.exit(1);  // Exit the process if the DB URI is not set
} else {
    mongoose.connect(DB, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.log("Error connecting to database:", err));
}
