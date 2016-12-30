const development = true;

function serverHost() {
    if (development === true) {
        return 'http://127.0.0.1'; // development
    } else {
        return 'http://upgi.ddns.net'; // production
    }
}
const serverPort = '9003';

module.exports = {
    serverUrl: serverHost() + ':' + serverPort
};
