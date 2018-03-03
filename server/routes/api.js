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

// Register
router.post('/register', (req, res, next) => {
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    temporarytoken: jwt.sign({
      data: {
        username: req.body.username,
        email: req.body.email
      }
    }, config.secret, {
      expiresIn: '5m' // 1 day
    })
  });

  User.getUserByUsername(newUser.username, (err, user) => {
    if (err) throw err;
    if (!user) {
      User.getUserByEmail(newUser.email, (err, user) => {
        if (err) throw err;
        if (!user) {
          User.addUser(newUser, (err, user) => {
            if (err) {
              res.json({
                success: false,
                msg: 'Failed to register user'
              });
            } else {
              var email = {
                from: 'ThanhHaiDev@gmail.com',
                to: user.email,
                subject: 'Loclhost Activation Link',
                text: 'Hello world',
                html: '<b>' + user.username + '</b>' + '<br>Link: <a href="http://localhost:3000/api/activate/' + user.temporarytoken + '">http://localhost:3000/activate</a>'
              };

              client.sendMail(email, function (err, info) {
                if (err) {
                  console.log(error);
                } else {
                  console.log('Message sent: ' + info.response);
                }
              });
              res.json({
                success: true,
                msg: 'Account registered! Please check your e-mail for activation link.'
              });
            }
          });
        } else {
          res.json({
            success: false,
            msg: 'Email already exists'
          });
        }
      });
    } else {
      res.json({
        success: false,
        msg: 'User already exists'
      });
    }
  });
})

// Authenticate
router.post('/authenticate', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json({
        success: false,
        msg: 'User not found'
      });
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        if (!user.comfirmed) {
          return res.json({
            success: false,
            msg: 'Account is not yet activated. Please check your e-mail for activation link.',
            expired: true
          });
        } else {
          const token = jwt.sign({
            data: user
          }, config.secret, {
            expiresIn: '1d' // 1 day
          });

          res.json({
            success: true,
            msg: 'Login Success',
            token: `JWT ${token}`,
            user: {
              id: user._id,
              name: user.name,
              username: user.username,
              email: user.email
            }
          });
        }
      } else {
        return res.json({
          success: false,
          msg: 'Wrong password'
        });
      }
    });
  });
});

router.get('/profile', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  res.json({
    user: req.user
  });
});

router.get('/activate/:token', (req, res) => {
  User.findOne({
    temporarytoken: req.params.token
  }, (err, user) => {
    if (err) throw err;
    var token = req.params.token;

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        res.json({
          success: false,
          msg: 'Activation link has exprired'
        });
      } else if (!user) {
        res.json({
          success: false,
          msg: 'Activation link has exprired'
        });
      } else {
        user.temporarytoken = false,
          user.comfirmed = true;
        user.save((err) => {
          if (err) {
            console.log(err);
          } else {
            var email = {
              from: 'ThanhHaiDev@gmail.com',
              to: user.email,
              subject: 'Loclhost Activation Link',
              text: 'Hello world',
              html: '<b>' + user.username + '</b>' + '<br>Link: <a href="http://localhost:3000/activate/' + user.temporarytoken + '"><a href="http://localhost:3000/activate</a>'
            };

            client.sendMail(email, function (err, info) {
              if (err) {
                console.log(error);
              } else {
                console.log('Message sent: ' + info.response);
              }
            });
            res.json({
              success: true,
              msg: 'Account activated.'
            });
          }
        });
      }
    });
  });
});

module.exports = router;
