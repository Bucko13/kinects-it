/* eslint max-len: ["error", 300] */
/* eslint-disable arrow-body-style, strict */
'use strict';

const bcrypt = require('bcrypt-nodejs');
const User = {};
const db = require('../db.js');
const utils = require('../utils/helpers.js');
const logger = require('../config/logger.js');

User.generateHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

User.comparePasswords = (providedPassword, userPassword) => {
  const comp = bcrypt.compareSync(providedPassword, userPassword);
  return comp;
};

User.create = (newUser) => {
  return db.tx(t => (
    t.one('INSERT INTO users(name, email, password, defaultviewhost,avatarurl) VALUES(${name}, ${email}, ${password}, ${defaultviewhost}, ${avatarURL}) RETURNING id, name, email, defaultviewhost, avatarurl', newUser)
      .then(userData => {
        const pay = {
          userid: userData.id,
        };
        // if there is a coinbase id associated with new user
        // add the payment method
        if (newUser.coinbaseId.length) {
          pay.nickname = 'My Coinbase';
          pay.paymethodid = 2;
          pay.accessToken = newUser.accessToken;
          pay.refreshToken = newUser.refreshToken;
          pay.accountid = newUser.coinbaseId;
        } else {
          pay.nickname = 'My Demo Pay Method';
          pay.paymethodid = 1;
          pay.accessToken = '';
          pay.refreshToken = '';
          pay.accountid = '';
        }
        return t.one('INSERT INTO user_pay_accounts(nickname, userid, paymethodid, accesstoken, refreshtoken, accountid) VALUES(${nickname}, ${userid}, ${paymethodid}, ${accessToken}, ${refreshToken}, ${accountid}) RETURNING id, nickname, paymethodid', pay)
        .then((payAccount) => {
          // need to handle if this is coming from coinbase then
          // skip until we can update the user with the host information
          if (!userData.defaultviewhost) {
            return {
              name: userData.name,
              email: userData.email,
              id: userData.id,
              defaultViewHost: userData.defaultviewhost,
              payAccounts: [{
                id: payAccount.id,
                nickname: payAccount.nickname,
              }],
            };
          }
          const hostCode = utils.randomString(6);

          return t.one('INSERT INTO houses(invitecode, housename) VALUES($1, $2) RETURNING id, invitecode, housename', [hostCode, newUser.home])
            .then((houseData) => {
              return t.one('INSERT INTO users_houses(userid, houseid, ishosthouse) VALUES($1, $2, $3) RETURNING userid, houseid, ishosthouse', [userData.id, houseData.id, true])
              .then(() => {
                return {
                  user: {
                    name: userData.name,
                    email: userData.email,
                    id: userData.id,
                    defaultViewHost: userData.defaultviewhost,
                    house: {
                      id: houseData.id,
                      code: houseData.invitecode,
                      name: houseData.housename,
                    },
                    payAccounts: [{
                      id: payAccount.id,
                      nickname: payAccount.nickname,
                    }],
                  },
                };
              });
            });
        });
      })
  ));
};

User.update = (updateUser) => {
  // before update, just confirm we can find the user in the db
  let newUserObject = updateUser;
  const returnObject = {};
  return db.tx(t => (
    t.any('SELECT * from users where email=$1 OR name=$2', [updateUser.email, updateUser.name])
        .then((result) => {
          if (!result.length) {
           // if nothing is found then throw error that it doesn't exist
            return { Error: 'That user does not exist in the database. Update failed.' };
          }
          // if user is found in the database
          // we want to combine the result with the updateUser object passed in to the model
          // this merges updateUser into result, overwriting any common properties
          newUserObject = Object.assign(result[0], updateUser);
          return newUserObject;
        })
        .then(() => {
          // now we update the found user with the new user object
          return t.one('UPDATE users SET name=${name}, email=${email}, password=${password}, defaultviewhost=${defaultviewhost}, avatarurl=${avatarurl} WHERE email = ${email} RETURNING id, name, email, defaultviewhost, avatarURL', newUserObject);
        })
        .then((updatedUser) => {
          Object.assign(newUserObject, updatedUser);
          // if the user object has an access token from coinbase
          // need to save that in the datbase
          if (newUserObject.payAccount && newUserObject.payAccount === 'coinbase') {
            return t.one('UPDATE user_pay_accounts SET accesstoken=$1, refreshtoken=$2, accountid=$3,  WHERE userid=$4 AND paymethodid=2 RETURNING id, userid, nickname, paymethodid', [newUserObject.accessToken, newUserObject.refreshToken, newUserObject.coinbaseId, newUserObject.id]);
          }
          return {};
        })
        .then(() => {
          // updated user now need to check if has home to update
          return t.any('SELECT * FROM users_houses WHERE userid=$1', newUserObject.id);
        })
        .then((houseResult) => {
          if (houseResult.length) {
            // then there was a house association
            // we need to find the house and return its data
            return t.one('SELECT * FROM houses WHERE id=$1', houseResult[0].houseid)
            .then((foundHouse) => {
              // found a house and need to return the user object
              returnObject.user = newUserObject;
              returnObject.user.house = {
                id: foundHouse.id,
                code: foundHouse.invitecode,
                name: foundHouse.housename,
              };
              return returnObject;
            });
          } else if (newUserObject.defaultviewhost) {
            // the user is a host but has no house association in database
            // need to add/create a house
            const hostCode = utils.randomString(6);

            return t.one('INSERT INTO houses(invitecode, housename) VALUES($1, $2) RETURNING id, invitecode, housename', [hostCode, newUserObject.home])
              .then((newHouseData) => {
                returnObject.user = newUserObject;
                returnObject.user.house = {
                  id: newHouseData.id,
                  code: newHouseData.invitecode,
                  name: newHouseData.housename,
                };
                return t.one('INSERT INTO users_houses(userid, houseid, ishosthouse) VALUES($1, $2, $3) RETURNING userid, houseid, ishosthouse', [newUserObject.id, newHouseData.id, true])
                .then(() => returnObject);
              });
          }
          console.log('no house result and user is not a host, just return new newUserObject', newUserObject);
          return newUserObject;
        })
        .catch(err => {
          logger.info(err);
          return err;
        })
  ));
};

module.exports = User;
