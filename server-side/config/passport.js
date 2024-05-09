const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');

const User = require('../models/UserSchema');

module.exports = function(passport) {
  // Local strategy for username/password authentication
  passport.use(
    new LocalStrategy(
      { usernameField: 'username' },
      async (username, password, done) => {
        try {
          const user = await User.findOne({ username });

          if (!user) {
            return done(null, false);
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            return done(null, false);
          }

          return done(null, user);
        } catch (err) {
          console.error(err);
          return done(err);
        }
      }
    )
  );

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