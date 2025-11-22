const express = require('express');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');




const app = express();
app.use(express.json());
app.use(cookieParser());


// Import user routes
app.use('/api/auth', userRoutes);


module.exports = app;