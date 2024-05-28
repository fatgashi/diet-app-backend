const passport = require('passport');

const isAdmin = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      req.user = user;
      next();
    })(req, res, next);
};


module.exports = {
    isAdmin,
}