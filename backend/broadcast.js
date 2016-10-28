var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var utility = require('./uuidGenerator.js');
var moment = require('moment');

app.use(bodyParser.json());

// host for the mobile messaging system 
var mysqlConfig = {
    // 'localhost' on production server
    host: '192.168.168.86',
    port: '3306',
    user: 'overdueMonitor',
    password: 'overdueMonitor',
    charset: 'utf8_bin'
};

app.post('/broadcast', function(req, res) {
    var message = req.body;
    var recipientID = "";
    var messageID = utility.uuidGenerator();
    var broadcastStatusID = utility.uuidGenerator();
    var currentDatetime = moment().format("YYYY-MM-DD HH:mm:ss");
    // establish connection to mobileMessagingSystem server
    var mysqlConn = mysql.createConnection(mysqlConfig);
    mysqlConn.connect();
    mysqlConn.query("INSERT INTO mobileMessagingSystem.message (`ID`,`messageCategoryID`,`systemCategoryID`,`manualTopic`,`content`,`created_at`) VALUES ('" + messageID + "'," + message.messageCategoryID + "," + message.systemCategoryID + ",'" + message.manualTopic + "','" + message.content + "','" + currentDatetime + "');", function(error) {
        if (error) throw error;
    });
    mysqlConn.query("SELECT a.userID,c.erpID FROM upgiSystem.userGroupMembership a INNER JOIN (SELECT ID FROM upgiSystem.userGroup WHERE reference='" + message.userGroup + "') b ON a.userGroupID=b.ID LEFT JOIN upgiSystem.user c ON a.userID=c.ID WHERE a.deprecated IS NULL AND c.erpID='" + message.recipientID + "';", function(error, data, fieldList) {
        if (error) throw error;
        recipientID = data[0].userID;
        // write the mobileMessagingSystem.broadcastStatus table
        mysqlConn.query("INSERT INTO mobileMessagingSystem.broadcastStatus (`ID`,`messageID`,`recipientID`,`primaryRecipient`,`url`,`audioFile`,`permanent`,`created_at`) VALUES ('" + broadcastStatusID + "','" + messageID + "','" + recipientID + "','1','" + message.url + "','" + message.audioFile + "',0,'" + currentDatetime + "');", function(error) {
            if (error) throw error;
        });
        //close connection
        mysqlConn.end();
    });
    console.log("==========" + currentDatetime + " 開始推撥 ==========\n");
    console.log(message + "\n");
    console.log("==========" + currentDatetime + " 推撥完畢 ==========\n");
    res.send(
        "<div>==========" + currentDatetime + " 開始推撥 ==========</div>" +
        "<p>" + message + "</p>" +
        "<div>==========" + currentDatetime + " 推撥完畢 ==========</div>");
});

app.listen(3939);
console.log('Running on port 3939...\n');