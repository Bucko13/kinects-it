/* eslint max-len: ["error", 150] */
/* eslint-disable strict */
'use strict';
const logger = require('../config/logger.js');
const db = require('../db.js');

module.exports.signUp = (req, res, next) => {
  db.one('INSERT INTO users(name, email, password, defaultViewHost) VALUES(${name}, ${email}, ${password}, ${host}) RETURNING *', req.body)
  .then((result) => {
    logger.info(result);
    res.send(result);
  })
  .catch((error) => {
    logger.info(error);
    res.send(error);
  })
  .finally(() => {
    next();
  });
};

module.exports.addToHome = (req, res, next) => {
  /*
   transaction will need to do the following:
     1. Retrieve the house id based on the invite code
     2. Insert a record into users_houses with the house id from #1 and the user id passed in on the API

  */
  const userId = req.params.id;
  const inviteCode = req.params.code;
  let houseName;

  db.query('SELECT ${column^} FROM ${table~} where invitecode=${code}', {
    column: '*',
    table: 'houses',
    code: inviteCode,
  })
  .then((houseData) => {
    const house = houseData[0].id;
    houseName = houseData[0].housename;
    logger.info('SUCCESS in addToHome retrival of house id: ', house);

    return db.one('INSERT INTO users_houses (userid, houseid, ishosthouse) values($1, $2, $3) RETURNING *', [userId, house, false]);
  })
  .then((data) => {
    logger.info('SUCCESS insert for addToHome: ', data);

    const message = {
      success: true,
      houseid: data.houseid,
      userid: data.userid,
      housename: houseName,
    };

    return res.json(message);
  })
  .catch((error) => {
    logger.info('ERROR in addToHome: ', error);
    // TODO: check if duplicate key error (meaning already in home)
    return res.send(error);
  })
  .finally(() => {
    next();
  });
};

module.exports.leaveHome = (req, res) => {
  const user = {
    userid: parseInt(req.params.id, 10),
  };
  db.one('DELETE FROM users_houses WHERE userid=${userid} RETURNING *', user)
    .then((result) => {
      logger.info(result);
      return res.json(result);
    })
    .catch((err) => {
      logger.info(err);
      return res.send(err);
    });
};

