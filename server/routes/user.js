const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');
const config = require('../config/database');

const router = express.Router();

var options = {
  auth: {
    api_user: 'thanhhaidev',
    api_key: 'Thanhtuyen98'
  }
}

var client = nodemailer.createTransport(sgTransport(options));

module.exports = router;
