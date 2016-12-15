var express = require('express');

var serverConfig = require('./module/serverConfig.js');

var app = express();

app.use('/boilerplate', express.static('./public'));

app.listen(serverConfig.serverPort, function(error) {
    if (error) {
        console.error(error);
    } else {
        console.log('boilerplate server running on... (' + serverConfig.serverUrl + ')');
    }
});
