let mssql = require('mssql');
let serverConfig = require('./serverConfig.js');

function executeQuery(queryString, callback) {
    let mssqlConnection = new mssql.Connection(serverConfig.mssqlConfig);
    mssqlConnection.connect()
        .then(function() {
            let mssqlRequest = new mssql.Request(mssqlConnection);
            mssqlRequest.query(queryString)
                .then(function(recordset) {
                    mssqlConnection.close();
                    return callback(recordset);
                })
                .catch(function(error) {
                    console.log('query failure: ' + error);
                    return callback(null, error);
                });
        })
        .catch(function(error) {
            console.log('database connection failure: ' + error);
            return callback(null, error);
        });
}

module.exports = {
    executeQuery: executeQuery
};
