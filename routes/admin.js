const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const Package = require('../models/Package');

// Admin dashboard
router.get('/dashboard', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const packageCounts = {
      total: await Package.countDocuments(),
      international: await Package.countDocuments({ category: 'international' }),
      local: await Package.countDocuments({ category: 'local' }),
      fixedDeparture: await Package.countDocuments({ category: 'fixedDeparture' })
    };
    
    res.render('admin/dashboard', { 
      title: 'Admin Dashboard',
      packageCounts
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading dashboard data');
    res.render('admin/dashboard', { 
      title: 'Admin Dashboard',
      packageCounts: { total: 0, international: 0, local: 0, fixedDeparture: 0 }
    });
  }
});

module.exports = router;