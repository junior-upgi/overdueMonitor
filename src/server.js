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

app.get('/overdueMonitor/annualReportSummary', function(request, response) {
    database.executeQuery('SELECT * FROM overdueMonitor.dbo.annualReportSummary ORDER BY YEAR ASC;', function(annualReportSummaryData, error) {
        if (error) {
            console.log(error);
            return response.status(500).send([{}]);
        } else {
            return response.status(200).json(annualReportSummaryData);
        }
    });
});

app.get('/overdueMonitor/warning_NewOverdue', function(request, response) {
    database.executeQuery('SELECT * FROM overdueMonitor.dbo.warning_NewOverdue ORDER BY PS_DD ASC;',
        function(warning_NewOverdueData, error) {
            if (error) {
                console.log(error);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(warning_NewOverdueData);
            }
        });
});

app.get('/overdueMonitor/warning_OneWeek', function(request, response) {
    database.executeQuery('SELECT * FROM overdueMonitor.dbo.warning_OneWeek ORDER BY G_PERIOD_REMAIN ASC;',
        function(warning_OneWeekData, error) {
            if (error) {
                console.log(error);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(warning_OneWeekData);
            }
        });
});

app.get('/overdueMonitor/warning_TwoWeek', function(request, response) {
    database.executeQuery('SELECT * FROM overdueMonitor.dbo.warning_TwoWeek ORDER BY G_PERIOD_REMAIN ASC;',
        function(warning_TwoWeekData, error) {
            if (error) {
                console.log(error);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(warning_TwoWeekData);
            }
        });
});

app.get('/overdueMonitor/warning_PastWeekOverdue', function(request, response) {
    database.executeQuery('SELECT * FROM overdueMonitor.dbo.warning_PastWeekOverdue ORDER BY G_PERIOD_REMAIN ASC;',
        function(warning_PastWeekOverdueData, error) {
            if (error) {
                console.log(error);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(warning_PastWeekOverdueData);
            }
        });
});

app.get('/overdueMonitor/warning_ProlongedOverdue', function(request, response) {
    database.executeQuery('SELECT * FROM overdueMonitor.dbo.warning_ProlongedOverdue ORDER BY DATEDIFF(day,DUE_DATE,GETDATE()) ASC;',
        function(warning_ProlongedOverdueData, error) {
            if (error) {
                console.log(error);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(warning_ProlongedOverdueData);
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
