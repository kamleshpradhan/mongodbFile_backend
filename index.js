const express = require("express");
const { connection } = require("./connection/db")
const app = express();
const userRouter = require("./controllers/user.controller");
const fileRouter = require("./controllers/file.controller");
const authRouter = require("./controllers/auth.controller")
const cors = require("cors");
const fs = require("fs");
const { MongoClient, GridFSBucket, ObjectId } = require("mongodb");
const bodyparser = require("body-parser");
const multer = require("multer");
const { Readable, Writable } = require("stream");
// const upload = multer({ dest: "uploads/" })
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const path = require("path");
const { fileModel, userModel } = require('./models/user.model');
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", async (req, res) => {
    try {
        res.status(200).send("TestRoute")
    } catch (err) {
        console.log("err")
    }
});

function convertfiles() {
    const files = fs.readdirSync("./uploads");
    return files;
}


async function uploadFiles(req, res) {
    const files = convertfiles();
    for (let j of req.files) {
        if (files.includes(j.filename)) {
            const data = fs.readFileSync(`./uploads/${j.filename}`);
            fs.writeFileSync(j.originalname, data)
        }
    }
    res.send("Hello World")
};



// To upload files
app.post('/upload', upload.any("file"), async (req, res) => {
    const { fieldname, encoding, originalname, mimetype, buffer } = req.files[0];
    let email = null;
    const secretKey = "demoSecret";
    try {
        if (req.headers) {
            const token = req.headers.authorization.split(" ")[1];
            if (jwt.verify(token, secretKey)) {
                email = jwt.verify(token, secretKey).email;
            } else {
                res.status(402).send('Invalid Token')
            }
        }
    } catch (err) {
        res.status(402).send('Invalid Token')
    };
    let readBuffer = new Readable();
    readBuffer.push(buffer);
    readBuffer.push(null);
    try {
        const client = await MongoClient.connect("mongodb://localhost:27017/files");
        const db = client.db();
        const bucket = new GridFSBucket(db, { bucketName: "test_bucket" });
        // const fileStream = fs.createReadStream("./image.avif");
        const uploadStream = bucket.openUploadStream(originalname);
        readBuffer.pipe(uploadStream);
        let fileId;
        await new Promise((resolve, reject) => {
            fileId = uploadStream.on('finish', resolve);;
            uploadStream.on('error', reject);
        })
        await client.close();
        try {
            const userData = await userModel.find({ "email": { "$eq": email } });
            const userid = userData[0].id;
            await fileModel.create({
                name: originalname,
                type: mimetype,
                userId: userid,
                fileId: fileId.id.toString(),
                createdAt: new Date().toISOString()
            })
        } catch (err) {
            console.log(err);
        }
        res.status(200).send("File uploaded successfully");
    } catch (err) {
        res.status(500).send("Pleas try again some err occured");
    }
});


// To download files
app.get("/download/:name", async (req, res) => {
    // try {
    //     if (req.headers) {
    //         const token = req.headers.authorization.split(" ")[1];
    //         if (jwt.verify(token, secretKey)) {
    //             email = jwt.verify(token,secretKey).email; 
    //         } else {
    //             res.status(402).send('Invalid Token')
    //         }
    //     }
    // } catch (err) {
    //     console.log(err);
    //     res.status(402).send('Invalid Token')
    // };
    try {
        const client = await MongoClient.connect("mongodb://localhost:27017/files");
        const db = client.db();
        const bucket = new GridFSBucket(db, { bucketName: "test_bucket" });
        const downloadStream = bucket.openDownloadStreamByName(req.params.name);
        const writeable = new Writable()
        const fileStream = fs.createWriteStream("./tax.jpeg");
        downloadStream.pipe(res);
        await new Promise((resolve, reject) => {
            downloadStream.on('close', resolve)
            downloadStream.on('error', reject)
        })
        await client.close();
        // res.status(200).send("File downloaded successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send("Some error occured while downloading please try again later");
    }
});

app.get("/delete/:id", async (req, res) => {
    const secretKey = "demoSecret";
    try {
        if (req.headers) {
            const token = req.headers.authorization.split(" ")[1];
            if (jwt.verify(token, secretKey)) {
                email = jwt.verify(token, secretKey).email;
            } else {
                res.status(402).send('Invalid Token')
            }
        }
    } catch (err) {
        console.log(err);
        res.status(402).send('Invalid Token')
    };
    try {
        const client = await MongoClient.connect("mongodb://localhost:27017/files");
        const db = client.db();
        const bucket = new GridFSBucket(db, { bucketName: "test_bucket" });
        const objId = new ObjectId(req.params.id);
        const resp = await bucket.delete(objId);
        if (resp) {
            res.status(201).send('Deleted Successfully');
        } else {
            res.status(200).send({ 'status': "400", "message": "Some error occured" });
        }
    } catch (err) {
        console.log(err);
    }
});

app.use("/user", userRouter);
app.use("/file", fileRouter);
app.use("/auth", authRouter);

app.listen(8000, async (req, res) => {
    await connection()
    console.log("Server started on port 8000")
});






// let newFile = new File({
//     fileName: originalname,
//     contentType: mimetype,
//     length: buffer.length,
//     fileBits: encoding
// });