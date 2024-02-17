const { fileModel, userModel } = require("../models/user.model");
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');




const authUser = async (req, res, next) => {
    const secretKey = "demoSecret"
    try {
        if (req.headers) {
            const token = req.headers.authorization.split(" ")[1];
            if (jwt.verify(token, secretKey)) {
                req.body.email = jwt.verify(token,secretKey).email; 
                    next()
            } else {
                res.status(402).send('Invalid Token')
            }
        }
    } catch (err) {
        res.status(402).send('Invalid Token')
    }
}

router.get("", authUser, async (req, res) => {
    try {
        const user = await userModel.findOne({'email':{'$eq':req.body.email}});
        const resp = await fileModel.find({'userId':{'$eq':user.id}});
        res.status(200).send(resp);
    } catch (err) {
        res.send("Some error occured", err)
    }
});

router.get("/:id", async (req, res) => {
    try {
        const resp = await fileModel.findOne({ "id": { "$eq": req.params.id } });
        res.status(200).send(resp);
    } catch (err) {
        res.send("Some error occured", err)
    }
});


router.delete("/:id", async (req, res) => {
    try {
        // const objId = new ObjectId(req.params.id);
        const resp = await fileModel.findByIdAndDelete(req.params.id)
        if (resp) {
            res.status(200).send("Deleted Successfully")
        } else {
            res.status(404).send("Data not found")
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Some error occured")
    }
});

module.exports = router;

