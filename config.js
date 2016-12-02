"use strict";

var serverHost = "http://localhost"; //development
var serverPort = process.env.PORT || 9002;
var broadcastServerHost = "http://upgi.ddns.net";
var broadcastServerPort = process.env.PORT || 9001;
var broadcastAPIUrl = broadcastServerHost + ":" + broadcastServerPort + "/broadcast";
//var mssqlServerHost = "http://upgi.ddns.net"; // access database from the internet (development)
var mssqlServerHost = "http://192.168.168.5"; // access database from LAN (production)
var mssqlServerPort = process.env.PORT || 1433;
var upgiSystemAccount = "upgiSystem";
var upgiSystemPassword = "upgiSystem";

var mssqlConfig = {
    server: mssqlServerHost.slice(7),
    user: upgiSystemAccount,
    password: upgiSystemPassword,
    port: mssqlServerPort,
    requestTimeout: 60000
};

const smtpTransportAccount = "smtps://junior.upgi@gmail.com:cHApPPZV@smtp.gmail.com";

const workingTimezone = "Asia/Taipei";

module.exports = {
    serverHost,
    serverPort,
    broadcastServerHost,
    broadcastServerPort,
    broadcastAPIUrl,
    upgiSystemAccount,
    upgiSystemPassword,
    mssqlConfig,
    smtpTransportAccount,
    workingTimezone
};