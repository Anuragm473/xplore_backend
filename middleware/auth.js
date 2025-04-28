module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.session.user) {
        return next();
      }
      req.flash('error_msg', 'Please log in to access this resource');
      res.redirect('/login');
    },
    
    ensureAdmin: function(req, res, next) {
      if (req.session.user && req.session.user.isAdmin) {
        return next();
      }
      req.flash('error_msg', 'Access denied. Admin privileges required.');
      res.redirect('/login');
    }
  };