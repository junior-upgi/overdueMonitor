var serverHost = "http://localhost"; // development
//var serverHost = "http://192.168.168.25"; // production
var serverPort = process.env.PORT || 9003;
var mssqlServerHost = "http://upgi.ddns.net"; // access database from the internet (development)
//var mssqlServerHost = "http://192.168.168.5"; // access database from LAN (production)
var upgiSystemAccount = "overdueMonitor";
var upgiSystemPassword = "overdueMonitor";

var mssqlConfig = {
    server: mssqlServerHost.slice(7),
    user: upgiSystemAccount,
    password: upgiSystemPassword
};

const workingTimezone = "Asia/Taipei";

module.exports = {
    serverHost,
    serverPort,
    upgiSystemAccount,
    upgiSystemPassword,
    mssqlConfig,
    workingTimezone
};