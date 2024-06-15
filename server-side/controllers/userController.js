const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');
const passport = require('passport');
const DietAssessment = require('../models/DietAssessmentSchema');
const mongoose = require('mongoose');

const userController = {
    register: async (req,res) => {
        const { name, surname, username, password, email, answers, dietType } = req.body;

        let session = null;
        
        
        try {
            // Check if username is already taken
            const existingUser = await User.findOne({ username });
            if (existingUser) {
              return res.status(400).json({message: 'Username already taken!'});
            }

            const existingEmail = await User.findOne({ email });
            
            if (existingEmail) {
              return res.status(400).json({message: 'Email already taken!'});
            }

        
            // Generate salt and hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const session = await mongoose.startSession();
            session.startTransaction();
        
            // Create new user object
            const newUser = new User({
              name,
              surname,
              username,
              password: hashedPassword,
              email
            });
        
            // Save the user to the database
            const savedUser = await newUser.save({ session });

            if (answers && dietType) {
                    const newDietAssessment = new DietAssessment({
                    user: savedUser._id,
                    answers,
                    dietType
                });
        
                await newDietAssessment.save({ session });
                
            }

            await session.commitTransaction();
            session.endSession();

            const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {expiresIn: '1h'});
        
            res.status(201).send({token, message: "You have Registered Successfully!"});

        } catch (err) {

            if (session) {
                await session.abortTransaction();
                session.endSession();
            }

            if (err.errors) {
              const errorMessages = {};
  
              for (const field in err.errors) {
                errorMessages[field] = err.errors[field].message;
              }
              res.status(400).json(errorMessages);
            } else {
              res.status(500).json({ message: 'Internal server error' });
            }
        }
    },
    login: async(req,res,next) => {
        passport.authenticate('local', { session: false }, (err, user, info) => {
            if (err) {
              console.error(err);
              return res.status(500).send({ message: 'Internal server error' });
            }
        
            if (!user) {
              return res.status(401).json({message: 'Your username or password is incorrect!'});
            }

            if (user.suspended) {
              return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
            }
        
            // Generate JWT token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {expiresIn: '1h'});
        
            res.send({ token });
          })(req, res, next);
    },
    getProfile: (req,res) => {
      res.json(req.user);
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