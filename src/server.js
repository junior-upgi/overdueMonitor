var express = require('express');

var serverConfig = require('../build/module/serverConfig.js');

var app = express();

app.use('/overdueMonitor', express.static('./public'));

app.listen(serverConfig.serverPort, function(error) {
    if (error) {
        console.error(error);
    } else {
        console.log('overdueMonitor server running on... (' + serverConfig.serverUrl + ')');
    }
});
