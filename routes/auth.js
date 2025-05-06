const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Home route - redirects to login
router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  res.redirect('/login');
});

// Login page
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  res.render('auth/login');
});

// Login process
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    
    // Validation
    if (!username || !password) {
      req.flash('error_msg', 'Please enter all fields');

      return res.redirect('/login');
    }
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      req.flash('error_msg', 'Invalid credentials');

      return res.redirect('/login');
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {

      req.flash('error_msg', 'Invalid credentials');
      return res.redirect('/login');
    }
    
    // Set user session
    req.session.user = {
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin
    };
    
    req.flash('success_msg', 'You are now logged in');
    res.redirect('/admin/dashboard');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred during login');
    res.redirect('/login');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect('/login');
  });
});

// Create admin user (this would typically be protected in production)
router.get('/setup-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (adminExists) {
      return res.json({ message: 'Admin already exists' });
    }
    
    const newAdmin = new User({
      username: 'admin',
      password: 'admin123',
    });
    
    await newAdmin.save();
    res.json({ message: 'Admin user created successfully' });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;