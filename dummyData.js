/* eslint max-len: ["error", 300] */
/* eslint-disable strict */
'use strict';

/*
  STEPS TO RUN:

  1) postgres must be running
  2) from psql prompt, drop kinectdb:
         drop database kinectdb;

  3) from project directory:
    createdb kinectdb -U postgres
    psql -U postgres -d kinectdb -f ./server/config/schema.sql
    node dummyData.js
*/

const bcrypt = require('bcrypt-nodejs');
const db = require('./server/db.js');
const User = require('./server/models/userModel');

const guestPassword = bcrypt.hashSync('12345', bcrypt.genSaltSync(8), null);
const hostPassword = bcrypt.hashSync('12345', bcrypt.genSaltSync(8), null);

const randomDate = () => {
  const dt = new Date();
  const month = Math.floor(Math.random() * 5);
  const day = Math.floor(Math.random() * 28);

  dt.setMonth(month);
  dt.setDate(day);
  return dt;
};

const randomSpend = () => {
  return Math.random() * 40;
};

const randomTime = () => {
  return Math.floor(Math.random() * 1000000000);
};

const hostUser = { name: 'hostBob',
  email: 'hostBob@bob.com',
  password: hostPassword,
  host: 'host',
  home: 'Bob\'s',
  defaultviewhost: true,
  avatarURL: '',
  coinbaseId: '' };

const guestUser = { name: 'guestBob',
  email: 'guestBob@bob.com',
  password: guestPassword,
  host: 'guest',
  defaultviewhost: false,
  avatarURL: '',
  coinbaseId: '' };

let guest = null;
let host = null;
let homeId = null;
let deviceId1 = null;
let deviceId2 = null;
let deviceId3 = null;

User.create(guestUser)
  .then((data) => {
    console.log('Succesfully created guest = ', data);
    guest = data;
    return User.create(hostUser);
  })
  .then((hostData) => {
    console.log('Succesfully created host = ', hostData);
    host = hostData;
    homeId = hostData.user.house.id;

    console.log('guest = ', guest);
    console.log('host = ', host);

    const newDevice1 = {
      houseId: homeId,
      name: 'Washing Machine',
      description: 'New Whirlpool washing machine.  A standard washing cycle is 45 minutes.',
      isactive: false,
      paidusage: false,
      deviceId: '00e04c038343',
      usagecostoptions: 1,
    };
    return db.one('INSERT INTO devices(id, houseId, name, description, isactive, paidusage, hardwarekey, usagecostoptions) VALUES(${deviceId}, ${houseId}, ${name}, ${description}, ${isactive}, ${paidusage}, ${deviceId}, ${usagecostoptions}) RETURNING *', newDevice1);
  })
  .then((result) => {
    console.log('SUCCESS adding device1:', result);

    deviceId1 = result.id;

    const newDevice2 = {
      houseId: homeId,
      name: 'Dryer',
      description: 'New Whirlpool dryer.  A standard drying cycle is 60 minutes.',
      isactive: true,
      paidusage: true,
      deviceId: '11234lj234',
      usagecostoptions: 1,
    };
    return db.one('INSERT INTO devices(id, houseId, name, description, isactive, paidusage, hardwarekey, usagecostoptions) VALUES(${deviceId}, ${houseId}, ${name}, ${description}, ${isactive}, ${paidusage}, ${deviceId}, ${usagecostoptions}) RETURNING *', newDevice2);
  })
  .then((result) => {
    console.log('SUCCESS adding device2:', result);
    deviceId2 = result.id;

    const newDevice3 = {
      houseId: homeId,
      name: 'Electric Fireplace',
      description: 'See temparature settings behind the control panel on top of fireplace.',
      isactive: false,
      paidusage: false,
      deviceId: 'klj32454j4aso',
      usagecostoptions: 1,
    };
    return db.one('INSERT INTO devices(id, houseId, name, description, isactive, paidusage, hardwarekey, usagecostoptions) VALUES(${deviceId}, ${houseId}, ${name}, ${description}, ${isactive}, ${paidusage}, ${deviceId}, ${usagecostoptions}) RETURNING *', newDevice3);
  })
  .then((result) => {
    console.log('SUCCESS adding device3:', result);
    deviceId3 = result.id;

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId1,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId1,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId1,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId1,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId1,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId1,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId1,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId1,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId1,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId1,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId2,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId2,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId2,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId2,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId2,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId2,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId2,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId2,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId2,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId2,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId2,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId3,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId3,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId3,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId3,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId3,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId3,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId3,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId3,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);

    // create all the transactions
    const deviceTransaction = {
      useraccountid: parseInt(guest.payAccounts[0].id, 10),
      deviceid: deviceId3,
      amountspent: randomSpend(),
      timespent: randomTime(),
      timestamp: randomDate(),
    };
    // Add to the device transaction database
    return db.one('INSERT INTO device_transactions(useraccountid, deviceid, amountspent, timespent, timestamp) VALUES(${useraccountid}, ${deviceid}, ${amountspent}, ${timespent}, ${timestamp}) RETURNING *', deviceTransaction);
  })
  .then((result) => {
    console.log('SUCCESS adding transaction:', result);
    return db.one('INSERT INTO users_houses(userid, houseid, ishosthouse) VALUES(${userid}, ${houseid}, ${ishosthouse}) RETURNING *', {
      userid: 1,
      houseid: 1,
      ishosthouse: false,
    });
  })
  .then((guestHost) => {
    console.log('SUCCESS adding guest to host rental', guestHost);
  });

// return;

