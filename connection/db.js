const mongoose = require("mongoose");

const connection = async () => {
    try {
        const db = await mongoose.connect("mongodb://localhost:27017/users");
        return "Connected successfully to database";
    } catch (e) {
        return "Some error occured please try again later."
    }
}


module.exports = { connection };