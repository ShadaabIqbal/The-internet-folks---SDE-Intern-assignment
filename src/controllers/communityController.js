const communityModel = require('../models/communityModel');
const userModel = require('../models/userModel');
const roleModel = require('../models/roleModel');
const memberModel = require('../models/memberModel');
const snowflake = require('@theinternetfolks/snowflake');
const validations = require('../validations/validation');



const createCommunity = async function (req, res) {
    try {
        let userInput = req.body;
        if (!validations.requiredInput(userInput)) {
            return res.status(400).send({ status: "false", message: "All fields are mandatory" });
        }
        let { name } = userInput;

        if (!validations.isEmpty(name)) {
            return res.status(400).send({ status: "false", message: "Name must be present" });
        }

        let checkUnique = await communityModel.findOne({ name: name });
        if (checkUnique) {
            return res.status(400).send({ status: "false", message: "This name already exists. Please choose another name" });
        }

        let snowFlakeCommunityId = snowflake.Snowflake.generate({ timestamp: Date.now() });
        userInput.id = snowFlakeCommunityId;

        userInput.slug = name;

        let decodedToken = req.decodedToken;
        let userId = decodedToken.userId;
        let presentUser = await userModel.findOne({ id: userId });
        if (!presentUser) return res.status(404).send({ status: false, message: 'User not found!' });
        userInput.owner = userId;

        let createData = await communityModel.create(userInput);

        let userDetails = {
            id: createData.id,
            name: createData.name,
            slug: createData.slug,
            owner: createData.owner,
            createdAt: createData.createdAt,
            updatedAt: createData.updatedAt
        }

        let snowFlakeRoleId = snowflake.Snowflake.generate({ timestamp: Date.now() });
        let roleName = 'Community Admin';
        await roleModel.create({ id: snowFlakeRoleId, name: roleName });

        let snowFlakeMemberId = snowflake.Snowflake.generate({ timestamp: Date.now() });
        await memberModel.create({ id: snowFlakeMemberId, community: snowFlakeCommunityId, user: userId, role: snowFlakeRoleId });

        return res.status(201).send(
            { status: true, content: { data: userDetails } }
        );
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


const getAllCommunities = async function (req, res) {
    const { page = 1, limit = 10 } = req.query;
    try {
        let data = await communityModel.find();
        if (data.length <= 0) {
            return res.status(404).send({ status: false, message: 'No communities found!' });
        }
        let arr = [];
        for (let i = 0; i < data.length; i++) {
            let ownerId = data[i].owner;
            let ownerData = await userModel.findOne({ id: ownerId });
            let obj = {
                id: data[i].id,
                name: data[i].name,
                slug: data[i].slug,
                owner: {
                    name: ownerData.name,
                    id: ownerData.id
                },
                createdAt: data[i].createdAt,
                updatedAt: data[i].updatedAt
            }
            arr.push(obj);
        }
        const totalPages = Math.ceil(arr.length / limit);
        return res.status(200).send(
            { status: true, content: { meta: { total: arr.length, pages: totalPages, page: page }, data: arr } }
        );
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


const getAllMembers = async function (req, res) {
    const { page = 1, limit = 10 } = req.query;
    try {
        let communityName = req.params.id;
        let communityExists = await communityModel.findOne({ name: communityName });
        if (!communityExists) {
            return res.status(400).send({ status: false, message: 'Community does not exist!' });
        }
        let communityId = communityExists.id;
        let allMembers = await memberModel.find({ community: communityId });
        let arr = [];
        for (let i = 0; i < allMembers.length; i++) {
            let userId = allMembers[i].user;
            let userData = await userModel.findOne({ id: userId });
            let rollId = allMembers[i].role;
            let rollData = await roleModel.findOne({ id: rollId });
            let obj = {
                id: allMembers[i].id,
                community: allMembers[i].community,
                user: {
                    id: userData.id,
                    name: userData.name
                },
                roll: {
                    id: rollData.id,
                    name: rollData.name
                },
                createdAt: allMembers[i].createdAt
            }
            arr.push(obj);
        }
        const totalPages = Math.ceil(arr.length / limit);
        return res.status(200).send(
            { status: true, content: { meta: { total: arr.length, pages: totalPages, page: page }, data: arr } }
        );
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


const getMyOwnCommunities = async function (req, res) {
    const { page = 1, limit = 10 } = req.query;
    try {
        let decodedToken = req.decodedToken;
        let userId = decodedToken.userId;
        let myCommunities = await communityModel.find({ owner: userId }).select({ _id: 0, __v: 0 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const count = myCommunities.length;
        if (count <= 0) {
            return res.status(404).send({ status: false, message: 'No communities found!' });
        }
        return res.status(200).send(
            { status: true, content: { meta: { total: count, pages: Math.ceil(count / limit), page: page }, data: myCommunities } }
        );
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


const getMyJoinedCommunities = async function (req, res) {
    const { page = 1, limit = 10 } = req.query;
    try {
        let decodedToken = req.decodedToken;
        let userId = decodedToken.userId;
        let memberOf = await memberModel.find({ user: userId });
        if (memberOf.length <= 0) {
            return res.status(404).send({ status: false, message: 'No communities found!' });
        }
        let arr = [];
        for (let i = 0; i < memberOf.length; i++) {
            let communityId = memberOf[i].community;
            let myCommunities = await communityModel.findOne({ id: communityId });
            if (myCommunities.owner === userId) {
                continue;
            }
            let ownerId = myCommunities.owner;
            let ownerData = await userModel.findOne({ id: ownerId });
            let obj = {
                id: myCommunities.id,
                name: myCommunities.name,
                slug: myCommunities.slug,
                owner: {
                    id: ownerData.id,
                    name: ownerData.name
                },
                createdAt: myCommunities.createdAt,
                updatedAt: myCommunities.updatedAt
            }
            arr.push(obj);
        }
        if (arr.length === 0) {
            return res.status(404).send({ status: false, message: 'No communities found!' });
        }
        const totalPages = Math.ceil(arr.length / limit);
        return res.status(200).send(
            { status: true, content: { meta: { total: arr.length, pages: totalPages, page: page }, data: arr } }
        );
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


module.exports = { createCommunity, getAllCommunities, getAllMembers, getMyOwnCommunities, getMyJoinedCommunities };
