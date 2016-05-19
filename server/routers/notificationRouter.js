const notificationRouter = require('express').Router();
const homeController = require('../controllers/homeController.js');
const notificationController = require('../controllers/notificationController.js');

notificationRouter.post(notificationController.toggleDevice);

module.exports = notificationRouter;