const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
const cors=require('cors')
require('dotenv').config();


// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: ['http://localhost:5173', 'https://www.xploreworld.in'],
  credentials: true, // Allow cookies / sessions to be sent
}));

// Set up session
app.use(session({
  secret: 'travel_agency_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/travel-agency' }),
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Flash messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  next();
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/admin/packages', require('./routes/packages'));
app.use('/api', require('./routes/frontend'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));