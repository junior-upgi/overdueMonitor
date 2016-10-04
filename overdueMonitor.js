var mysql = require('mysql');
var mssql = require('mssql');

var mssqlConfig = {
    user: 'sunlikeReader',
    password: 'sunlikeReader',
    server: '192.168.99.1'
}

mssql.connect(mssqlConfig, function (err) {
    if (err) console.log(err);
    var request = new mssql.Request();
    request.query('SELECT * FROM UPGI_OverdueMonitor.dbo.warning_NewOverdue;', function (err, resultset) {
        if (err) console.log(err);
        resultset.forEach(function (item, index) {
            var recipientID = "";
            var messageID = generateUUID();
            var broadcastStatusID = generateUUID();
            var mysqlConn = mysql.createConnection({
                host: 'upgi.ddns.net',
                port: '3306',
                user: 'overdueMonitor',
                password: 'overdueMonitor',
                charset: 'utf8_bin'
            });
            mysqlConn.connect();
            mysqlConn.query("SELECT a.userID,c.erpID FROM upgiSystem.userGroupMembership a INNER JOIN (SELECT ID FROM upgiSystem.userGroup WHERE reference='Sales') b ON a.userGroupID=b.ID LEFT JOIN upgiSystem.user c ON a.userID=c.ID WHERE a.deprecated IS NULL AND c.erpID='" + item.recipientID + "';", function (err, data, fieldList) {
                if (err) throw err;
                recipientID = data[0].userID;
                mysqlConn.query("INSERT INTO mobileMessagingSystem.message (`ID`,`messageCategoryID`,`systemCategoryID`,`manualTopic`,`content`,`created_at`) VALUES ('" + messageID + "'," + item.messageCategoryID + "," + item.systemCategoryID + ",'" + item.manualTopic + "','" + item.content + "',NOW());", function (err, data, fieldList) {
                    if (err) throw err;
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

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

/*mssql.connect(mssqlConfig, function (err) {
    if (err) console.log(err);
    var request = new mssql.Request();
    request.query("select * from UPGI_OverdueMonitor.dbo.warning_NewOverdue;", function (err, resultset) {
        if (err) console.log(err);
        console.log(resultset);
        mysqlConn.connect();
        mysqlConn.query("SELECT a.userID,c.erpID FROM upgiSystem.userGroupMembership a INNER JOIN (SELECT ID FROM upgiSystem.userGroup WHERE reference='Sales') b ON a.userGroupID=b.ID LEFT JOIN upgiSystem.user c ON a.userID=c.ID WHERE a.deprecated IS NULL;", function (err, rows, fields) {
            if (err) throw err;
            console.log(rows);
        });
        mysqlConn.end();
        mssql.close();
    });
});*/