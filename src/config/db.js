require("dotenv").config();
//MongoDB Connection using Mongoose
const mongoose = require("mongoose");

const dbURL = process.env.DATABASE_URL;
const TEST = process.env.NODE_ENV || "no-test";

const connectDB = async () => {
    await mongoose.connect(dbURL).then(() => {
        if (TEST === "no-test") {
            console.log("DB Connected");
        }
    }).catch((err) => {
        console.log(err);
    })
}


module.exports = connectDB;