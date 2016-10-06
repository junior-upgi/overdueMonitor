var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var mssql = require('mssql');

var app = express();

var sqlSrvConfig = {
    user: 'sunlikeReader', // same account (production/development)
    password: 'sunlikeReader', // same password (production/development)
    // '192.168.168.2' for production server, 'localhost' for local test env.
    server: 'localhost'
}

var testArray = [];

testArray = function testFunc() {
    return [1, 2, 3, 4];
}();

console.log(testArray);

/*
mssql.connect(sqlSrvConfig).then(function () {
    new mssql.Request()
        .query('SELECT YEAR FROM UPGI_OverdueMonitor.dbo.observedYear;').then(function (recordSet) {
            app.get('/', function (request, response) {
                response.send('overdueMonitor system running on port 3000');
                mssql.close();
            });
            recordSet.forEach(function (item, index) {
                app.get('/' + item.YEAR, function (request, response) {
                    response.send('SELECT * FROM UPGI_OverdueMonitor.dbo.annualReportDetail where YEAR=' + item.YEAR + ' order by CUS_SNM;');
                    mssql.close();
                });
            });
            app.listen(3000);
            console.log('overdueMonitor system running on port 3000');
            mssql.close();
        }).catch(function (error) {
            console.log('觀察年份列表查詢錯誤..., ' + error);
            mssql.close();
            throw error;
        });
}).catch(function (error) {
    console.log('無法建立伺服器連線..., ' + error);
    mssql.close();
    throw error;
});*/