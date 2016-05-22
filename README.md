#__Kinects.It__  

##__An application for homeowners to rent their appliances to guests.__

Your appliances are lazy. Put them to work with Kinects.it.

With Kinects.it, you don't need to wait for your home to get smart. Just plug in and get started. No more hunting for quarters or surprises on your electricity bill.

#### Master branch build status: ![](https://travis-ci.org/Kinectsit/kinects-it.svg?branch=master)

##__Table of Contents__

1. [Introduction](#Introduction)
2. [Requirements](#requirements)
3. [Development](#development)
- [Dependencies](#dependencies)
- [Tasks](#tasks)
5. [Resources](#resources)
- [User Flow](#user-flow)
- [Client File Structure](#client-file-structure)
- [Server Architecture](#server-architecture)
- [Database Schema](#database-schema)
- [Local API Routes](#local-api-routes)
- [Third-Party API Interactions](#third-party-api-interactions)
- [Styling](#styling)
4. [Team](#team)
6. [Contributing](#contributing)


##__Introduction__

###__How it works__

####__Instructions for Hosts__
1. Sign up for a host account on the website. You can use local sign-in for demo purposes - or you can use Coinbase to set up payments.
2. Plug your applicance into the power socket we provide *
3. Use the hardware code on that socket to add your device to the website.
4. Share your house code with any guests who stay in your house.
5. Start collecting payments and view detailed usage stats. 

####__Instructions for House Guests__
1. Sign up for a guest account on the website. You can use local sign-in for demo purposes, or to purchase device use, set up a Coinbase account.
2. Add your current rental to your account by using the code your host has provided. 
3. View all devices and activity on your dashboard. Click on a device to view previous transactions or purchase time. 
4. After paid usage expires, the power to that device turns off. 

> * You can create your own demo using Little Bits - read the hardware section below for more information.


##__Requirements__

###__Tech Stack__

####__Server__
- Node 
- Express
- Postgres
- Redis

####__Client__
- React 
- Redux 
- Material UI
- Foundation
- SASS
- Webpack

####__Hardware__
- Provided

> Alternatively, you can create your own testing account using the Little Bits Smart Home Kit: Power, Button, CloudBit, AC & IR. Use the MAC address of your CloudBit in the device set up page, and add your access token to your config.js file.

####__APIs__
- Little Bits <http://developers.littlebitscloud.cc/>
- Coinbase Connect <https://developers.coinbase.com/>
- Coinbase Merchant Checkout

####__Continuous Integration and Testing__
- Mocha
- Supertest
- TravisCI - <https://travis-ci.org/Kinectsit/kinects-it>

####__Deployment__
- AWS EC2 


##__Development__

###__Dependencies__

You should have the following applications installed on your local machine:
- NPM
- NodeJS
- Postgres
- Redis

### Tasks

From within the root directory:

Install node modules:
```sh
npm install
```

Set up Postgres database to handle persistent data:
```sh
psql -U postgres -d kinectdb -f ./server/config/schema.sql

// to use dummy data in application
node dummyData.js
```

Set up Redis server to handle device usage expiration times:
```sh
redis-server /usr/local/etc/redis.conf --port 6379
```

Start your server in development mode(localhost:3001)
```sh
npm start
```

Alternatively, start your server in production mode (localhost:3000). You will need to use production mode if you are interacting with Coinbase
```sh
npm run build
node server/server.js
```

Create a config.js file at the root level to store your API keys. You can find your access token for your Cloudbit by following these instructions: <http://developers.littlebitscloud.cc/access>, and you can get your Coinbase keys from this link: <https://www.coinbase.com/settings/api​>. Make sure you add this to your .gitignore file if it isn't already.

```sh
module.exports = {
  ACCESS_TOKEN: '',
  COINBASE_CLIENT_ID: '',
  COINBASE_CLIENT_SECRET: '',
};
```

##__Team__
- Product Owner: Bucko Perley
- Scrum Master: Bryan Newby
- Development Team Members: Krista Moroder, Bucko Perley, Bryan Newby


##__Contributing__

To contribute, create a fork on a pull request on a feature branch. We will do our best to review pull requests in a timely fashion. 


###__Backlog__

1. Add a third database to store device transaction query data (stored for lookup per device, and/or by user).
2. Add the ability for users to upload photos for devices, and/or use the device category table in the database.
3. Add the ability for users to be both a host and a guest.
4. Allow hosts or guests to be in multiple houses at once.
5. Integrate additional payment options.


##__Resources__

###__User Flow__

The home dashboard is the primary screen for both guests and hosts. From there, each user can select a device - and depending on their role, interact with that device in different ways - including toggling the power on/off, paying for usage, and/or viewing transaction history.

![kinectsituserflow](https://cloud.githubusercontent.com/assets/5761911/15413706/f2437986-1de7-11e6-9b99-c097845bef7d.png)


###__Client File Structure__
This project uses React with React-Router and Redux. The image below shows the primary files in the project, and how Redux interacts with them to manage an immutable state tree. 

####__Why We Chose React__
Having a responsive client-side for this application is important; users are quickly (and often!) navigating through many different pages. Because of that, we decided to build a single-page application using React. We chose React beause of its speed and modularity - we liked that we were able to separate concerns and we also liked the number of useful libraries (like React Router and Redux) that supported the framework. Additionally, React Native is quickly gaining credibility in developer circles - and transitioning this application to a mobile application (which it is a natural fit for) would be fairly simple.

####__Why We Chose Redux__
Redux was the missing piece we need to build out our file structure. It allowed us to handle state in a more controlled way (a centralized, immutable state tree), and also allowed us to pass only the information down that was necessary (so we didn’t have to bog down each page with unncessary information). If you are not familiar with Redux, the following resources may be useful: 
1. Logger middleware for Redux (open Chrome Console when interacting with code to see state tree) <https://github.com/theaqua/redux-logger>
2. Egghead tutorial from creator of Redux: <https://egghead.io/series/getting-started-with-redux>
3. Full-stack Redux tutorial: <http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html>
4. Redux Boilerplate (we used components of this): <https://github.com/coryhouse/react-slingshot>

![kinectsitclientfilestructure](https://cloud.githubusercontent.com/assets/5761911/15413705/f2102c52-1de7-11e6-8a60-4c116452648e.png)


###__Server Architecture__ 

Currently, there is one server, that acts as the API to the client. It also interacts with two third-party APIs, and two databases. Postgres holds relational data (schema below), and Redis stores the expiration time for devices in use by a guest. 

####__Why We Chose Node__
Our front-end was written using JavaScript so we chose Node to keep the language consistent between both sides of the application - this allowed the development team to work on both sides of the application. We also used Express to abstract away unncessary complexity, particulary with parsing requests and responses.

####__Why We Chose Postgres__
Relationships are important in our application - so we wanted a relational database that could handle this complexity. We chose Postgres because of its ability to scale and fast lookup times. We chose not to use an ORM because it wasn’t necessary to abstract out our interactions with Postgres. We ended up using a library called pgPromise that made structuring queries a bit cleaner.

####__Why We Chose Redis__
We needed to run a cron job (once per minute) to deal with toggling off devices with “expired time” for guests. Redis allowed us to keep and delete this data in an fast and efficient key-value store. We chose Redis over other non-persistent databases because of the functionality to sort sets based on a ‘score’ (see here: <http://redis.io/commands/ZRANGE>). The score we used for each guest device was the expiration time in milliseconds. Adding and returning items from this set has time complexities of O(log(N)) and O(log(N) + M).

![server architecture kinectsit](https://cloud.githubusercontent.com/assets/5761911/15435698/a8f137ce-1e72-11e6-8950-2f59943396c4.png)


###__Database Schema__ 

####__Schema Decisions and Backlog Issues:__
1. There is a join table between users and houses right now (USERS_HOUSES), even though the current application is built to only handle one house per user at a time. Allowing users to be in multiple houses is currently in the backlog, so we built our database to support that future possibility.
2. The PAY_METHODS table needs to be pre-populated with payment options. Currently, the only option is Coinbase and a Demo method (empty).
3. The DEVICES table has two fields for caching total time spent and total cost spent (for a more efficent lookup). This is not currently being utilized (backlog).
4. The DEVICE_CATEGORY table is not currently being used (backlog).
5. The DEVICE_TRANSACTIONS table holds ALL device transactions, so dealing with this data is not as efficient as we'd like. The backlog has an open issue for creating a query cache.

![kinectsitdatabaseshema](https://cloud.githubusercontent.com/assets/5761911/15413746/5557457a-1de8-11e6-9bd9-f3576a0967ff.png)

####__Useful Database Commands__
To check the content in your databases while in development, use the following commands:

```sh
//// FROM POSTGRES TERMINAL

// show all databases
\list

// connect to the database used in this project
\c kinectdb

// show all tables in that database
\dt

// show all data in the table called 'device transactions' 
// don't forget the semi-colon!
select * from device_transactions;
```

```sh
//// FROM REDIS TERMINAL

// will return the value of all items stored
// this is the hardware key for the devices waiting to be toggled off
zrangebyscore device -inf +inf

// will return the score for all items stored
// this is the 'expiration time' for each device - in milliseconds
// the worker is checking every minute if this time is older than the current time
// once it is, the worker will send a call to toggle the hardware
// and will delete this key-value set from this database
zrem device [deviceHardwareKey]
```


###__Local API Routes__

####__Primary Interactions__
The pictures below show the the urls, methods, purpose, and data received back from our client-to-server API requests. 

![apiusers](https://cloud.githubusercontent.com/assets/5761911/15436412/a0d2993a-1e76-11e6-92af-d7fa5df01c23.png)
![apihouses](https://cloud.githubusercontent.com/assets/5761911/15436413/a0d36db0-1e76-11e6-8002-72150180aa4c.png)
![apidevices](https://cloud.githubusercontent.com/assets/5761911/15436603/aafa0fc8-1e77-11e6-9f7d-35890f6ad7b5.png)



###__Third-Party API Interactions__

####__LittleBits API__
The sequence diagram below shows how we use the LittleBits API for three actions: pinging the device on setup, toggling the device (host), and toggling the device a second time from the worker (guest). 

####__Coinbase API__
The diagram also shows the sequence for Coinbase O-Auth in our application.

![kinectsitthirdpartyapi](https://cloud.githubusercontent.com/assets/5761911/15436156/49f8b848-1e75-11e6-8a0c-fa0a46d7b6e2.png)



###__Styling__

####__Tech Stack__
1. Material UI (for components) <http://www.material-ui.com/#/>
2. Foundation (primarily for the grid system) <http://foundation.zurb.com/grid.html>
3. SASS <http://sass-lang.com/> 
4. rd3.js for data visualization <https://yang-wei.github.io/rd3/>
4. Video (shot with Panasonic Lumix GX7 with Olympus M. Zuiko 45mm f1.8 lens)

####__Original Mockups__
The link below contains the original design files, which also include integrated payment dashboards (in backlog). View all of the mockups in the image below here: <https://goo.gl/IhnrhM>

![kinectsmockupfolderview](https://cloud.githubusercontent.com/assets/5761911/15413743/5372f880-1de8-11e6-9d82-bd1006400bcf.png)

