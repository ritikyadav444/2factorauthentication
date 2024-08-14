const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const speakeasy = require("speakeasy");
const uuid = require("uuid");
const { JsonDB } = require('node-json-db')
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')

const db = new JsonDB(new Config('authDb', true, false, '/'))

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get("/api", (req, res) => res.send({
    message: "hello"
}))

// register user  & create 
// app.post("/register", (req, res, next) => {
//     const id = uuid.v4()
//     try {
//         const path = `/user/${id}`
//         const temp_secret = speakeasy.generateSecret()
// const secret = speakeasy.generateSecret();
// user.temp_secret = { base32: secret.base32 };

//         db.push(path, { id, temp_secret })
//         res.json({ id, secret: temp_secret.base32 })
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ message: "Error in generating" })
//     }
// })
app.post("/register", (req, res, next) => {
    const id = uuid.v4();
    try {
        const path = `/user/${id}`;
        const secret = speakeasy.generateSecret();
        const temp_secret = { base32: secret.base32 };
        db.push(path, { id, temp_secret });
        console.log("User data stored:", { id, temp_secret });
        res.json({ id, secret: temp_secret.base32 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error in generating" });
    }
});



// verify
app.post('/verify', async (req, res) => {
    const { token, userId } = req.body;

    try {
        const path = `/user/${userId}`;
        const user = await db.getData(path);

        console.log("User data retrieved:", user);

        if (!user.temp_secret || !user.temp_secret.base32) {
            return res.status(400).json({ message: "Temporary secret not found" });
        }

        const { base32: secret } = user.temp_secret;
        const generatedToken = speakeasy.totp({
            secret,
            encoding: 'base32'
        });
        console.log("Generated token for verification:", generatedToken);
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 2
        });

        if (verified) {
            db.push(path, { id: userId, secret: user.temp_secret });
            res.json({ verified: true });
        } else {
            res.json({ verified: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error while verifying" });
    }
});



module.exports = app