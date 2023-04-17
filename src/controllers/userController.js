const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const snowflake = require('@theinternetfolks/snowflake');
const jwt = require('jsonwebtoken');
const validations = require('../validations/validation');



const createUser = async function (req, res) {
    try {
        let userInput = req.body;
        if (!validations.requiredInput(userInput)) {
            return res.status(400).send({ status: "false", message: "All fields are mandatory" });
        }
        let { name, email, password } = userInput;

        if (!validations.isEmpty(name)) {
            return res.status(400).send({ status: "false", message: "Name must be present" });
        }

        if (!validations.isEmpty(email)) {
            return res.status(400).send({ status: "false", message: "email must be present" });
        }

        if (!validations.isEmpty(password)) {
            return res.status(400).send({ status: "false", message: "Password must be present" });
        }

        if (!validations.isValidEmail(email)) {
            return res.status(400).send({ status: "false", message: "Provide a valid email" });
        }

        if (!validations.isValidPswd(password)) {
            return res.status(400).send({ status: false, message: "Provide password between 8 to 15 characters and must contain one capital letter and one special character" })
        }

        let checkEmail = await userModel.findOne({ email });
        if (checkEmail) {
            return res.status(400).send({ status: "false", message: "Email already exists" });
        }

        const saltRounds = 10
        let hash = await bcrypt.hash(password, saltRounds);
        userInput.password = hash;

        let snowFlake = snowflake.Snowflake.generate({ timestamp: Date.now() });
        userInput.id = snowFlake;

        let createData = await userModel.create(userInput);

        const encodedToken = jwt.sign({ userId: createData.id, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) }, 'mysignature');

        let userDetails = {
            id: createData.id,
            name: createData.name,
            email: createData.email,
            createdAt: createData.createdAt
        }

        return res.status(201).send(
            { status: true, content: { data: userDetails, meta: { encodedToken } } }
        );
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


const loginUser = async function (req, res) {
    try {
        const { email, password } = req.body
        if (!validations.requiredInput(req.body)) return res.status(400).send({ status: false, message: 'Input is required' })

        if (!validations.isEmpty(email)) return res.status(400).send({ status: false, message: 'Email is required' })

        if (!validations.isEmpty(password)) return res.status(400).send({ status: false, message: 'Password is required' })

        let presentUser = await userModel.findOne({ email })
        if (!presentUser) return res.status(400).send({ status: false, message: 'Invalid email' })

        let comparePassword = await bcrypt.compare(password, presentUser.password)
        if (!comparePassword) return res.status(400).send({ status: false, message: 'Incorrect password' })

        const encodedToken = jwt.sign({ userId: presentUser.id, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) }, 'mysignature');

        let userDetails = {
            id: presentUser.id,
            name: presentUser.name,
            email: presentUser.email,
            createdAt: presentUser.createdAt
        }

        return res.status(200).send(
            { status: true, content: { data: userDetails, meta: { encodedToken } } }
        );
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


const getUser = async function (req, res) {
    try {
        let decodedToken = req.decodedToken;
        let userId = decodedToken.userId;
        let presentUser = await userModel.findOne({ id: userId });
        if (!presentUser) return res.status(404).send({ status: false, message: 'User not found!' });
        let userDetails = {
            id: presentUser.id,
            name: presentUser.name,
            email: presentUser.email,
            createdAt: presentUser.createdAt
        }
        return res.status(200).send(
            { status: true, content: { data: userDetails } }
        );
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message })
    }
}


module.exports = { createUser, loginUser, getUser };