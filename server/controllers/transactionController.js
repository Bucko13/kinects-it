// const logger = require('../config/logger.js');
const db = require('../db.js');
const coinbase = require('coinbase');
const authKeys = require('../../config.js');

module.exports.sendTransaction = (customerId, reqBody) => {
  // then pull out the body information and store as txArgs (to, amount, currency, description)
  const txArgs = {
    to: '',
    amount: reqBody.amount,
    currency: 'USD',
    description: reqBody.device.description,
  };
  // do a database query for the house owners email address
  return db.one('SELECT userid FROM users_houses WHERE houseid=$1 AND isHostHouse=true', 
    [reqBody.homeId])
  .then(hostid => {
    // use the host id to get the host email
    console.log('got this hostid back from first query:', hostid);
    return db.one('SELECT email FROM users WHERE id=$1', hostid.userid);
  })
  .then(hostEmail => {
    // save email to txArgs
    console.log('this is the hosts email:', hostEmail);
    txArgs.to = hostEmail;

    // then do a database query for user's payment information (refresh, access tokens, accountid)
    return db.one('SELECT * FROM user_pay_accounts WHERE userid=$1 AND paymethodid=2', customerId);
  })
  .catch(err => {
    console.log('error!', err);
  });
};

module.exports.createTxCheckout = (userId, reqBody, callback) => {
  const cbClient = new coinbase.Client({
    apiKey: authKeys.COINBASE_API_KEY,
    apiSecret: authKeys.COINBASE_API_SECRET,
  });
  const txArgs = {
    amount: reqBody.amount,
    currency: 'USD',
    description: reqBody.device.description,
    name: reqBody.device.name,
    deviceId: reqBody.device.id,
    // deviceState: reqBody.deviceState,
  };
  return db.one('SELECT userid FROM users_houses WHERE houseid=$1 AND isHostHouse=true',
    [reqBody.homeId])
  .then(hostid => {
    // use the host id to get the host email
    txArgs.hostId = hostid.userid;
    return db.one('SELECT email FROM users WHERE id=$1', hostid.userid);
  })
  .then(hostEmail => {
    // then get the client's account with the accountid
    Object.assign(txArgs, reqBody.deviceState);
    return cbClient.createCheckout({ amount: txArgs.amount,
                           currency: 'USD',
                           name: txArgs.name,
                           description: txArgs.description,
                           type: 'order',
                           style: 'custom_large',
                           // style: 'buy_now_large',
                           notifications_url: 'http://requestb.in/14gr32i1',
                           success_url: process.env.NODE_ENV === 'development' ? 'http://localhost:3001/dashboard' : 'https://kinects.it/dashboard',
                           cancel_url: process.env.NODE_ENV === 'development' ? 'http://localhost:3001/dashboard' : 'https://kinects.it/dashboard',
                           auto_redirect: true,
                           metadata: {
                             device_id: txArgs.deviceId,
                             host_id: txArgs.hostId,
                             host_email: hostEmail.email,
                             isactive: txArgs.isactive,
                             paidusage: txArgs.paidusage,
                             payaccountid: txArgs.payaccountid,
                             amountspent: txArgs.amountspent,
                             timespent: txArgs.timespent,
                           } }, (err, checkout) => {
      if (err) return err;
      return callback(checkout.embed_code);
    });
  })
  .catch(err => {
    console.log('Error:', err);
  });
};
