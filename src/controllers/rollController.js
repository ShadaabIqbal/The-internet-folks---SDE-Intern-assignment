const roleModel = require('../models/roleModel');
const validations = require('../validations/validation');
const snowFlake = require('@theinternetfolks/snowflake');



const createRole = async function (req, res) {
    try {
        let userInput = req.body;
        if (!validations.requiredInput(userInput)) {
            return res.status(400).send({ status: "false", message: "All fields are mandatory" });
        };
        let { name } = userInput;

        if (!validations.isEmpty(name)) {
            return res.status(400).send({ status: "false", message: "Name must be present" });
        };

        if (!(validations.isValidMember(name))) { return res.status(400).send({ status: false, message: "Name is invalid!" }) };

        let snowFlakeRoleId = snowFlake.Snowflake.generate({ timestamp: Date.now() });
        userInput.id = snowFlakeRoleId;

        let createData = await roleModel.create(userInput);

        let userDetails = {
            id: createData.id,
            name: createData.name,
            createdAt: createData.createdAt,
            updatedAt: createData.updatedAt
        }

        return res.status(201).send(
            { status: true, content: { data: userDetails } }
        );
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


const getAllRoles = async function (req, res) {
    const { page = 1, limit = 10 } = req.query;
    try {
        const userDetails = await roleModel.find().select({ _id: 0, __v: 0 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const count = await roleModel.countDocuments();
        return res.status(200).send(
            { status: true, content: { meta: { total: count, pages: Math.ceil(count / limit), page: page }, data: userDetails } }
        );
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createRole, getAllRoles };