const express = require("express");
const app = express();
const router = express.Router();
const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { userModel } = require("../models/user.model");
const jwt = require('jsonwebtoken');


app.use(express.json());


router.post('/login', async (req, res) => {
    console.log(req.body.password,"hitting");
    try {
        const user = await userModel.findOne({ "email": { "$eq": req.body.email } })
        console.log(user);
        if(user == null){
            res.status(404).send('User not found');
            return;
        }
        const check = bcryptjs.compareSync(req.body.password, user.password);
        const secretKey = "demoSecret"
        if (check) {
            const jwtToken = jwt.sign(req.body, secretKey, { expiresIn: '1h' });
            console.log(jwtToken);
            return res.status(200).send({"token":`Bearer ${jwtToken}`});
        } else {
            return res.status(400).send('Invalid credentials')
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Some error occured please try again later");
    }
})



router.get("/signup", async (req, res) => {
    try {
        if (!req.body.password || !req.body.email) {
            res.status(402).send("Please check password and email")
        }
        const salt = bcryptjs.genSaltSync(10);
        const saltedPass = bcryptjs.hashSync(req.body.password, salt);
        const data = {
            name: `sampleName${Math.random() * 1000}`,
            age: Math.floor(Math.random() * 100),
            email: req.body.email,
            experience: Math.floor(Math.random() * 50),
            id: uuidv4(),
            domain: `sampleDomain${Math.random() * 1000}`,
            image: `sampleImage${Math.random() * 1000}`,
            password: saltedPass
        };
        const apiResp = await userModel.create(data);
        if (apiResp) {
            res.status(201).send("User Added Successfully");
        }
    } catch (err) {
        console.log("err");
        res.status(500).send("Some error occured")
    }
})


module.exports = router;