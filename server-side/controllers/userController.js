const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');
const passport = require('passport');
const DietAssessment = require('../models/DietAssessmentSchema');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');
const EmailToken = require('../models/EmailTokenSchema');
const crypto = require('crypto');
const transformUserInputToWrite = require('../models/FormatDataToWrite');
const writeTransformedDataToCSV = require('../csv/collectUserData');

const userController = {
    register: async (req, res) => {
      const { name, password, email, answers } = req.body;

      // Validate required fields
      if (!name || !password || !email) {
        return res.status(400).json({ message: 'Please fill in all fields.' });
      }

      try {
        // Check if email exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: 'Email already taken!' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
          name,
          email,
          discountOffer: {
            startTime: new Date(),
            isActive: true
          },
          password: hashedPassword
        });

        const savedUser = await newUser.save();

        let newDietAssessment = null;
        // Save diet assessment with just answers (no dietType yet)
        if (answers && Array.isArray(answers)) {
          newDietAssessment = new DietAssessment({
            user: savedUser._id,
            answers // no dietType yet
          });
          await newDietAssessment.save();

          const data = transformUserInputToWrite(answers, newDietAssessment._id.toString());
          writeTransformedDataToCSV(data);
        }

        const tokenEmail = uuidv4();
        await EmailToken.create({
          userId: savedUser._id,
          token: tokenEmail,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // expires in 24h
        });

        // Send verification email
        await sendVerificationEmail(savedUser.email, savedUser.name, tokenEmail);

        const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).send({ token, message: "You have Registered Successfully!", id: newDietAssessment._id });

      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
    },

    discountOffer: async (req, res) => {
      const user = await User.findById(req.user.id);

      if (!user?.discountOffer?.startTime) {
        return res.json({ active: false });
      }

      const now = new Date();
      const expiry = new Date(user.discountOffer.startTime.getTime() + 30 * 60000); // +30 min

      const stillActive = now < expiry;
      if (!stillActive) user.discountOffer.isActive = false;

      await user.save();

      res.json({
        active: stillActive,
        price: stillActive ? 20 : 35,
        expiresAt: expiry.toISOString() // ✅ ADD THIS LINE
      });
    },

    verifyEmail: async (req, res) => {
      const token = req.params.token;

      try {
        const emailToken = await EmailToken.findOne({ token });

        if (!emailToken) {
          return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
        }

        const user = await User.findById(emailToken.userId);
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Mark user as verified
        user.emailVerified = true;
        await user.save();

        // Remove the used token
        await EmailToken.deleteOne({ _id: emailToken._id });

        return res.status(200).json({ success: true, message: 'Email successfully verified!' });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
      }
    },

    login: async(req,res,next) => {
        passport.authenticate('local', { session: false }, (err, user, info) => {
            if (err) {
              console.error(err);
              return res.status(500).send({ message: 'Internal server error' });
            }
        
            if (!user) {
              return res.status(401).json({message: 'Your email or password is incorrect!'});
            }

            if (user.suspended) {
              return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
            }
        
            // Generate JWT token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {expiresIn: '7d'});
        
            res.send({ token });
          })(req, res, next);
    },
    getProfile: (req,res) => {
      res.json(req.user);
    },

    saveAnswers: async (req, res) => {
      const { answers } = req.body;
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: 'Invalid answers format' });
      }
      try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

          const newDietAssessment = new DietAssessment({
            user: user._id,
            answers: req.body.answers
          });
          await newDietAssessment.save();

          const data = transformUserInputToWrite(answers, newDietAssessment._id.toString());
          writeTransformedDataToCSV(data);
        

        res.json({ success: true, id: newDietAssessment._id });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to save answers' });
      }
    },

    forgotPassword: async (req, res) => {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User with this email not found!' });

      const token = crypto.randomBytes(32).toString('hex');
      const expiry = Date.now() + 3600000; // 1 hour

      user.resetPasswordToken = token;
      user.resetPasswordExpires = expiry;
      await user.save();

      await sendPasswordResetEmail(user.email, user.name, token);

      res.json({ message: 'Reset link sent to email.' });
    },

    resetPassword: async (req, res) => {
      const { token, password } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      res.json({ message: 'Password reset successfully' });
    },

    getUsersByCondition: async (req,res) => {
      const { sort, limit, skip } = req.query;
      const sortOptions = {};

      if (sort) {
          const [field, order] = sort.split(':');
          sortOptions[field] = order === 'desc' ? -1 : 1;
      }

      try {
          const total = await User.countDocuments({role: 'client'}); // Total number of clients
          const users = await User.find({role: 'client'})
              .sort(sortOptions)
              .limit(parseInt(limit))
              .skip(parseInt(skip));

          res.status(200).json({ users, total });
      } catch (error) {
          res.status(500).json({ message: "Internal Server Error!" });
      }
    },

    suspendUsers: async (req,res) => {
      const { userId, suspended } = req.body

      try {

        await User.findByIdAndUpdate(userId, {
          suspended
        })

        res.status(204).json("Updated!")
        
      } catch (error) {
          res.status(500).json({ message: "Internal Server Error!" });
      }
    },

    updateUser: async (req,res) => {
      try {
        const { name, surname, email, username } = req.body;

        const currentUser = req.user;

        // Find the user by ID
        const user = await User.findById(currentUser._id);
        if (!user) {
            return res.status(400).json({ message: 'User not found!' });
        }

        // Check if the last update was more than a month ago
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        if (user.updatedAt > oneMonthAgo) {
            return res.status(404).json({ message: 'You can update your profile only once a month!' });
        }

        // Update user fields
        if (name) user.name = name;
        if (surname) user.surname = surname;

        if (email && email !== user.email) {
          const existingEmail = await User.findOne({ email });
          if (existingEmail) {
              return res.status(400).json({ message: 'Email already taken!' });
          } else {
              user.email = email;
          }
      }

      if (username && username !== user.username) {
          const existingUser = await User.findOne({ username });
          if (existingUser) {
              return res.status(400).json({ message: 'Username already taken!' });
          } else {
              user.username = username;
          }
      }

        user.updatedAt = Date.now();

        // Save the updated user
        await user.save();

        res.status(200).json({ message: 'Profile updated successfully'});
      } catch (error) {
          res.status(500).json({ message: 'An error occurred', error });
      }
    }
}

module.exports = userController