const Package = require("../models/Package");
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const category ='all';
    let packages;
    
    if (category === 'all') {
      packages = await Package.find().sort({ createdAt: -1 });
    } else {
      packages = await Package.find({ category }).sort({ createdAt: -1 });
    }
    
    res.json({
      packages
    });
  } catch (err) {
    console.error(err);
  }
});

module.exports=router