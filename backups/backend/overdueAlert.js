// this APP will query the overdueMonitor.dbo.warning_NewOverdue and get newly incurred overdue's, and write data to the server to cause a mobile broadcast to the user.  Intented to run every morning at 08:50
var mysql = require('mysql');
var mssql = require('mssql');

var utility = require('./uuidGenerator.js');

// host of ERP data
var mssqlConfig = {
    // production server
    user: 'overdueMonitor',
    password: 'overdueMonitor',
    server: '192.168.168.5'
}

// host for the mobile messaging system 
var mysqlConfig = {
    // 'localhost' on production server
    host: '192.168.168.86',
    port: '3306',
    user: 'overdueMonitor',
    password: 'overdueMonitor',
    charset: 'utf8_bin'
};

// connect to ERP server
mssql.connect(mssqlConfig, function(error) {
    if (error) throw error;
    var request = new mssql.Request();
    // query the data source (data is already prepared by the query)
    request.query('SELECT * FROM overdueMonitor.dbo.warning_NewOverdue;', function(error, resultSet) {
        if (error) throw error;
        console.log('-----------------------------------------------------------------------------------------------');
        console.log('scheduled overdue info broadcasting started at: ' + new Date());
        console.log(resultSet.length + ' record(s) found\n');
        resultSet.forEach(function(item, index) { //loop through each individual record
            var recipientID = "";
            var messageID = utility.uuidGenerator();
            var broadcastStatusID = utility.uuidGenerator();
            // establish connection to mobileMessagingSystem server
            var mysqlConn = mysql.createConnection(mysqlConfig);
            mysqlConn.connect();
            // write to the mobileMessagingSystem.message table
            mysqlConn.query("INSERT INTO mobileMessagingSystem.message (`ID`,`messageCategoryID`,`systemCategoryID`,`manualTopic`,`content`,`created_at`) VALUES ('" + messageID + "'," + item.messageCategoryID + "," + item.systemCategoryID + ",'" + item.manualTopic + "','" + item.content + "','" + convertDateTime(item.generated) + "');", function(error) {
                if (error) throw error;
            });
            // check the user ID used by the mobile messaging system (compare against the particular sales' ERP ID or 員工編號)
            mysqlConn.query("SELECT a.userID,c.erpID FROM upgiSystem.userGroupMembership a INNER JOIN (SELECT ID FROM upgiSystem.userGroup WHERE reference='Sales') b ON a.userGroupID=b.ID LEFT JOIN upgiSystem.user c ON a.userID=c.ID WHERE a.deprecated IS NULL AND c.erpID='" + item.recipientID + "';", function(error, data, fieldList) {
                if (error) throw error;
                recipientID = data[0].userID;
                // write the mobileMessagingSystem.broadcastStatus table
                mysqlConn.query("INSERT INTO mobileMessagingSystem.broadcastStatus (`ID`,`messageID`,`recipientID`,`primaryRecipient`,`url`,`audioFile`,`permanent`,`created_at`) VALUES ('" + broadcastStatusID + "','" + messageID + "','" + recipientID + "','1','" + item.url + "','" + item.audioFile + "',0,'" + convertDateTime(item.generated) + "');", function(error) {
                    if (error) throw error;
                });
                closeDataConnection(mysqlConn, mssql);
            });
            console.log('#' + (index + 1) + ': ' + item.verboseMessage);
        });
        console.log('\nScheduled mobile broadcasting completed at: ' + new Date());
        console.log('-----------------------------------------------------------------------------------------------');
    });
});

function closeDataConnection(mysqlConn, mssqlConn) {
    mysqlConn.end();
    mssqlConn.close();
}

function convertDateTime(dateTimeVariable) {
    return dateTimeVariable.getFullYear() + '/' + dateTimeVariable.getMonth() + '/' + dateTimeVariable.getDate() + ' ' + dateTimeVariable.getHours() + ':' + dateTimeVariable.getMinutes() + ':' + dateTimeVariable.getSeconds();
};