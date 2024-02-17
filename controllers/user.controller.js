const { userModel } = require("../models/user.model");
const express = require("express");
const router = express.Router();
const fs = require("fs");
const data = require("../")


router.get("", async (req, res) => {
    try {
        const resp = await userModel.find();
        res.status(200).send(resp);
    } catch (err) {
        res.send("Some error occured", err)
    }
});

router.get("/:id", async (req, res) => {
    try {
        const resp = await userModel.findOne({ "id": { "$eq": req.params.id } });
        res.status(200).send(resp);
    } catch (err) {
        res.send("Some error occured", err)
    }
});


router.post("/add", async (req, res) => {
    console.log(req.body);
    try {
        const resp = await userModel.create(JSON.stringify(req.body));
        console.log(resp);
        res.send("User added successfully");
    } catch (err) {
        res.send("Some error occured", err)
    }
})

router.patch("/:id", async (req, res) => {
    console.log(req.body);
    try {
        const resp = await userModel.findOneAndUpdate(
            { "id": { "$eq": req.params.id } },
            { $set: req.body },
            { new: true }
        );
        console.log(resp);
        res.status(201).send("User added successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send("Some error occured")
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const resp = (await userModel.deleteOne({ "id": { "$eq": req.params.id } }))
        if (resp.deletedCount == 1) {
            res.status(200).send("Deleted Successfully")
        } else {
            res.status(404).send("Data not found")
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Some error occured")
    }
})

router.post("/addMany", async (req, res) => {
    const data = fs.readFileSync("MOCK_DATA.json").toString();
    try {
        const db = await userModel.insertMany(JSON.parse(data));
        if (db) res.send("added");
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
})



router.post("/addFile", (req, res) => {
    res.status(200).send("Hello")
})

module.exports = router;

