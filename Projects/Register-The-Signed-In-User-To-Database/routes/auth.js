const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "secret";

router.post('/signup', async(req, res) => {
    try {

        let success = false;

        let user = await User.findOne({ email: req.body.email });
        if(user){
            res.status(400).json({
                msg: "User with the same email already exists"
            });
        }

        user = await User.create({
            email: req.body.email
        });

        const data = {
            user
        }

        const token = jwt.sign(data, JWT_SECRET);

        success = true;
        res.json({success, token, msg: "User created successfully"});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            msg: "Internal server error"
        });
    }
});

module.exports = router;
