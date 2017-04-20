import jwt from 'jsonwebtoken';

import { passphrase } from '../serverConfig.js';
import { endpointErrorHandler, logger } from '../utility.js';

// middleware func declaration for token validation
module.exports = (request, response, next) => {
    // get the full request route
    const requestRoute = `${request.protocol}://${request.get('Host')}${request.originalUrl}`;
    logger.info(`conducting token validation on ${requestRoute}`);
    // check request for token
    const accessToken =
        (request.body && request.body.accessToken) ||
        (request.query && request.query.accessToken) ||
        request.headers['x-access-token'];
    if (accessToken) { // if a token is found
        jwt.verify(accessToken, passphrase(), (error, decodedToken) => {
            if (error) {
                return response.status(403).json(
                    endpointErrorHandler(request.method, request.originalUrl, `帳號使用權限發生錯誤: ${error.message}`)
                );
            }
            logger.info('credential is valid...');
            next();
        });
    } else { // if there is no token, return an error
        return response.status(403).json(
            endpointErrorHandler(request.method, request.originalUrl, '認證遺失，請重新登入')
        );
    }
};
