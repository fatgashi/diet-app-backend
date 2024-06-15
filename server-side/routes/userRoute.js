const express = require('express');
const userController = require('../controllers/userController');
const passport = require('passport');
const { isAdmin } = require('../middleware/authorization');

const userRouter = express.Router();

userRouter.post('/register', userController.register);
userRouter.post('/login', userController.login);
userRouter.post('/suspendUser', isAdmin, userController.suspendUsers);
userRouter.post('/updateProfile', passport.authenticate('jwt', { session: false }), userController.updateUser);

userRouter.get('/profile', passport.authenticate('jwt', { session: false }), userController.getProfile);
userRouter.get('/getUsers', isAdmin, userController.getUsersByCondition);

module.exports = userRouter;