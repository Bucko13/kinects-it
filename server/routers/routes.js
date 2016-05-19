/* eslint new-cap: ["error", { "capIsNewExceptions": "Router" }] */
const router = require('express').Router();
const userController = require('../controllers/userController.js');
const https = require('https');
const authKeys = require('../../config.js');
const User = require('../models/userModel');
const logger = require('../config/logger.js');
const coinbase = require('coinbase');
const db = require('../db.js');

module.exports = (app, passport) => {

/******************************
************ USER ROUTES*******
*******************************/
  app.route('/api/v1/users/:id/homes/:code').post(userController.addToHome);
  app.route('/api/v1/users/:id/homes/:code').delete(userController.leaveHome);

  // Update a user's profile information
  app.put('/api/v1/users',(req, res, next) => {
    return User.update(req.body)
    .then((updateResult) => {
      logger.info('Succesfully updated user = ', updateResult);
      return res.json(updateResult);
    })
    .catch(err => {
      logger.info('There was an error updating the user:', err);
      next(err, null);
    });
  });

  // Signup new user
  app.route('/api/v1/users').post((req, res, next) => {
    passport.authenticate('local-signup', (err, user, info) => {
      if (err) {
        return next(err)
      };
      if (user) {
        // user was created in the database
        // Manually establish the session...
        req.login(user, function(err) {
          const loginUser = user.user || user;
          if (err) return next(err);
          // creating a message to send to the client for session information
          const userInfo = {
            name: loginUser.name,
            email: loginUser.email,
            id: loginUser.id,
          }
          const message = {
            user: userInfo,
            sessionId: req.session.id,
            login: info.login,
            message: info.message,
            payAccounts: loginUser.payAccounts,
          };

          if (loginUser.house) {
             message.house = {
              id: loginUser.house.id,
              code: loginUser.house.code,
              name: loginUser.house.name,
             };
          }

          return res.json(message)
        });
      };
      if (!user) {
        return res.json(info);
      }

    })(req, res, next);
  });

/*****************************************
********* Transaction ROUTES **********
******************************************/
  app.post('/api/v1/users/:id/payment', (req, res) =>{
    // use the users information: ({'accessToken': accessToken, 'refreshToken': refreshToken});
    // first get the users id from req.params.id
    const customerId = req.params.id;
    // then pull out the body information and store as txArgs (to, amount, currency, description)
    const txArgs = {
      to: '',
      amount: req.body.amount,
      currency: 'USD',
      description: req.body.description,
    };
    // do a database query for the house owners email address
    db.one('SELECT userid FROM users_houses WHERE houseid=$1', req.body.houseid)
    .then(hostid => {
      // use the host id to get the host email
      console.log('got this hostid back from first query:', hostid)
      return db.one('SELECT email FROM users WHERE id=$1', hostid)
    })
    .then(hostEmail => {
      // save email to txArgs
      console.log('this is the hosts email:', hostEmail);
      tx.Args.to = hostEmail;
      
      // then do a database query for user's payment information (refresh, access tokens, accountid)
      return db.one('SELECT * FROM user_pay_accounts WHERE userid=$1 AND paymethodid=2', customerId)
    })
    .then(payInfo => {
      // then create a client connection with refresh and access tokens
      console.log('received this payment information for the customer:', payInfo);
      cbClient = new coinbase.Client({'accessToken': payInfo.accesstoken, 'refreshToken': refreshtoken});

      // then get the client's account with the accountid
        // returns 'account' <======= TEST WITH THIS FIRST
      client.getAccount(payInfo.accountid, function(err, account) {
        console.log('========= we\'ve retrieved your info from coinbase! =====')
        console.log('bal: ' + account.balance.amount + ' currency: ' + account.balance.currency);
        
        // account.sendMoney with txArgs, returns txn on success
        // send txn back to client
        // account.sendMoney(txArgs, function(err, txn) {
        //   console.log('my txn id is: ' + txn.id);
        // });
        return res.json({accountBalance: account.balance.amount});
      });
    })
    .catch(err => 
      ({ error: err, message: 'you got an error when trying to make a transaction',})
    )
  });

/*****************************************
********* Authentication ROUTES **********
******************************************/
// Log current user out
  app.delete('/api/v1/authentication', (req, res) => {
    req.logout();
    res.json(true);
  })

// Check if user is authenticated and return user information if so
  app.get('/api/v1/authentication', (req, res, next) => {
    if (req.isAuthenticated()) {
      const loginUser = req.session.passport.user.user || req.session.passport.user;
      const message = {
        user: {
          name:loginUser.name,
          email: loginUser.email,
          id: loginUser.id,
        },
        sessionId: req.session.id,
        defaultviewhost: req.user.defaultviewhost,
        house: loginUser.house,
        payAccounts: loginUser.payAccounts,
      }

      if (req.session.passport.house) {
        message.house = {
          id: loginUser.house.id,
          code: loginUser.house.code,
        };
      }
      return res.json(message);
    } else {
      return res.json(false);
    }
  })

  // Authenticate and login user
  app.route('/api/v1/session').post((req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
      if (err) {
        return next(err)
      };
      if (user) {
        // user was validated 
        // Manually establish the session...
        req.login(user, function(err) {
            if (err) {
              return next(err);
            }
            // creating a message to send to the client for session information
            const loginUser = user.user || user;
            const message = {
              user: {
                name: loginUser.name,
                email: loginUser.email,
                id: loginUser.id,
              },
              sessionId: req.session.id,
              host: loginUser.defaultviewhost,
              login: info.login,
              message: info.message,
              payAccounts: loginUser.payAccounts,
            }
            if (loginUser.house) {
               message.house = {
                id: loginUser.house.id,
                code: loginUser.house.code,
                name: loginUser.house.name,
              }
            }
            return res.json(message);
        });
      };
      if (!user) {
        return res.json(info)
      }
    })(req, res, next);
  });

  // Authenticate coinbase
  app.route('/api/v1/auth/coinbase').get(passport.authenticate('coinbase'));

  // oAuth callback route 
  app.route('/api/v1/auth/callback').get((req, res, next) => {
    passport.authenticate('coinbase', (err, user, info) => {
      if (err) {
        return next(err)
      };
     req.login(user, function(err) {
          if (err) { 
            console.log('got an error:', err);
            return next(err); 
          }
          process.nextTick(() => {
            const loginUser = user.user || user;
            if (loginUser.defaultViewHost === null) {
              return res.redirect('/choose-role');
            } else {
              return res.redirect('/dashboard');
            }
          });
      });
    })(req, res, next);
  });
};
