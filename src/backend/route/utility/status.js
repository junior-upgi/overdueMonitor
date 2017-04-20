import express from 'express';
import os from 'os';

import { systemReference } from '../../serverConfig.js';
import { currentDatetimeString } from '../../utility.js';

const router = express.Router();

router.get('/utility/status', (request, response) => {
    return response.status(200).json({
        hostname: os.hostname(),
        system: systemReference,
        status: 'online',
        timestamp: currentDatetimeString()
    });
});

module.exports = router;
