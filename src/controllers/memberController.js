const memberModel = require('../models/memberModel');
const communityModel = require('../models/communityModel');
const userModel = require('../models/userModel');
const snowFlake = require('@theinternetfolks/snowflake');
const roleModel = require('../models/roleModel');
let validations = require('../validations/validation');


const addMember = async function (req, res) {
    try {
        let userInput = req.body;
        if (!validations.requiredInput(userInput)) {
            return res.status(400).send({ status: "false", message: "All fields are mandatory" });
        }

        let { community, user, role } = userInput;

        if (!validations.isEmpty(community)) {
            return res.status(400).send({ status: "false", message: "CommunityId must be present" });
        }

        if (!validations.isEmpty(user)) {
            return res.status(400).send({ status: "false", message: "UserId must be present" });
        }

        if (!validations.isEmpty(role)) {
            return res.status(400).send({ status: "false", message: "RoleId must be present" });
        }

        if (!snowFlake.Snowflake.isValid(community)) {
            return res.status(400).send({ status: "false", message: "CommunityId is invalid" });
        }

        if (!snowFlake.Snowflake.isValid(user)) {
            return res.status(400).send({ status: "false", message: "UserId is invalid" });
        }

        if (!snowFlake.Snowflake.isValid(role)) {
            return res.status(400).send({ status: "false", message: "RoleId is invalid" });
        }

        let presentUser = await userModel.findOne({ id: user })
        if (!presentUser) return res.status(404).send({ status: false, message: 'User not found!' });

        let decodedToken = req.decodedToken;
        let userId = decodedToken.userId;

        let rollData = await roleModel.findOne({ id: role });
        if (!rollData) return res.status(400).send({ status: false, message: 'Roll cannot be assigned without initializing!' });

        if (rollData.name === 'Community Admin') {
            return res.status(400).send({ status: false, message: 'Admin has already been assigned' });
        }

        let communityData = await communityModel.findOne({ id: community });
        if (!communityData) return res.status(404).send({ status: false, message: 'Community not found!' });

        if (userId !== communityData.owner) {
            return res.status(403).send({ status: false, message: 'NOT_ALLOWED_ACCESS' });
        }

        if (user === userId) {
            return res.status(400).send({ status: false, message: 'You are already an admin of this community' });
        }

        let checkUser = await memberModel.find();

        for (let i = 0; i < checkUser.length; i++) {
            let communityId = checkUser[i].community;
            let userId = checkUser[i].user;
            let roleId = checkUser[i].role;
            if (user === userId && community === communityId) {
                return res.status(400).send({ status: false, message: 'You are already a member of this community' });
            }
            if (role === roleId) {
                return res.status(400).send({ status: false, message: 'This roleId already exists. Please create a new roleId' });
            }
        }

        let snowFlakeMemberId = snowFlake.Snowflake.generate({ timestamp: Date.now() });
        userInput.id = snowFlakeMemberId;

        let createData = await memberModel.create(userInput);

        let userDetails = {
            id: createData.id,
            community: createData.community,
            user: createData.user,
            roll: createData.role,
            createdAt: createData.createdAt
        };

        return res.status(201).send(
            { status: true, content: { data: userDetails } }
        );
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


const removeMember = async function (req, res) {
    try {
        const memberId = req.params.id;

        if (!memberId)
            return res.status(400).send({ status: true, message: "memberId is required" })

        if (!snowFlake.Snowflake.isValid(memberId)) {
            return res.status(400).send({ status: "false", message: "memberId is invalid" });
        }

        const memberDetails = await memberModel.findOne({ id: memberId });
        if (!memberDetails) {
            return res.status(404).send({ status: false, message: "Member not found!" });
        }

        let memberCommunity = memberDetails.community;
        let communityData = await communityModel.findOne({ id: memberCommunity });

        let decodedToken = req.decodedToken;
        let userId = decodedToken.userId;

        if (communityData.owner !== userId) {
            return res.status(403).send({ status: false, message: 'NOT_ALLOWED_ACCESS' });
        }

        await memberModel.deleteOne({ id: memberId });

        return res.status(200).send({ status: true });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


module.exports = { addMember, removeMember };