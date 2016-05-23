/* eslint-disable strict */
/* eslint-disable max-len, consistent-return, no-else-return */

'use strict';
const logger = require('../config/logger.js');
const db = require('../db.js');
const request = require('request');
const hardware = require('../../config.js');
const redis = require('redis');
const client = redis.createClient(); // defaults to 127.0.0.1:6379
const crontab = require('node-crontab');

client.on('error', (err) => {
  console.log(`Error ${err}`);
  return err;
});

// Gets all device transactions for a home
exports.getUsage = (req, res, next) => {
  db.query('SELECT * FROM device_transactions WHERE deviceId IN(SELECT id FROM devices WHERE houseid=${houseid})', {
    houseid: req.params.homeId,
  })
  .then((result) => {
    const message = { transactions: result };
    db.query('SELECT name, hardwarekey from devices WHERE houseid=${houseid}', { houseid: req.params.homeId })
      .then((devices) => {
        message.devices = devices;
        res.json(message);
        return null;
      })
      .catch((error) => {
        logger.info('ERROR in get devices: ', error);
        res.send(error);
        return null;
      })
      .finally(() => next()
      );
  })
  .catch((error) => {
    logger.info('ERROR in get devices: ', error);
    return error;
  })
  .finally(() => next());
};

// Gets list of devices when dashboard first loads
exports.getDevices = (req, res) => {
  const homeId = req.params.homeId;
  logger.info('HomeId in getDevices: ', homeId);

  db.query('SELECT ${column^} FROM ${table~} where houseId=${home}', {
    column: '*',
    table: 'devices',
    home: homeId,
  })
  .then((result) => {
    logger.info('SUCCESS in getDevices');
    res.json(result);
    return null;
  })
  .catch((error) => {
    logger.info('ERROR in get devices: ', error);
    res.json({ success: false, message: 'Failed to retrieve devices' });
    return null;
  });
};

// Gets device transactions for individual devices
exports.getDeviceInfo = (req, res, next) => {
  if (req.query.user) {
    let success = false;
    let data = null;
    let message = null;

    db.query('SELECT * FROM device_transactions WHERE deviceid=${deviceid} AND useraccountid=(SELECT id FROM user_pay_accounts WHERE userid=${userid})', {
      deviceid: req.params.deviceId,
      userid: req.query.user,
    })
    .then((result) => {
      if (result && result.length > 0) {
        success = true;
        data = result;
        logger.info('SUCCESS in getDevices: ', result);
      } else {
        success = false;
        message = 'Failed to retrieve device information';
        data = [];
        logger.info('ERROR in getDevices: ', result);
      }

      res.json({ success, data, message });
      return null;
    })
    .catch((error) => {
      logger.info('ERROR in get devices: ', error);
      res.json({ success: false, message: 'Failed to retrieve devices' });
      return { success: false, message: 'Failed to retrieve devices' };
    })
    .finally(() => next()
    );
  } else {
    db.query('SELECT * FROM device_transactions WHERE deviceid=${deviceid}', {
      deviceid: req.params.deviceId,
    })
    .then((result) => {
      logger.info('SUCCESS in getDevices: ', result);
      res.json(result);
      return null;
    })
    .catch((error) => {
      logger.info('ERROR in get devices: ', error);
      res.send(error);
      return null;
    })
    .finally(() => next()
    );
  }
};

// Adds the device to the database after host fills out set options form
exports.addDevice = (req, res, next) => {
  const newDevice = {
    houseId: req.params.homeId,
    name: req.body.name,
    description: req.body.description,
    isactive: req.body.isactive,
    deviceId: req.body.id,
    usagecostoptions: req.body.cost,
  };

  db.one('INSERT INTO devices(id, houseId, name, description, isactive, hardwarekey, usagecostoptions) VALUES(${deviceId}, ${houseId}, ${name}, ${description}, ${isactive}, ${deviceId}, ${usagecostoptions}) RETURNING *', newDevice)
  .then((result) => {
    logger.info('SUCCESS in addDevice:', result);
    res.json(result);
    return null;
  })
  .catch((error) => {
    logger.info('ERROR in addDevice: ', error);
    res.send(error);
    return null;
  })
  .finally(() => next()
  );
};

