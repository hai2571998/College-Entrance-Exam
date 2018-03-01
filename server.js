const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const passport = require('passport');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./server/config/database');

// Config To Database
mongoose.connect(config.database);

// Connection
mongoose.connection.on('connected', () => {
  console.log('Connected to database '+ config.database);

});

// Error Connection Database
mongoose.connection.on('error', (err) => {
  console.log('Database error '+ err);

});

const app = express();

// Cors Middleware
app.use(cors());

// API file for interacting with MongoDB
const api = require('./server/routes/api');

// Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
require('./server/config/passport')(passport);

// Angular DIST output folder
app.use(express.static(path.join(__dirname, 'dist')));

// API location
app.use('/api', api);

// Send all other requests to the Angular app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

//Set Port
const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => console.log(`Running on localhost:${port}`));
