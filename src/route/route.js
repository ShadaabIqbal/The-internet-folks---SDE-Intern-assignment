const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const communityController = require('../controllers/communityController');
const roleController = require('../controllers/rollController');
const memberController = require('../controllers/memberController');
const auth = require('../middleware/auth')


/*----------------ROLE ROUTES---------------------------*/
router.post('/v1/role', roleController.createRole);

router.get('/v1/role', roleController.getAllRoles);


/*----------------USER ROUTES---------------------------*/
router.post('/v1/auth/signup', userController.createUser);

router.post('/v1/auth/signin', userController.loginUser);

router.get('/v1/auth/me', auth.authentication, userController.getUser);


/*----------------COMMUNITY ROUTES----------------------*/
router.post('/v1/community', auth.authentication, communityController.createCommunity);

router.get('/v1/community', communityController.getAllCommunities);

router.get('/v1/community/:id/members', communityController.getAllMembers);

router.get('/v1/community/me/owner', auth.authentication, communityController.getMyOwnCommunities);

router.get('/v1/community/me/member', auth.authentication, communityController.getMyJoinedCommunities);


/*----------------MEMBER ROUTES----------------------*/
router.post('/v1/member', auth.authentication, memberController.addMember);

router.delete('/v1/member/:id', auth.authentication, memberController.removeMember);



router.all('/*', function (req, res) {
    return res.status(400).send({ status: false, message: 'Path not found' })
});


module.exports = router;
