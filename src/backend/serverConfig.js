// system configuration
export const systemReference = 'overdueMonitor';
export const systemName = 'overdueMonitor';
export const development = true;
export const administrator = 241630569; // telegram account of system admin
// export const uploadDir = 'upload';
export const logDir = 'log';
export function passphrase() { // can be later changed to pull something from other locations
    return 'This is not a passphrase';
}

// application server configuration
export const serverHost = 'http://localhost';
export const serverPort = 9003;
export const serverUrl = `${serverHost}:${serverPort}`;

// telegram broadcast server
export function broadcastServerUrl() {
    const broadcastServerPort = 9001;
    const sshAccessUrl = `http://upgi.ddns.net:${broadcastServerPort}/broadcast`;
    const lanAccessUrl = `http://192.168.168.25:${broadcastServerPort}/broadcast`;
    return (development === true) ? sshAccessUrl : lanAccessUrl;
}

// smartsheet
export const smartsheetToken = 'Bearer ' + '696io5sv0dcqj8korwwgjob9os';

// ldap
export const ldapServerUrl = 'ldap://upgi.ddns.net:389';

// email service
export const smtpTransportAccount = 'smtps://junior.upgi@gmail.com:cHApPPZV@smtp.gmail.com'; // this should not be hardcoded

// database access configuration
function mssqlServerHost() {
    // access database through SSH (development === true)
    // access database from LAN (development === false)
    return (development === true) ? 'http://127.0.0.1' : 'http://192.168.168.5';
}
const mssqlServerPort = 1433;
export function mssqlServerUrl() { return `${mssqlServerHost()}:${mssqlServerPort}`; }
const upgiSystemAccount = 'upgiSystem';
const upgiSystemPassword = 'upgiSystem';
export const mssqlConfig = {
    client: 'mssql',
    connection: {
        server: mssqlServerHost().slice(7),
        user: upgiSystemAccount,
        password: upgiSystemPassword,
        port: mssqlServerPort
    },
    debug: true,
    server: mssqlServerHost().slice(7),
    user: upgiSystemAccount,
    password: upgiSystemPassword,
    port: mssqlServerPort,
    connectionTimeout: 60000,
    requestTimeout: 60000
};

/*
// const browsersyncPort = 9996;


function publicServerUrl() {
    if (development === true) {
        return `${serverHost}:${browsersyncPort}/${systemReference}`; // development
    } else {
        return `http://upgi.ddns.net:${serverPort}/${systemReference}`; // production
    }
}

// misc
const workingTimezone = 'Asia/Taipei';


*/

/*
module.exports = {
    serverPort: serverPort,
    administrator: administrator,
    botAPIUrl: botAPIUrl,
    broadcastServerUrl: broadcastServerUrl(),,
    mssqlServerUrl: mssqlServerUrl(),
    passphrase: passphrase(),
    publicServerUrl: publicServerUrl(),
    serverHost: serverHost,,
    smtpTransportAccount: smtpTransportAccount,
    systemReference: systemReference,
    upgiSystemAccount: upgiSystemAccount,
    upgiSystemPassword: upgiSystemPassword,
    workingTimezone: workingTimezone
};
*/
