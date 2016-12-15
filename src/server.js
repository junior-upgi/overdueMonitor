var cors = require('cors');
var express = require('express');
var morgan = require('morgan');

var database = require('../build/module/database.js');
var serverConfig = require('../build/module/serverConfig.js');

var app = express();
app.use(cors());
app.use(morgan('dev'));

app.use('/overdueMonitor', express.static('./public')); // serve static files

app.get('/overdueMonitor/overview', function(request, response) {
    database.executeQuery('SELECT * FROM overdueMonitor.dbo.overview;', function(overviewData, error) {
        if (error) {
            console.log(error);
            return response.status(500).send([{}]);
        } else {
            return response.status(200).json(overviewData);
        }
    });
});

app.get('/overdueMonitor/annualReport', function(request, response) {
    database.executeQuery('SELECT * FROM overdueMonitor.dbo.annualReportSummary ORDER BY YEAR ASC;', function(annualReportSummaryData, error) {
        if (error) {
            console.log(error);
            return response.status(500).send([{}]);
        } else {
            return response.status(200).json(annualReportSummaryData);
        }
    });
});

app.listen(serverConfig.serverPort, function(error) {
    if (error) {
        console.error(error);
    } else {
        console.log('overdueMonitor server running on... (' + serverConfig.serverUrl + ')');
    }
});
