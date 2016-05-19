DROP TABLE IF EXISTS users_houses CASCADE;

CREATE TABLE users_houses (
  userId SERIAL PRIMARY KEY,
  houseId INTEGER,
  isHostHouse BOOLEAN DEFAULT FALSE
);

DROP TABLE IF EXISTS houses CASCADE;
    
CREATE TABLE houses (
  id SERIAL PRIMARY KEY,
  houseName VARCHAR,
  inviteCode VARCHAR
);

DROP TABLE IF EXISTS devices CASCADE;
    
CREATE TABLE devices (
  id VARCHAR PRIMARY KEY,
  houseId INTEGER,
  name VARCHAR,
  description VARCHAR,
  isActive BOOLEAN DEFAULT FALSE,
  paidUsage BOOLEAN DEFAULT FALSE,
  hardwareKey VARCHAR,
  hardwareType VARCHAR,
  usageTimeOptions INTEGER,
  usageCostOptions INTEGER,
  deviceCategoryId INTEGER,
  totalTimeSpent INTEGER,
  totalCostSpent INTEGER
);


DROP TABLE IF EXISTS device_category CASCADE;
    
CREATE TABLE device_category (
  id SERIAL PRIMARY KEY,
  name INTEGER,
  defaultTime INTEGER,
  defaultCost INTEGER,
  defaultPhoto INTEGER
);


DROP TABLE IF EXISTS device_transactions CASCADE;
    
CREATE TABLE device_transactions (
  id SERIAL PRIMARY KEY,
  userAccountId INTEGER,
  deviceId VARCHAR,
  amountSpent DECIMAL(10,2),
  timeSpent INTEGER,
  timeStamp TIMESTAMP default now()
);


DROP TABLE IF EXISTS pay_methods CASCADE;
    
CREATE TABLE pay_methods (
  id SERIAL PRIMARY KEY,
  name VARCHAR
);


DROP TABLE IF EXISTS user_pay_accounts CASCADE;
    
CREATE TABLE user_pay_accounts (
  id SERIAL PRIMARY KEY,
  nickname VARCHAR,
  accountId VARCHAR,
  accessToken VARCHAR,
  refreshToken VARCHAR,
  payMethodId INTEGER,
  userId INTEGER
);

DROP TABLE IF EXISTS users CASCADE;
    
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  email VARCHAR,
  password VARCHAR,
  defaultViewHost BOOLEAN,
  avatarURL VARCHAR
);

ALTER TABLE users_houses ADD FOREIGN KEY (userId) REFERENCES users (id);
ALTER TABLE users_houses ADD FOREIGN KEY (houseId) REFERENCES houses (id);
ALTER TABLE devices ADD FOREIGN KEY (houseId) REFERENCES houses (id);
ALTER TABLE devices ADD FOREIGN KEY (deviceCategoryId) REFERENCES device_category (id);
ALTER TABLE device_transactions ADD FOREIGN KEY (userAccountId) REFERENCES user_pay_accounts (id);
ALTER TABLE device_transactions ADD FOREIGN KEY (deviceId) REFERENCES devices (id);
ALTER TABLE user_pay_accounts ADD FOREIGN KEY (payMethodId) REFERENCES pay_methods (id);
ALTER TABLE user_pay_accounts ADD FOREIGN KEY (userId) REFERENCES users (id);

INSERT INTO pay_methods (name) VALUES ('demo'), ('coinbase');