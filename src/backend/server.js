/*
// const prettyJson = require('prettyjson');


if (process.env.NODE_ENV === 'development') {
    main.use('/lintingReport', express.static(path.join(__dirname, '/../temp/lintingReport'))); // Eslint html reporter results
    utility.logger.info('running in development mode');
}

// data routes
main.use('/', require('./route/data/purchaseOrder.js'));
main.use('/', require('./route/data/rawMaterial.js'));
main.use('/', require('./route/data/shipment.js'));
main.use('/', require('./route/data/supplier.js'));

*/

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import morgan from 'morgan';
import path from 'path';

import { serverPort, serverUrl, systemReference, uploadDir } from './serverConfig.js';
import { logger, statusReport } from './utility.js';

const app = express();
const main = express.Router();

app.use(`/${systemReference}`, main);
main.use(cors());
main.use(morgan('dev'));
main.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
main.use(bodyParser.json()); // parse application/json
main.use('/', express.static(path.join(__dirname, '/../public'))); // frontend client server route
main.use('/bower_components', express.static(path.join(__dirname, '/../bower_components'))); // serve bower packages

// utility routes
main.use('/', require('./route/utility/status.js'));
main.use('/', require('./route/utility/login.js'));

// initiate server script
if (!module.parent) {
    if (!fs.existsSync(`${uploadDir}/`)) { // check if photo upload dir's existence
        fs.mkdirSync(`${uploadDir}/`); // if not found, create directory
        logger.info(`${uploadDir}/ created for image storage`);
    }
    app.listen(serverPort, (error) => { // start backend server
        if (error) {
            logger.error(`error starting ${systemReference} server: ${error}`);
        } else {
            logger.info(`${systemReference} server in operation... (${serverUrl})`);
            statusReport.start(); // start the server status reporting function
        }
    });
}
