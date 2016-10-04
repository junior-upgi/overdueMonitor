var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'upgi.ddns.net',
    port: '3306',
    user: 'overdueMonitor',
    password: 'overdueMonitor',
    charset: 'utf8_bin'
});

connection.connect();

app.get('/', function (req, res) {
    res.send('server started');
});

app.listen(3000);
console.log('server started');

connection.query("SELECT a.userID,c.erpID FROM upgiSystem.userGroupMembership a INNER JOIN (SELECT ID FROM upgiSystem.userGroup WHERE reference='Sales') b ON a.userGroupID=b.ID LEFT JOIN upgiSystem.user c ON a.userID=c.ID WHERE a.deprecated IS NULL;", function (err, rows, fields) {
    if (err) throw err;

    console.log(rows);
});

connection.end();

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};