// this APP will query the UPGI_OverdueMonitor.dbo.warning_WeeklySummary and get records and differentiate what will become overdue within a week or two weeks, then write data to the mobileMessagingSystem server to cause a mobile broadcast to each user.  Intented to run every Monday morning at 08:55 (once a week)
var mysql = require('mysql');
var mssql = require('mssql');

var utility = require('./uuidGenerator.js');

// host of ERP data
var mssqlConfig = {
    user: 'sunlikeReader', // same account (production/development)
    password: 'sunlikeReader', // same password (production/development)
    // '192.168.168.2' for production server, 'localhost' for local test env.
    server: 'localhost'
}

// host for the mobile messaging system 
var mysqlConfig = {
    // 'localhost' on production server, 'upgi.ddns.net' on local test env.
    host: 'upgi.ddns.net',
    port: '3306',
    user: 'overdueMonitor', // this does not change, APP has to remote access production server
    password: 'overdueMonitor', // this does not change, APP has to remote access production server
    charset: 'utf8_bin'
};

// connect to ERP server
mssql.connect(mssqlConfig, function (error) {
    if (error) throw error;
    var request = new mssql.Request();
    // query invoice to become overdue within this week from the ERP server
    request.query('SELECT * FROM UPGI_OverdueMonitor.dbo.warning_WeeklySummary ORDER BY recipientID, DUE_DATE;', function (error, resultSet) {
        if (error) throw error;
        console.log('-----------------------------------------------------------------------------------------------');
        console.log('Scheduled pending payment reminder broadcasting started at: '+new Date()+'...');
        console.log('there are '+resultSet.length+' records...');
        resultSet.forEach(function (item, index) { //loop through individual records
            var recipientID = "";
            var messageID = utility.uuidGenerator();
            var broadcastStatusID = utility.uuidGenerator();
            // establish connection to mobileMessagingSystem server
            var mysqlConn = mysql.createConnection(mysqlConfig);
            mysqlConn.connect();
            // write to the mobileMessagingSystem.message table
            mysqlConn.query("INSERT INTO mobileMessagingSystem.message (`ID`,`messageCategoryID`,`systemCategoryID`,`manualTopic`,`content`,`created_at`) VALUES ('" + messageID + "'," + item.messageCategoryID + "," + item.systemCategoryID + ",'" + item.manualTopic + "','" + item.content + "','"+convertDateTime(item.generated)+"');", function (error) {
                if (error) throw error;
            });
            // check the user ID used by the mobile messaging system (compare against the particular sales' ERP ID or 員工編號)
            mysqlConn.query("SELECT a.userID,c.erpID FROM upgiSystem.userGroupMembership a INNER JOIN (SELECT ID FROM upgiSystem.userGroup WHERE reference='Sales') b ON a.userGroupID=b.ID LEFT JOIN upgiSystem.user c ON a.userID=c.ID WHERE a.deprecated IS NULL AND c.erpID='" + item.recipientID + "';", function (error, data, fieldList) {
                if (error) throw error;
                recipientID = data[0].userID;
                // write the mobileMessagingSystem.broadcastStatus table
                mysqlConn.query("INSERT INTO mobileMessagingSystem.broadcastStatus (`ID`,`messageID`,`recipientID`,`primaryRecipient`,`url`,`audioFile`,`permanent`,`created_at`) VALUES ('" + broadcastStatusID + "','" + messageID + "','" + recipientID + "','1','" + item.url + "','" + item.audioFile + "',0,'"+convertDateTime(item.generated)+"');", function (error) {
                    if (error) throw error;
                });
                closeDataConnection(mysqlConn, mssql);
            });
            console.log('#'+index+': '+item.verboseMessage);
        });
        console.log('Scheduled mobile broadcasting completed at: '+new Date());
        console.log('-----------------------------------------------------------------------------------------------');
    });
});

function closeDataConnection(mysqlConn, mssqlConn) {
    mysqlConn.end();
    mssqlConn.close();
};

function convertDateTime(dateTimeVariable){
    return dateTimeVariable.getFullYear()+'/'+dateTimeVariable.getMonth()+'/'+dateTimeVariable.getDate()+' '+dateTimeVariable.getHours()+':'+dateTimeVariable.getMinutes()+':'+dateTimeVariable.getSeconds();
};