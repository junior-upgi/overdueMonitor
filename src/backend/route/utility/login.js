import bodyParser from 'body-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import ldap from 'ldapjs';

import { ldapServerUrl, passphrase, mssqlConfig, systemReference } from '../../serverConfig.js';
import { endpointErrorHandler, logger } from '../../utility.js';

const router = express.Router();
router.use(bodyParser.json());

router.post('/login', (request, response) => {
    const loginId = request.body.loginId;
    const method = request.method;
    const url = request.originalUrl;
    const ldapClient = ldap.createClient({ url: ldapServerUrl });
    ldapClient.bind(`uid=${loginId},ou=user,dc=upgi,dc=ddns,dc=net`, request.body.password, (error) => {
        if (error) {
            return response.status(403)
                .json(endpointErrorHandler(method, url, `${loginId} LDAP validation failure: ${error.lde_message}`));
        }
        ldapClient.unbind((error) => {
            if (error) {
                return response.status(403)
                    .json(endpointErrorHandler(method, url, `${loginId} LDAP server separation failure: ${error.lde_message}`));
            }
            logger.info(`${loginId} account info validated, checking access rights`);
            // continue to check if user has rights to access the website of the system selected
            const knex = require('knex')(mssqlConfig);
            knex.select('*')
                .from('productDatabase.dbo.privilegeDetail').debug(false)
                .where({ SAL_NO: loginId })
                .then((resultset) => {
                    if (resultset.length === 0) {
                        return response.status(403)
                            .json(endpointErrorHandler(method, url, `${loginId} 此帳號尚未設定系統使用權限`));
                    } else {
                        logger.info(`${loginId} ${systemReference} access privilege validated`);
                        const payload = resultset[0];
                        payload.loginId = loginId;
                        const token = jwt.sign(payload, passphrase(), { expiresIn: 7200 });
                        logger.info(`${loginId} login procedure completed`);
                        return response.status(200).json({ token: token });
                    }
                }).catch((error) => {
                    return response.status(500)
                        .json(endpointErrorHandler(method, url, `${loginId} 帳號權限資料讀取失敗: ${error}`));
                }).finally(() => {
                    knex.destroy();
                });
        });
    });
});

module.exports = router;
