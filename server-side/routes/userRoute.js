const express = require('express');
const userController = require('../controllers/userController');
const passport = require('passport');
const { isAdmin } = require('../middleware/authorization');
const jwt = require('jsonwebtoken');

const userRouter = express.Router();

userRouter.post('/register', userController.register);
userRouter.post('/login', userController.login);
userRouter.post('/suspendUser', isAdmin, userController.suspendUsers);
userRouter.post('/updateProfile', passport.authenticate('jwt', { session: false }), userController.updateUser);

userRouter.get('/profile', passport.authenticate('jwt', { session: false }), userController.getProfile);
userRouter.get('/getUsers', isAdmin, userController.getUsersByCondition);
userRouter.post('/save-answers', passport.authenticate('jwt', { session: false }), userController.saveAnswers);

userRouter.post('/request-password-reset', userController.forgotPassword);
userRouter.post('/reset-password', userController.resetPassword);
userRouter.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

userRouter.get('/discount-offer', passport.authenticate('jwt', { session: false }), userController.discountOffer);

userRouter.get('/verify-email/:token', userController.verifyEmail);

// Step 2: Handle Google callback
userRouter.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // You can redirect back to Vue frontend with the token
    res.redirect(`http://localhost:8080/auth/google/success?token=${token}`);
  }
);

module.exports = userRouter;