// Sends ping to device after host first types the code
exports.pingDevice = (req, res) => {
  const deviceId = req.params.deviceId;

  db.none('SELECT ${column^} FROM ${table~} where id=${device}', {
    column: '*',
    table: 'devices',
    device: deviceId,
  })
  .then(() => {
    // if none exist, test if it responds
    const options = { method: 'POST',
    url: `https://api-http.littlebitscloud.cc/devices/${deviceId}/output`,
    headers: {
      authorization: `Bearer ${hardware.ACCESS_TOKEN}`,
      'content-type': 'application/json',
      accept: 'application/vnd.littlebits.v2+json',
    },
    body: { duration_ms: 4000 },
    json: true };

    request(options, (error, response, body) => {
      if (error) {
        throw new Error('error!!! ', error);
      } else {
        res.json(body);
        return null;
      }
    });
  })
  .catch((err) => {
    // One already exists, return an error
    logger.error('Device already exists, return error: ', err);

    const error = { setup: false,
                    message: 'Setup failed. Device already exists' };

    res.send(error);
    return null;
  });
};

// Toggles device for both guests and hosts
exports.toggleDevice = (req, res) => {
  const deviceId = req.params.deviceId;
  const updateDevice = {
    deviceId: req.params.deviceId,
    isactive: req.body.isactive,
    paidusage: req.body.paidusage,
  };

  const options = { method: 'POST',
    url: `https://api-http.littlebitscloud.cc/devices/${deviceId}/output`,
    headers: {
      authorization: `Bearer ${hardware.ACCESS_TOKEN}`,
      'content-type': 'application/json',
      accept: 'application/vnd.littlebits.v2+json',
    },
    body: { duration_ms: 100 },
    json: true };

  request(options, (error /* , response, body */) => {
    if (error) {
      return res.json({
        success: false,
        message: 'Failed to communicate to device, please try again',
      });
    } else {
      // Update database with the current status of the device
      db.many('UPDATE devices SET isactive=${isactive}, paidusage=${paidusage} WHERE id=${deviceId} RETURNING *', updateDevice) // .many for demo purposes - multiple devices with same id
        .then((deviceData) => {
          logger.info('SUCCESS UPDATE of devices: ', deviceData);
          // If the guest purchased the time...
          if (req.body.paidusage === 'true') {
            const deviceTransaction = {
              useraccountid: parseInt(req.body.payaccountid, 10),
              deviceid: req.body.deviceid,
              amountspent: parseFloat(req.body.amountspent, 10),
              timespent: parseInt(req.body.timespent, 10),
            };
            // Add to the device transaction database
            return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}) RETURNING *', deviceTransaction);
          }
          return null;
        })
        .then((transactionData) => {
          if (transactionData) {
            logger.info('SUCCESS in device_transactions INSERT: ', transactionData);
            const d = new Date();
            const now = d.getTime();
            const endingTime = now + parseInt(req.body.timespent, 10);

            // Add to expiry queue if guest request - adds deviceId as value, endingTime as the score - time complexity is O(log(N))
            client.zadd('device', endingTime, deviceId, redis.print);
          }

          res.json({ success: true, transactionData });
          return null;
        })
        .catch((transError) => {
          logger.error('ERROR in toggleDevice: ', transError);
          res.json({ success: false, message: 'Failed to communicate to device, please try again' });
          return null;
        });
    }
  });
};

// This will call this function every 1 minutes
crontab.scheduleJob('*/1 * * * *', () => {
  const d = new Date();
  const now = d.getTime();
  client.multi()
    .zrangebyscore('device', '-inf', now)
    .exec((err, results) => {
      // toggle off all of the devices that have expired times
      for (let i = 0; i < results[0].length; i++) {
        const device = results[0][i];
        const options = { method: 'POST',
          url: `https://api-http.littlebitscloud.cc/devices/${device}/output`,
          headers: {
            authorization: `Bearer ${hardware.ACCESS_TOKEN}`,
            'content-type': 'application/json',
            accept: 'application/vnd.littlebits.v2+json',
          },
          body: { duration_ms: 100 },
          json: true };

        request(options, (error) => {
          if (error) {
            throw new Error('error!!! ', error);
          } else {
            // delete device from redis
            client.zrem('device', results[0][i]);
            // update persistent database
            const deviceOff = {
              isactive: false,
              paidusage: false,
              hardwarekey: results[0][i],
            };
            db.many('UPDATE devices SET isactive=${isactive}, paidusage=${paidusage} WHERE id=${hardwarekey} RETURNING *', deviceOff) // .many for demo purposes - multiple devices with same id
              .then((result) => {
                logger.info(result);
                return result;
              })
              .catch((updateError) => {
                logger.info(updateError);
                return updateError;
              });
          }
        });
      }
    });
});

module.exports.removeDevice = (req, res) => {
  const device = {
    id: req.params.deviceId,
    houseid: null,
  };
  db.one('UPDATE devices SET houseid=${houseid} WHERE id=${id} RETURNING *', device)
    .then((result) => {
      logger.info(result);
      return res.json(result);
    })
    .catch((err) => {
      logger.info(err);
      return res.send(err);
    });
};

