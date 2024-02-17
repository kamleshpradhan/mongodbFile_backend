const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    experience: { type: Number, required: true },
    id: { type: String, required: true },
    domain: { type: String, required: true },
    image: { type: String },
    password: { type: String, required: true }
}, {
    timestamps: true,
});

const fileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    createdAt: { type: Date, required: true },
    fileId: { type: ObjectId, required: true },
    userId: { type: String, required: true }
})



const userModel = mongoose.model('User', userSchema);
const fileModel = mongoose.model('FileModel', fileSchema);


module.exports = { userModel, fileModel };