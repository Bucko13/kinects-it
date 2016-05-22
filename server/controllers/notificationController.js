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

// Toggles device for both guests and hosts
exports.toggleDevice = (req, res) => {
  const notification = req.body;
  const deviceId = notification.metadata.deviceId;
  const deviceState = notification.metadata.deviceState;

  const updateDevice = {
    deviceId,
    isactive: deviceState.isactive,
    paidusage: deviceState.paidusage,
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
          if (deviceState.paidusage === 'true') {
            const deviceTransaction = {
              useraccountid: parseInt(deviceState.payaccountid, 10),
              deviceid: deviceState.deviceid,
              amountspent: parseFloat(deviceState.amountspent, 10),
              timespent: parseInt(deviceState.timespent, 10),
            };
            // Add to the device transaction database
            return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}) RETURNING *', deviceTransaction);
          }
          return;
        })
        .then((transactionData) => {
          if (transactionData) {
            logger.info('SUCCESS in device_transactions INSERT: ', transactionData);
            const d = new Date();
            const now = d.getTime();
            const endingTime = now + parseInt(deviceState.timespent, 10);

            // Add to expiry queue if guest request - adds deviceId as value, endingTime as the score - time complexity is O(log(N))
            client.zadd('device', endingTime, deviceId, redis.print);
          }

          return res.json({ success: true, transactionData });
        })
        .catch((transError) => {
          logger.error('ERROR in toggleDevice: ', transError);
          return res.json({ success: false, message: 'Failed to communicate to device, please try again' });
        });
    }
  });
};

