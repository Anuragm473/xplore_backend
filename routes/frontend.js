// Add these to your existing imports
const nodemailer = require('nodemailer');
const express = require('express');
const Package = require('../models/Package');
const router = express.Router();

// Your existing route
router.get('/', async (req, res) => {
  try {
    const category = 'all';
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
    res.status(500).json({ error: 'Server error' });
  }
});

// New route for form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, packageOfInterest, message, visaType } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }
    
    // Configure nodemailer with your Gmail credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Use environment variables for credentials
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Email to the business owner
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'info@xploreworld.in', // Business email
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Package of Interest:</strong> ${packageOfInterest || 'Not specified'}</p>
        <p><strong>Visa Type:</strong> ${visaType || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };
    
    // Confirmation email to the customer
    const confirmationMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting Xplore World Tours and Travels',
      html: `
        <h2>Thank you for contacting Xplore World Tours and Travels</h2>
        <p>Dear ${name},</p>
        <p>We have received your inquiry regarding ${packageOfInterest || 'our travel services'}. Our team will review your message and get back to you shortly.</p>
        <p>Here's a summary of your submission:</p>
        <ul>
          <li><strong>Package of Interest:</strong> ${packageOfInterest || 'Not specified'}</li>
          <li><strong>Visa Type:</strong> ${visaType || 'Not specified'}</li>
          <li><strong>Your Message:</strong> ${message}</li>
        </ul>
        <p>Thank you for choosing Xplore World Tours and Travels.</p>
        <p>Best regards,</p>
        <p>The Xplore World Team</p>
        <p>Phone: +91 9819475680</p>
        <p>Email: info@xploreworld.in</p>
      `
    };
    
    // Send emails
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(confirmationMailOptions);
    
    res.status(200).json({ success: true, message: 'Your message has been sent. We will contact you soon!' });
  } catch (err) {
    console.error('Email sending error:', err);
    res.status(500).json({ 
      error: 'Failed to send email', 
      message: 'There was a problem sending your message. Please try again later.'
    });
  }
});

module.exports = router;