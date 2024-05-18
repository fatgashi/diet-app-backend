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
              return res.status(400).send('Username already taken!');
            }

            const existingEmail = await User.findOne({ email });
            
            if (existingEmail) {
              return res.status(400).send('Email already taken!');
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

            console.log(err.message);

            res.status(500).send(err.message)
          
        }
    },
    login: async(req,res,next) => {
        passport.authenticate('local', { session: false }, (err, user, info) => {
            if (err) {
              console.error(err);
              return res.status(500).send({ message: 'Internal server error' });
            }
        
            if (!user) {
              return res.status(401).send('Invalid credentials');
            }
        
            // Generate JWT token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {expiresIn: '1h'});
        
            res.send({ token });
          })(req, res, next);
    },
    getProfile: (req,res) => {
      res.json(req.user);
    },
}

module.exports = userController