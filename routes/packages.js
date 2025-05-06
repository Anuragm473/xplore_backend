const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const Package = require('../models/Package');

router.get('/api/cloudinary-config', (req, res) => {
  // Return only the necessary Cloudinary configuration
  // No API secret is exposed here
  res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    uploadPreset: 'xploreworld' 
  });
});

// List all packages
router.get('/', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const category = req.query.category || 'all';
    let packages;
    
    if (category === 'all') {
      packages = await Package.find().sort({ createdAt: -1 });
    } else {
      packages = await Package.find({ category }).sort({ createdAt: -1 });
    }
    
    res.render('admin/packages/index', {
      title: 'Manage Packages',
      packages,
      category
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading packages');
    res.redirect('/admin/dashboard');
  }
});

// Show form to create new package
router.get('/create', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.render('admin/packages/create', {
    title: 'Create New Package'
  });
});

// POST route to handle form submission and manual image upload to Cloudinary
router.post('/', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { destination, category, duration ,valid, price, rating, description, images,pax,fixedDeparture } = req.body;


    if (!destination || !category || !duration || !price || !rating || !description || !images || !pax) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate images array
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    // Create new package
    const newPackage = new Package({
      destination,
      category,
      duration: duration,
      price: price,
      pax:pax,
      valid,
      fixedDeparture,
      rating: rating,
      description,
      images
    });

    // Save the package to the database
    await newPackage.save();

    // Redirect after successful creation
    return res.status(201).json({ 
      message: 'Package created successfully', 
      package: newPackage,
      redirect: '/admin/packages'
    });

  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ 
      error: 'Failed to create package',
      details: error.message 
    });
  }
});

// Show package details
router.get('/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const packageItem = await Package.findById(req.params.id);
    
    if (!packageItem) {
      req.flash('error_msg', 'Package not found');
      return res.redirect('/admin/packages');
    }
    
    res.render('admin/packages/view', {
      title: packageItem.destination,
      packageItem
    });
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading package details');
    res.redirect('/admin/packages');
  }
});

// Show edit form
router.get('/:id/edit', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const packageItem = await Package.findById(req.params.id);
    
    if (!packageItem) {
      req.flash('error_msg', 'Package not found');
      return res.redirect('/admin/packages');
    }
    
    res.render('admin/packages/edit', {
      title: `Edit ${packageItem.destination}`,
      packageItem
    });
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading package');
    res.redirect('/admin/packages');
  }
});

// Update package
router.put('/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { destination, duration, price, rating, description,valid, category, images,pax,fixedDeparture } = req.body;
    
    // Validate required fields
    if (!destination || !category || !duration || !price || !rating || !description || !pax || !fixedDeparture) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate images array
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }
    
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      {
        destination,
        images,
        duration: duration,
        pax,
        valid,
        fixedDeparture,
        price: price,
        rating: rating,
        description,
        category
      },
      { new: true }
    );
    
    if (!updatedPackage) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    res.status(200).json({ 
      message: 'Package updated successfully',
      package: updatedPackage
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: 'Error updating package',
      details: err.message
    });
  }
});

// Delete package
router.delete('/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const result = await Package.findByIdAndDelete(req.params.id);
    
    if (!result) {
      req.flash('error_msg', 'Package not found');
      return res.redirect('/admin/packages');
    }
    
    req.flash('success_msg', 'Package deleted successfully');
    res.redirect('/admin/packages');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error deleting package');
    res.redirect('/admin/packages');
  }
});

module.exports = router;