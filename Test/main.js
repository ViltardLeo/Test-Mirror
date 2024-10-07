const api = require('./api/api').api;
const tcpServer = require('./protocol/tcpServer').tcpServer;
const logger = require('./logging').logger.child({ serviceName: 'Main' });

api.listen(3000, () => {
    logger.info('API started listenning on 3000');
});


tcpServer.listen(4242, '127.0.0.1', () => {
    logger.info('TCP server started listenning on 4242');
});