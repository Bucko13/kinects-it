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
    console.log('error!!!!', err);
  });
};

module.exports.createTxCheckout = (callback) => {
  const cbClient = new coinbase.Client({
    // accessToken: payInfo.accesstoken,
    // refreshToken: payInfo.refreshtoken,
    apiKey: authKeys.COINBASE_API_KEY,
    apiSecret: authKeys.COINBASE_API_SECRET,
  });
  // cbClient.strictSSL = false;
  // then get the client's account with the accountid
  cbClient.createCheckout({ amount: '10.00',
                         currency: 'USD',
                         name: 'Spring donation',
                         description: 'Sample checkout',
                         type: 'donation',
                         style: 'donation_large',
                         customer_defined_amount: true,
                         amount_presets: ['20.00', '50.00'],
                         collect_email: true,
                         metadata: {
                           product_id: 'id_1020',
                         } }, (err, checkout) => {
    if (err) return err;
    console.log('the checkout information:', checkout);
    return callback(checkout.embed_code);
  });
};
