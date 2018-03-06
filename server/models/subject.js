const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

// SubjectSchema
const SubjectSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  created: {
    type: Date,
    require: true,
    default: Date.now
  },
  count: {
    type: Number,
    require: true,
  },
  description: {
    type: String
  }
});
