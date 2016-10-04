// this APP will query the UPGI_OverdueMonitor.dbo.warning_NewOverdue and get newly incurred overdue's, and write data to the server to cause a mobile broadcast to the user.
var mysql = require('mysql');
var mssql = require('mssql');

// host of ERP data
var mssqlConfig = {
    user: 'sunlikeReader',      // same account (production/development)
    password: 'sunlikeReader',  // same password (production/development)
    server: '192.168.99.1'      // 192.168.168.2 (current production ERP server - sunv9)
}

// connect to ERP server
mssql.connect(mssqlConfig, function (err) {
    if (err) throw err;
    var request = new mssql.Request();
    // query the data source (data is already prepared by the query)
    request.query('SELECT * FROM UPGI_OverdueMonitor.dbo.warning_NewOverdue;', function (err, resultset) {
        if (err) throw err;
        resultset.forEach(function (item, index) {      //loop through each individual record
            var recipientID = "";
            var messageID = generateUUID();
            var broadcastStatusID = generateUUID();
            // host for the mobile messaging system 
            var mysqlConn = mysql.createConnection({
                host: 'upgi.ddns.net',                  // if APP is placed on the production server, it should use 'localhost'
                port: '3306',
                user: 'overdueMonitor',                 // this does not change, APP has to remote access production server
                password: 'overdueMonitor',             // this does not change, APP has to remote access production server
                charset: 'utf8_bin'
            });
            mysqlConn.connect();
            // check the user ID used by the mobile messaging system (compare against the particular sales' ERP ID or 員工編號)
            mysqlConn.query("SELECT a.userID,c.erpID FROM upgiSystem.userGroupMembership a INNER JOIN (SELECT ID FROM upgiSystem.userGroup WHERE reference='Sales') b ON a.userGroupID=b.ID LEFT JOIN upgiSystem.user c ON a.userID=c.ID WHERE a.deprecated IS NULL AND c.erpID='" + item.recipientID + "';", function (err, data, fieldList) {
                if (err) throw err;
                recipientID = data[0].userID;
                // write to the mobileMessagingSystem.message table
                mysqlConn.query("INSERT INTO mobileMessagingSystem.message (`ID`,`messageCategoryID`,`systemCategoryID`,`manualTopic`,`content`,`created_at`) VALUES ('" + messageID + "'," + item.messageCategoryID + "," + item.systemCategoryID + ",'" + item.manualTopic + "','" + item.content + "',NOW());", function (err, data, fieldList) {
                    if (err) throw err;
                    // write the mobileMessagingSystem.broadcastStatus table
                    mysqlConn.query("INSERT INTO mobileMessagingSystem.broadcastStatus (`ID`,`messageID`,`recipientID`,`primaryRecipient`,`url`,`audioFile`,`permanent`,`created_at`) VALUES ('" + broadcastStatusID + "','" + messageID + "','" + recipientID + "','1',NULL,'siren.mp3',0,NOW());", function (err, data, fieldList) {
                        if (err) throw err;
                        mysqlConn.end();
                        mssql.close();
                    });
                });
            });
        });
    });
});

//function to generate UUID for the records
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};