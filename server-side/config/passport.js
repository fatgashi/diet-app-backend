const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../models/UserSchema');

module.exports = function(passport) {
  // Local strategy for username/password authentication
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' }, // changed from 'username'
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });

          if (!user) {
            return done(null, false, { message: 'No user with this email' });
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            return done(null, false, { message: 'Incorrect password' });
          }

          return done(null, user);
        } catch (err) {
          console.error(err);
          return done(err);
        }
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const name = profile.displayName;

          let user = await User.findOne({ email });

          if (!user) {
            user = await new User({
              name,
              email,
              discountOffer: {
                startTime: new Date(),
                isActive: true
              },
              password: '',
            }).save();
          }

          return done(null, user);
        } catch (err) {
          console.error('Google Auth Error:', err);
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // JWT strategy for token authentication
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      try {
        const user = await User.findById(payload.id);

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        console.error(err);
        return done(err);
      }
    })
  );
};