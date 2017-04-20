/*
const express = require('express');
const moment = require('moment-timezone');
const Treeize = require('treeize');
const uuidV4 = require('uuid/v4');
const serverConfig = require('../../serverConfig.js');
const utility = require('../../utility.js');
const tokenValidation = require('../../middleware/tokenValidation.js');

const router = express.Router();

router.get('/data/purchaseOrder/contentSummary', tokenValidation, (request, response, next) => {
    let knex = require('knex')(serverConfig.mssqlConfig);
    knex('rawMaterial.dbo.pOContentSummary').select('*').debug(false)
        .then((resultset) => {
            return response.status(200).json({ pOContentSummary: resultset });
        }).catch((error) => {
            return response.status(500).json(
                utility.endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `訂單預約進貨細節資料讀取發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
});

router.route('/data/purchaseOrder')
    .all(tokenValidation)
    .get((request, response, next) => {
        let knex = require('knex')(serverConfig.mssqlConfig);
        knex('rawMaterial.dbo.ActivePurchaseOrder')
            .select('*')
            .orderBy('pONumber')
            .orderBy('shipments:workingDate')
            .orderBy('workingYear')
            .orderBy('workingMonth')
            .orderBy('CUS_NO')
            .debug(false)
            .then((resultset) => {
                let pOList = new Treeize();
                pOList.setOptions({
                    input: {
                        detectCollection: false,
                        uniformRows: true
                    },
                    output: {
                        prune: false,
                        objectOverwrite: false
                    }
                });
                pOList.grow(resultset);
                let tempList = pOList.getData();
                tempList.forEach((purchaseOrder, index, array) => {
                    array[index].supplier = purchaseOrder.suppliers[0];
                    delete array[index].suppliers;
                });
                return response.status(200).json({ activePOList: tempList });
            }).catch((error) => {
                return response.status(500).json(
                    utility.endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `訂單資料讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    })
    .put((request, response, next) => {
        let responseObject = {
            shipmentSchedule: null,
            newRequestSummary: null,
            activePOList: null,
            pOContentSummary: null,
            consolidatedReceivingRecord: null,
            receivingRecord: null,
            monthlyShipmentOverview: null
        };
        // create a new PO entry data object
        let newPOId = uuidV4().toUpperCase();
        let newPOEntry = {
            id: newPOId,
            revisionNumber: request.body.targetPO.revisionNumber + 1,
            originalPOId: request.body.targetPO.originalPOId,
            pONumber: request.body.targetPO.pONumber,
            contractType: request.body.targetPO.contractType,
            documentDate: moment(new Date()).format('YYYY-MM-DD'),
            workingYear: request.body.targetPO.workingYear,
            workingMonth: request.body.targetPO.workingMonth,
            startingDate: request.body.targetPO.startingDate,
            endDate: request.body.targetPO.endDate,
            CUS_NO: request.body.targetPO.CUS_NO
        };
        let knex = require('knex')(serverConfig.mssqlConfig);
        knex.transaction((trx) => {
            // create a new PO entry
            return trx.insert(newPOEntry).into('rawMaterial.dbo.purchaseOrder').debug(false)
                .then(() => {
                    // create by copying valid shipments and attach to the new PO
                    return trx.raw('INSERT INTO rawMaterial.dbo.shipment (pOId,requestDate,CUS_NO,PRD_NO,typeId,unitPrice,requestWeight,receivedDate,supplierWeight,actualWeight,note,created,deprecated) SELECT ? AS pOId,requestDate,CUS_NO,PRD_NO,typeId,unitPrice,requestWeight,receivedDate,supplierWeight,actualWeight,note,created,deprecated FROM rawMaterial.dbo.shipment WHERE pOId=? AND deprecated IS NULL;', [newPOId, request.body.targetPO.id]).debug(false);
                }).then(() => {
                    // deprecate the original valid shipment entries
                    return trx('rawMaterial.dbo.shipment')
                        .update({ deprecated: moment.utc(new Date()).format('YYYY-MM-DD hh:mm:ss') })
                        .where({ pOId: request.body.targetPO.id }).debug(false);
                }).then(() => {
                    // attach pending shipments to the new PO
                    let queryList = [];
                    request.body.pendingOrderList.forEach((pendingShipment) => {
                        queryList.push(
                            trx('rawMaterial.dbo.shipment')
                            .update({ pOId: newPOId })
                            .where({
                                id: pendingShipment.id
                            }).debug(false)
                        );
                    });
                    return Promise.all(queryList);
                }).then(() => {
                    // deprecate the old purchase order
                    return trx('rawMaterial.dbo.purchaseOrder')
                        .update({ deprecated: moment.utc(new Date()).format('YYYY-MM-DD hh:mm:ss') })
                        .where({ id: request.body.targetPO.id }).debug(false);
                }).then(() => {
                    // remove PO that does not have any valid shipment attached (e.g. all shipments were cancelled)
                    return trx.raw('UPDATE a SET deprecated=? FROM rawMaterial.dbo.purchaseOrder a LEFT JOIN rawMaterial.dbo.shipment b ON a.id=b.pOId WHERE a.deprecated IS NULL AND b.id IS NULL;', [moment.utc(new Date()).format('YYYY-MM-DD hh:mm:ss')]).debug(false);
                }).then(() => {
                    // get a set of fresh shipment data
                    return trx.select('*').from('rawMaterial.dbo.shipmentSchedule')
                        .orderBy('PRD_NO').orderBy('CUS_NO').orderBy('workingDate').debug(false);
                }).then((resultset) => {
                    let shipmentSchedule = new Treeize();
                    shipmentSchedule.setOptions({
                        input: {
                            detectCollection: false,
                            uniformRows: true
                        },
                        output: {
                            prune: false,
                            objectOverwrite: false
                        }
                    });
                    shipmentSchedule.grow(resultset);
                    responseObject.shipmentSchedule = shipmentSchedule.getData();
                    // get a set of fresh newRequestSummary data
                    return trx.select('*').from('rawMaterial.dbo.newRequestSummary')
                        .orderBy('workingYear').orderBy('workingMonth').orderBy('CUS_NO').debug(false);
                }).then((resultset) => {
                    responseObject.newRequestSummary = resultset;
                    // get a set of fresh purchaseOrder data
                    return trx('rawMaterial.dbo.ActivePurchaseOrder')
                        .select('*')
                        .orderBy('pONumber')
                        .orderBy('shipments:workingDate')
                        .orderBy('workingYear')
                        .orderBy('workingMonth')
                        .orderBy('CUS_NO')
                        .debug(false);
                }).then((resultset) => {
                    // process active purchase order data
                    let pOList = new Treeize();
                    pOList.setOptions({
                        input: {
                            detectCollection: false,
                            uniformRows: true
                        },
                        output: {
                            prune: false,
                            objectOverwrite: false
                        }
                    });
                    pOList.grow(resultset);
                    let tempList = pOList.getData();
                    tempList.forEach((purchaseOrder, index, array) => {
                        array[index].supplier = purchaseOrder.suppliers[0];
                        delete array[index].suppliers;
                    });
                    responseObject.activePOList = tempList;
                    // get a set of fresh contentSummary data
                    return trx('rawMaterial.dbo.pOContentSummary').select('*').debug(false);
                }).then((resultset) => {
                    responseObject.pOContentSummary = resultset;
                    // get simplified shipment records
                    return trx('rawMaterial.dbo.consolidatedReceivingRecord').select('*')
                        .orderBy('CUS_NO').orderBy('PRD_NO').orderBy('workingDate').debug(false);
                }).then((resultset) => {
                    responseObject.consolidatedReceivingRecord = resultset;
                    // get simplified shipment records
                    return trx('rawMaterial.dbo.receivingRecord').select('*')
                        .orderBy('CUS_NO').orderBy('PRD_NO').orderBy('workingDate').debug(false);
                }).then((resultset) => {
                    responseObject.receivingRecord = resultset;
                    // get monthly shipment overview data
                    return trx('rawMaterial.dbo.monthlyShipmentOverview').select('*')
                        .orderBy('workingYear').orderBy('workingMonth').orderBy('CUS_NO')
                        .orderBy('PRD_NO').debug(false);
                });
        }).then((resultset) => {
            responseObject.monthlyShipmentOverview = resultset;
            return response.status(200).json(responseObject);
        }).catch((error) => {
            return response.status(500).json(
                utility.endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `更新訂單資料發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    })
    .post((request, response, next) => {
        let responseObject = {
            shipmentSchedule: null,
            newRequestSummary: null,
            activePOList: null,
            pOContentSummary: null,
            consolidatedReceivingRecord: null,
            receivingRecord: null,
            monthlyShipmentOverview: null
        };
        // create a new PO entry data object
        let newPOId = uuidV4().toUpperCase();
        let newPOEntry = {
            contractType: request.body.contractType,
            CUS_NO: request.body.CUS_NO,
            documentDate: request.body.documentDate,
            endDate: request.body.endDate,
            id: newPOId,
            originalPOId: newPOId,
            pONumber: request.body.pONumber,
            revisionNumber: 0,
            startingDate: request.body.startingDate,
            workingMonth: request.body.workingMonth,
            workingYear: request.body.workingYear
        };
        let knex = require('knex')(serverConfig.mssqlConfig);
        knex.transaction((trx) => {
            // create a new PO entry
            return trx.insert(newPOEntry).into('rawMaterial.dbo.purchaseOrder').debug(false)
                .then(() => {
                    // attach pending shipments to the new PO
                    if (request.body.contractType === 'oneTime') { // if contract type is 'oneTime' add everything
                        return trx('rawMaterial.dbo.shipment')
                            .update({ pOId: newPOId })
                            .where({
                                CUS_NO: request.body.CUS_NO,
                                deprecated: null,
                                pOId: null
                            }).debug(false);
                    } else { // if contract type is otherwise filter pending shipment by startingDate and endDate
                        return trx('rawMaterial.dbo.shipment')
                            .update({ pOId: newPOId })
                            .whereBetween('requestDate', [request.body.startingDate, request.body.endDate])
                            .where({
                                CUS_NO: request.body.CUS_NO,
                                deprecated: null,
                                pOId: null
                            }).debug(false);
                    }
                }).then(() => {
                    // get a set of fresh shipment data
                    return trx.select('*').from('rawMaterial.dbo.shipmentSchedule')
                        .orderBy('PRD_NO').orderBy('CUS_NO').orderBy('workingDate').debug(false);
                }).then((resultset) => {
                    let shipmentSchedule = new Treeize();
                    shipmentSchedule.setOptions({
                        input: {
                            detectCollection: false,
                            uniformRows: true
                        },
                        output: {
                            prune: false,
                            objectOverwrite: false
                        }
                    });
                    shipmentSchedule.grow(resultset);
                    responseObject.shipmentSchedule = shipmentSchedule.getData();
                    // get a set of fresh newRequestSummary data
                    return trx.select('*').from('rawMaterial.dbo.newRequestSummary')
                        .orderBy('workingYear').orderBy('workingMonth').orderBy('CUS_NO').debug(false);
                }).then((resultset) => {
                    responseObject.newRequestSummary = resultset;
                    // get a set of fresh purchaseOrder data
                    return trx('rawMaterial.dbo.ActivePurchaseOrder')
                        .select('*')
                        .orderBy('pONumber')
                        .orderBy('shipments:workingDate')
                        .orderBy('workingYear')
                        .orderBy('workingMonth')
                        .orderBy('CUS_NO')
                        .debug(false);
                }).then((resultset) => {
                    // process active purchase order data
                    let pOList = new Treeize();
                    pOList.setOptions({
                        input: {
                            detectCollection: false,
                            uniformRows: true
                        },
                        output: {
                            prune: false,
                            objectOverwrite: false
                        }
                    });
                    pOList.grow(resultset);
                    let tempList = pOList.getData();
                    tempList.forEach((purchaseOrder, index, array) => {
                        array[index].supplier = purchaseOrder.suppliers[0];
                        delete array[index].suppliers;
                    });
                    responseObject.activePOList = tempList;
                    // get a set of fresh contentSummary data
                    return trx('rawMaterial.dbo.pOContentSummary').select('*').debug(false);
                }).then((resultset) => {
                    responseObject.pOContentSummary = resultset;
                    // get simplified shipment records
                    return trx('rawMaterial.dbo.consolidatedReceivingRecord').select('*')
                        .orderBy('CUS_NO').orderBy('PRD_NO').orderBy('workingDate').debug(false);
                }).then((resultset) => {
                    responseObject.consolidatedReceivingRecord = resultset;
                    // get simplified shipment records
                    return trx('rawMaterial.dbo.receivingRecord').select('*')
                        .orderBy('CUS_NO').orderBy('PRD_NO').orderBy('workingDate').debug(false);
                }).then((resultset) => {
                    responseObject.receivingRecord = resultset;
                    // get monthly shipment overview data
                    return trx('rawMaterial.dbo.monthlyShipmentOverview').select('*')
                        .orderBy('workingYear').orderBy('workingMonth').orderBy('CUS_NO')
                        .orderBy('PRD_NO').debug(false);
                });
        }).then((resultset) => {
            responseObject.monthlyShipmentOverview = resultset;
            return response.status(200).json(responseObject);
        }).catch((error) => {
            return response.status(500).json(
                utility.endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `新增訂單資料發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

module.exports = router;
*/
